import React from 'react';
import { Player, HOUSES, DiceState, MoveOption } from '../types/parchis';

interface SideDiceHUDProps {
  activePlayer: Player;
  dice: DiceState;
  selectedTokenId: number | null;
  availableMovesForSelectedToken: MoveOption[];
  selectedDieIndex: number | null;
  onDieSelect: (index: number) => void;
  onOpenDrawer: () => void;
  onDeselectToken: () => void;
}

export const SideDiceHUD: React.FC<SideDiceHUDProps> = ({
  activePlayer,
  dice,
  selectedTokenId,
  availableMovesForSelectedToken,
  selectedDieIndex,
  onDieSelect,
  onOpenDrawer,
  onDeselectToken
}) => {
  const house = HOUSES[activePlayer.house];

  // Only render when dice have been rolled or movement is pending
  if (dice.canRoll || !dice.hasRolled) return null;

  return (
    <aside
      aria-label="Resultados de dados y turno"
      className="fixed top-14 right-2 sm:right-4 z-30 max-w-[280px] w-auto animate-in slide-in-from-right duration-300 pointer-events-none"
    >
      <div className="pointer-events-auto rounded-2xl bg-stone-950/92 backdrop-blur-md border-2 border-amber-500/70 p-2.5 sm:p-3 shadow-2xl flex flex-col gap-2 text-amber-50">
        {/* Top Mini Header: Player House & Menu Trigger */}
        <div className="flex items-center justify-between gap-2 border-b border-amber-900/40 pb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow shrink-0 border"
              style={{
                backgroundColor: house.primaryColor,
                borderColor: house.secondaryColor
              }}
            >
              <span>{house.animalIcon}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-cinzel font-semibold block leading-tight">
                Tirada de
              </span>
              <p className="text-xs font-bold font-cinzel text-amber-100 truncate leading-tight">
                {activePlayer.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenDrawer}
            className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-900/50 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
            title="Abrir Menú y Datos"
          >
            ☰
          </button>
        </div>

        {/* Rolled Dice Display Widget */}
        <div className="flex items-center gap-2 justify-center py-1">
          {dice.values.slice(0, dice.count).map((val, idx) => {
            const isUsed = dice.used[idx];
            const isSelected = selectedDieIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onDieSelect(idx)}
                disabled={isUsed}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                  isUsed
                    ? 'opacity-40 bg-stone-900 border-stone-800 line-through cursor-not-allowed text-stone-500'
                    : isSelected
                    ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-lg scale-105'
                    : 'bg-stone-900 hover:bg-stone-850 text-amber-200 border-amber-500/60 shadow'
                }`}
                title={isUsed ? 'Dado ya utilizado' : `Dado ${val}`}
              >
                <span className="text-base">🎲</span>
                <span className="text-sm font-black font-mono">{val}</span>
                {isUsed && (
                  <span className="absolute -top-1 -right-1 text-[9px] bg-stone-700 text-stone-300 rounded-full px-1">
                    ✓
                  </span>
                )}
              </button>
            );
          })}

          {dice.pendingBonus !== null && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold font-mono text-xs shadow animate-pulse">
              <span>+{dice.pendingBonus}</span>
            </div>
          )}
        </div>

        {/* Selected Piece or Move Advice */}
        {selectedTokenId !== null ? (
          <div className="flex items-center justify-between gap-1 px-2 py-1 rounded-lg bg-amber-950/70 border border-amber-600/40 text-[11px]">
            <span className="text-amber-200 truncate">
              🪄 Ficha #{selectedTokenId + 1} seleccionada
            </span>
            <button
              type="button"
              onClick={onDeselectToken}
              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-800 text-stone-300 hover:bg-stone-700 cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        ) : (
          <p className="text-[10px] text-amber-200/80 font-cinzel text-center">
            Toca una ficha de {house.name} para mover
          </p>
        )}
      </div>
    </aside>
  );
};
