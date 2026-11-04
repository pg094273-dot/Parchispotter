import React from 'react';
import { HouseId, HOUSES, Player, DiceState, MoveOption } from '../types/parchis';

interface FloatingHUDProps {
  activePlayer: Player;
  dice: DiceState;
  selectedTokenId: number | null;
  availableMovesForSelectedToken: MoveOption[];
  isBotTurn: boolean;
  onRollDice: () => void;
  onOpenDrawer: () => void;
  onDeselectToken: () => void;
}

export const FloatingHUD: React.FC<FloatingHUDProps> = ({
  activePlayer,
  dice,
  selectedTokenId,
  availableMovesForSelectedToken,
  isBotTurn,
  onRollDice,
  onOpenDrawer,
  onDeselectToken
}) => {
  const house = HOUSES[activePlayer.house];

  return (
    <nav
      aria-label="Controles del turno"
      className="fixed bottom-2 inset-x-2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[94vw] sm:max-w-xl z-30 pointer-events-none"
    >
      <div className="pointer-events-auto rounded-2xl bg-stone-950/90 backdrop-blur-md border border-amber-500/50 p-2 sm:p-2.5 shadow-2xl flex flex-col gap-1.5 text-amber-50">
        {/* Token Selection Advice Banner */}
        {selectedTokenId !== null && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-900/60 border border-amber-500/50 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-amber-300 font-bold">🪄 Ficha #{selectedTokenId + 1}:</span>
              <span className="text-stone-200 truncate">
                {availableMovesForSelectedToken.length > 0
                  ? `Toca casilla (+${availableMovesForSelectedToken.map(m => m.dieValue).join(', +')})`
                  : 'Sin movimientos disponibles'}
              </span>
            </div>
            <button
              type="button"
              onClick={onDeselectToken}
              className="px-2 py-0.5 rounded text-[10px] font-cinzel font-bold bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600 ml-2 shrink-0 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Main Floating Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Active Player Info (Left) */}
          <button
            type="button"
            onClick={onOpenDrawer}
            className="flex items-center gap-2 text-left min-w-0 p-1 rounded-xl hover:bg-stone-900/60 transition-colors cursor-pointer"
            title="Toca para abrir Menú y Datos"
          >
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-md border shrink-0"
              style={{
                backgroundColor: house.primaryColor,
                borderColor: house.secondaryColor
              }}
            >
              <span>{house.animalIcon}</span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-cinzel font-semibold">
                  Turno
                </span>
                {dice.pendingBonus !== null && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-stone-950">
                    +{dice.pendingBonus}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold font-cinzel text-amber-100 truncate">
                {activePlayer.name}
              </p>
            </div>
          </button>

          {/* Dice & Quick Action (Center / Right) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Roll / Current Dice Display */}
            {dice.canRoll ? (
              <button
                type="button"
                onClick={onRollDice}
                disabled={isBotTurn || dice.isRolling}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.97] text-stone-950 font-cinzel font-black text-xs sm:text-sm shadow-lg shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>🎲</span>
                <span>{dice.isRolling ? 'Lanzando...' : 'Tirar Dados'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-stone-900 px-2 py-1 rounded-xl border border-amber-900/40">
                {dice.values.slice(0, dice.count).map((val, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-black ${
                      dice.used[idx]
                        ? 'line-through text-stone-500 bg-stone-950'
                        : 'text-amber-300 bg-stone-800 border border-amber-500/40'
                    }`}
                  >
                    🎲 {val}
                  </span>
                ))}
              </div>
            )}

            {/* Menu & Data Pop-up Button */}
            <button
              type="button"
              onClick={onOpenDrawer}
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-[0.97] border border-amber-900/60 text-amber-300 text-xs font-cinzel font-bold flex items-center gap-1 shadow cursor-pointer whitespace-nowrap"
            >
              <span>☰</span>
              <span className="hidden xs:inline sm:inline">Menú</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
