import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { HouseId, HOUSES, Player } from '../types/parchis';
import { soundManager } from '../utils/audio';
import hogwartsCastleImg from '../assets/images/hogwarts_castle_cinematic_1793787024485.jpg';

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

      // Launch victory fireworks across the screen
      const end = Date.now() + 5 * 1000;
      const colors = ['#d4af37', '#9b111e', '#165b33', '#1e3a8a', '#eab308', '#ffffff'];

      const interval: NodeJS.Timeout = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 25,
          spread: 70,
          origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.5 },
          colors
        });
      }, 350);

      return () => clearInterval(interval);
    }
  }, [winnerHouse]);

  if (!winnerHouse) return null;

  const house = HOUSES[winnerHouse];
  const winningPlayer = players.find(p => p.house === winnerHouse);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border-2 border-amber-500 shadow-2xl bg-stone-950 text-amber-50 flex flex-col">
        {/* Cinematic Hogwarts Castle Header Background */}
        <div className="relative w-full h-52 sm:h-60 overflow-hidden bg-black flex items-center justify-center">
          <img
            src={hogwartsCastleImg}
            alt="Castillo de Hogwarts Celebración"
            className="w-full h-full object-cover object-center scale-105 animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
          
          {/* Floating House Cup Trophy */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 backdrop-blur-md border-2 border-amber-400 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shadow-amber-500/50 animate-bounce mb-2">
              🏆
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-cinzel font-bold tracking-widest uppercase bg-amber-600/90 text-stone-950 border border-amber-300 shadow">
              ¡Copa de las Casas Conquistada!
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 text-center flex flex-col items-center">
          <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-amber-200 mb-2">
            ¡Victoria de {house.name}!
          </h2>

          <div
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-3 shadow-lg"
            style={{ backgroundColor: house.primaryColor, border: `2px solid ${house.secondaryColor}` }}
          >
            <span className="text-2xl">{house.animalIcon}</span>
            <div className="text-left">
              <p className="font-cinzel text-sm sm:text-base font-bold text-white leading-tight">
                {winningPlayer?.name || house.name}
              </p>
              <p className="text-[10px] text-amber-200/80 font-cinzel">
                Campeón del Parchís de Hogwarts
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-amber-200/80 italic mb-5 font-cinzel max-w-sm">
            "{house.latinMotto}"
          </p>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-stone-950 font-bold font-cinzel tracking-wider text-xs sm:text-sm shadow-lg shadow-amber-600/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>⚡</span>
              <span>Jugar Otra Partida</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-cinzel text-xs sm:text-sm transition-colors cursor-pointer border border-stone-700"
            >
              Revisar Tablero Final
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

