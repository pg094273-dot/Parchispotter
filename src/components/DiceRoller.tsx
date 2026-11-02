import React from 'react';
import { DiceState, HouseId, HOUSES } from '../types/parchis';
import { soundManager } from '../utils/audio';

interface DiceRollerProps {
  dice: DiceState;
  currentHouse: HouseId;
  isBotTurn: boolean;
  onRoll: () => void;
  onDieSelect?: (dieIndex: number) => void;
  selectedDieIndex?: number | null;
  onDiceCountChange: (count: 1 | 2) => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  dice,
  currentHouse,
  isBotTurn,
  onRoll,
  onDieSelect,
  selectedDieIndex,
  onDiceCountChange
}) => {
  const houseConfig = HOUSES[currentHouse];

  const handleRollClick = () => {
    if (!dice.canRoll || isBotTurn) return;
    soundManager.playDiceRoll();
    onRoll();
  };

  // Helper to render die pips/dots
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
      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
        {coords.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="9"
            fill="#1e140d"
            className="drop-shadow-sm"
          />
        ))}
      </svg>
    );
  };

  const isDoubles = dice.count === 2 && dice.values.length === 2 && dice.values[0] === dice.values[1];
  const hasSix = dice.values.some(v => v === 6);

  return (
    <div className="w-full flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl bg-stone-900/90 border border-amber-900/40 backdrop-blur-md shadow-xl text-amber-50">
      {/* Top Header: Dice Mode Toggle & Bonus Alert */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wider text-amber-400 font-cinzel font-semibold">
            Tirador Mágico
          </span>
          {dice.pendingBonus !== null && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-500 text-stone-950 animate-pulse">
              +{dice.pendingBonus} Pasos
            </span>
          )}
        </div>

        {/* 1 or 2 Dice Selector */}
        <div className="flex items-center gap-1 bg-stone-950/80 p-0.5 rounded-lg border border-amber-900/40">
          <button
            type="button"
            onClick={() => onDiceCountChange(1)}
            disabled={!dice.canRoll || isBotTurn}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              dice.count === 1
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'text-amber-200/70 hover:text-amber-100 disabled:opacity-40'
            }`}
          >
            1 Dado
          </button>
          <button
            type="button"
            onClick={() => onDiceCountChange(2)}
            disabled={!dice.canRoll || isBotTurn}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              dice.count === 2
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'text-amber-200/70 hover:text-amber-100 disabled:opacity-40'
            }`}
          >
            2 Dados
          </button>
        </div>
      </div>

      {/* Graphical 3D Dice Display */}
      <div className="flex items-center justify-center gap-4 py-3 min-h-[76px]">
        {dice.values.map((val, idx) => {
          const isUsed = dice.used[idx];
          const isSelected = selectedDieIndex === idx;

          return (
            <button
              key={idx}
              type="button"
              disabled={isUsed || dice.canRoll}
              onClick={() => onDieSelect && onDieSelect(idx)}
              className={`relative group w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 transition-all duration-300 transform select-none ${
                dice.isRolling ? 'rotate-180 scale-105' : 'hover:scale-105'
              } ${
                isUsed
                  ? 'opacity-35 border-stone-700 bg-stone-800 cursor-not-allowed'
                  : isSelected
                  ? 'border-amber-400 bg-amber-100 ring-4 ring-amber-400/40 shadow-lg shadow-amber-500/30'
                  : 'border-amber-600/70 bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 shadow-md cursor-pointer hover:border-amber-400'
              }`}
            >
              {renderPips(val)}
              {isUsed && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-950/50 rounded-xl">
                  <span className="text-amber-400 text-lg">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Extra turn notices */}
      {!dice.canRoll && (isDoubles || hasSix) && (
        <div className="text-center py-1 px-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-medium font-cinzel">
          {isDoubles ? '⚡ ¡Dobles sacados! ¡Tirada extra!' : '✨ ¡Sacaste un 6! ¡Tirada adicional!'}
        </div>
      )}

      {/* Primary Roll Action Button */}
      <button
        type="button"
        disabled={!dice.canRoll || isBotTurn}
        onClick={handleRollClick}
        style={{
          boxShadow: dice.canRoll && !isBotTurn ? `0 0 20px ${houseConfig.accentColor}33` : 'none'
        }}
        className={`w-full h-12 rounded-xl font-cinzel font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
          dice.canRoll && !isBotTurn
            ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 text-stone-950 shadow-lg cursor-pointer'
            : 'bg-stone-800/80 text-stone-400 border border-stone-700/50 cursor-not-allowed'
        }`}
      >
        <span>🎲</span>
        <span>
          {isBotTurn
            ? `Turno de ${houseConfig.name}...`
            : dice.canRoll
            ? 'Lanzar Dados Mágicos'
            : 'Selecciona una ficha para mover'}
        </span>
      </button>
    </div>
  );
};
