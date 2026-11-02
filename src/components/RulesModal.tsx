import React from 'react';
import { HOUSES, HOUSE_ORDER } from '../types/parchis';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl bg-stone-900 border-2 border-amber-800/80 p-5 sm:p-6 shadow-2xl text-amber-50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📜</span>
            <div>
              <h2 className="font-cinzel text-xl font-bold text-amber-300">
                Reglas del Parchís de Hogwarts
              </h2>
              <p className="text-xs text-amber-200/60 font-cinzel">
                Leyes y hechizos tradicionales del torneo de las 4 casas
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

        {/* Houses Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {HOUSE_ORDER.map(h => {
            const house = HOUSES[h];
            return (
              <div
                key={h}
                className="p-2.5 rounded-xl border border-amber-900/40 bg-stone-950/60 flex flex-col items-center text-center"
              >
                <span className="text-xl">{house.animalIcon}</span>
                <span className="text-xs font-bold font-cinzel text-amber-200 mt-1">
                  {house.name}
                </span>
                <span className="text-[10px] text-amber-400 font-mono">
                  Salida: {house.exitTile}
                </span>
              </div>
            );
          })}
        </div>

        {/* Rules Breakdown */}
        <div className="space-y-3 text-xs text-stone-300">
          <div className="p-3 rounded-xl bg-black/40 border border-stone-800">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <span>🚪</span> 1. Salida de Casa (¡Alohomora!)
            </h4>
            <p>
              Para sacar una ficha de tu casa a la casilla de salida debes sacar un <strong>5</strong> con el dado (o en modo 2 dados, si uno de los dados es 5 o la suma de ambos es 5). Si la casilla de salida está ocupada por dos fichas, no se podrá salir hasta que quede espacio.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-stone-800">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <span>🛡️</span> 2. Casillas Seguras y Barreras
            </h4>
            <p>
              Las casillas marcadas con una estrella dorada (<strong>★</strong>) son <strong>seguros</strong>: aquí ninguna ficha contraria puede ser capturada. Si dos fichas de la misma casa coinciden en una casilla, forman una <strong>barrera o puente</strong> que impide el paso de cualquier ficha contraria.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-stone-800">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <span>⚡</span> 3. Capturas (¡Expelliarmus!)
            </h4>
            <p>
              Si tu ficha cae en una casilla normal (no segura) ocupada por una ficha contraria, la ficha enemiga es capturada y devuelta inmediatamente a su casa. ¡Como recompensa mágica obtienes una bonificación de <strong>+20 casillas</strong> para avanzar con cualquiera de tus fichas!
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-stone-800">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <span>🎲</span> 4. Turnos Adicionales
            </h4>
            <p>
              Sacar un <strong>6</strong> (en modo 1 dado) o <strong>dobles</strong> (en modo 2 dados) te permite volver a tirar inmediatamente. Sin embargo, sacar tres 6 consecutivos penaliza enviando tu última ficha movida de vuelta a casa por exceso de codicia mágica.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-stone-800">
            <h4 className="font-cinzel font-bold text-amber-300 mb-1 flex items-center gap-1.5">
              <span>🏰</span> 5. Llegada al Castillo de Hogwarts
            </h4>
            <p>
              Tras recorrer las 68 casillas exteriores, tus fichas entran en el pasillo de 7 casillas de su color. Al introducir una ficha en el centro de Hogwarts, ganas una bonificación de <strong>+10 casillas</strong> para mover otra ficha. ¡El primer mago que introduzca sus <strong>4 fichas</strong> gana la gloriosa Copa de las Casas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
