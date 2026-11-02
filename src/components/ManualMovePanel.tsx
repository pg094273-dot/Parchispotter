import React from 'react';
import { HouseId, HOUSES, Player, Token, MoveOption } from '../types/parchis';

interface ManualMovePanelProps {
  selectedTokenId: number | null;
  activePlayer: Player;
  availableMovesForSelectedToken: MoveOption[];
  onExecuteMove: (move: MoveOption) => void;
  onDeselect: () => void;
  onManualStep: (tokenId: number, steps: number) => void;
  onManualSetState: (tokenId: number, state: Token['state'], position: number) => void;
  isFreeMoveMode: boolean;
  onToggleFreeMoveMode: () => void;
}

export const ManualMovePanel: React.FC<ManualMovePanelProps> = ({
  selectedTokenId,
  activePlayer,
  availableMovesForSelectedToken,
  onExecuteMove,
  onDeselect,
  onManualStep,
  onManualSetState,
  isFreeMoveMode,
  onToggleFreeMoveMode
}) => {
  if (selectedTokenId === null) {
    return (
      <div className="w-full p-2.5 sm:p-3 rounded-2xl bg-stone-950/60 border border-amber-900/30 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
        <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
          <span>👆</span>
          <span>Toca una ficha de {HOUSES[activePlayer.house].name} para seleccionarla</span>
        </span>
        <button
          type="button"
          onClick={onToggleFreeMoveMode}
          className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-cinzel font-semibold transition-colors ${
            isFreeMoveMode
              ? 'bg-amber-500 text-stone-950'
              : 'bg-stone-900 text-amber-300/80 border border-amber-900/40 hover:bg-stone-800'
          }`}
        >
          {isFreeMoveMode ? 'Modo Libre Activo' : 'Activar Modo Libre'}
        </button>
      </div>
    );
  }

  const token = activePlayer.tokens[selectedTokenId];
  if (!token) return null;

  const house = HOUSES[activePlayer.house];

  let positionLabel = '';
  if (token.state === 'home') positionLabel = 'En Casa';
  else if (token.state === 'board') positionLabel = `En Casilla ${token.position}`;
  else if (token.state === 'corridor') positionLabel = `Pasillo hacia Hogwarts (${token.position}/7)`;
  else if (token.state === 'goal') positionLabel = '¡En el Gran Comedor de Hogwarts!';

  return (
    <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-stone-900/95 border-2 border-amber-500/80 shadow-2xl text-amber-50 flex flex-col gap-3">
      {/* Header of selected token */}
      <div className="flex items-center justify-between border-b border-amber-900/40 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow font-bold"
            style={{ backgroundColor: house.primaryColor, border: `1.5px solid ${house.secondaryColor}` }}
          >
            <span>{house.animalIcon}</span>
          </div>
          <div>
            <h4 className="font-cinzel text-xs font-bold text-amber-200">
              Ficha #{token.id + 1} de {house.name}
            </h4>
            <p className="text-[11px] text-stone-300 font-mono">
              Posición actual: <strong className="text-amber-300">{positionLabel}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFreeMoveMode}
            className={`px-2 py-1 rounded text-[10px] font-cinzel font-bold transition-colors ${
              isFreeMoveMode
                ? 'bg-amber-400 text-stone-950 shadow'
                : 'bg-stone-800 text-stone-400 border border-stone-700 hover:text-amber-200'
            }`}
          >
            {isFreeMoveMode ? '⚡ Modo Libre ON' : 'Modo Libre'}
          </button>
          <button
            type="button"
            onClick={onDeselect}
            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-cinzel"
          >
            ✕ Deseleccionar
          </button>
        </div>
      </div>

      {/* Available moves according to dice */}
      {availableMovesForSelectedToken.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-cinzel uppercase tracking-wider text-amber-400/90 font-semibold">
            Movimientos con los dados disponibles (toca para mover):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableMovesForSelectedToken.map((m, idx) => {
              let label = `Mover +${m.dieValue} pasos`;
              let sublabel = '';
              if (m.fromState === 'home') {
                label = `🚪 Sacar a Salida (Casilla ${m.toPosition})`;
                sublabel = 'Requiere un 5';
              } else if (m.isEnteringGoal) {
                label = `🏆 Entrar a Hogwarts (+${m.dieValue})`;
                sublabel = '¡Meta alcanzada!';
              } else if (m.toState === 'corridor') {
                label = `Avanzar en Pasillo (${m.toPosition}/7) (+${m.dieValue})`;
              } else {
                label = `Avanzar a Casilla ${m.toPosition} (+${m.dieValue})`;
              }

              if (m.isCapture) {
                sublabel = '⚡ ¡Captura Expelliarmus! (+20 de regalo)';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onExecuteMove(m)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-stone-950 font-bold font-cinzel text-xs text-left shadow-md flex flex-col justify-between transition-transform cursor-pointer"
                >
                  <span className="truncate">{label}</span>
                  {sublabel && (
                    <span className="text-[10px] text-stone-900 font-sans font-medium mt-0.5 opacity-90 truncate">
                      {sublabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {availableMovesForSelectedToken.length === 0 && !isFreeMoveMode && (
        <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 text-xs text-stone-400 flex items-center justify-between">
          <span>Esta ficha no tiene jugadas válidas con la tirada actual.</span>
          <button
            type="button"
            onClick={onToggleFreeMoveMode}
            className="text-amber-400 hover:underline font-semibold font-cinzel text-xs"
          >
            Moverla en Modo Libre →
          </button>
        </div>
      )}

      {/* Free Manual Stepper Controls (when Free Mode is active) */}
      {isFreeMoveMode && (
        <div className="p-3 rounded-xl bg-black/50 border border-amber-900/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-cinzel text-amber-300 font-bold uppercase tracking-wider">
              Control Manual Libre de Ficha:
            </span>
            <span className="text-[10px] text-amber-200/60">
              Mueve paso a paso o a posiciones clave
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs font-semibold font-cinzel">
            <button
              type="button"
              onClick={() => onManualStep(token.id, -1)}
              className="py-2 px-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-center"
              title="Retroceder 1 paso"
            >
              ◀ -1 Paso
            </button>
            <button
              type="button"
              onClick={() => onManualStep(token.id, 1)}
              className="py-2 px-1 rounded-lg bg-amber-700 hover:bg-amber-600 text-amber-100 text-center"
              title="Avanzar 1 paso"
            >
              ▶ +1 Paso
            </button>
            <button
              type="button"
              onClick={() => onManualStep(token.id, 5)}
              className="py-2 px-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-center font-bold"
              title="Avanzar 5 pasos"
            >
              ▶▶ +5 Pasos
            </button>
            <button
              type="button"
              onClick={() => onManualSetState(token.id, 'board', house.exitTile)}
              className="py-2 px-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-center"
              title="Colocar en casilla de salida"
            >
              🚪 A Salida
            </button>
            <button
              type="button"
              onClick={() => onManualSetState(token.id, 'goal', 8)}
              className="py-2 px-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-center"
              title="Colocar en meta de Hogwarts"
            >
              🏆 A Hogwarts
            </button>
            <button
              type="button"
              onClick={() => onManualSetState(token.id, 'home', token.id)}
              className="py-2 px-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-red-300 text-center"
              title="Devolver a casa"
            >
              🏠 A Casa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
