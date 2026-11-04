import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HouseId,
  HOUSES,
  HOUSE_ORDER,
  Player,
  Token,
  DiceState,
  MoveOption,
  GameHistoryEntry,
  GameSettings
} from './types/parchis';
import { getLegalMoves, checkWinner } from './utils/parchisLogic';
import { selectBestBotMove } from './utils/botAI';
import { soundManager } from './utils/audio';
import { Board } from './components/Board';
import { DiceRoller } from './components/DiceRoller';
import { PlayersHUD } from './components/PlayersHUD';
import { ManualMovePanel } from './components/ManualMovePanel';
import { SetupModal } from './components/SetupModal';
import { WinnerModal } from './components/WinnerModal';
import { ExportModal } from './components/ExportModal';
import { RulesModal } from './components/RulesModal';
import { HogwartsIntroModal } from './components/HogwartsIntroModal';
import { TurnDrawer } from './components/TurnDrawer';
import { TurnAnnouncementModal } from './components/TurnAnnouncementModal';
import { CenterDiceModal } from './components/CenterDiceModal';
import { SideDiceHUD } from './components/SideDiceHUD';

const STORAGE_KEY = 'parchis_hogwarts_saved_game_v2';

const DEFAULT_PLAYERS: Player[] = HOUSE_ORDER.map((h, i) => ({
  house: h,
  name: HOUSES[h].defaultCharacter,
  type: i === 0 ? 'human' : 'bot',
  isActive: true,
  consecutiveSixes: 0,
  tokens: [
    { id: 0, house: h, state: 'home', position: 0 },
    { id: 1, house: h, state: 'home', position: 1 },
    { id: 2, house: h, state: 'home', position: 2 },
    { id: 3, house: h, state: 'home', position: 3 }
  ]
}));

export default function App() {
  // Number of active players (1 to 4)
  const [playerCount, setPlayerCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_count');
      if (saved) {
        const val = parseInt(saved, 10);
        if (val >= 1 && val <= 4) return val;
      }
    } catch (e) {}
    return 4;
  });

  // Game players state
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.players && Array.isArray(parsed.players)) return parsed.players;
      }
    } catch (e) {}
    return DEFAULT_PLAYERS;
  });

  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [dice, setDice] = useState<DiceState>({
    count: 1,
    values: [5],
    used: [false],
    isRolling: false,
    canRoll: true,
    hasRolled: false,
    pendingBonus: null
  });

  const [settings, setSettings] = useState<GameSettings>({
    diceCount: 1,
    soundEnabled: true,
    animationSpeed: 'normal',
    exactGoalNeeded: true,
    autoPass: true
  });

  const [history, setHistory] = useState<GameHistoryEntry[]>([
    {
      id: 'init',
      timestamp: Date.now(),
      text: '¡Bienvenidos al Torneo de Parchís de Hogwarts! Selecciona jugadores y dados para comenzar.',
      house: 'gryffindor',
      type: 'start'
    }
  ]);

  const [winner, setWinner] = useState<HouseId | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [selectedDieIndex, setSelectedDieIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isFreeMoveMode, setIsFreeMoveMode] = useState<boolean>(false);

  // Modals & Drawers
  const [isIntroOpen, setIsIntroOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAnnouncingTurn, setIsAnnouncingTurn] = useState(true);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Trigger turn announcement whenever turn changes
  useEffect(() => {
    setIsAnnouncingTurn(true);
  }, [currentTurnIndex]);

  // Active players in the match according to playerCount
  const activePlayers = useMemo(() => {
    return players.slice(0, playerCount);
  }, [players, playerCount]);

  const activePlayer = activePlayers[currentTurnIndex] || activePlayers[0];
  const isBotTurn = activePlayer?.type === 'bot';

  // Compute legal moves for the current active player
  const legalMoves = useMemo(() => {
    if (!activePlayer || dice.canRoll || winner) return [];
    return getLegalMoves(activePlayer, dice, activePlayers, settings);
  }, [activePlayer, dice, activePlayers, settings, winner]);

  // Moves available for the currently selected token
  const availableMovesForSelectedToken = useMemo(() => {
    if (selectedTokenId === null || !activePlayer) return [];
    return legalMoves.filter(m => m.tokenId === selectedTokenId);
  }, [legalMoves, selectedTokenId, activePlayer]);

  // Add history event helper
  const addLog = useCallback((text: string, house: HouseId, type: GameHistoryEntry['type']) => {
    setHistory(prev => [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        text,
        house,
        type
      },
      ...prev.slice(0, 40)
    ]);
  }, []);

  // Save game to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          players,
          currentTurnIndex,
          dice,
          settings,
          winner
        })
      );
      localStorage.setItem(STORAGE_KEY + '_count', playerCount.toString());
    } catch (e) {}
  }, [players, currentTurnIndex, dice, settings, winner, playerCount]);

  // Turn management: pass turn to next player in active players
  const passTurn = useCallback(() => {
    setCurrentTurnIndex(prev => {
      const nextIdx = (prev + 1) % activePlayers.length;
      return nextIdx;
    });

    setDice(prev => ({
      ...prev,
      values: prev.count === 1 ? [1] : [1, 1],
      used: prev.count === 1 ? [false] : [false, false],
      isRolling: false,
      canRoll: true,
      hasRolled: false,
      pendingBonus: null
    }));

    setSelectedTokenId(null);
    setSelectedDieIndex(null);
  }, [activePlayers.length]);

  // Execute a verified move
  const executeMove = useCallback(
    (move: MoveOption) => {
      soundManager.playTokenStep();

      let isCaptureOccurred = false;
      let isGoalOccurred = false;

      // Update tokens
      setPlayers(prevPlayers => {
        return prevPlayers.map(p => {
          if (p.house === activePlayer.house) {
            const updatedTokens = p.tokens.map(t => {
              if (t.id === move.tokenId) {
                return {
                  ...t,
                  state: move.toState,
                  position: move.toPosition
                };
              }
              return t;
            });

            return {
              ...p,
              tokens: updatedTokens
            };
          }

          // Opponent captured -> return to home
          if (move.isCapture && move.capturedToken && p.house === move.capturedToken.house) {
            isCaptureOccurred = true;
            const updatedTokens = p.tokens.map(t => {
              if (t.id === move.capturedToken!.tokenId) {
                return {
                  ...t,
                  state: 'home' as const,
                  position: t.id
                };
              }
              return t;
            });
            return {
              ...p,
              tokens: updatedTokens
            };
          }

          return p;
        });
      });

      if (move.fromState === 'home') {
        soundManager.playExitHome();
        addLog(
          `${activePlayer.name} sacó una ficha a la casilla de salida (${move.toPosition})`,
          activePlayer.house,
          'move'
        );
      } else if (move.isEnteringGoal) {
        isGoalOccurred = true;
        soundManager.playGoal();
        addLog(
          `¡${activePlayer.name} introdujo una ficha en Hogwarts! (+10 bonificación)`,
          activePlayer.house,
          'goal'
        );
      } else {
        addLog(
          `${activePlayer.name} avanzó ficha a la casilla ${move.toPosition}`,
          activePlayer.house,
          'move'
        );
      }

      if (move.isCapture && move.capturedToken) {
        soundManager.playCapture();
        addLog(
          `¡Expelliarmus! ${activePlayer.name} capturó ficha de ${HOUSES[move.capturedToken.house].name} (+20 bonificación)`,
          activePlayer.house,
          'capture'
        );
      }

      // Check victory
      const playerAfterMove: Player = {
        ...activePlayer,
        tokens: activePlayer.tokens.map(t =>
          t.id === move.tokenId ? { ...t, state: move.toState, position: move.toPosition } : t
        )
      };

      if (checkWinner(playerAfterMove)) {
        setWinner(activePlayer.house);
        addLog(
          `🏆 ¡${activePlayer.name} ha ganado la Copa de las Casas para ${HOUSES[activePlayer.house].name}!`,
          activePlayer.house,
          'goal'
        );
        return;
      }

      // Update dice used status or set bonus
      setDice(prev => {
        let newBonus: number | null = null;
        if (isCaptureOccurred) {
          newBonus = 20;
        } else if (isGoalOccurred) {
          newBonus = 10;
        }

        if (newBonus !== null) {
          return {
            ...prev,
            pendingBonus: newBonus
          };
        }

        if (prev.pendingBonus !== null) {
          return {
            ...prev,
            pendingBonus: null
          };
        }

        const newUsed = [...prev.used];
        if (move.dieIndex >= 0 && move.dieIndex < newUsed.length) {
          newUsed[move.dieIndex] = true;
        } else if (move.dieIndex === 99) {
          newUsed[0] = true;
          newUsed[1] = true;
        }

        return {
          ...prev,
          used: newUsed
        };
      });

      setSelectedTokenId(null);
      setSelectedDieIndex(null);
    },
    [activePlayer, addLog]
  );

  // Manual Stepper functions for Free Move mode
  const handleManualStep = useCallback(
    (tokenId: number, steps: number) => {
      soundManager.playTokenStep();
      setPlayers(prev =>
        prev.map(p => {
          if (p.house !== activePlayer.house) return p;
          const updatedTokens = p.tokens.map(t => {
            if (t.id !== tokenId) return t;

            if (t.state === 'home') {
              // Stepping from home puts it on board exit if positive
              if (steps > 0) {
                return { ...t, state: 'board' as const, position: HOUSES[p.house].exitTile };
              }
              return t;
            }

            if (t.state === 'board') {
              const newPos = ((t.position - 1 + steps + 68) % 68) + 1;
              return { ...t, position: newPos };
            }

            if (t.state === 'corridor') {
              const newCorridor = Math.max(1, Math.min(8, t.position + steps));
              if (newCorridor === 8) {
                return { ...t, state: 'goal' as const, position: 8 };
              }
              return { ...t, position: newCorridor };
            }

            return t;
          });
          return { ...p, tokens: updatedTokens };
        })
      );
      addLog(`Ajuste manual de ficha #${tokenId + 1}: ${steps > 0 ? '+' : ''}${steps} pasos`, activePlayer.house, 'move');
    },
    [activePlayer, addLog]
  );

  const handleManualSetState = useCallback(
    (tokenId: number, state: Token['state'], position: number) => {
      soundManager.playTokenStep();
      setPlayers(prev =>
        prev.map(p => {
          if (p.house !== activePlayer.house) return p;
          const updatedTokens = p.tokens.map(t => {
            if (t.id === tokenId) {
              return { ...t, state, position };
            }
            return t;
          });
          return { ...p, tokens: updatedTokens };
        })
      );
      addLog(`Ficha #${tokenId + 1} colocada manualmente en: ${state} (${position})`, activePlayer.house, 'move');
    },
    [activePlayer, addLog]
  );

  // Quick toggle Human vs AI Bot for any player card
  const handleTogglePlayerType = (house: HouseId) => {
    setPlayers(prev =>
      prev.map(p => (p.house === house ? { ...p, type: p.type === 'human' ? 'bot' : 'human' } : p))
    );
  };

  // Change active player count directly (1 to 4)
  const handleChangePlayerCount = (count: number) => {
    setPlayerCount(count);
    if (currentTurnIndex >= count) {
      setCurrentTurnIndex(0);
    }
    setSelectedTokenId(null);
    addLog(`Configuración cambiada a ${count} jugador${count > 1 ? 'es' : ''}.`, 'gryffindor', 'start');
  };

  // Turn continuation check
  useEffect(() => {
    if (dice.canRoll || !dice.hasRolled || winner) return;

    if (dice.pendingBonus !== null) {
      if (isBotTurn) {
        const timer = setTimeout(() => {
          const bonusMoves = getLegalMoves(activePlayer, dice, activePlayers, settings);
          if (bonusMoves.length > 0) {
            const best = selectBestBotMove(activePlayer, bonusMoves, activePlayers);
            if (best) executeMove(best);
          } else {
            setDice(d => ({ ...d, pendingBonus: null }));
          }
        }, 600);
        return () => clearTimeout(timer);
      }
      return;
    }

    const allDiceUsed = dice.used.every(u => u === true);

    if (allDiceUsed) {
      const hasSix = dice.values.some(v => v === 6);
      const isDoubles = dice.count === 2 && dice.values[0] === dice.values[1];

      if (hasSix || isDoubles) {
        soundManager.playExtraTurn();
        addLog(
          `¡Tirada adicional para ${activePlayer.name} por sacar ${hasSix ? 'un 6' : 'dobles'}!`,
          activePlayer.house,
          'extra_turn'
        );
        setDice(prev => ({
          ...prev,
          values: prev.count === 1 ? [1] : [1, 1],
          used: prev.count === 1 ? [false] : [false, false],
          canRoll: true,
          hasRolled: false,
          pendingBonus: null
        }));
      } else {
        const timer = setTimeout(passTurn, 500);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (legalMoves.length === 0) {
      addLog(`No hay movimientos posibles para ${activePlayer.name}. Pasa turno.`, activePlayer.house, 'roll');
      const timer = setTimeout(passTurn, 800);
      return () => clearTimeout(timer);
    }

    // Bot automatic execution
    if (isBotTurn && legalMoves.length > 0) {
      const timer = setTimeout(() => {
        const bestMove = selectBestBotMove(activePlayer, legalMoves, activePlayers);
        if (bestMove) {
          executeMove(bestMove);
        } else {
          passTurn();
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [
    dice,
    activePlayer,
    isBotTurn,
    legalMoves,
    winner,
    executeMove,
    passTurn,
    addLog,
    activePlayers,
    settings
  ]);

  // Roll the dice
  const handleRollDice = () => {
    if (!dice.canRoll || isBotTurn) return;

    soundManager.playDiceRoll();
    setDice(prev => ({ ...prev, isRolling: true }));

    setTimeout(() => {
      const val1 = Math.floor(Math.random() * 6) + 1;
      const newVals = [val1];
      if (dice.count === 2) {
        const val2 = Math.floor(Math.random() * 6) + 1;
        newVals.push(val2);
      }

      setDice({
        count: dice.count,
        values: newVals,
        used: newVals.map(() => false),
        isRolling: false,
        canRoll: false,
        hasRolled: true,
        pendingBonus: null
      });

      addLog(
        `${activePlayer.name} lanzó los dados y obtuvo: ${newVals.join(' y ')}`,
        activePlayer.house,
        'roll'
      );
    }, 450);
  };

  // Bot auto-roll (waits for turn announcement to finish)
  useEffect(() => {
    if (isBotTurn && dice.canRoll && !winner && !isAnnouncingTurn && !isIntroOpen) {
      const timer = setTimeout(() => {
        soundManager.playDiceRoll();
        const val1 = Math.floor(Math.random() * 6) + 1;
        const newVals = [val1];
        if (dice.count === 2) {
          const val2 = Math.floor(Math.random() * 6) + 1;
          newVals.push(val2);
        }

        setDice({
          count: dice.count,
          values: newVals,
          used: newVals.map(() => false),
          isRolling: false,
          canRoll: false,
          hasRolled: true,
          pendingBonus: null
        });

        addLog(
          `${activePlayer.name} lanzó los dados y obtuvo: ${newVals.join(' y ')}`,
          activePlayer.house,
          'roll'
        );
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isBotTurn, dice.canRoll, winner, isAnnouncingTurn, isIntroOpen, activePlayer, dice.count, addLog]);

  // Setup modal handler
  const handleStartNewGame = (newPlayers: Player[], newDiceCount: 1 | 2) => {
    setPlayers(newPlayers);
    setPlayerCount(newPlayers.length);
    setCurrentTurnIndex(0);
    setDice({
      count: newDiceCount,
      values: newDiceCount === 1 ? [5] : [5, 5],
      used: newDiceCount === 1 ? [false] : [false, false],
      isRolling: false,
      canRoll: true,
      hasRolled: false,
      pendingBonus: null
    });
    setWinner(null);
    setSelectedTokenId(null);
    addLog('¡Ha comenzado una nueva partida del Torneo de Hogwarts!', 'gryffindor', 'start');
  };

  const handleResetGame = () => {
    setPlayers(prev =>
      prev.map(p => ({
        ...p,
        consecutiveSixes: 0,
        tokens: p.tokens.map((t, idx) => ({
          ...t,
          state: 'home' as const,
          position: idx
        }))
      }))
    );
    setCurrentTurnIndex(0);
    setDice(d => ({
      ...d,
      values: d.count === 1 ? [5] : [5, 5],
      used: d.count === 1 ? [false] : [false, false],
      canRoll: true,
      hasRolled: false,
      pendingBonus: null
    }));
    setWinner(null);
    setSelectedTokenId(null);
    addLog('La partida ha sido reiniciada. Las fichas regresan a sus casas.', 'gryffindor', 'start');
  };

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#100b08] text-amber-50 antialiased relative selection:bg-amber-500 selection:text-stone-950"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 20%, rgba(36, 22, 14, 0.7), rgba(12, 8, 6, 0.98))`
      }}
    >
      {/* ----------------- TOP BAR (Compact & Unobtrusive) ----------------- */}
      <header className="sticky top-0 z-30 w-full max-w-full flex items-center justify-between gap-2 px-2.5 sm:px-6 py-2 bg-stone-950/90 backdrop-blur-md border-b border-amber-900/40">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="text-lg sm:text-xl">⚡</span>
          <span className="font-cinzel text-xs sm:text-base font-bold tracking-wider text-amber-300">
            Parchís Hogwarts
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs">
          <button
            type="button"
            onClick={() => setIsIntroOpen(true)}
            className="px-2 py-1 text-[11px] sm:text-xs text-amber-300 hover:text-amber-200 transition-colors font-cinzel cursor-pointer flex items-center gap-1 bg-stone-900/70 border border-amber-900/40 rounded-lg"
            title="Ver animación del Castillo de Hogwarts"
          >
            <span>🏰</span>
            <span className="hidden sm:inline">Hogwarts</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="px-2 py-1 text-[11px] sm:text-xs text-stone-300 hover:text-amber-300 transition-colors font-cinzel cursor-pointer flex items-center gap-1"
          >
            <span>📜</span>
            <span className="hidden sm:inline">Reglas</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="px-2.5 py-1 text-[11px] sm:text-xs text-amber-300 bg-amber-950/80 border border-amber-600/50 rounded-lg hover:bg-amber-900 transition-colors font-cinzel font-bold cursor-pointer flex items-center gap-1 shadow"
          >
            <span>📊</span>
            <span>Menú y Datos</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="px-2 py-1 text-[11px] sm:text-xs text-amber-400 font-semibold hover:text-amber-300 transition-colors font-cinzel cursor-pointer flex items-center gap-1"
          >
            <span>📦</span>
            <span className="hidden md:inline">Exportar</span>
          </button>
          <button
            type="button"
            onClick={() => soundManager.setMuted(!soundManager.getMuted())}
            className="px-2 py-1 text-[11px] sm:text-xs text-stone-300 hover:text-amber-300 transition-colors cursor-pointer hidden md:inline-block"
          >
            {soundManager.getMuted() ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            onClick={() => setIsSetupOpen(true)}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-cinzel font-bold text-stone-950 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            Nueva
          </button>
        </div>
      </header>

      {/* ----------------- COMPACT PLAYER SELECTOR BAR ----------------- */}
      <div className="w-full max-w-full bg-black/60 border-b border-amber-900/30 px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-cinzel font-bold text-amber-400 text-[11px] sm:text-xs">Jugadores:</span>
          <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-amber-900/40">
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => handleChangePlayerCount(n)}
                className={`w-7 sm:w-8 h-6 sm:h-7 rounded text-[11px] sm:text-xs font-cinzel font-bold flex items-center justify-center transition-all ${
                  playerCount === n
                    ? 'bg-amber-600 text-stone-950 shadow'
                    : 'text-stone-400 hover:text-amber-200 hover:bg-stone-800'
                }`}
                title={`${n} Jugador${n > 1 ? 'es' : ''}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="text-[10px] sm:text-xs text-amber-300/90 hover:text-amber-200 font-cinzel flex items-center gap-1.5 bg-stone-900 px-2 py-0.5 rounded-lg border border-amber-900/40 cursor-pointer"
          >
            <span>{HOUSES[activePlayer.house].animalIcon}</span>
            <span className="font-bold">{activePlayer.name}</span>
            <span className="text-stone-400 hidden xs:inline">({HOUSES[activePlayer.house].name})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFreeMoveMode(f => !f)}
            className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-cinzel font-semibold transition-colors ${
              isFreeMoveMode
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'bg-stone-900 text-amber-300/80 border border-amber-900/40 hover:bg-stone-800'
            }`}
          >
            {isFreeMoveMode ? '⚡ Libre: ON' : 'Modo Libre'}
          </button>
        </div>
      </div>

      {/* ----------------- FULL-SCREEN HERO BOARD VIEWPORT (Optimized for iPad & Mobile) ----------------- */}
      <main className="flex-1 w-full max-w-full flex flex-col items-center justify-center p-1 sm:p-2 relative select-none">
        {/* SVG Parchis Board - Full Viewport Presence */}
        <Board
          players={activePlayers}
          activeHouse={activePlayer.house}
          legalMoves={legalMoves}
          selectedTokenId={selectedTokenId}
          onSelectToken={(_, id) => setSelectedTokenId(id)}
          onExecuteMove={executeMove}
        />

        {/* Free Move / Fine Control Panel (rendered when piece selected or free move mode is active) */}
        {(selectedTokenId !== null || isFreeMoveMode) && (
          <div className="w-full max-w-xl mx-auto mt-2 px-2">
            <ManualMovePanel
              selectedTokenId={selectedTokenId}
              activePlayer={activePlayer}
              availableMovesForSelectedToken={availableMovesForSelectedToken}
              onExecuteMove={executeMove}
              onDeselect={() => setSelectedTokenId(null)}
              onManualStep={handleManualStep}
              onManualSetState={handleManualSetState}
              isFreeMoveMode={isFreeMoveMode}
              onToggleFreeMoveMode={() => setIsFreeMoveMode(f => !f)}
            />
          </div>
        )}
      </main>

      {/* ----------------- TRANSIENT TURN ANNOUNCEMENT POP-UP (Appears and auto-disappears) ----------------- */}
      <TurnAnnouncementModal
        player={activePlayer}
        isOpen={isAnnouncingTurn && !isIntroOpen && !winner}
        onFinish={() => setIsAnnouncingTurn(false)}
      />

      {/* ----------------- CENTER DICE ROLLER (Appears in center for rolling, then disappears) ----------------- */}
      <CenterDiceModal
        isOpen={!isAnnouncingTurn && dice.canRoll && !isIntroOpen && !winner}
        dice={dice}
        activePlayer={activePlayer}
        isBotTurn={isBotTurn}
        onRoll={handleRollDice}
        onDiceCountChange={cnt => setDice(d => ({ ...d, count: cnt }))}
      />

      {/* ----------------- SIDE DICE HUD (Docks to the side showing rolled numbers) ----------------- */}
      <SideDiceHUD
        activePlayer={activePlayer}
        dice={dice}
        selectedTokenId={selectedTokenId}
        availableMovesForSelectedToken={availableMovesForSelectedToken}
        selectedDieIndex={selectedDieIndex}
        onDieSelect={idx => setSelectedDieIndex(idx)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onDeselectToken={() => setSelectedTokenId(null)}
      />

      {/* ----------------- POP-UP MENU DRAWER (Turn, 3D Dice, Roster & Stats) ----------------- */}
      <TurnDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activePlayer={activePlayer}
        players={activePlayers}
        playerCount={playerCount}
        dice={dice}
        isBotTurn={isBotTurn}
        onRollDice={handleRollDice}
        onDieSelect={idx => setSelectedDieIndex(idx)}
        selectedDieIndex={selectedDieIndex}
        onDiceCountChange={cnt => setDice(d => ({ ...d, count: cnt }))}
        onTogglePlayerType={handleTogglePlayerType}
        onChangePlayerCount={handleChangePlayerCount}
        onResetGame={handleResetGame}
        onOpenRules={() => setIsRulesOpen(true)}
        history={history}
      />

      {/* ----------------- HOGWARTS CASTLE INTRO ANIMATION MODAL ----------------- */}
      <HogwartsIntroModal
        isOpen={isIntroOpen}
        onClose={() => setIsIntroOpen(false)}
      />

      {/* ----------------- MODALS ----------------- */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartGame={handleStartNewGame}
        initialDiceCount={dice.count}
      />

      <WinnerModal
        winnerHouse={winner}
        players={activePlayers}
        onPlayAgain={() => {
          setWinner(null);
          setIsSetupOpen(true);
        }}
        onClose={() => setWinner(null)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}
