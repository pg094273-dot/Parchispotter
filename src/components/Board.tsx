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
  getBoardTiles,
  getCorridorGeometries,
  getHomeBases,
  getGoalDestinations,
  BoardPoint
} from '../utils/boardCoordinates';
import { TokenGraphic } from './TokenGraphic';
import {
  HUFFLEPUFF_CREST,
  SLYTHERIN_CREST,
  RAVENCLAW_CREST,
  GRYFFINDOR_CREST,
  HOGWARTS_CREST
} from '../assets/crestImages';

interface BoardProps {
  players: Player[];
  activeHouse: HouseId;
  legalMoves: MoveOption[];
  selectedTokenId: number | null;
  onSelectToken: (house: HouseId, tokenId: number | null) => void;
  onExecuteMove: (move: MoveOption) => void;
  zoomLevel?: number;
}

export const Board: React.FC<BoardProps> = ({
  players,
  activeHouse,
  legalMoves,
  selectedTokenId,
  onSelectToken,
  onExecuteMove
}) => {
  const boardTiles = useMemo(() => getBoardTiles(), []);
  const corridorGeoms = useMemo(() => getCorridorGeometries(), []);
  const homeBases = useMemo(() => getHomeBases(), []);
  const goalDestinations = useMemo(() => getGoalDestinations(), []);

  // Map of movable token IDs for current active house
  const movableTokenIds = useMemo(() => {
    const set = new Set<number>();
    legalMoves.forEach(m => set.add(m.tokenId));
    return set;
  }, [legalMoves]);

  // Selected token moves
  const selectedMoves = useMemo(() => {
    if (selectedTokenId === null) return [];
    return legalMoves.filter(m => m.tokenId === selectedTokenId);
  }, [legalMoves, selectedTokenId]);

  // Find target destination points for highlighting
  const highlightedDestinations = useMemo(() => {
    return selectedMoves.map(m => {
      let pt: BoardPoint;
      if (m.toState === 'board') {
        const tile = boardTiles[m.toPosition];
        pt = tile ? { x: tile.cx, y: tile.cy } : { x: 500, y: 500 };
      } else if (m.toState === 'corridor') {
        const corr = corridorGeoms[activeHouse][m.toPosition - 1];
        pt = corr ? { x: corr.cx, y: corr.cy } : { x: 500, y: 500 };
      } else {
        pt = goalDestinations[activeHouse];
      }
      return { move: m, pt };
    });
  }, [selectedMoves, boardTiles, corridorGeoms, goalDestinations, activeHouse]);

  // Render tokens
  const renderTokens = () => {
    const rendered: React.ReactNode[] = [];

    // Group board tokens to handle stacking
    const boardOccupancy: Record<number, { player: Player; token: Token }[]> = {};
    players.forEach(player => {
      player.tokens.forEach(t => {
        if (t.state === 'board') {
          if (!boardOccupancy[t.position]) boardOccupancy[t.position] = [];
          boardOccupancy[t.position].push({ player, token: t });
        }
      });
    });

    players.forEach(player => {
      const houseConfig = HOUSES[player.house];
      const isCurrentPlayer = player.house === activeHouse;

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
          const tile = boardTiles[token.position];
          if (tile) {
            x = tile.cx;
            y = tile.cy;

            // Offset if 2 tokens on the same cell
            const stack = boardOccupancy[token.position] || [];
            if (stack.length > 1) {
              const index = stack.findIndex(
                item => item.player.house === player.house && item.token.id === token.id
              );
              // Offset horizontally or vertically based on cell orientation
              if (tile.w >= tile.h) {
                if (index === 0) x -= 14;
                if (index === 1) x += 14;
              } else {
                if (index === 0) y -= 14;
                if (index === 1) y += 14;
              }
            }
          }
        } else if (token.state === 'corridor') {
          const corr = corridorGeoms[player.house][token.position - 1];
          if (corr) {
            x = corr.cx;
            y = corr.cy;
          }
        } else if (token.state === 'goal') {
          const pt = goalDestinations[player.house];
          const angle = (token.id * Math.PI) / 2;
          x = pt.x + Math.cos(angle) * 18;
          y = pt.y + Math.sin(angle) * 18;
        }

        const handleTokenClick = (e: React.MouseEvent | React.TouchEvent) => {
          e.stopPropagation();
          if (isMovable || isCurrentPlayer) {
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
          >
            <TokenGraphic
              house={player.house}
              tokenId={token.id}
              isCurrentPlayer={isCurrentPlayer}
              isMovable={isMovable}
              isSelected={isSelected}
              onClick={handleTokenClick}
            />
          </g>
        );
      });
    });

    return rendered;
  };

  return (
    <div className="w-full max-w-full flex items-center justify-center p-0.5 sm:p-1">
      <div
        className="relative w-full aspect-square max-w-[min(100vw-8px,calc(100dvh-115px))] max-h-[calc(100dvh-115px)] mx-auto select-none rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-amber-900/70 bg-[#16100b]"
        style={{ touchAction: 'none' }}
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full block touch-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Background Parchment Radial */}
            <radialGradient id="parchmentBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2c1f15" />
              <stop offset="70%" stopColor="#1e140d" />
              <stop offset="100%" stopColor="#120c08" />
            </radialGradient>

            {/* Token Drop Shadow Filter */}
            <filter id="tokenShadowFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
              <feOffset dx="0" dy="3.5" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.65" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* 3D Coin Metallic Rim Gradients */}
            <linearGradient id="rimGoldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#d4af37" />
              <stop offset="70%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="rimSilverGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#e2e8f0" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="rimBronzeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="35%" stopColor="#cd7f32" />
              <stop offset="70%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* 3D Coin Gemstone Core Radial Gradients */}
            <radialGradient id="gemGryffindorGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="55%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#450a0a" />
            </radialGradient>
            <radialGradient id="gemSlytherinGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="55%" stopColor="#047857" />
              <stop offset="100%" stopColor="#022c22" />
            </radialGradient>
            <radialGradient id="gemRavenclawGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="55%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#0b1736" />
            </radialGradient>
            <radialGradient id="gemHufflepuffGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="55%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#713f12" />
            </radialGradient>

            {/* Corner House ClipPaths */}
            <clipPath id="cornerClipHufflepuff">
              <rect x="15" y="15" width="350" height="350" rx="22" />
            </clipPath>
            <clipPath id="cornerClipSlytherin">
              <rect x="635" y="15" width="350" height="350" rx="22" />
            </clipPath>
            <clipPath id="cornerClipRavenclaw">
              <rect x="15" y="635" width="350" height="350" rx="22" />
            </clipPath>
            <clipPath id="cornerClipGryffindor">
              <rect x="635" y="635" width="350" height="350" rx="22" />
            </clipPath>

            {/* Hogwarts Central Medallion ClipPath */}
            <clipPath id="centerHogwartsClip">
              <circle cx="120" cy="120" r="48" />
            </clipPath>

            {/* House Gradients */}
            <linearGradient id="gryffindorGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9b111e" />
              <stop offset="100%" stopColor="#5c070f" />
            </linearGradient>
            <linearGradient id="slytherinGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1a6e3e" />
              <stop offset="100%" stopColor="#0b381e" />
            </linearGradient>
            <linearGradient id="ravenclawGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f1f4d" />
            </linearGradient>
            <linearGradient id="hufflepuffGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#7a6012" />
            </linearGradient>
          </defs>

          {/* Board Background */}
          <rect width="1000" height="1000" fill="url(#parchmentBg)" />

          {/* Outer Filigree Borders */}
          <rect
            x="8"
            y="8"
            width="984"
            height="984"
            fill="none"
            stroke="#d4af37"
            strokeWidth="3"
            strokeDasharray="40 10 10 10"
            opacity="0.8"
          />

          {/* ---------------- 4 CORNER HOUSES (AUTHENTIC ILLUSTRATED HARRY POTTER CRESTS) ---------------- */}
          {/* HUFFLEPUFF (Top-Left: 15,15 - Yellow / Gold) */}
          <g>
            <rect
              x="15"
              y="15"
              width="350"
              height="350"
              rx="22"
              fill="#221a08"
            />
            <image
              href={HUFFLEPUFF_CREST}
              x="15"
              y="15"
              width="350"
              height="350"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#cornerClipHufflepuff)"
            />
            {/* Ornate Gold Border */}
            <rect
              x="15"
              y="15"
              width="350"
              height="350"
              rx="22"
              fill="none"
              stroke="#d4af37"
              strokeWidth="5"
            />
            {/* Subtle Vignette Overlay for token contrast */}
            <rect
              x="15"
              y="15"
              width="350"
              height="350"
              rx="22"
              fill="rgba(24, 18, 6, 0.08)"
              clipPath="url(#cornerClipHufflepuff)"
            />
            {/* 4 Token Home Resting Pods */}
            {homeBases.hufflepuff.tokenSlots.map((slot, i) => (
              <g key={i}>
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r="27"
                  fill="rgba(20, 15, 6, 0.72)"
                  stroke="#fde047"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r="20"
                  fill="rgba(253, 224, 71, 0.15)"
                />
              </g>
            ))}
          </g>

          {/* SLYTHERIN (Top-Right: 635,15 - Emerald / Silver) */}
          <g>
            <rect
              x="635"
              y="15"
              width="350"
              height="350"
              rx="22"
              fill="#061d10"
            />
            <image
              href={SLYTHERIN_CREST}
              x="635"
              y="15"
              width="350"
              height="350"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#cornerClipSlytherin)"
            />
            {/* Ornate Silver Border */}
            <rect
              x="635"
              y="15"
              width="350"
              height="350"
              rx="22"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="5"
            />
            <rect
              x="635"
              y="15"
              width="350"
              height="350"
              rx="22"
              fill="rgba(6, 29, 16, 0.08)"
              clipPath="url(#cornerClipSlytherin)"
            />
            {/* 4 Token Home Resting Pods */}
            {homeBases.slytherin.tokenSlots.map((slot, i) => (
              <g key={i}>
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r="27"
                  fill="rgba(6, 24, 14, 0.72)"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r="20"
                  fill="rgba(241, 245, 249, 0.15)"
                />
              </g>
            ))}
          </g>

          {/* RAVENCLAW (Bottom-Left: 15,635 - Sapphire / Bronze) */}
          <g>
            <rect
              x="15"
              y="635"
              width="350"
              height="350"
              rx="22"
              fill="#09142e"
            />
            <image
              href={RAVENCLAW_CREST}
              x="15"
              y="635"
              width="350"
              height="350"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#cornerClipRavenclaw)"
            />
            {/* Ornate Bronze Border */}
            <rect
              x="15"
              y="635"
              width="350"
              height="350"
              rx="22"
              fill="none"
              stroke="#cd7f32"
              strokeWidth="5"
            />
            <rect
              x="15"
              y="635"
              width="350"
              height="350"
              rx="22"
              fill="rgba(9, 20, 46, 0.08)"
              clipPath="url(#cornerClipRavenclaw)"
            />
            {/* 4 Token Home Resting Pods */}
            {homeBases.ravenclaw.tokenSlots.map((slot, i) => (
              <g key={i}>
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r="27"
                  fill="rgba(8, 18, 44, 0.72)"
                  stroke="#93c5fd"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r="20"
                  fill="rgba(147, 197, 253, 0.15)"
                />
              </g>
            ))}
          </g>

          {/* GRYFFINDOR (Bottom-Right: 635,635 - Scarlet / Gold) */}
          <g>
            <rect
              x="635"
              y="635"
              width="350"
              height="350"
              rx="22"
              fill="#260609"
            />
            <image
              href={GRYFFINDOR_CREST}
              x="635"
              y="635"
              width="350"
              height="350"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#cornerClipGryffindor)"
            />
            {/* Ornate Gold Border */}
            <rect
              x="635"
              y="635"
              width="350"
              height="350"
              rx="22"
              fill="none"
              stroke="#d4af37"
              strokeWidth="5"
            />
            <rect
              x="635"
              y="635"
              width="350"
              height="350"
              rx="22"
              fill="rgba(38, 6, 9, 0.08)"
              clipPath="url(#cornerClipGryffindor)"
            />
            {/* 4 Token Home Resting Pods */}
            {homeBases.gryffindor.tokenSlots.map((slot, i) => (
              <g key={i}>
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r="27"
                  fill="rgba(36, 6, 9, 0.72)"
                  stroke="#fde047"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r="20"
                  fill="rgba(253, 224, 71, 0.15)"
                />
              </g>
            ))}
          </g>

          {/* ---------------- 68 PERIMETER TRACK CELLS (RECTANGULAR GRIDS) ---------------- */}
          {Object.values(boardTiles).map(tile => {
            const isSafe = tile.isSafe;
            const isExit = tile.isExit;

            // Fill & stroke colors for cells
            let cellFill = '#221912';
            let cellStroke = '#543f2c';
            let textFill = '#c7b299';

            if (isExit && tile.house) {
              cellFill = HOUSES[tile.house].primaryColor;
              cellStroke = HOUSES[tile.house].secondaryColor;
              textFill = '#ffffff';
            } else if (isSafe) {
              cellFill = '#3b2b16';
              cellStroke = '#d4af37';
              textFill = '#fde047';
            }

            return (
              <g key={`tile-${tile.num}`}>
                {/* Cell Rectangle */}
                <rect
                  x={tile.x}
                  y={tile.y}
                  width={tile.w}
                  height={tile.h}
                  rx="4"
                  fill={cellFill}
                  stroke={cellStroke}
                  strokeWidth={isSafe || isExit ? 2.5 : 1.5}
                />

                {/* Safe Star Icon */}
                {isSafe && (
                  <text
                    x={tile.cx}
                    y={tile.cy - 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                    fill="#fbbf24"
                  >
                    ★
                  </text>
                )}

                {/* Exit Gate Icon */}
                {isExit && (
                  <text
                    x={tile.cx}
                    y={tile.cy - 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                    fill="#ffffff"
                  >
                    🚪
                  </text>
                )}

                {/* Cell Number (Large, high-contrast, bold) */}
                <text
                  x={tile.cx}
                  y={isSafe || isExit ? tile.cy + 9 : tile.cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={isSafe || isExit ? "12" : "13"}
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  fill={textFill}
                >
                  {tile.num}
                </text>
              </g>
            );
          })}

          {/* ---------------- 4 COLORED CORRIDORS (7 TILES EACH) ---------------- */}
          {/* Gryffindor Corridor (Red path) */}
          {corridorGeoms.gryffindor.map(cell => (
            <g key={`corr-gryf-${cell.step}`}>
              <rect
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                rx="5"
                fill="#8a111e"
                stroke="#d4af37"
                strokeWidth="2.5"
              />
              <text
                x={cell.cx}
                y={cell.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fontFamily="Cinzel, serif"
                fontWeight="900"
                fill="#fde047"
              >
                {cell.step}
              </text>
            </g>
          ))}

          {/* Slytherin Corridor (Green path) */}
          {corridorGeoms.slytherin.map(cell => (
            <g key={`corr-slyth-${cell.step}`}>
              <rect
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                rx="5"
                fill="#165b33"
                stroke="#c0c0c0"
                strokeWidth="2.5"
              />
              <text
                x={cell.cx}
                y={cell.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fontFamily="Cinzel, serif"
                fontWeight="900"
                fill="#f1f5f9"
              >
                {cell.step}
              </text>
            </g>
          ))}

          {/* Ravenclaw Corridor (Blue path) */}
          {corridorGeoms.ravenclaw.map(cell => (
            <g key={`corr-raven-${cell.step}`}>
              <rect
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                rx="5"
                fill="#1e3a8a"
                stroke="#cd7f32"
                strokeWidth="2.5"
              />
              <text
                x={cell.cx}
                y={cell.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fontFamily="Cinzel, serif"
                fontWeight="900"
                fill="#93c5fd"
              >
                {cell.step}
              </text>
            </g>
          ))}

          {/* Hufflepuff Corridor (Yellow path) */}
          {corridorGeoms.hufflepuff.map(cell => (
            <g key={`corr-huff-${cell.step}`}>
              <rect
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                rx="5"
                fill="#c49a15"
                stroke="#1c1917"
                strokeWidth="2.5"
              />
              <text
                x={cell.cx}
                y={cell.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fontFamily="Cinzel, serif"
                fontWeight="900"
                fill="#1c1917"
              >
                {cell.step}
              </text>
            </g>
          ))}

          {/* ---------------- CENTER CASTLE / HOGWARTS GOAL ---------------- */}
          <g transform="translate(380, 380)">
            <rect
              width="240"
              height="240"
              rx="16"
              fill="#1c130d"
              stroke="#d4af37"
              strokeWidth="5"
            />

            {/* 4 House Triangles pointing to center (Classic Parchis Corridor Arrivals) */}
            {/* Top: Hufflepuff (Yellow/Gold) */}
            <polygon points="0,0 240,0 120,120" fill="#c49a15" opacity="0.9" stroke="#d4af37" strokeWidth="2" />
            {/* Left: Ravenclaw (Blue) */}
            <polygon points="0,0 0,240 120,120" fill="#1e3a8a" opacity="0.9" stroke="#cd7f32" strokeWidth="2" />
            {/* Bottom: Gryffindor (Red) */}
            <polygon points="0,240 240,240 120,120" fill="#8a111e" opacity="0.9" stroke="#d4af37" strokeWidth="2" />
            {/* Right: Slytherin (Green) */}
            <polygon points="240,0 240,240 120,120" fill="#165b33" opacity="0.9" stroke="#c0c0c0" strokeWidth="2" />

            {/* Central Hogwarts Medallion with the authentic crest from board */}
            <circle cx="120" cy="120" r="54" fill="#100b08" stroke="#d4af37" strokeWidth="4.5" />
            <image
              href={HOGWARTS_CREST}
              x="72"
              y="72"
              width="96"
              height="96"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#centerHogwartsClip)"
            />
            <circle cx="120" cy="120" r="49" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeDasharray="6 3" />
            <circle cx="120" cy="120" r="53" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
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
              {/* Hitbox */}
              <circle r="40" fill="rgba(245, 158, 11, 0.01)" />

              {/* Glowing Target Ring */}
              <circle
                r="30"
                fill="rgba(245, 158, 11, 0.45)"
                stroke="#fbbf24"
                strokeWidth="4.5"
                strokeDasharray="6 3"
                className="animate-spin"
              />
              <circle r="18" fill="#f59e0b" className="opacity-90 animate-pulse" />

              <text
                x="0"
                y="5"
                textAnchor="middle"
                fontSize="13"
                fill="#1e140d"
                fontWeight="900"
                fontFamily="sans-serif"
              >
                +{move.dieValue}
              </text>

              {move.isCapture && (
                <g transform="translate(0, -36)">
                  <rect x="-60" y="-12" width="120" height="22" rx="6" fill="#991b1b" stroke="#fca5a5" strokeWidth="1.5" />
                  <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">
                    ⚡ ¡Expelliarmus!
                  </text>
                </g>
              )}
              {move.isEnteringGoal && (
                <g transform="translate(0, -36)">
                  <rect x="-55" y="-12" width="110" height="22" rx="6" fill="#065f46" stroke="#6ee7b7" strokeWidth="1.5" />
                  <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">
                    🏆 ¡A Hogwarts!
                  </text>
                </g>
              )}
              {move.fromState === 'home' && (
                <g transform="translate(0, -36)">
                  <rect x="-48" y="-12" width="96" height="22" rx="6" fill="#78350f" stroke="#fde68a" strokeWidth="1.5" />
                  <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">
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
