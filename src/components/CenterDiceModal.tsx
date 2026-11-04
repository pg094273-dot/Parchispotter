import React, { useEffect } from 'react';
import { DiceState, Player, HOUSES } from '../types/parchis';
import { soundManager } from '../utils/audio';

interface CenterDiceModalProps {
  isOpen: boolean;
  dice: DiceState;
  activePlayer: Player;
  isBotTurn: boolean;
  onRoll: () => void;
  onDiceCountChange: (count: 1 | 2) => void;
}

export const CenterDiceModal: React.FC<CenterDiceModalProps> = ({
  isOpen,
  dice,
  activePlayer,
  isBotTurn,
  onRoll,
  onDiceCountChange
}) => {
  const house = HOUSES[activePlayer.house];

  // Auto-roll for bot players
  useEffect(() => {
    if (isOpen && isBotTurn && dice.canRoll && !dice.isRolling) {
      const timer = setTimeout(() => {
        onRoll();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isBotTurn, dice.canRoll, dice.isRolling, onRoll]);

  if (!isOpen) return null;

  const handleRollClick = () => {
    if (!dice.canRoll || isBotTurn || dice.isRolling) return;
    soundManager.playDiceRoll();
    onRoll();
  };

  const renderPips = (value: number) => {
    const pipCoords: Record<number, [number, number][]> = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [75, 25], [25, 75], [75, 75]],
      5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
      6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
    };

    const coords = pipCoords[value] || [[50, 50]];

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-2.5">
        {coords.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="9.5"
            fill="#1e140d"
            className="drop-shadow-sm"
          />
        ))}
      </svg>
    );
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-all duration-300 animate-in fade-in"
      aria-label="Tirador de Dados Central"
    >
      <div
        className="relative rounded-3xl p-5 sm:p-6 bg-stone-950/95 border-2 shadow-2xl flex flex-col items-center gap-4 max-w-xs sm:max-w-sm w-full mx-auto animate-in zoom-in-95 duration-200 text-amber-50"
        style={{
          borderColor: house.secondaryColor,
          boxShadow: `0 0 40px ${house.primaryColor}88`
        }}
      >
        {/* Header: Turn banner & Dice Selector */}
        <div className="w-full flex items-center justify-between border-b border-amber-900/40 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{house.animalIcon}</span>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-amber-400 font-cinzel font-semibold">
                ¡Hora de tirar!
              </p>
              <h4 className="font-cinzel text-sm font-bold text-amber-100 truncate">
                {activePlayer.name}
              </h4>
            </div>
          </div>

          {/* 1 or 2 Dice Toggle */}
          <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-amber-900/40">
            <button
              type="button"
              onClick={() => onDiceCountChange(1)}
              disabled={dice.isRolling || isBotTurn}
              className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                dice.count === 1
                  ? 'bg-amber-600 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              1 Dado
            </button>
            <button
              type="button"
              onClick={() => onDiceCountChange(2)}
              disabled={dice.isRolling || isBotTurn}
              className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                dice.count === 2
                  ? 'bg-amber-600 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              2 Dados
            </button>
          </div>
        </div>

        {/* 3D Visual Dice Display */}
        <div
          className="flex items-center justify-center gap-5 my-2 cursor-pointer"
          onClick={handleRollClick}
          title={isBotTurn ? 'El bot está tirando...' : 'Toca para tirar los dados'}
        >
          {Array.from({ length: dice.count }).map((_, idx) => {
            const val = dice.values[idx] || 1;
            return (
              <div
                key={idx}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300 shadow-xl flex items-center justify-center transform transition-transform duration-300 ${
                  dice.isRolling ? 'animate-spin scale-110' : 'hover:scale-105 active:scale-95'
                }`}
                style={{
                  boxShadow: `0 10px 25px rgba(0,0,0,0.5), 0 0 15px ${house.primaryColor}66`
                }}
              >
                {renderPips(val)}
              </div>
            );
          })}
        </div>

        {/* Big Interactive Action Button */}
        <button
          type="button"
          onClick={handleRollClick}
          disabled={!dice.canRoll || isBotTurn || dice.isRolling}
          className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-stone-950 font-cinzel font-black text-sm tracking-wider shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>🎲</span>
          <span>
            {dice.isRolling
              ? 'Lanzando hechizo...'
              : isBotTurn
              ? 'Mago IA Lanzando...'
              : '¡TOCAR PARA TIRAR!'}
          </span>
        </button>
      </div>
    </div>
  );
};
