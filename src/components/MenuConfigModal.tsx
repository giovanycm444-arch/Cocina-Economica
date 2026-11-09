import React, { useState } from 'react';
import { X, Sparkles, Check, DollarSign, Plus, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { MenuItem, Category } from '../types';
import { dataService } from '../services/dataService';
import { soundEffects } from '../utils/audio';

interface MenuConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: MenuItem[];
  onMenuUpdated: () => void;
}

export const MenuConfigModal: React.FC<MenuConfigModalProps> = ({
  isOpen,
  onClose,
  menu,
  onMenuUpdated,
}) => {
  const [items, setItems] = useState<MenuItem[]>(menu);
  const [selectedId, setSelectedId] = useState<string>(menu[0]?.id || 'menu_dia');
  const [savedBadge, setSavedBadge] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New dish fields
  const [newName, setNewName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newCategory, setNewCategory] = useState<Category>('carta');
  const [newEmoji, setNewEmoji] = useState('🌮');
  const [newDesc, setNewDesc] = useState('');

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedId) || items[0];

  const handleUpdateCurrent = (field: keyof MenuItem, val: string | number | boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === selectedId ? { ...item, [field]: val } : item))
    );
  };

  const handleToggleAvailability = (id: string) => {
    soundEffects.tap();
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const handleSaveAll = () => {
    items.forEach((item) => dataService.updateMenuItem(item));
    soundEffects.cashRegister();
    setSavedBadge(true);
    onMenuUpdated();
    setTimeout(() => {
      setSavedBadge(false);
      onClose();
    }, 700);
  };

  const handleCreateNewDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice || Number(newPrice) <= 0) return;

    soundEffects.cashRegister();
    const newDish: MenuItem = {
      id: `dish-${Date.now()}`,
      name: newName.trim(),
      shortName: newShortName.trim() || newName.trim(),
      category: newCategory,
      price: Number(newPrice),
      description: newDesc.trim() || 'Especialidad casera preparada al momento',
      emoji: newEmoji.trim() || '🍽️',
      isAvailable: true,
    };

    dataService.addMenuItem(newDish);
    setItems((prev) => [...prev, newDish]);
    setSelectedId(newDish.id);
    setIsCreatingNew(false);
    setNewName('');
    setNewShortName('');
    setNewPrice('');
    setNewDesc('');
    onMenuUpdated();
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('¿Restablecer todo el menú con los 20+ platillos mexicanos completos?')) {
      dataService.restoreDefaultMenu();
      setItems(dataService.getMenu());
      setSelectedId('menu_dia');
      onMenuUpdated();
      soundEffects.cashRegister();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">Administrar Menú & Precios</h2>
              <p className="text-xs text-stone-500">{items.length} platillos en catálogo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingNew ? 'Ver Lista' : 'Nuevo Platillo'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl active:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {isCreatingNew ? (
            /* Create new dish form */
            <form onSubmit={handleCreateNewDish} className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-orange-600" />
                <span>Agregar Nuevo Platillo al Menú</span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Ej. Tacos de Barbacoa"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Emoji</label>
                  <input
                    type="text"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-center text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Nombre Corto en Botón</label>
                  <input
                    type="text"
                    placeholder="Ej. Barbacoa"
                    value={newShortName}
                    onChange={(e) => setNewShortName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Precio ($ MXN)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-black text-stone-900 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none"
                >
                  <option value="menu_dia">🍱 Menús del Día</option>
                  <option value="carta">🧀 A la Carta</option>
                  <option value="desayuno">🍳 Desayunos</option>
                  <option value="sopas">🍲 Sopas & Caldos</option>
                  <option value="bebida">🥤 Bebidas</option>
                  <option value="extra">🍮 Postres & Extras</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Detalles para el cliente"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-stone-200 font-bold text-stone-700 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Guardar en Menú
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Dish selector horizontal scroll */}
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Selecciona para editar:
                </p>
                <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      onClick={() => setSelectedId(it.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                        selectedId === it.id
                          ? 'bg-orange-600 text-white shadow-xs'
                          : it.isAvailable
                          ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          : 'bg-stone-100 text-stone-400 line-through'
                      }`}
                    >
                      <span>{it.emoji}</span>
                      <span>{it.shortName}</span>
                      <span className="opacity-80">${it.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected dish edit form */}
              {currentItem && (
                <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase">Editando Platillo</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(currentItem.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                        currentItem.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {currentItem.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{currentItem.isAvailable ? 'Disponible' : 'Agotado'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={currentItem.name}
                      onChange={(e) => handleUpdateCurrent('name', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Nombre en Botón</label>
                      <input
                        type="text"
                        value={currentItem.shortName}
                        onChange={(e) => handleUpdateCurrent('shortName', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Precio ($ MXN)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                        <input
                          type="number"
                          value={currentItem.price}
                          onChange={(e) => handleUpdateCurrent('price', Number(e.target.value))}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-base font-black text-stone-900 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Descripción del Platillo / Guisados del Día
                    </label>
                    <textarea
                      rows={2}
                      value={currentItem.description}
                      onChange={(e) => handleUpdateCurrent('description', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Restore defaults button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="text-stone-500 hover:text-stone-800 text-xs font-semibold inline-flex items-center gap-1.5 transition underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Menú Completo Original (20+ platillos)</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-stone-200 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 rounded-2xl bg-stone-100 font-bold text-stone-700 text-xs active:bg-stone-200 transition"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="w-2/3 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
          >
            {savedBadge ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <span>Guardar Todos los Cambios</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
