import React, { useState } from 'react';
import { X, Plus, DollarSign } from 'lucide-react';
import { OrderItem } from '../types';
import { soundEffects } from '../utils/audio';

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomItem: (item: OrderItem) => void;
}

export const CustomItemModal: React.FC<CustomItemModalProps> = ({
  isOpen,
  onClose,
  onAddCustomItem,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || Number(price) <= 0) return;

    soundEffects.tap();
    onAddCustomItem({
      menuItemId: `custom-${Date.now()}`,
      name: name.trim(),
      price: Number(price),
      quantity: 1,
      emoji: '🍽️',
      category: 'extra',
      notes: notes.trim() || undefined,
    });

    setName('');
    setPrice('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
              <Plus className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">Platillo Especial / Manual</h2>
              <p className="text-xs text-stone-500">Agrega un ítem no registrado en el menú</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl active:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Nombre del Platillo / Extra</label>
            <input
              type="text"
              placeholder="Ej. Medio Menú, Orden de Cecina, Taco extra..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Precio a cobrar ($ MXN)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full pl-7 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xl font-black text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Detalle para Cocina <span className="text-stone-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Con verdura, sin sal, bien cocido"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-2xl bg-stone-100 font-bold text-stone-700 text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !price || Number(price) <= 0}
              className="w-2/3 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-black text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <span>Agregar a Orden</span>
              <span>${price || '0'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
