import React, { useMemo } from 'react';
import {
  HouseId,
  HOUSES,
  Player,
  Token,
  MoveOption,
  SAFE_TILES
} from '../types/parchis';
import {
  getTileCoordinates,
  getCorridorCoordinates,
  getHomeBases,
  getGoalDestinations,
  BoardPoint
} from '../utils/boardCoordinates';
import { HouseEmblem } from './HouseEmblem';

interface BoardProps {
  players: Player[];
  activeHouse: HouseId;
  legalMoves: MoveOption[];
  selectedTokenId: number | null;
  onSelectToken: (house: HouseId, tokenId: number | null) => void;
  onExecuteMove: (move: MoveOption) => void;
  zoomLevel: number;
}

export const Board: React.FC<BoardProps> = ({
  players,
  activeHouse,
  legalMoves,
  selectedTokenId,
  onSelectToken,
  onExecuteMove,
  zoomLevel
}) => {
  const tileCoords = useMemo(() => getTileCoordinates(), []);
  const corridorCoords = useMemo(() => getCorridorCoordinates(), []);
  const homeBases = useMemo(() => getHomeBases(), []);
  const goalDestinations = useMemo(() => getGoalDestinations(), []);

  // Map of movable token IDs for current active house
  const movableTokenIds = useMemo(() => {
    const set = new Set<number>();
    legalMoves.forEach(m => set.add(m.tokenId));
    return set;
  }, [legalMoves]);

  // If a token is selected, find its moves to highlight target tiles
  const selectedMoves = useMemo(() => {
    if (selectedTokenId === null) return [];
    return legalMoves.filter(m => m.tokenId === selectedTokenId);
  }, [legalMoves, selectedTokenId]);

  // Find target destination points for highlighting
  const highlightedDestinations = useMemo(() => {
    return selectedMoves.map(m => {
      let pt: BoardPoint;
      if (m.toState === 'board') {
        pt = tileCoords[m.toPosition] || { x: 500, y: 500 };
      } else if (m.toState === 'corridor') {
        pt = corridorCoords[activeHouse][m.toPosition - 1] || { x: 500, y: 500 };
      } else {
        pt = goalDestinations[activeHouse];
      }
      return { move: m, pt };
    });
  }, [selectedMoves, tileCoords, corridorCoords, goalDestinations, activeHouse]);

  // Render all tokens across all players
  const renderTokens = () => {
    const rendered: React.ReactNode[] = [];

    players.forEach(player => {
      const houseConfig = HOUSES[player.house];
      const isCurrentPlayer = player.house === activeHouse;

      // Group tokens by board position to offset stacked tokens (up to 2 tokens per tile)
      const boardOccupancy: Record<number, Token[]> = {};
      player.tokens.forEach(t => {
        if (t.state === 'board') {
          if (!boardOccupancy[t.position]) boardOccupancy[t.position] = [];
          boardOccupancy[t.position].push(t);
        }
      });

      player.tokens.forEach(token => {
        let x = 500;
        let y = 500;
        const isMovable = isCurrentPlayer && movableTokenIds.has(token.id);
        const isSelected = isCurrentPlayer && selectedTokenId === token.id;

        if (token.state === 'home') {
          const slot = homeBases[player.house].tokenSlots[token.id] || { x: 190, y: 190 };
          x = slot.x;
          y = slot.y;
        } else if (token.state === 'board') {
          const pt = tileCoords[token.position] || { x: 500, y: 500 };
          x = pt.x;
          y = pt.y;

          // If multiple tokens are on the same tile, offset slightly
          const stack = boardOccupancy[token.position] || [];
          if (stack.length > 1) {
            const index = stack.findIndex(t => t.id === token.id);
            if (index === 0) x -= 10;
            if (index === 1) x += 10;
          }
        } else if (token.state === 'corridor') {
          const pt = corridorCoords[player.house][token.position - 1] || { x: 500, y: 500 };
          x = pt.x;
          y = pt.y;
        } else if (token.state === 'goal') {
          const pt = goalDestinations[player.house];
          // Small radial offset in goal
          const angle = (token.id * Math.PI) / 2;
          x = pt.x + Math.cos(angle) * 16;
          y = pt.y + Math.sin(angle) * 16;
        }

        const handleTokenClick = (e: React.MouseEvent | React.TouchEvent) => {
          e.stopPropagation();
          if (isMovable || isCurrentPlayer) {
            // Select this token or toggle if already selected
            if (isSelected) {
              onSelectToken(player.house, null);
            } else {
              onSelectToken(player.house, token.id);
            }
          }
        };

        rendered.push(
          <g
            key={`${player.house}-${token.id}`}
            transform={`translate(${x}, ${y})`}
            className={`transition-all duration-300 ${isCurrentPlayer ? 'cursor-pointer' : 'pointer-events-none'}`}
            onClick={handleTokenClick}
          >
            {/* Movable Pulsing Ring */}
            {isMovable && (
              <circle
                r="26"
                fill="none"
                stroke={houseConfig.accentColor}
                strokeWidth="3.5"
                className="animate-ping opacity-60"
              />
            )}

            {/* Selection Aura */}
            {isSelected && (
              <circle
                r="28"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray="6 3"
                className="animate-spin"
              />
            )}

            {/* Token Base Shadow */}
            <circle cx="2" cy="4" r="18" fill="rgba(0,0,0,0.5)" filter="blur(2px)" />

            {/* Outer Gold/Silver Rim */}
            <circle
              r="18"
              fill={houseConfig.primaryColor}
              stroke={isSelected ? '#f59e0b' : houseConfig.secondaryColor}
              strokeWidth="3.5"
            />

            {/* Inner House Tone */}
            <circle r="12" fill={houseConfig.primaryColor} />

            {/* House Animal Silhouette / Glyph */}
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="14"
              className="select-none pointer-events-none font-bold"
              fill="#ffffff"
            >
              {houseConfig.animalIcon}
            </text>

            {/* Token ID subscript badge */}
            <circle cx="10" cy="-10" r="6" fill="#1c1917" stroke={houseConfig.secondaryColor} strokeWidth="1" />
            <text
              x="10"
              y="-9"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="8"
              fill="#f5d77f"
              fontWeight="bold"
            >
              {token.id + 1}
            </text>
          </g>
        );
      });
    });

    return rendered;
  };

  return (
    <div className="w-full max-w-full overflow-hidden flex items-center justify-center">
      <div
        className="relative w-full aspect-square max-w-[min(100vw-20px,580px)] mx-auto select-none rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-amber-900/60 bg-[#140e0a]"
        style={{
          touchAction: 'none'
        }}
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full block touch-none"
          xmlns="http://www.w3.org/2000/svg"
        >
        <defs>
          {/* Parchment board texture */}
          <radialGradient id="parchmentBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2c1f15" />
            <stop offset="70%" stopColor="#1e140d" />
            <stop offset="100%" stopColor="#120c08" />
          </radialGradient>

          {/* House Gradients */}
          <linearGradient id="gryffindorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7a0c16" />
            <stop offset="100%" stopColor="#4a050d" />
          </linearGradient>
          <linearGradient id="slytherinGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#165b33" />
            <stop offset="100%" stopColor="#092e18" />
          </linearGradient>
          <linearGradient id="ravenclawGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f1d47" />
          </linearGradient>
          <linearGradient id="hufflepuffGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c49a15" />
            <stop offset="100%" stopColor="#695105" />
          </linearGradient>

          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Board Background */}
        <rect width="1000" height="1000" fill="url(#parchmentBg)" />

        {/* Ornate Gold Outer Filigree Border */}
        <rect
          x="12"
          y="12"
          width="976"
          height="976"
          fill="none"
          stroke="#d4af37"
          strokeWidth="3"
          strokeDasharray="40 10 10 10"
          opacity="0.8"
        />
        <rect
          x="20"
          y="20"
          width="960"
          height="960"
          fill="none"
          stroke="#8c6d1f"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* ---------------- 4 CORNER HOUSES (CASAS) ---------------- */}
        {/* GRYFFINDOR (Top-Left) */}
        <g transform="translate(0, 0)">
          <rect
            x="24"
            y="24"
            width="340"
            height="340"
            rx="24"
            fill="url(#gryffindorGrad)"
            stroke="#d4af37"
            strokeWidth="5"
          />
          <circle cx="190" cy="190" r="120" fill="#2d080c" stroke="#d4af37" strokeWidth="2" strokeDasharray="6 4" />
          {/* House animal & title */}
          <text
            x="190"
            y="95"
            textAnchor="middle"
            fill="#f7d070"
            fontFamily="Cinzel, serif"
            fontSize="24"
            fontWeight="900"
            letterSpacing="2"
          >
            GRYFFINDOR
          </text>
          {/* 4 Token pedestals */}
          {homeBases.gryffindor.tokenSlots.map((slot, i) => (
            <circle
              key={i}
              cx={slot.x}
              cy={slot.y}
              r="24"
              fill="#520a10"
              stroke="#d4af37"
              strokeWidth="2.5"
            />
          ))}
        </g>

        {/* SLYTHERIN (Top-Right) */}
        <g transform="translate(0, 0)">
          <rect
            x="636"
            y="24"
            width="340"
            height="340"
            rx="24"
            fill="url(#slytherinGrad)"
            stroke="#c0c0c0"
            strokeWidth="5"
          />
          <circle cx="810" cy="190" r="120" fill="#0d2817" stroke="#c0c0c0" strokeWidth="2" strokeDasharray="6 4" />
          <text
            x="810"
            y="95"
            textAnchor="middle"
            fill="#e2e8f0"
            fontFamily="Cinzel, serif"
            fontSize="24"
            fontWeight="900"
            letterSpacing="2"
          >
            SLYTHERIN
          </text>
          {homeBases.slytherin.tokenSlots.map((slot, i) => (
            <circle
              key={i}
              cx={slot.x}
              cy={slot.y}
              r="24"
              fill="#103b22"
              stroke="#c0c0c0"
              strokeWidth="2.5"
            />
          ))}
        </g>

        {/* RAVENCLAW (Bottom-Right) */}
        <g transform="translate(0, 0)">
          <rect
            x="636"
            y="636"
            width="340"
            height="340"
            rx="24"
            fill="url(#ravenclawGrad)"
            stroke="#cd7f32"
            strokeWidth="5"
          />
          <circle cx="810" cy="810" r="120" fill="#0a1533" stroke="#cd7f32" strokeWidth="2" strokeDasharray="6 4" />
          <text
            x="810"
            y="710"
            textAnchor="middle"
            fill="#93c5fd"
            fontFamily="Cinzel, serif"
            fontSize="24"
            fontWeight="900"
            letterSpacing="2"
          >
            RAVENCLAW
          </text>
          {homeBases.ravenclaw.tokenSlots.map((slot, i) => (
            <circle
              key={i}
              cx={slot.x}
              cy={slot.y}
              r="24"
              fill="#142857"
              stroke="#cd7f32"
              strokeWidth="2.5"
            />
          ))}
        </g>

        {/* HUFFLEPUFF (Bottom-Left) */}
        <g transform="translate(0, 0)">
          <rect
            x="24"
            y="636"
            width="340"
            height="340"
            rx="24"
            fill="url(#hufflepuffGrad)"
            stroke="#1c1917"
            strokeWidth="5"
          />
          <circle cx="190" cy="810" r="120" fill="#362906" stroke="#fde047" strokeWidth="2" strokeDasharray="6 4" />
          <text
            x="190"
            y="710"
            textAnchor="middle"
            fill="#1c1917"
            fontFamily="Cinzel, serif"
            fontSize="24"
            fontWeight="900"
            letterSpacing="2"
          >
            HUFFLEPUFF
          </text>
          {homeBases.hufflepuff.tokenSlots.map((slot, i) => (
            <circle
              key={i}
              cx={slot.x}
              cy={slot.y}
              r="24"
              fill="#4d3b07"
              stroke="#1c1917"
              strokeWidth="2.5"
            />
          ))}
        </g>

        {/* ---------------- 4 CORRIDORS LEADING TO HOGWARTS ---------------- */}
        {/* Gryffindor Corridor (Left arm center) */}
        {corridorCoords.gryffindor.map((pt, idx) => (
          <g key={`corridor-gryf-${idx}`}>
            <rect
              x={pt.x - 22}
              y={pt.y - 20}
              width="44"
              height="40"
              rx="6"
              fill="#8a111e"
              stroke="#d4af37"
              strokeWidth="2"
              opacity="0.9"
            />
            <text
              x={pt.x}
              y={pt.y + 5}
              textAnchor="middle"
              fill="#f7d070"
              fontSize="14"
              fontFamily="Cinzel, serif"
              fontWeight="bold"
            >
              {idx + 1}
            </text>
          </g>
        ))}

        {/* Slytherin Corridor (Top arm center) */}
        {corridorCoords.slytherin.map((pt, idx) => (
          <g key={`corridor-slyth-${idx}`}>
            <rect
              x={pt.x - 20}
              y={pt.y - 22}
              width="40"
              height="44"
              rx="6"
              fill="#165b33"
              stroke="#c0c0c0"
              strokeWidth="2"
              opacity="0.9"
            />
            <text
              x={pt.x}
              y={pt.y + 5}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="14"
              fontFamily="Cinzel, serif"
              fontWeight="bold"
            >
              {idx + 1}
            </text>
          </g>
        ))}

        {/* Ravenclaw Corridor (Right arm center) */}
        {corridorCoords.ravenclaw.map((pt, idx) => (
          <g key={`corridor-raven-${idx}`}>
            <rect
              x={pt.x - 22}
              y={pt.y - 20}
              width="44"
              height="40"
              rx="6"
              fill="#1e3a8a"
              stroke="#cd7f32"
              strokeWidth="2"
              opacity="0.9"
            />
            <text
              x={pt.x}
              y={pt.y + 5}
              textAnchor="middle"
              fill="#93c5fd"
              fontSize="14"
              fontFamily="Cinzel, serif"
              fontWeight="bold"
            >
              {idx + 1}
            </text>
          </g>
        ))}

        {/* Hufflepuff Corridor (Bottom arm center) */}
        {corridorCoords.hufflepuff.map((pt, idx) => (
          <g key={`corridor-huff-${idx}`}>
            <rect
              x={pt.x - 20}
              y={pt.y - 22}
              width="40"
              height="44"
              rx="6"
              fill="#c49a15"
              stroke="#1c1917"
              strokeWidth="2"
              opacity="0.9"
            />
            <text
              x={pt.x}
              y={pt.y + 5}
              textAnchor="middle"
              fill="#1c1917"
              fontSize="14"
              fontFamily="Cinzel, serif"
              fontWeight="bold"
            >
              {idx + 1}
            </text>
          </g>
        ))}

        {/* ---------------- 68 PERIMETER TILES ---------------- */}
        {Object.entries(tileCoords).map(([numStr, pt]) => {
          const num = parseInt(numStr, 10);
          const isSafe = SAFE_TILES.includes(num);
          const isExit = pt.isExit;

          let tileFill = '#221912';
          let tileStroke = '#523f2b';

          if (isExit && pt.house) {
            tileFill = HOUSES[pt.house].primaryColor;
            tileStroke = HOUSES[pt.house].secondaryColor;
          } else if (isSafe) {
            tileFill = '#3a2a1b';
            tileStroke = '#d4af37';
          }

          return (
            <g key={`tile-${num}`} transform={`translate(${pt.x}, ${pt.y})`}>
              {/* Tile Box */}
              <circle
                r="18"
                fill={tileFill}
                stroke={tileStroke}
                strokeWidth={isSafe ? 2.5 : 1.5}
              />

              {/* Safe Star Icon */}
              {isSafe && (
                <text
                  x="0"
                  y="-7"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fill="#f59e0b"
                >
                  ★
                </text>
              )}

              {/* Tile Number */}
              <text
                x="0"
                y={isSafe ? '5' : '1'}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight="600"
                fill={isExit ? '#ffffff' : isSafe ? '#fcd34d' : '#a8947b'}
              >
                {num}
              </text>
            </g>
          );
        })}

        {/* ---------------- CENTER CASTLE / HOGWARTS DESTINATION ---------------- */}
        <g transform="translate(380, 380)">
          {/* Great Hall Central Square */}
          <rect
            width="240"
            height="240"
            rx="20"
            fill="#1e150f"
            stroke="#d4af37"
            strokeWidth="5"
          />

          {/* 4 House Triangles pointing to center */}
          {/* Gryffindor (Left) */}
          <polygon points="0,0 120,120 0,240" fill="#8a111e" opacity="0.85" stroke="#d4af37" strokeWidth="2" />
          {/* Slytherin (Top) */}
          <polygon points="0,0 120,120 240,0" fill="#165b33" opacity="0.85" stroke="#c0c0c0" strokeWidth="2" />
          {/* Ravenclaw (Right) */}
          <polygon points="240,0 120,120 240,240" fill="#1e3a8a" opacity="0.85" stroke="#cd7f32" strokeWidth="2" />
          {/* Hufflepuff (Bottom) */}
          <polygon points="0,240 120,120 240,240" fill="#c49a15" opacity="0.85" stroke="#1c1917" strokeWidth="2" />

          {/* Central Golden Crest Medallion */}
          <circle cx="120" cy="120" r="52" fill="#100b08" stroke="#d4af37" strokeWidth="4" />
          <text
            x="120"
            y="106"
            textAnchor="middle"
            fill="#f59e0b"
            fontFamily="Cinzel, serif"
            fontSize="14"
            fontWeight="bold"
            letterSpacing="1"
          >
            HOGWARTS
          </text>
          <text
            x="120"
            y="134"
            textAnchor="middle"
            fontSize="26"
          >
            🏆
          </text>
        </g>

        {/* ---------------- HIGHLIGHT DESTINATION TARGETS ---------------- */}
        {highlightedDestinations.map(({ move, pt }, i) => (
          <g
            key={`highlight-${i}`}
            transform={`translate(${pt.x}, ${pt.y})`}
            className="cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              onExecuteMove(move);
            }}
          >
            {/* Expanded Touch Target for iOS Safari */}
            <circle r="36" fill="rgba(245, 158, 11, 0.01)" />

            {/* Glowing Golden Portal */}
            <circle
              r="26"
              fill="rgba(245, 158, 11, 0.45)"
              stroke="#fbbf24"
              strokeWidth="4"
              strokeDasharray="6 3"
              className="animate-spin"
            />
            <circle r="16" fill="#f59e0b" className="opacity-80 animate-pulse" />

            {/* Step Count Label */}
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fontSize="12"
              fill="#1e140d"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              +{move.dieValue}
            </text>

            {move.isCapture && (
              <g transform="translate(0, -32)">
                <rect x="-55" y="-12" width="110" height="20" rx="6" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />
                <text x="0" y="2" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">
                  ⚡ ¡Expelliarmus!
                </text>
              </g>
            )}
            {move.isEnteringGoal && (
              <g transform="translate(0, -32)">
                <rect x="-50" y="-12" width="100" height="20" rx="6" fill="#065f46" stroke="#6ee7b7" strokeWidth="1" />
                <text x="0" y="2" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">
                  🏆 ¡A Hogwarts!
                </text>
              </g>
            )}
            {move.fromState === 'home' && (
              <g transform="translate(0, -32)">
                <rect x="-42" y="-12" width="84" height="20" rx="6" fill="#78350f" stroke="#fde68a" strokeWidth="1" />
                <text x="0" y="2" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">
                  🚪 ¡A la Salida!
                </text>
              </g>
            )}
          </g>
        ))}

        {/* ---------------- RENDER ALL TOKENS ---------------- */}
        {renderTokens()}
      </svg>
    </div>
  </div>
  );
};
