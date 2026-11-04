import React from 'react';
import { Player, HouseId, HOUSES, DiceState, GameHistoryEntry } from '../types/parchis';
import { DiceRoller } from './DiceRoller';
import { PlayersHUD } from './PlayersHUD';

interface TurnDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePlayer: Player;
  players: Player[];
  playerCount: number;
  dice: DiceState;
  isBotTurn: boolean;
  onRollDice: () => void;
  onDieSelect: (idx: number) => void;
  selectedDieIndex: number | null;
  onDiceCountChange: (count: 1 | 2) => void;
  onTogglePlayerType: (house: HouseId) => void;
  onChangePlayerCount: (count: number) => void;
  onResetGame: () => void;
  onOpenRules: () => void;
  history: GameHistoryEntry[];
}

export const TurnDrawer: React.FC<TurnDrawerProps> = ({
  isOpen,
  onClose,
  activePlayer,
  players,
  playerCount,
  dice,
  isBotTurn,
  onRollDice,
  onDieSelect,
  selectedDieIndex,
  onDiceCountChange,
  onTogglePlayerType,
  onChangePlayerCount,
  onResetGame,
  onOpenRules,
  history
}) => {
  if (!isOpen) return null;

  const house = HOUSES[activePlayer.house];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity">
      <div
        className="relative w-full max-w-xl max-h-[88vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-stone-900 border-2 border-amber-600/90 shadow-2xl p-4 sm:p-6 text-amber-50 flex flex-col gap-4 overflow-y-auto animate-in slide-in-from-bottom duration-300"
      >
        {/* Header / Grab handle */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📜</span>
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-300">
                Menú del Gran Comedor
              </h3>
              <p className="text-[11px] text-amber-200/60 font-cinzel">
                Turnos, tirador de dados y datos del torneo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current Active Player Banner */}
        <div
          className="p-3.5 rounded-2xl border shadow-lg flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(26, 18, 13, 0.95)',
            borderColor: house.secondaryColor
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-lg border-2 shrink-0"
              style={{
                backgroundColor: house.primaryColor,
                borderColor: house.secondaryColor
              }}
            >
              <span>{house.animalIcon}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-cinzel font-semibold">
                Turno Actual
              </span>
              <h4 className="text-base font-bold font-cinzel truncate text-amber-100">
                {activePlayer.name}
              </h4>
              <p className="text-[11px] text-stone-400 font-cinzel truncate">
                {house.name} · {activePlayer.type === 'bot' ? 'Mago IA' : 'Jugador Humano'}
              </p>
            </div>
          </div>

          {dice.pendingBonus !== null && (
            <div className="px-2.5 py-1 rounded-xl bg-amber-500 text-stone-950 font-bold font-mono text-xs shadow-md animate-pulse">
              +{dice.pendingBonus} Pasos
            </div>
          )}
        </div>

        {/* Dice Roller Section */}
        <div className="w-full">
          <DiceRoller
            dice={dice}
            currentHouse={activePlayer.house}
            isBotTurn={isBotTurn}
            onRoll={() => {
              onRollDice();
              // Auto-close if needed or keep open
            }}
            onDieSelect={onDieSelect}
            selectedDieIndex={selectedDieIndex}
            onDiceCountChange={onDiceCountChange}
          />
        </div>

        {/* Players Status Grid */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 font-cinzel">
              Casas Participantes ({players.length})
            </span>
            <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-amber-900/40">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChangePlayerCount(n)}
                  className={`w-6 h-6 rounded text-[10px] font-cinzel font-bold flex items-center justify-center transition-all ${
                    playerCount === n
                      ? 'bg-amber-600 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-amber-200'
                  }`}
                  title={`${n} Jugadores`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <PlayersHUD
            players={players}
            activeHouse={activePlayer.house}
            onTogglePlayerType={onTogglePlayerType}
          />
        </div>

        {/* Game Log */}
        <div className="p-3 rounded-2xl bg-stone-950/70 border border-amber-900/40 flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/80 font-cinzel">
            Crónica de Hechizos
          </span>
          <div className="h-20 overflow-y-auto space-y-1 pr-1 text-[11px] text-stone-300">
            {history.slice(0, 15).map(item => (
              <div key={item.id} className="flex items-start gap-1">
                <span className="text-amber-400 shrink-0 font-bold">✦</span>
                <span
                  className={
                    item.type === 'capture'
                      ? 'text-red-300 font-semibold'
                      : item.type === 'goal'
                      ? 'text-emerald-300 font-semibold'
                      : item.type === 'extra_turn'
                      ? 'text-amber-300'
                      : 'text-stone-300'
                  }
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-900/30 text-xs">
          <button
            type="button"
            onClick={onOpenRules}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 font-cinzel font-semibold flex items-center gap-1.5"
          >
            <span>📜</span>
            <span>Normas Clásicas</span>
          </button>
          <button
            type="button"
            onClick={onResetGame}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-cinzel"
          >
            Reiniciar Fichas
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-cinzel font-bold shadow"
          >
            Volver al Tablero
          </button>
        </div>
      </div>
    </div>
  );
};
