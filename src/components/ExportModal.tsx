import React, { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [downloadedSingle, setDownloadedSingle] = useState(false);
  const [downloadedZip, setDownloadedZip] = useState(false);

  if (!isOpen) return null;

  // Direct download of the compiled standalone index.html (single file with everything bundled)
  const handleDownloadSingleHtml = async () => {
    try {
      const res = await fetch('./index.html');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloadedSingle(true);
        return;
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Download the ZIP file
  const handleDownloadZip = async () => {
    try {
      const res = await fetch('./parchis-hogwarts-github-pages.zip');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Potterchis-github-pages.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloadedZip(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-stone-900 border-2 border-amber-600/90 p-4 sm:p-6 shadow-2xl text-amber-50 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">📱</span>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-amber-300">
                Publicar desde iPhone (Sin Carpetas)
              </h2>
              <p className="text-[11px] text-amber-200/60 font-cinzel">
                Solución de 1 solo archivo para GitHub Pages
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-amber-300/70 hover:text-amber-100 hover:bg-stone-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Why it was blank explanation */}
        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-600/50 mb-3 text-xs text-amber-200/90 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 font-cinzel text-xs">
            <span>💡</span>
            <span>¿Por qué en el iPhone no te dejaba subir carpetas?</span>
          </div>
          <p className="text-stone-300 text-[11px] leading-relaxed">
            Safari en iOS no permite arrastrar o subir carpetas enteras a la web de GitHub, y los archivos ocultos (como <code>.nojekyll</code>) no se ven en la app Archivos del iPhone.
          </p>
          <p className="text-amber-300 font-semibold text-[11px]">
            ⚡ <strong>Solución:</strong> Hemos empaquetado TODO el juego (gráficos, reglas, sonidos y estilos) dentro de <strong>UN ÚNICO ARCHIVO <code>index.html</code></strong>. ¡No necesitas carpetas ni descomprimir nada!
          </p>
        </div>

        {/* PRIMARY CTA FOR IPHONE: 1 Single File */}
        <div className="mb-3">
          <button
            type="button"
            onClick={handleDownloadSingleHtml}
            className={`w-full p-3.5 sm:p-4 rounded-2xl font-cinzel font-bold text-xs sm:text-sm flex items-center justify-between transition-all shadow-xl cursor-pointer ${
              downloadedSingle
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-[0.99] text-stone-950 shadow-amber-600/20'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl shrink-0">📄</span>
              <div className="text-left min-w-0">
                <span className="block font-extrabold truncate">
                  {downloadedSingle ? '✓ index.html Descargado' : 'Descargar index.html (1 Solo Archivo)'}
                </span>
                <span className="block text-[11px] font-sans font-normal opacity-90 truncate">
                  Todo el juego en 1 archivo · Ideal para subir desde Safari en iPhone
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/30 font-bold shrink-0 ml-1">
              .HTML
            </span>
          </button>
        </div>

        {/* Secondary: ZIP download */}
        <div className="mb-3">
          <button
            type="button"
            onClick={handleDownloadZip}
            className="w-full p-2.5 rounded-xl border border-amber-900/40 bg-stone-950/70 hover:bg-stone-900 text-left flex items-center justify-between text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <span>📦</span>
              <div>
                <span className="font-cinzel font-semibold text-stone-300">
                  Descargar archivo comprimido .ZIP
                </span>
                <span className="block text-[10px] text-stone-400">
                  Para quienes prefieran descomprimirlo en un ordenador.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-400 shrink-0">
              {downloadedZip ? '✓ Descargado' : '.ZIP'}
            </span>
          </button>
        </div>

        {/* Step-by-Step for iPhone */}
        <div className="rounded-2xl bg-black/60 border border-amber-900/40 p-3.5 space-y-2 text-xs text-stone-300">
          <h4 className="font-cinzel font-bold text-amber-300 uppercase tracking-wider text-[11px]">
            Cómo subirlo desde el iPhone en 3 pasos:
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-stone-300 text-[11px]">
            <li>
              Pulsa el botón amarillo de arriba <strong>"Descargar index.html"</strong> (se guardará en la carpeta <em>Descargas</em> de tu iPhone).
            </li>
            <li>
              En Safari, abre tu repositorio:
              <div className="mt-0.5 font-mono text-amber-300 bg-stone-950 p-1.5 rounded border border-amber-900/40 select-all truncate text-[11px]">
                https://github.com/pg094273-dot/Potterchis
              </div>
            </li>
            <li>
              Toca <strong>Add file → Upload files</strong>, pulsa <strong>Choose your files</strong> y selecciona el archivo <strong>index.html</strong> recién descargado.
            </li>
            <li>
              Pulsa el botón verde <strong>Commit changes</strong>.
            </li>
          </ol>

          <div className="pt-1.5 border-t border-stone-800 text-[11px] text-emerald-300 font-medium">
            🚀 En 30-60 segundos entra en tu enlace:
            <div className="mt-0.5 font-mono text-emerald-200 bg-stone-950 p-1.5 rounded border border-emerald-900/40 select-all truncate">
              https://pg094273-dot.github.io/Potterchis/
            </div>
            ¡Tu Parchís de Hogwarts cargará de inmediato y a pantalla completa!
          </div>
        </div>
      </div>
    </div>
  );
};
