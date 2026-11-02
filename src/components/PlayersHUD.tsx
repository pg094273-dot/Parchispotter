import React from 'react';
import { Player, HouseId, HOUSES } from '../types/parchis';

interface PlayersHUDProps {
  players: Player[];
  activeHouse: HouseId;
  onPlayerClick?: (house: HouseId) => void;
  onTogglePlayerType?: (house: HouseId) => void;
}

export const PlayersHUD: React.FC<PlayersHUDProps> = ({
  players,
  activeHouse,
  onPlayerClick,
  onTogglePlayerType
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full">
      {players.map(player => {
        const houseConfig = HOUSES[player.house];
        const isActive = player.house === activeHouse;

        const homeCount = player.tokens.filter(t => t.state === 'home').length;
        const boardCount = player.tokens.filter(t => t.state === 'board' || t.state === 'corridor').length;
        const goalCount = player.tokens.filter(t => t.state === 'goal').length;

        return (
          <div
            key={player.house}
            onClick={() => onPlayerClick && onPlayerClick(player.house)}
            className={`relative p-2.5 sm:p-3 rounded-xl transition-all duration-300 border flex flex-col justify-between select-none cursor-pointer ${
              isActive
                ? 'border-amber-400 bg-stone-900/95 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/10'
                : 'border-amber-900/30 bg-stone-950/70 hover:border-amber-800/50'
            }`}
          >
            {/* Top row: Avatar & Name */}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-md shrink-0"
                style={{ backgroundColor: houseConfig.primaryColor, border: `1.5px solid ${houseConfig.secondaryColor}` }}
              >
                <span>{houseConfig.animalIcon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-cinzel text-xs font-bold truncate text-amber-100">
                    {player.name}
                  </h3>
                  {onTogglePlayerType && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePlayerType(player.house);
                      }}
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-cinzel font-semibold transition-colors ${
                        player.type === 'human'
                          ? 'bg-amber-600/90 text-stone-950 hover:bg-amber-500'
                          : 'bg-stone-800 text-amber-300/80 border border-amber-900/40 hover:bg-stone-700'
                      }`}
                      title="Pulsa para alternar entre Humano y Mago IA"
                    >
                      {player.type === 'human' ? '👤 Humano' : '🪄 IA'}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-amber-200/50 truncate font-cinzel">
                  {houseConfig.name}
                </p>
              </div>
            </div>

            {/* Bottom row: Token progress badges */}
            <div className="mt-2.5 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] font-mono">
              <span className="text-stone-400" title="En Casa">
                🏠 {homeCount}
              </span>
              <span className="text-amber-200/80" title="En Juego">
                🎲 {boardCount}
              </span>
              <span className="text-amber-400 font-bold" title="En Hogwarts">
                🏰 {goalCount}/4
              </span>
            </div>

            {/* Active turn indicator beacon */}
            {isActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping opacity-75" />
            )}
          </div>
        );
      })}
    </div>
  );
};
