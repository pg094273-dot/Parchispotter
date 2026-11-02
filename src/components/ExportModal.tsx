import React, { useState } from 'react';
import { downloadFile, generateStandaloneHtml, generateStandaloneReadme } from '../utils/exportStandalone';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [downloadedHtml, setDownloadedHtml] = useState(false);
  const [downloadedReadme, setDownloadedReadme] = useState(false);

  if (!isOpen) return null;

  const handleDownloadHtml = () => {
    const htmlContent = generateStandaloneHtml();
    downloadFile('index.html', htmlContent, 'text/html');
    setDownloadedHtml(true);
  };

  const handleDownloadReadme = () => {
    const readmeContent = generateStandaloneReadme();
    downloadFile('README.md', readmeContent, 'text/markdown');
    setDownloadedReadme(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl bg-stone-900 border-2 border-amber-700/80 p-5 sm:p-6 shadow-2xl text-amber-50 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📦</span>
            <div>
              <h2 className="font-cinzel text-xl font-bold text-amber-300">
                Publicar en GitHub Pages
              </h2>
              <p className="text-xs text-amber-200/60 font-cinzel">
                Archivos listos para subir y desplegar automáticamente tu juego
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

        {/* 1-Click Download Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={handleDownloadHtml}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              downloadedHtml
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-100'
                : 'border-amber-600 bg-amber-950/30 hover:bg-amber-900/40 text-amber-50 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📄</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/40 text-amber-300">
                {downloadedHtml ? '✓ Descargado' : 'HTML Único'}
              </span>
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-sm text-amber-200">
                1. Descargar index.html
              </h3>
              <p className="text-[11px] text-stone-300 mt-1">
                Juego completo 100% autónomo (HTML, CSS, JS y audio sin dependencias externas).
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleDownloadReadme}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              downloadedReadme
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-100'
                : 'border-amber-600 bg-amber-950/30 hover:bg-amber-900/40 text-amber-50 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📋</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/40 text-amber-300">
                {downloadedReadme ? '✓ Descargado' : 'Documentación'}
              </span>
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-sm text-amber-200">
                2. Descargar README.md
              </h3>
              <p className="text-[11px] text-stone-300 mt-1">
                Guía completa con las instrucciones paso a paso para GitHub.
              </p>
            </div>
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="rounded-2xl bg-black/50 border border-amber-900/40 p-4 space-y-3 text-xs text-stone-300 mb-5">
          <h4 className="font-cinzel font-bold text-amber-300 uppercase tracking-wider text-xs">
            Pasos para el despliegue automático:
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-stone-300">
            <li>
              Crea un nuevo repositorio en GitHub llamado <code className="bg-stone-800 text-amber-300 px-1 py-0.5 rounded font-mono">parchis-hogwarts</code> (público).
            </li>
            <li>
              Sube los dos archivos descargados (<code className="text-amber-200 font-mono">index.html</code> y <code className="text-amber-200 font-mono">README.md</code>) directamente a la raíz de tu repositorio.
            </li>
            <li>
              Entra en la pestaña <strong>Settings</strong> del repositorio → en el menú izquierdo haz clic en <strong>Pages</strong>.
            </li>
            <li>
              En <strong>Build and deployment</strong>, selecciona:
              <ul className="list-disc list-inside ml-4 mt-1 text-stone-400">
                <li>Source: <strong>Deploy from a branch</strong></li>
                <li>Branch: <strong>main</strong> y carpeta <strong>/ (root)</strong></li>
              </ul>
            </li>
            <li>
              Haz clic en <strong>Save</strong>. ¡En unos instantes tu juego estará en vivo en:
              <div className="mt-1 font-mono text-amber-300 bg-stone-900 p-2 rounded border border-amber-900/40 select-all">
                https://TU-USUARIO.github.io/parchis-hogwarts/
              </div>
            </li>
          </ol>
        </div>

        {/* Safari iPhone / iPad PWA Hint */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2.5">
          <span className="text-lg">📱</span>
          <p>
            <strong>Para iPhone y iPad:</strong> Una vez publicado en GitHub Pages, abre el enlace en <strong>Safari</strong>, pulsa el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba) y elige <strong>"Añadir a pantalla de inicio"</strong> para tener el juego a pantalla completa como una app nativa.
          </p>
        </div>
      </div>
    </div>
  );
};
