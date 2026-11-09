import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, UtensilsCrossed, Search, Plus, Minus, Trash2, 
  CheckCircle2, Clock, MessageSquare, Phone, User, MapPin, 
  Sparkles, ArrowRight, ChevronRight, AlertCircle, Send, Bike, Check, FileText
} from 'lucide-react';
import { MenuItem, OrderItem, DiningType, Order, Category, RestaurantTable } from '../types';
import { dataService } from '../services/dataService';
import { soundEffects } from '../utils/audio';
import { sendOrderViaWhatsApp, getSavedWhatsAppPhone, buildOrderWhatsAppMessage } from '../utils/whatsapp';
import { DishOptionModal } from './DishOptionModal';
import { DigitalTicketModal } from './DigitalTicketModal';

interface ClientOrderViewProps {
  menu: MenuItem[];
  tables: RestaurantTable[];
  onOrderPlaced?: (order: Order) => void;
  onExitClientView?: () => void;
}

const CATEGORY_TABS: { id: 'todos' | Category; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos', icon: '🔥' },
  { id: 'menu_dia', label: 'Menú del Día', icon: '🍱' },
  { id: 'carta', label: 'A la Carta', icon: '🧀' },
  { id: 'desayuno', label: 'Desayunos', icon: '🍳' },
  { id: 'sopas', label: 'Sopas & Caldos', icon: '🍲' },
  { id: 'bebida', label: 'Bebidas', icon: '🥤' },
  { id: 'extra', label: 'Postres & Extras', icon: '🍮' },
];

const PICKUP_TIME_PRESETS = ['En 15 minutos', 'En 30 minutos', 'En 45 minutos', 'Lo antes posible'];

export const ClientOrderView: React.FC<ClientOrderViewProps> = ({
  menu,
  tables,
  onOrderPlaced,
  onExitClientView,
}) => {
  // Ordering mode state
  const [diningType, setDiningType] = useState<DiningType>('aqui');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('En 15-20 minutos');
  const [orderNotes, setOrderNotes] = useState('');

  // Cart & search state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<'todos' | Category>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDishForOptions, setSelectedDishForOptions] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem('cocina_client_last_ticket');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const savedOwnerPhone = getSavedWhatsAppPhone();

  // Filter available tables for dine-in
  const availableTables = useMemo(() => {
    return tables.filter((t) => t.status === 'disponible');
  }, [tables]);

  // Filter menu items
  const filteredDishes = useMemo(() => {
    return menu.filter((dish) => {
      if (!dish.isAvailable) return false;
      const matchesCat = activeCategory === 'todos' || dish.category === activeCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [menu, activeCategory, searchQuery]);

  // Total cart calculation
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Add dish to cart
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

  // Submit client order
  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    if (!customerName.trim()) {
      alert('Por favor ingresa tu nombre para que podamos identificar tu pedido.');
      return;
    }
    if (diningType === 'aqui' && !selectedTable) {
      alert('Por favor selecciona una mesa disponible en la que te encuentras.');
      return;
    }
    if (diningType === 'domicilio' && !deliveryAddress.trim()) {
      alert('Por favor ingresa tu dirección de entrega y referencias.');
      return;
    }
    if (diningType === 'domicilio' && !customerPhone.trim()) {
      alert('Por favor ingresa un número de teléfono de contacto para la entrega.');
      return;
    }

    const hasMenuDia = cart.some((i) => i.category === 'menu_dia');
    const hasCarta = cart.some((i) => i.category === 'carta' || i.category === 'desayuno');
    let orderType: Order['type'] = 'A la Carta';
    if (hasMenuDia && hasCarta) orderType = 'Mixto';
    else if (hasMenuDia) orderType = 'Menú del Día';

    const tableLabel = diningType === 'aqui' 
      ? selectedTable 
      : diningType === 'domicilio' 
      ? 'A Domicilio' 
      : 'Para Llevar';

    const newOrder = dataService.saveOrder({
      items: [...cart],
      total,
      paymentMethod: 'efectivo', // default pending payment at delivery/table/pickup
      amountPaid: total,
      change: 0,
      type: orderType,
      diningType,
      status: 'en_cocina', // directly sends to kitchen & owner!
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      tableNumber: tableLabel,
      deliveryAddress: diningType === 'domicilio' ? deliveryAddress.trim() : undefined,
      pickupTime: diningType === 'llevar' ? pickupTime : undefined,
      notes: orderNotes.trim() || undefined,
      source: 'cliente_qr',
    });

    soundEffects.incomingOrderAlert();
    try {
      localStorage.setItem('cocina_client_last_ticket', JSON.stringify(newOrder));
    } catch {
      // Ignore
    }
    setActiveTicket(newOrder);
    setPlacedOrder(newOrder);
    setShowTicketModal(true);
    setIsCartOpen(false);

    if (onOrderPlaced) {
      onOrderPlaced(newOrder);
    }
  };

  const handleStartNewOrder = () => {
    setCart([]);
    setPlacedOrder(null);
    setShowTicketModal(false);
    setOrderNotes('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-100 text-stone-900 pb-32">
      {/* ── CLIENT HERO BANNER ── */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-md px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌮</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-base tracking-tight leading-none text-white">
                  COCINA EXPRESS
                </h1>
                <span className="text-[10px] bg-yellow-300 text-orange-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                  Menú Digital
                </span>
              </div>
              <p className="text-[11px] text-orange-100 mt-0.5">Ordena en línea o desde tu mesa</p>
            </div>
          </div>

          {onExitClientView && (
            <button
              onClick={onExitClientView}
              className="text-xs bg-white/20 hover:bg-white/30 text-white font-bold px-2.5 py-1 rounded-xl transition"
            >
              Salir a Caja
            </button>
          )}
        </div>
      </header>

      {/* ── PERSISTENT DIGITAL TICKET ACCESS FOR CLIENT ── */}
      {activeTicket && (
        <div className="bg-emerald-800 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-emerald-900 shadow-sm animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-white/20 rounded-lg text-base">🧾</span>
            <div>
              <p className="font-black leading-tight">
                Tu Ticket Activo: {activeTicket.orderNumber} (${activeTicket.total} MXN)
              </p>
              <p className="text-[10px] text-emerald-200">
                {activeTicket.diningType === 'aqui' ? `Mesa: ${activeTicket.tableNumber}` : activeTicket.diningType === 'domicilio' ? 'A Domicilio' : 'Para Llevar'} • Comprobante guardado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPlacedOrder(activeTicket);
              setShowTicketModal(true);
              soundEffects.tap();
            }}
            className="bg-white text-emerald-950 font-black px-3 py-1.5 rounded-xl text-xs hover:bg-emerald-50 active:scale-95 transition shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ver Mi Ticket</span>
          </button>
        </div>
      )}

      {/* ── MAIN CLIENT BODY ── */}
      <main className="flex-1 max-w-lg mx-auto w-full px-3 py-3 space-y-3">
        {/* Step 1: Delivery Mode (Comer Aquí vs Para Llevar vs A Domicilio) */}
        <section className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <span>1. ¿Cómo deseas tu pedido?</span>
            </h2>
            <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
              Paso 1 de 2
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Mode 1: Comer Aquí */}
            <button
              type="button"
              onClick={() => {
                setDiningType('aqui');
                soundEffects.tap();
              }}
              className={`p-2.5 rounded-2xl border-2 transition text-left flex flex-col items-center justify-center text-center gap-1 ${
                diningType === 'aqui'
                  ? 'border-orange-600 bg-orange-50/80 text-orange-950 ring-2 ring-orange-500/20'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${diningType === 'aqui' ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs">Comer Aquí</p>
                <p className="text-[9px] text-stone-500">En una mesa</p>
              </div>
            </button>

            {/* Mode 2: Para Llevar */}
            <button
              type="button"
              onClick={() => {
                setDiningType('llevar');
                soundEffects.tap();
              }}
              className={`p-2.5 rounded-2xl border-2 transition text-left flex flex-col items-center justify-center text-center gap-1 ${
                diningType === 'llevar'
                  ? 'border-orange-600 bg-orange-50/80 text-orange-950 ring-2 ring-orange-500/20'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${diningType === 'llevar' ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs">Para Llevar</p>
                <p className="text-[9px] text-stone-500">Paso a recoger</p>
              </div>
            </button>

            {/* Mode 3: A Domicilio */}
            <button
              type="button"
              onClick={() => {
                setDiningType('domicilio');
                soundEffects.tap();
              }}
              className={`p-2.5 rounded-2xl border-2 transition text-left flex flex-col items-center justify-center text-center gap-1 ${
                diningType === 'domicilio'
                  ? 'border-orange-600 bg-orange-50/80 text-orange-950 ring-2 ring-orange-500/20'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${diningType === 'domicilio' ? 'bg-orange-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs">A Domicilio</p>
                <p className="text-[9px] text-stone-500">Envío directo</p>
              </div>
            </button>
          </div>

          {/* Conditional Sub-View: Dine-in Table Selection with Live Table Availability */}
          {diningType === 'aqui' && (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-stone-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>¿En qué mesa te encuentras?</span>
                </label>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  🟢 {availableTables.length} mesas libres
                </span>
              </div>

              {availableTables.length === 0 ? (
                <p className="text-xs text-amber-700 font-bold p-2 bg-amber-50 rounded-xl border border-amber-200">
                  ⚠️ En este momento todas las mesas están ocupadas. Puedes pedir para llevar o preguntar al cajero.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {tables.map((tbl) => {
                    const isAvail = tbl.status === 'disponible';
                    const isSelected = selectedTable === tbl.name;
                    return (
                      <button
                        key={tbl.id}
                        type="button"
                        disabled={!isAvail}
                        onClick={() => {
                          setSelectedTable(tbl.name);
                          soundEffects.tap();
                        }}
                        className={`p-2 rounded-xl text-center border-2 transition ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600 font-black shadow-md scale-102'
                            : isAvail
                            ? 'bg-white hover:bg-emerald-50 border-emerald-300 text-stone-900 font-bold'
                            : 'bg-stone-200/70 border-stone-300 text-stone-400 cursor-not-allowed line-through opacity-60'
                        }`}
                      >
                        <span className="block text-xs font-black">{tbl.name}</span>
                        <span className="block text-[9px] font-semibold opacity-90">
                          {isAvail ? `✓ Libre (${tbl.capacity}p)` : '✕ Ocupada'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Conditional Sub-View: Takeaway Pickup Time */}
          {diningType === 'llevar' && (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 animate-in fade-in">
              <label className="text-[11px] font-extrabold text-stone-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>¿En cuánto tiempo pasas a recoger?</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PICKUP_TIME_PRESETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setPickupTime(t);
                      soundEffects.tap();
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
                      pickupTime === t
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conditional Sub-View: Delivery Address */}
          {diningType === 'domicilio' && (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 animate-in fade-in">
              <label className="text-[11px] font-extrabold text-stone-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Dirección Completa de Entrega: <span className="text-red-500">*</span></span>
              </label>
              <textarea
                rows={2}
                placeholder="Calle, número exterior/interior, colonia, referencias (ej. portón negro)..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          )}

          {/* Customer info fields */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Tu Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Carlos Mendoza"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Teléfono / WhatsApp {diningType === 'domicilio' ? <span className="text-red-500">*</span> : <span className="text-stone-400 font-normal">(Opcional)</span>}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="5512345678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:border-orange-500"
                required={diningType === 'domicilio'}
              />
            </div>
          </div>
        </section>

        {/* Step 2: Browse Menu & Select Food */}
        <section className="space-y-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="¿Qué se te antoja hoy? (enchiladas, caldo, agua)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-bold text-stone-900 focus:outline-none focus:border-orange-500 shadow-2xs"
            />
          </div>

          {/* Category Tabs */}
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

          {/* Dishes list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {filteredDishes.map((dish) => {
              const inCartCount = cart
                .filter((i) => i.menuItemId === dish.id)
                .reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={dish.id}
                  onClick={() => handleDishClick(dish)}
                  className={`p-3.5 rounded-2xl border-2 transition text-left bg-white shadow-xs cursor-pointer active:scale-98 tap-bounce flex items-start justify-between gap-3 ${
                    inCartCount > 0 ? 'border-orange-500 ring-2 ring-orange-400/20' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl shrink-0">{dish.emoji}</span>
                      <h3 className="font-extrabold text-sm text-stone-900 truncate">{dish.name}</h3>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {dish.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-base font-black text-orange-600">${dish.price} MXN</span>
                      {dish.options && dish.options.length > 0 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md">
                          Personalizable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add button or count */}
                  <div className="shrink-0 self-center">
                    {inCartCount > 0 ? (
                      <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                        {inCartCount}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full bg-stone-100 hover:bg-orange-600 hover:text-white text-stone-800 font-black flex items-center justify-center transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ── FLOATING TRAY BAR (Bottom Cart Trigger) ── */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-2xl max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-base shadow-xl active:scale-98 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center text-xs font-black">
                {totalItemsCount}
              </span>
              <span>Ver Mi Pedido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black">${total.toFixed(2)} MXN</span>
              <ChevronRight className="w-5 h-5 text-yellow-300" />
            </div>
          </button>
        </div>
      )}

      {/* ── CART SLIDE-OVER / MODAL ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl max-h-[88vh] flex flex-col animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-black text-stone-900 text-lg">Tu Pedido</h3>
                <p className="text-xs text-stone-500">
                  {diningType === 'aqui' ? `Comer en ${selectedTable || 'Mesa'}` : 'Para Llevar'} • {customerName || 'Cliente'}
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                  <div>
                    <p className="font-extrabold text-stone-900 text-sm">{item.name}</p>
                    {item.selectedOption && (
                      <p className="text-emerald-700 font-bold text-xs mt-0.5">➔ {item.selectedOption}</p>
                    )}
                    <p className="text-stone-500 font-medium">${item.price} c/u • <span className="font-bold text-stone-800">${item.price * item.quantity}</span></p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDecrease(idx)}
                      className="w-7 h-7 rounded-lg bg-stone-200 text-stone-800 font-bold flex items-center justify-center active:scale-90"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center font-black text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrease(idx)}
                      className="w-7 h-7 rounded-lg bg-orange-600 text-white font-bold flex items-center justify-center active:scale-90"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Special notes */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Indicaciones para el cocinero (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sin cebolla, salsa aparte, bien caliente..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Total & Submit Button */}
            <div className="pt-3 border-t border-stone-200 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-sm text-stone-600">Total a Pagar en Caja:</span>
                <span className="text-2xl font-black text-stone-900">${total.toFixed(2)} MXN</span>
              </div>

              <button
                type="button"
                onClick={handleSubmitOrder}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-xl active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span>CONFIRMAR Y ENVIAR AL DUEÑO (${total.toFixed(2)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DIGITAL TICKET & OWNER DISPATCH MODAL ── */}
      {showTicketModal && placedOrder && (
        <DigitalTicketModal
          order={placedOrder}
          onClose={() => setShowTicketModal(false)}
          onNewOrder={handleStartNewOrder}
          storeName="Cocina Express"
        />
      )}

      {/* Dish Options Modal */}
      <DishOptionModal
        dish={selectedDishForOptions}
        onClose={() => setSelectedDishForOptions(null)}
        onSelectOption={(dish, option) => handleAddItem(dish, option)}
      />
    </div>
  );
};
