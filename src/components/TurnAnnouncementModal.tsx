import React, { useEffect } from 'react';
import { Player, HOUSES } from '../types/parchis';
import { soundManager } from '../utils/audio';

interface TurnAnnouncementModalProps {
  player: Player | null;
  isOpen: boolean;
  onFinish: () => void;
}

export const TurnAnnouncementModal: React.FC<TurnAnnouncementModalProps> = ({
  player,
  isOpen,
  onFinish
}) => {
  useEffect(() => {
    if (isOpen && player) {
      soundManager.playExitHome();
      const timer = setTimeout(() => {
        onFinish();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, player, onFinish]);

  if (!isOpen || !player) return null;

  const house = HOUSES[player.house];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-none transition-all duration-300 animate-in fade-in"
      aria-live="assertive"
    >
      <div
        className="pointer-events-auto transform transition-all duration-300 scale-100 rounded-3xl p-6 sm:p-8 text-center text-amber-50 shadow-2xl flex flex-col items-center gap-3 border-2 max-w-sm w-full mx-auto animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'rgba(20, 14, 10, 0.96)',
          borderColor: house.secondaryColor,
          boxShadow: `0 0 35px ${house.primaryColor}88`
        }}
      >
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-xl border-2 animate-bounce"
          style={{
            backgroundColor: house.primaryColor,
            borderColor: house.secondaryColor
          }}
        >
          <span>{house.animalIcon}</span>
        </div>

        <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-400 font-cinzel font-semibold">
          ✦ Nuevo Turno ✦
        </span>

        <h3 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-amber-100 tracking-wide">
          Turno de {player.name}
        </h3>

        <div
          className="px-3.5 py-1 rounded-full text-xs font-cinzel font-bold shadow"
          style={{
            backgroundColor: house.primaryColor,
            border: `1.5px solid ${house.secondaryColor}`
          }}
        >
          {house.name} · {player.type === 'bot' ? 'Mago IA' : 'Jugador'}
        </div>

        <p className="text-xs text-amber-200/70 italic font-cinzel pt-1">
          "{house.latinMotto}"
        </p>
      </div>
    </div>
  );
};
