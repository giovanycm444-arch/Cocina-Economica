import React, { useState } from 'react';
import { X, DollarSign, Receipt, Flame, Carrot, Layers, Package } from 'lucide-react';
import { ExpenseCategory } from '../types';
import { dataService } from '../services/dataService';
import { soundEffects } from '../utils/audio';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredBy?: string;
}

const CATEGORIES: { id: ExpenseCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'gas', label: 'Gas LP', icon: <Flame className="w-4 h-4 text-orange-500" />, color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { id: 'verdura', label: 'Verdura / Recaudo', icon: <Carrot className="w-4 h-4 text-emerald-600" />, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'tortillas', label: 'Tortillería', icon: <Layers className="w-4 h-4 text-amber-600" />, color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'insumos', label: 'Desechables / Insumos', icon: <Package className="w-4 h-4 text-blue-600" />, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'otro', label: 'Otro Gasto', icon: <Receipt className="w-4 h-4 text-stone-600" />, color: 'bg-stone-50 border-stone-200 text-stone-700' },
];

const PRESET_AMOUNTS = [50, 100, 150, 200, 350, 500];

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  registeredBy = 'Cajero',
}) => {
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenseCategory>('verdura');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Number(amount);
    if (!finalAmount || finalAmount <= 0) return;

    const defaultConcepts: Record<ExpenseCategory, string> = {
      gas: 'Pago de gas para cocina',
      verdura: 'Compra de recaudo y verduras',
      tortillas: 'Compra de tortillas del día',
      insumos: 'Desechables / servilletas / bolsas',
      otro: 'Gasto menor de caja chica',
    };

    const finalConcept = concept.trim() || defaultConcepts[category];

    dataService.saveExpense({
      concept: finalConcept,
      amount: finalAmount,
      category,
      registeredBy,
    });

    soundEffects.cashRegister();
    setSuccessMsg(true);

    setTimeout(() => {
      setSuccessMsg(false);
      setConcept('');
      setAmount('');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-100 text-red-700 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">Registrar Gasto Rápido</h2>
              <p className="text-xs text-stone-500">Salida de efectivo de la caja chica</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl active:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">
              ✓
            </div>
            <p className="font-bold text-stone-800">¡Gasto registrado en caja!</p>
            <p className="text-xs text-stone-500">El saldo neto se actualizó al instante</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Monto Pagado ($ MXN)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                  autoFocus
                  className="w-full pl-9 pr-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl text-2xl font-black text-stone-900 focus:bg-white focus:border-red-500 focus:outline-none transition"
                />
              </div>

              {/* Fast amount buttons */}
              <div className="grid grid-cols-6 gap-1.5 mt-2">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val);
                      soundEffects.tap();
                    }}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                      amount === val
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Categoría del Gasto</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      soundEffects.tap();
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition ${
                      category === cat.id
                        ? `${cat.color} ring-2 ring-red-500/40`
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Concept note */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Detalle / Nota <span className="text-stone-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Cilantro, jitomates y cebollas"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:bg-white focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-2xl bg-stone-100 font-bold text-stone-700 text-xs active:bg-stone-200 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!amount || Number(amount) <= 0}
                className="w-2/3 py-3 rounded-2xl bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white font-black text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
              >
                <span>Descontar de Caja</span>
                <span>${amount || '0'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
