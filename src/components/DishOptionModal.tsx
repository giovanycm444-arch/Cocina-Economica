import React from 'react';
import { X, Check } from 'lucide-react';
import { MenuItem } from '../types';
import { soundEffects } from '../utils/audio';

interface DishOptionModalProps {
  dish: MenuItem | null;
  onClose: () => void;
  onSelectOption: (dish: MenuItem, option: string) => void;
}

export const DishOptionModal: React.FC<DishOptionModalProps> = ({
  dish,
  onClose,
  onSelectOption,
}) => {
  if (!dish || !dish.options || dish.options.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{dish.emoji}</span>
            <div>
              <h2 className="font-black text-stone-900 text-base">{dish.name}</h2>
              <p className="text-xs text-orange-600 font-bold">${dish.price} MXN • Selecciona el tipo/salsa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl active:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2">
          {dish.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                soundEffects.tap();
                onSelectOption(dish, opt);
                onClose();
              }}
              className="w-full p-4 rounded-2xl border-2 border-stone-200 hover:border-orange-500 bg-stone-50 hover:bg-orange-50/50 text-left font-black text-stone-900 text-sm flex items-center justify-between active:scale-98 transition shadow-xs"
              style={{ minHeight: '54px' }}
            >
              <span>{opt}</span>
              <span className="text-orange-600 font-bold text-xs bg-white px-2 py-1 rounded-lg border border-stone-200">
                Elegir
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            soundEffects.tap();
            onSelectOption(dish, dish.options![0]);
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-stone-100 text-stone-600 font-bold text-xs active:bg-stone-200 transition"
        >
          Agregar con opción por defecto ({dish.options[0]})
        </button>
      </div>
    </div>
  );
};
