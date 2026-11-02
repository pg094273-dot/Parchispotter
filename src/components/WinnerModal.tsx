import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { HouseId, HOUSES, Player } from '../types/parchis';
import { soundManager } from '../utils/audio';

interface WinnerModalProps {
  winnerHouse: HouseId | null;
  players: Player[];
  onPlayAgain: () => void;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winnerHouse,
  players,
  onPlayAgain,
  onClose
}) => {
  useEffect(() => {
    if (winnerHouse) {
      soundManager.playVictory();

      // Launch victory fireworks
      const end = Date.now() + 3 * 1000;
      const colors = ['#d4af37', '#9b111e', '#165b33', '#1e3a8a', '#c49a15'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [winnerHouse]);

  if (!winnerHouse) return null;

  const house = HOUSES[winnerHouse];
  const winningPlayer = players.find(p => p.house === winnerHouse);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      <div className="relative w-full max-w-md rounded-3xl bg-stone-900 border-2 border-amber-500/80 p-6 text-center text-amber-50 shadow-2xl">
        <div className="text-6xl mb-3 animate-bounce">
          🏆
        </div>

        <p className="text-xs uppercase tracking-widest text-amber-400 font-cinzel font-semibold mb-1">
          ¡Copa de las Casas Conquistada!
        </p>

        <h2 className="font-cinzel text-3xl font-extrabold text-amber-200 mb-2">
          ¡Victoria de {house.name}!
        </h2>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 shadow"
          style={{ backgroundColor: house.primaryColor, border: `2px solid ${house.secondaryColor}` }}
        >
          <span className="text-xl">{house.animalIcon}</span>
          <span className="font-cinzel text-sm font-bold text-white">
            {winningPlayer?.name || house.name}
          </span>
        </div>

        <p className="text-xs text-amber-200/70 italic mb-6 font-cinzel">
          "{house.latinMotto}"
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-stone-950 font-bold font-cinzel tracking-wider text-sm shadow-lg shadow-amber-600/30 cursor-pointer"
          >
            ⚡ Jugar Otra Partida
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-cinzel text-xs transition-colors"
          >
            Revisar Tablero Final
          </button>
        </div>
      </div>
    </div>
  );
};
