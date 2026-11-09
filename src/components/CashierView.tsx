import React, { useState, useMemo } from 'react';
import { 
  Plus, Minus, Trash2, UtensilsCrossed, ShoppingBag, 
  CheckCircle2, AlertCircle, RefreshCw, Volume2, VolumeX,
  CreditCard, Banknote, Smartphone, Receipt, Sparkles,
  MessageSquare, Send, Copy, Check, Search, Tag, User, MapPin
} from 'lucide-react';
import { MenuItem, OrderItem, PaymentMethod, DiningType, Order, Category } from '../types';
import { dataService } from '../services/dataService';
import { soundEffects } from '../utils/audio';
import { 
  sendOrderViaWhatsApp, 
  buildOrderWhatsAppMessage, 
  getSavedWhatsAppPhone, 
  DEFAULT_WHATSAPP_PHONE 
} from '../utils/whatsapp';
import { DishOptionModal } from './DishOptionModal';
import { CustomItemModal } from './CustomItemModal';

interface CashierViewProps {
  menu: MenuItem[];
  onOpenExpenseModal: () => void;
  onOpenOwnerView?: () => void;
  onOpenWhatsAppConfig?: () => void;
}

const CASH_BILL_PRESETS = [50, 100, 200, 500];

const CATEGORY_TABS: { id: 'todos' | Category; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos', icon: '🔥' },
  { id: 'menu_dia', label: 'Menús del Día', icon: '🍱' },
  { id: 'carta', label: 'A la Carta', icon: '🧀' },
  { id: 'desayuno', label: 'Desayunos', icon: '🍳' },
  { id: 'sopas', label: 'Sopas & Caldos', icon: '🍲' },
  { id: 'bebida', label: 'Bebidas', icon: '🥤' },
  { id: 'extra', label: 'Postres & Extras', icon: '🍮' },
];

const TABLE_PRESETS = ['Para Llevar', 'Mostrador', 'Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5'];

export const CashierView: React.FC<CashierViewProps> = ({
  menu,
  onOpenExpenseModal,
  onOpenOwnerView,
  onOpenWhatsAppConfig,
}) => {
  // Active order state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [diningType, setDiningType] = useState<DiningType>('aqui');
  const [selectedTable, setSelectedTable] = useState('Mesa 1');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [customCashInput, setCustomCashInput] = useState(false);
  const [customCustomerPhone, setCustomCustomerPhone] = useState('');
  const [showCustomerPhoneInput, setShowCustomerPhoneInput] = useState(false);
  const [ticketCopied, setTicketCopied] = useState(false);
  const [whatsAppNotice, setWhatsAppNotice] = useState<string | null>(null);

  // Search & category navigation
  const [activeCategory, setActiveCategory] = useState<'todos' | Category>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for dish options and custom unlisted item
  const [selectedDishForOptions, setSelectedDishForOptions] = useState<MenuItem | null>(null);
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);

  const savedPhone = getSavedWhatsAppPhone();

  // Featured Menú del Día item
  const menuDelDiaItem = menu.find((item) => item.id === 'menu_dia') || menu[0];

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return menu.filter((dish) => {
      if (!dish.isAvailable) return false;
      const matchesCategory = activeCategory === 'todos' || dish.category === activeCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, activeCategory, searchQuery]);

  // Total calculation
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Change calculation
  const effectivePaid = paymentMethod === 'efectivo' 
    ? (amountPaid === '' ? 0 : Number(amountPaid))
    : total;

  const change = effectivePaid - total;
  const isSufficient = effectivePaid >= total && total > 0;
  const isInsufficient = paymentMethod === 'efectivo' && amountPaid !== '' && effectivePaid < total;

  // Add item with or without options
  const handleDishClick = (dish: MenuItem) => {
    if (dish.options && dish.options.length > 0) {
      setSelectedDishForOptions(dish);
    } else {
      handleAddItem(dish);
    }
  };

  const handleAddItem = (dish: MenuItem, selectedOption?: string) => {
    soundEffects.tap();
    setCart((prev) => {
      const matchIndex = prev.findIndex(
        (i) => i.menuItemId === dish.id && i.selectedOption === selectedOption
      );

      if (matchIndex >= 0) {
        const copy = [...prev];
        copy[matchIndex].quantity += 1;
        return copy;
      }

      return [
        ...prev,
        {
          menuItemId: dish.id,
          name: dish.shortName,
          price: dish.price,
          quantity: 1,
          emoji: dish.emoji,
          category: dish.category,
          selectedOption,
        },
      ];
    });
  };

  const handleAddCustomItem = (customItem: OrderItem) => {
    setCart((prev) => [...prev, customItem]);
  };

  // Stepper quantity handlers
  const handleIncrease = (index: number) => {
    soundEffects.tap();
    setCart((prev) => {
      const copy = [...prev];
      copy[index].quantity += 1;
      return copy;
    });
  };

  const handleDecrease = (index: number) => {
    soundEffects.tap();
    setCart((prev) => {
      const copy = [...prev];
      if (copy[index].quantity > 1) {
        copy[index].quantity -= 1;
        return copy;
      }
      return copy.filter((_, idx) => idx !== index);
    });
  };

  const handleClearCart = () => {
    setCart([]);
    setAmountPaid('');
    setCustomCashInput(false);
  };

  // Quick cash bill selection
  const handleSelectCashPreset = (bill: number) => {
    soundEffects.tap();
    setAmountPaid(bill);
    setCustomCashInput(false);
    if (bill < total) {
      soundEffects.insufficient();
    }
  };

  const handleSelectExactCash = () => {
    soundEffects.tap();
    setAmountPaid(total);
    setCustomCashInput(false);
  };

  // Complete and commit order
  const handleCompleteOrder = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'efectivo' && !isSufficient) {
      soundEffects.insufficient();
      return;
    }

    const hasMenuDia = cart.some((i) => i.category === 'menu_dia');
    const hasCarta = cart.some((i) => i.category === 'carta' || i.category === 'desayuno');
    let orderType: Order['type'] = 'A la Carta';
    if (hasMenuDia && hasCarta) {
      orderType = 'Mixto';
    } else if (hasMenuDia) {
      orderType = 'Menú del Día';
    }

    const finalDining = selectedTable === 'Para Llevar' ? 'llevar' : diningType;

    const newOrder = dataService.saveOrder({
      items: [...cart],
      total,
      paymentMethod,
      amountPaid: paymentMethod === 'efectivo' ? Number(amountPaid) : total,
      change: paymentMethod === 'efectivo' ? change : 0,
      type: orderType,
      diningType: finalDining,
      status: 'en_cocina', // Sent directly to kitchen KDS!
      customerName: customerName.trim() || undefined,
      tableNumber: selectedTable !== 'Para Llevar' ? selectedTable : undefined,
      notes: orderNotes.trim() || undefined,
    });

    soundEffects.cashRegister();
    setCompletedOrder(newOrder);
  };

  const handleSendToWhatsApp = (order: Order, customPhone?: string) => {
    soundEffects.tap();
    const phoneToUse = customPhone?.trim() || savedPhone;
    sendOrderViaWhatsApp(order, phoneToUse);
    setWhatsAppNotice(`✓ Abriendo WhatsApp para orden ${order.orderNumber} (${phoneToUse})`);
    setTimeout(() => setWhatsAppNotice(null), 3500);
  };

  const handleCopyTicket = (order: Order) => {
    soundEffects.tap();
    const text = buildOrderWhatsAppMessage(order);
    navigator.clipboard.writeText(text);
    setTicketCopied(true);
    setTimeout(() => setTicketCopied(false), 2500);
  };

  const handleShareCurrentCart = () => {
    if (cart.length === 0) return;
    soundEffects.tap();
    const hasMenuDia = cart.some((i) => i.category === 'menu_dia');
    const hasCarta = cart.some((i) => i.category === 'carta' || i.category === 'desayuno');
    let orderType: Order['type'] = 'A la Carta';
    if (hasMenuDia && hasCarta) orderType = 'Mixto';
    else if (hasMenuDia) orderType = 'Menú del Día';

    const tempOrder: Order = {
      id: `temp-${Date.now()}`,
      orderNumber: '#Comanda',
      items: [...cart],
      total,
      paymentMethod,
      amountPaid: paymentMethod === 'efectivo' && amountPaid !== '' ? Number(amountPaid) : total,
      change: paymentMethod === 'efectivo' ? Math.max(0, change) : 0,
      timestamp: new Date().toISOString(),
      timeString: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: orderType,
      diningType,
      status: 'en_cocina',
      customerName: customerName.trim() || undefined,
      tableNumber: selectedTable,
      notes: orderNotes.trim() || undefined,
    };

    sendOrderViaWhatsApp(tempOrder, savedPhone);
  };

  const handleStartNextOrder = () => {
    setCart([]);
    setAmountPaid('');
    setOrderNotes('');
    setCustomerName('');
    setSelectedTable('Mesa 1');
    setCustomCashInput(false);
    setCompletedOrder(null);
    setCustomCustomerPhone('');
    setShowCustomerPhoneInput(false);
    setTicketCopied(false);
    setWhatsAppNotice(null);
  };

  const getItemCount = (id: string) => {
    return cart
      .filter((i) => i.menuItemId === id)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const toggleSound = () => {
    const nextState = !isSoundMuted;
    setIsSoundMuted(nextState);
    soundEffects.toggleSound(!nextState);
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-100 text-stone-900 pb-28 md:pb-6">
      {/* ── TOP MOBILE BAR ── */}
      <header className="sticky top-0 z-30 bg-orange-600 text-white shadow-md px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm shadow-inner">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-sm tracking-tight leading-none">COCINA EXPRESS</h1>
              <span className="text-[10px] bg-amber-400 text-orange-950 px-1.5 py-0.5 rounded-full font-bold uppercase">
                Caja
              </span>
            </div>
            <p className="text-[11px] text-orange-100 leading-none mt-0.5">Menú Completo & Cobro Rápido</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            aria-label={isSoundMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="p-2 rounded-lg bg-orange-700/60 hover:bg-orange-700 text-white transition active:scale-95"
            title={isSoundMuted ? 'Activar audio' : 'Silenciar audio'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-orange-300" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quick Expense button */}
          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-1 bg-red-700 hover:bg-red-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95 transition"
            title="Registrar gasto de insumo/gas"
          >
            <span className="text-[10px]">$</span>
            <span>Gasto</span>
          </button>

          {/* WhatsApp Destination button */}
          <button
            type="button"
            onClick={onOpenWhatsAppConfig}
            className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95 transition"
            title={`WhatsApp configurado: ${savedPhone}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WA: {savedPhone}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER (Optimized for 6" phone) ── */}
      <main className="flex-1 max-w-lg mx-auto w-full px-3 py-2.5 space-y-3">
        {/* Table & Customer Quick Context */}
        <div className="bg-white rounded-2xl p-2.5 border border-stone-200 shadow-xs space-y-2">
          {/* Dining / Table Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {TABLE_PRESETS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setSelectedTable(tab);
                  setDiningType(tab === 'Para Llevar' ? 'llevar' : 'aqui');
                  soundEffects.tap();
                }}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 ${
                  selectedTable === tab
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {tab === 'Para Llevar' ? '🛍️ Para Llevar' : tab === 'Mostrador' ? '⚡ Mostrador' : `🪑 ${tab}`}
              </button>
            ))}
          </div>

          {/* Customer Name input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Nombre del cliente (Opcional, ej. Don Pedro)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsCustomItemModalOpen(true)}
              className="shrink-0 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition"
              title="Agregar platillo especial o extra manual"
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>+ Platillo Extra</span>
            </button>
          </div>
        </div>

        {/* ── SEARCH BAR & CATEGORIES FILTER ── */}
        <div className="space-y-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar platillo (enchiladas, sopa, milanesa, agua)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-stone-200 rounded-2xl text-xs font-bold text-stone-900 placeholder:font-normal focus:outline-none focus:border-orange-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs Scrollable */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  soundEffects.tap();
                }}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── FEATURED GIANT BUTTON: MENÚ DEL DÍA (When in Todos or Menús) ── */}
        {(activeCategory === 'todos' || activeCategory === 'menu_dia') && !searchQuery && (
          <section aria-label="Menú del Día">
            <button
              type="button"
              onClick={() => handleDishClick(menuDelDiaItem)}
              className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-4 shadow-lg active:scale-98 tap-bounce text-left border-2 border-emerald-400/40"
              style={{ minHeight: '84px' }}
            >
              <div className="absolute -right-4 -bottom-4 text-emerald-800/30 text-7xl select-none pointer-events-none">
                🍱
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍱</span>
                    <span className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                      {menuDelDiaItem.shortName.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-1 line-clamp-1 max-w-[240px]">
                    {menuDelDiaItem.description}
                  </p>
                </div>

                <div className="text-right">
                  <span className="block text-2xl font-black text-yellow-300 drop-shadow-sm">
                    ${menuDelDiaItem.price}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">
                    MXN
                  </span>
                </div>
              </div>

              {getItemCount(menuDelDiaItem.id) > 0 && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-stone-900 font-black text-xs px-2.5 py-1 rounded-full shadow-md animate-pulse">
                  {getItemCount(menuDelDiaItem.id)} en orden
                </div>
              )}
            </button>
          </section>
        )}

        {/* ── COMPLETE DISHES GRID (Categorized & Thumb Friendly) ── */}
        <section aria-label="Catálogo de Platillos">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-black tracking-wider uppercase text-stone-500">
              {activeCategory === 'todos' ? 'Platillos & Carta Completa' : CATEGORY_TABS.find((t) => t.id === activeCategory)?.label} ({filteredDishes.length})
            </span>
            <span className="text-[11px] text-stone-500 font-medium">Toque para agregar</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredDishes
              .filter((dish) => dish.id !== 'menu_dia' || activeCategory !== 'todos' || searchQuery !== '')
              .map((dish) => {
                const count = getItemCount(dish.id);
                return (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleDishClick(dish)}
                    className={`relative flex flex-col justify-between p-3 rounded-2xl border-2 transition tap-bounce active:scale-95 text-left bg-white shadow-xs ${
                      count > 0 ? 'border-orange-500 ring-2 ring-orange-400/20' : 'border-stone-200 hover:border-stone-300'
                    }`}
                    style={{ minHeight: '88px', minWidth: '48px' }}
                  >
                    {count > 0 && (
                      <span className="absolute -top-2 -right-1 bg-orange-600 text-white font-black text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                        {count}
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{dish.emoji}</span>
                      {dish.options && dish.options.length > 0 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                          Opciones
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5">
                      <span className="block font-black text-xs sm:text-sm text-stone-900 leading-tight line-clamp-1">
                        {dish.shortName}
                      </span>
                      <div className="flex items-baseline justify-between mt-0.5">
                        <span className="text-sm font-black text-orange-600">
                          ${dish.price}
                        </span>
                        <span className="text-[10px] text-stone-400 uppercase font-bold">MXN</span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </section>

        {/* ── SECCIÓN C: RESUMEN DE LA ORDEN ACTIVA ── */}
        <section className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-stone-500" />
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-stone-700">
                Resumen ({cart.reduce((s, i) => s + i.quantity, 0)} platillos)
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-stone-400 hover:text-red-600 text-xs font-semibold flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar</span>
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="py-5 text-center text-stone-400 space-y-1">
              <p className="text-sm font-semibold">Sin platillos seleccionados</p>
              <p className="text-xs">Toca los platillos arriba para agregarlos a la comanda</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div
                  key={`${item.menuItemId}-${idx}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{item.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-stone-900 truncate">{item.name}</p>
                      {item.selectedOption && (
                        <p className="text-[10px] text-emerald-700 font-bold truncate">
                          ➔ {item.selectedOption}
                        </p>
                      )}
                      <p className="text-[11px] text-stone-500 font-medium">
                        ${item.price} c/u • <span className="font-bold text-stone-800">${item.price * item.quantity}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper (Thumb friendly) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDecrease(idx)}
                      className="w-8 h-8 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 flex items-center justify-center active:scale-90 font-black text-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-black text-sm text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleIncrease(idx)}
                      className="w-8 h-8 rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center active:scale-90 font-black text-sm shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TOTAL BOLD GRANDE */}
          <div className="pt-2 border-t border-stone-200 flex items-baseline justify-between">
            <div>
              <span className="font-bold text-sm text-stone-600 uppercase">Total a Pagar:</span>
              {(customerName || selectedTable) && (
                <p className="text-[11px] text-stone-500 font-medium">
                  {selectedTable} {customerName ? `• ${customerName}` : ''}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-stone-900 tracking-tight">
                ${total.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-stone-500 ml-1">MXN</span>
            </div>
          </div>

          {/* Quick WhatsApp Send during order creation */}
          {cart.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleShareCurrentCart}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition shadow-2xs"
                title="Manda el desglose de lo que lleva anotado directo a WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enviar Comanda a mi WhatsApp ({savedPhone})</span>
              </button>
            </div>
          )}
        </section>

        {/* ── SECCIÓN D: CALCULADORA DE CAMBIO EXPRESS ── */}
        {cart.length > 0 && (
          <section className="bg-white rounded-2xl p-3.5 border-2 border-orange-200 shadow-sm space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-600">
                Sección D • Método & Calculadora de Cambio
              </span>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('efectivo');
                  soundEffects.tap();
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition ${
                  paymentMethod === 'efectivo'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Efectivo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('tarjeta');
                  soundEffects.tap();
                  setAmountPaid(total);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition ${
                  paymentMethod === 'tarjeta'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Tarjeta</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('transferencia');
                  soundEffects.tap();
                  setAmountPaid(total);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition ${
                  paymentMethod === 'transferencia'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Transf.</span>
              </button>
            </div>

            {/* Cash Bills Row (Only for cash payments) */}
            {paymentMethod === 'efectivo' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-600">Cliente paga con billete:</span>
                  <button
                    type="button"
                    onClick={() => setCustomCashInput(!customCashInput)}
                    className="text-xs text-orange-600 font-bold underline"
                  >
                    {customCashInput ? 'Billetes rápidos' : 'Monto manual'}
                  </button>
                </div>

                {!customCashInput ? (
                  <div className="grid grid-cols-5 gap-1.5">
                    {CASH_BILL_PRESETS.map((bill) => (
                      <button
                        key={bill}
                        type="button"
                        onClick={() => handleSelectCashPreset(bill)}
                        className={`py-3 rounded-xl font-black text-sm border-2 transition tap-bounce active:scale-95 ${
                          amountPaid === bill
                            ? 'bg-stone-900 text-yellow-300 border-stone-900 shadow-md scale-102'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        ${bill}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleSelectExactCash}
                      className={`py-3 rounded-xl font-black text-xs border-2 transition tap-bounce active:scale-95 ${
                        amountPaid === total
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                      style={{ minHeight: '48px' }}
                    >
                      Exacto
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-stone-400 text-lg">
                      $
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="Monto recibido del cliente"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 bg-stone-50 border-2 border-orange-400 rounded-xl text-xl font-black text-stone-900 focus:bg-white focus:outline-none"
                      autoFocus
                    />
                  </div>
                )}

                {/* ── HIGH VISIBILITY CHANGE BANNER ── */}
                {amountPaid !== '' && (
                  <div className="mt-2">
                    {isInsufficient ? (
                      <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl flex items-center justify-between text-red-700 animate-in shake">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                          <div>
                            <p className="text-xs font-bold leading-tight uppercase">Saldo Insuficiente</p>
                            <p className="text-xs text-red-600 font-semibold">
                              Faltan ${(total - effectivePaid).toFixed(2)} MXN
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-black text-red-700">
                          -${(total - effectivePaid).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-500 text-white rounded-xl flex items-center justify-between shadow-md pulse-green">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-6 h-6 text-yellow-300 shrink-0" />
                          <div>
                            <p className="text-[11px] uppercase font-bold tracking-wider text-emerald-100">
                              Cambio a Regresar:
                            </p>
                            <p className="text-2xl font-black text-white tracking-tight">
                              ${change.toFixed(2)} <span className="text-xs font-semibold">MXN</span>
                            </p>
                          </div>
                        </div>
                        <span className="bg-emerald-600/80 text-yellow-300 px-2.5 py-1 rounded-lg text-xs font-black uppercase">
                          {change === 0 ? 'Pago Exacto' : 'Dar Cambio'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Note field */}
            <div>
              <input
                type="text"
                placeholder="Nota especial para cocina (ej. sin cebolla, salsa aparte, bien dorado)"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:bg-white focus:border-orange-400 focus:outline-none"
              />
            </div>
          </section>
        )}
      </main>

      {/* ── STICKY FAST ACTION BUTTON (Always thumb-reachable at bottom) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-2xl max-w-lg mx-auto">
        <button
          type="button"
          onClick={handleCompleteOrder}
          disabled={cart.length === 0 || (paymentMethod === 'efectivo' && !isSufficient)}
          className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition tap-bounce ${
            cart.length === 0
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : paymentMethod === 'efectivo' && !isSufficient
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
          }`}
          style={{ minHeight: '56px' }}
        >
          {cart.length === 0 ? (
            <span>Selecciona platillos para cobrar</span>
          ) : paymentMethod === 'efectivo' && !isSufficient ? (
            <span>Indica billete para calcular cambio</span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-yellow-300" />
              <span>COBRAR Y MANDAR A COCINA (${total.toFixed(2)} MXN)</span>
            </>
          )}
        </button>
      </div>

      {/* ── ORDER COMPLETED MODAL (Rapid confirmation in < 1 second) ── */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-3xl shadow-inner">
              ✓
            </div>

            <div>
              <span className="text-xs font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                Pedido {completedOrder.orderNumber}
              </span>
              <h3 className="text-2xl font-black text-stone-900 mt-1">¡Venta Registrada!</h3>
              <p className="text-xs text-stone-500">
                {completedOrder.diningType === 'aqui' ? `En Local (${completedOrder.tableNumber || 'Mesa'})` : 'Empacado para llevar'} • {completedOrder.timeString}
              </p>
              {completedOrder.customerName && (
                <p className="text-xs font-bold text-stone-700 mt-0.5">Cliente: {completedOrder.customerName}</p>
              )}
            </div>

            {/* Fast change reminder */}
            {completedOrder.paymentMethod === 'efectivo' && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="text-xs font-bold text-emerald-800">Cambio que debes entregar:</p>
                <p className="text-3xl font-black text-emerald-600 mt-0.5">
                  ${completedOrder.change.toFixed(2)} <span className="text-sm font-semibold">MXN</span>
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Pagó con ${completedOrder.amountPaid} • Total ${completedOrder.total}
                </p>
              </div>
            )}

            {/* Quick summary of items */}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1">
              {completedOrder.items.map((i, idx) => (
                <div key={idx} className="flex justify-between font-medium text-stone-700">
                  <span>
                    {i.quantity}x {i.name}
                    {i.selectedOption ? ` (${i.selectedOption})` : ''}
                  </span>
                  <span className="font-bold">${i.price * i.quantity}</span>
                </div>
              ))}
            </div>

            {/* ── WHATSAPP DISPATCH ACTIONS ── */}
            <div className="space-y-2 pt-1 border-t border-stone-200">
              {whatsAppNotice && (
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold animate-in fade-in flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{whatsAppNotice}</span>
                </div>
              )}

              {/* Direct WhatsApp button to default number (5584085644) */}
              <button
                type="button"
                onClick={() => handleSendToWhatsApp(completedOrder, savedPhone)}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Enviar Ticket a mi WhatsApp ({savedPhone})</span>
              </button>

              {/* Customer phone or copy options */}
              <div className="flex items-center justify-between text-xs px-1">
                <button
                  type="button"
                  onClick={() => setShowCustomerPhoneInput(!showCustomerPhoneInput)}
                  className="text-stone-600 hover:text-emerald-700 underline font-semibold flex items-center gap-1"
                >
                  <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                  <span>{showCustomerPhoneInput ? 'Ocultar número cliente' : '¿Enviar al WhatsApp del cliente?'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyTicket(completedOrder)}
                  className="text-stone-700 hover:text-stone-950 font-bold flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition"
                >
                  {ticketCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-stone-500" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
              </div>

              {/* Send to custom/client phone number */}
              {showCustomerPhoneInput && (
                <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-2 animate-in slide-in-from-top duration-150">
                  <p className="text-[11px] font-bold text-stone-700">
                    Ingresa los 10 dígitos del cliente:
                  </p>
                  <div className="flex gap-1.5">
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Ej. 5512345678"
                      value={customCustomerPhone}
                      onChange={(e) => setCustomCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      disabled={customCustomerPhone.length < 10}
                      onClick={() => handleSendToWhatsApp(completedOrder, customCustomerPhone)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-black text-xs rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleStartNextOrder}
              autoFocus
              className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-base shadow-lg active:scale-98 transition flex items-center justify-center gap-2"
              style={{ minHeight: '52px' }}
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>SIGUIENTE CLIENTE EN FILA</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODALS FOR DISH OPTIONS & CUSTOM ITEMS ── */}
      <DishOptionModal
        dish={selectedDishForOptions}
        onClose={() => setSelectedDishForOptions(null)}
        onSelectOption={(dish, option) => handleAddItem(dish, option)}
      />

      <CustomItemModal
        isOpen={isCustomItemModalOpen}
        onClose={() => setIsCustomItemModalOpen(false)}
        onAddCustomItem={handleAddCustomItem}
      />
    </div>
  );
};
