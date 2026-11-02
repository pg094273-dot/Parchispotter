import React, { useState } from 'react';
import { HouseId, HOUSES, HOUSE_ORDER, Player, PlayerType } from '../types/parchis';
import { HouseEmblem } from './HouseEmblem';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (players: Player[], diceCount: 1 | 2) => void;
  initialDiceCount?: 1 | 2;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  initialDiceCount = 1
}) => {
  const [numPlayers, setNumPlayers] = useState<number>(4);
  const [diceCount, setDiceCount] = useState<1 | 2>(initialDiceCount);

  // Player state configuration
  const [playerConfigs, setPlayerConfigs] = useState<
    { house: HouseId; name: string; type: PlayerType }[]
  >(
    HOUSE_ORDER.map((h, i) => ({
      house: h,
      name: HOUSES[h].defaultCharacter,
      type: i === 0 ? 'human' : 'bot'
    }))
  );

  if (!isOpen) return null;

  const handlePlayerTypeToggle = (index: number) => {
    setPlayerConfigs(prev =>
      prev.map((p, idx) => (idx === index ? { ...p, type: p.type === 'human' ? 'bot' : 'human' } : p))
    );
  };

  const handleNameChange = (index: number, newName: string) => {
    setPlayerConfigs(prev =>
      prev.map((p, idx) => (idx === index ? { ...p, name: newName } : p))
    );
  };

  const handleStart = () => {
    const activePlayers: Player[] = playerConfigs.slice(0, numPlayers).map(cfg => ({
      house: cfg.house,
      name: cfg.name.trim() || HOUSES[cfg.house].name,
      type: cfg.type,
      isActive: true,
      consecutiveSixes: 0,
      tokens: [
        { id: 0, house: cfg.house, state: 'home', position: 0 },
        { id: 1, house: cfg.house, state: 'home', position: 1 },
        { id: 2, house: cfg.house, state: 'home', position: 2 },
        { id: 3, house: cfg.house, state: 'home', position: 3 }
      ]
    }));

    onStartGame(activePlayers, diceCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-stone-900 border-2 border-amber-800/80 p-5 sm:p-6 shadow-2xl text-amber-50 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏰</span>
            <div>
              <h2 className="font-cinzel text-xl font-bold text-amber-300">
                Torneo de Hogwarts
              </h2>
              <p className="text-xs text-amber-200/60 font-cinzel">
                Configura los magos y las reglas de la partida
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-300/70 hover:text-amber-100 hover:bg-stone-800"
          >
            ✕
          </button>
        </div>

        {/* Number of players selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 font-cinzel">
            Número de Jugadores (1 a 4)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setNumPlayers(n)}
                className={`py-2 rounded-xl text-xs font-bold font-cinzel transition-all ${
                  numPlayers === n
                    ? 'bg-amber-600 text-stone-950 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-stone-800/80 text-amber-200/80 hover:bg-stone-800'
                }`}
              >
                {n} {n === 1 ? 'Mago (+3 IAs)' : 'Magos'}
              </button>
            ))}
          </div>
        </div>

        {/* Dice count selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 font-cinzel">
            Tirador de Dados
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDiceCount(1)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                diceCount === 1
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200 ring-2 ring-amber-500/30'
                  : 'border-amber-900/30 bg-stone-950/60 text-stone-400'
              }`}
            >
              <span className="text-xl">🎲</span>
              <span className="text-xs font-bold font-cinzel">1 Dado Tradicional</span>
              <span className="text-[10px] text-amber-200/50">Turno extra con 6</span>
            </button>
            <button
              type="button"
              onClick={() => setDiceCount(2)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                diceCount === 2
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200 ring-2 ring-amber-500/30'
                  : 'border-amber-900/30 bg-stone-950/60 text-stone-400'
              }`}
            >
              <span className="text-xl">🎲🎲</span>
              <span className="text-xs font-bold font-cinzel">2 Dados Mágicos</span>
              <span className="text-[10px] text-amber-200/50">Reparto o suma de dados</span>
            </button>
          </div>
        </div>

        {/* Players Configuration list */}
        <div className="space-y-2.5 mb-6">
          <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider font-cinzel">
            Casas y Magos Participantes
          </label>

          {playerConfigs.slice(0, numPlayers).map((cfg, idx) => {
            const house = HOUSES[cfg.house];
            return (
              <div
                key={cfg.house}
                className="p-3 rounded-xl bg-stone-950/70 border border-amber-900/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base shadow shrink-0"
                    style={{ backgroundColor: house.primaryColor, border: `1.5px solid ${house.secondaryColor}` }}
                  >
                    <span>{house.animalIcon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-amber-400/80 font-cinzel font-bold">
                      {house.name}
                    </p>
                    <input
                      type="text"
                      value={cfg.name}
                      onChange={e => handleNameChange(idx, e.target.value)}
                      placeholder="Nombre del mago"
                      className="w-full bg-stone-900 border border-stone-800 rounded px-2 py-1 text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Toggle Human vs Bot */}
                <button
                  type="button"
                  onClick={() => handlePlayerTypeToggle(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-cinzel transition-colors shrink-0 flex items-center gap-1.5 ${
                    cfg.type === 'human'
                      ? 'bg-amber-600 text-stone-950'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <span>{cfg.type === 'human' ? '👤 Humano' : '🪄 Mago IA'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Start Game Action Button */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-stone-950 font-bold font-cinzel tracking-wider text-base shadow-xl shadow-amber-600/20 cursor-pointer"
        >
          ⚡ ¡Comenzar Torneo de Parchís!
        </button>
      </div>
    </div>
  );
};
