import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' | 'card' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide prompt
  if (isInstalled) {
    return null;
  }

  // Android / Chromium / Desktop install prompt
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-lg">
              <Download className="w-4 h-4" />
            </span>
            <div>
              <p className="font-bold">Instalar Cocina Express</p>
              <p className="text-orange-100 text-[11px]">Acceso rápido sin conexión en tu pantalla</p>
            </div>
          </div>
          <button
            onClick={install}
            className="bg-white text-orange-700 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm active:scale-95 transition"
          >
            Instalar App
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={install}
        aria-label="Instalar aplicación"
        className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold px-2.5 py-1.5 rounded-lg text-xs shadow-sm active:scale-95 transition"
        title="Instalar en tu celular"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition"
          title="Instalar en iPhone"
        >
          <Download className="w-3.5 h-3.5 text-stone-600" />
          <span className="hidden sm:inline">Instalar iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-stone-800">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    CE
                  </div>
                  <h3 className="font-bold text-stone-900">Instalar en iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 my-4 text-xs sm:text-sm text-stone-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">Paso 1: Botón Compartir</p>
                    <p className="text-stone-500 text-xs">Toca el ícono de compartir en la barra inferior de Safari.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900">Paso 2: Agregar a Inicio</p>
                    <p className="text-stone-500 text-xs">Desliza hacia abajo y selecciona &quot;Agregar a la pantalla de inicio&quot;.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-white text-xs sm:text-sm transition shadow-sm active:scale-98"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
