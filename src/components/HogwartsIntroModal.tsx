import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';

interface HogwartsIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HogwartsIntroModal: React.FC<HogwartsIntroModalProps> = ({ isOpen, onClose }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      soundManager.playGoal();
      const timer = setTimeout(() => setShowContent(true), 150);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden select-none">
      {/* Cinematic Castle Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hogwarts_castle_cinematic_1793787024485.jpg"
          alt="Castillo de Hogwarts de Noche"
          className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[8000ms]"
          referrerPolicy="no-referrer"
        />
        {/* Atmospheric Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
      </div>

      {/* Floating Golden Sparks Effect */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-400 opacity-75 blur-[1px] animate-bounce"
            style={{
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 4 + 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Animated Content Card */}
      <div
        className={`relative z-20 max-w-lg w-[92%] p-6 sm:p-8 rounded-3xl bg-black/75 border-2 border-amber-500/80 shadow-2xl text-center text-amber-50 flex flex-col items-center gap-4 transition-all duration-700 transform ${
          showContent ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Hogwarts School Crest */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/30">
          <img
            src="/src/assets/images/hogwarts_school_crest_1793629565209.jpg"
            alt="Escudo de Hogwarts"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div>
          <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-400 font-cinzel font-semibold">
            Torneo de las Cuatro Casas
          </span>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-amber-200 mt-1 drop-shadow-md">
            Parchís de Hogwarts
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-cinzel mt-2 italic max-w-sm mx-auto">
            "Draco Dormiens Nunquam Titillandus"
          </p>
        </div>

        {/* 4 Houses Symbols Strip */}
        <div className="flex items-center justify-center gap-3 py-1">
          <span className="text-xl sm:text-2xl" title="Gryffindor">🦁</span>
          <span className="text-xl sm:text-2xl" title="Slytherin">🐍</span>
          <span className="text-xl sm:text-2xl" title="Ravenclaw">🦅</span>
          <span className="text-xl sm:text-2xl" title="Hufflepuff">🦡</span>
        </div>

        {/* Enter Action Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playTokenStep();
            onClose();
          }}
          className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-stone-950 font-bold font-cinzel tracking-wider text-sm sm:text-base shadow-xl shadow-amber-500/30 cursor-pointer transition-transform"
        >
          🏰 Entrar al Gran Comedor
        </button>
      </div>
    </div>
  );
};
