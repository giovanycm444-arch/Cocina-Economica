import React, { useState, useEffect } from 'react';
import { 
  Smartphone, BarChart3, Settings, PlusCircle, SplitSquareVertical, 
  HelpCircle, Wifi, Store, Check, Info, Sparkles, MessageSquare, ChefHat,
  UtensilsCrossed, QrCode, Share2, Copy, X, Bell, ExternalLink
} from 'lucide-react';
import { CashierView } from './components/CashierView';
import { OwnerDashboard } from './components/OwnerDashboard';
import { KitchenView } from './components/KitchenView';
import { ClientOrderView } from './components/ClientOrderView';
import { TableGrid } from './components/TableGrid';
import { QuickExpenseModal } from './components/QuickExpenseModal';
import { MenuConfigModal } from './components/MenuConfigModal';
import { WhatsAppConfigModal } from './components/WhatsAppConfigModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DigitalTicketModal } from './components/DigitalTicketModal';
import { dataService } from './services/dataService';
import { getSavedWhatsAppPhone } from './utils/whatsapp';
import { soundEffects } from './utils/audio';
import { MenuItem, Order, RestaurantTable } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'cajero' | 'mesas' | 'cliente' | 'cocina' | 'dueno'>('cajero');
  const [isDualSimMode, setIsDualSimMode] = useState<boolean>(false);
  const [dualLeftScreen, setDualLeftScreen] = useState<'cajero' | 'cliente'>('cliente');
  const [dualSecondScreen, setDualSecondScreen] = useState<'cocina' | 'dueno' | 'mesas'>('dueno');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [whatsAppPhone, setWhatsAppPhone] = useState<string>(getSavedWhatsAppPhone());
  const [menu, setMenu] = useState<MenuItem[]>(dataService.getMenu());
  const [orders, setOrders] = useState<Order[]>(dataService.getOrders());
  const [tables, setTables] = useState<RestaurantTable[]>(dataService.getTables());
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [latestClientOrder, setLatestClientOrder] = useState<Order | null>(null);
  const [inspectTicketOrder, setInspectTicketOrder] = useState<Order | null>(null);
  const [qrCopied, setQrCopied] = useState(false);

  // Sync menu, orders and tables
  const reloadData = () => {
    setMenu(dataService.getMenu());
    setOrders(dataService.getOrders());
    setTables(dataService.getTables());
  };

  useEffect(() => {
    reloadData();
    const unsub = dataService.subscribe((payload) => {
      const freshOrders = dataService.getOrders();
      setOrders(freshOrders);
      setTables(dataService.getTables());
      setMenu(dataService.getMenu());

      // Check if a new client order was placed
      if (payload?.type === 'NEW_ORDER' && payload.order) {
        setLatestClientOrder(payload.order);
        soundEffects.incomingOrderAlert();
      } else if (freshOrders.length > 0 && freshOrders[0].source === 'cliente_qr') {
        const newest = freshOrders[0];
        const diffMs = Date.now() - new Date(newest.timestamp).getTime();
        if (diffMs < 45000) {
          setLatestClientOrder(newest);
          soundEffects.incomingOrderAlert();
        }
      }
    });
    return () => unsub();
  }, []);

  const pendingKitchenOrdersCount = orders.filter((o) => o.status === 'en_cocina').length;
  const availableTablesCount = tables.filter((t) => t.status === 'disponible').length;

  const handleCopyClientLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url);
    setQrCopied(true);
    soundEffects.tap();
    setTimeout(() => setQrCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Offline Toast */}
      <OfflineIndicator />

      {/* ── TOP NOTIFICATION BANNER WHEN CLIENT PLACES AN ORDER (LLEGA AL DUEÑO) ── */}
      {latestClientOrder && (
        <div className="bg-emerald-600 text-white px-3.5 py-2 text-xs flex items-center justify-between shadow-lg sticky top-0 z-50 animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-white/20 rounded-lg">
              <Bell className="w-4 h-4 animate-bounce" />
            </span>
            <div>
              <p className="font-black leading-tight">
                ¡NUEVO PEDIDO EN LÍNEA! Comanda {latestClientOrder.orderNumber} ({latestClientOrder.diningType === 'aqui' ? latestClientOrder.tableNumber : latestClientOrder.diningType === 'domicilio' ? 'A Domicilio' : 'Para Llevar'})
              </p>
              <p className="text-[10px] text-emerald-100">
                Cliente: {latestClientOrder.customerName || 'Comensal'} • Total: ${latestClientOrder.total} MXN
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setInspectTicketOrder(latestClientOrder);
                soundEffects.tap();
              }}
              className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-xs transition flex items-center gap-1"
            >
              <span>🧾 Ticket</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('dueno');
                setLatestClientOrder(null);
                soundEffects.tap();
              }}
              className="px-2.5 py-1 bg-white text-emerald-950 rounded-lg font-black text-xs hover:bg-emerald-50 transition shadow-2xs"
            >
              Ver en Dueño
            </button>
            <button
              onClick={() => setLatestClientOrder(null)}
              className="p-1 text-emerald-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── TOP UTILITY STRIP ── */}
      <div className="bg-stone-900 text-stone-300 text-xs px-3 py-1.5 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-stone-200">Cocina Express PWA</span>
          <span className="hidden sm:inline text-stone-400">• Sistema de Restaurante & Menú Cliente</span>
        </div>

        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* QR Client Menu Link Button */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="flex items-center gap-1 text-amber-300 hover:text-white bg-amber-950/80 border border-amber-700/60 hover:bg-amber-900/80 px-2 py-1 rounded-md transition font-bold"
            title="Abrir o compartir Menú QR para que los clientes ordenen"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">QR Clientes</span>
          </button>

          {/* WhatsApp Destination button */}
          <button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 hover:bg-emerald-900/80 px-2 py-1 rounded-md transition font-bold"
            title="Configurar número para recibir pedidos por WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-emerald-400" />
            <span>WA: {whatsAppPhone}</span>
          </button>

          {/* Quick Menu Edit */}
          <button
            onClick={() => setIsMenuModalOpen(true)}
            className="flex items-center gap-1 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-2 py-1 rounded-md transition"
            title="Editar Menú del Día y precios"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Menú & Precios ({menu.length})</span>
          </button>

          {/* Dual screen toggle (visible on wide screens) */}
          <button
            onClick={() => setIsDualSimMode(!isDualSimMode)}
            className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-md font-medium transition ${
              isDualSimMode
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700'
            }`}
            title="Simular 2 celulares en tiempo real (Cliente ordenando + Dueño recibiendo)"
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>{isDualSimMode ? 'Vista Única' : 'Simular 2 Celulares'}</span>
          </button>

          {/* Help & Specs modal button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-1 text-stone-400 hover:text-stone-200 rounded transition"
            title="Ver Criterios y Menú Completo"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1">
        {isDualSimMode ? (
          /* Dual Phone Simulation (Desktop/Tablet) */
          <div className="p-4 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4 bg-orange-50 border border-orange-200 rounded-2xl p-2.5">
              <span className="inline-flex items-center gap-1.5 font-bold text-xs text-orange-900">
                <Sparkles className="w-4 h-4 text-orange-600" />
                Simulación en Tiempo Real: Ordena como Cliente (Izquierda) y mira cómo le llega al Dueño (Derecha)
              </span>

              <div className="flex items-center gap-2">
                {/* Left screen selector */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-stone-600 font-semibold mr-1">Izq:</span>
                  <button
                    onClick={() => setDualLeftScreen('cliente')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      dualLeftScreen === 'cliente' ? 'bg-orange-600 text-white' : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    📱 Vista Cliente
                  </button>
                  <button
                    onClick={() => setDualLeftScreen('cajero')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      dualLeftScreen === 'cajero' ? 'bg-orange-600 text-white' : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    ⚡ Caja POS
                  </button>
                </div>

                <div className="w-px h-5 bg-stone-300 mx-1" />

                {/* Right screen selector */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-stone-600 font-semibold mr-1">Der:</span>
                  <button
                    onClick={() => setDualSecondScreen('dueno')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      dualSecondScreen === 'dueno' ? 'bg-orange-600 text-white' : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    👑 Dueño
                  </button>
                  <button
                    onClick={() => setDualSecondScreen('mesas')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      dualSecondScreen === 'mesas' ? 'bg-orange-600 text-white' : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    🪑 Mesas
                  </button>
                  <button
                    onClick={() => setDualSecondScreen('cocina')}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      dualSecondScreen === 'cocina' ? 'bg-orange-600 text-white' : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    👨‍🍳 Cocina
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Screen: Client Order View or Cashier */}
              <div className="bg-stone-900 p-3 rounded-[40px] shadow-2xl border-4 border-stone-800 max-w-sm mx-auto w-full">
                <div className="bg-white rounded-[32px] overflow-hidden min-h-[640px] shadow-inner flex flex-col">
                  {dualLeftScreen === 'cliente' ? (
                    <ClientOrderView
                      menu={menu}
                      tables={tables}
                      onOrderPlaced={() => reloadData()}
                    />
                  ) : (
                    <CashierView
                      menu={menu}
                      onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                      onOpenWhatsAppConfig={() => setIsWhatsAppModalOpen(true)}
                    />
                  )}
                </div>
              </div>

              {/* Right Screen: Owner Dashboard, Tables or Kitchen */}
              <div className="bg-stone-900 p-3 rounded-[40px] shadow-2xl border-4 border-stone-800 max-w-sm mx-auto w-full">
                <div className="bg-stone-100 rounded-[32px] overflow-hidden min-h-[640px] shadow-inner flex flex-col">
                  {dualSecondScreen === 'dueno' ? (
                    <OwnerDashboard
                      onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                      onSwitchToCashier={() => {}}
                      onOpenWhatsAppConfig={() => setIsWhatsAppModalOpen(true)}
                    />
                  ) : dualSecondScreen === 'mesas' ? (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                        <h2 className="font-black text-sm text-stone-900 flex items-center gap-1.5">
                          <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                          <span>Mesas Disponibles</span>
                        </h2>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          🟢 {availableTablesCount} Libres
                        </span>
                      </div>
                      <TableGrid tables={tables} showActions={true} />
                    </div>
                  ) : (
                    <KitchenView />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Single Mobile View (Default for smartphones and responsive layouts) */
          <div>
            {currentView === 'cajero' && (
              <CashierView
                menu={menu}
                onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                onOpenOwnerView={() => setCurrentView('dueno')}
                onOpenWhatsAppConfig={() => setIsWhatsAppModalOpen(true)}
              />
            )}

            {currentView === 'mesas' && (
              <div className="min-h-screen bg-stone-100 pb-28">
                <header className="sticky top-0 z-30 bg-stone-900 text-white shadow-md px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🪑</span>
                    <div>
                      <h1 className="font-black text-sm tracking-tight">MAPA DE MESAS</h1>
                      <p className="text-[11px] text-stone-400">Estado de disponibilidad en tiempo real</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-900/60 border border-emerald-600 px-2 py-1 rounded-xl">
                    🟢 {availableTablesCount} Libres
                  </span>
                </header>

                <main className="max-w-lg mx-auto p-3 space-y-3">
                  <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm">
                    <TableGrid tables={tables} showActions={true} />
                  </div>
                </main>
              </div>
            )}

            {currentView === 'cliente' && (
              <ClientOrderView
                menu={menu}
                tables={tables}
                onExitClientView={() => setCurrentView('cajero')}
                onOrderPlaced={() => reloadData()}
              />
            )}

            {currentView === 'cocina' && <KitchenView />}

            {currentView === 'dueno' && (
              <OwnerDashboard
                onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
                onSwitchToCashier={() => setCurrentView('cajero')}
                onOpenWhatsAppConfig={() => setIsWhatsAppModalOpen(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM ROLE SWITCHER BAR (Fixed for thumb reachability on mobile) ── */}
      {!isDualSimMode && (
        <nav
          aria-label="Navegación principal"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-1.5 py-1.5 shadow-lg max-w-lg mx-auto flex items-center justify-between"
        >
          {/* Caja Mostrador */}
          <button
            type="button"
            onClick={() => {
              setCurrentView('cajero');
              soundEffects.tap();
            }}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              currentView === 'cajero'
                ? 'text-orange-600 font-black'
                : 'text-stone-500 font-semibold hover:text-stone-800'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${currentView === 'cajero' ? 'bg-orange-100' : ''}`}>
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="text-[9px] mt-0.5">Caja POS</span>
          </button>

          {/* Mesas del Negocio */}
          <button
            type="button"
            onClick={() => {
              setCurrentView('mesas');
              soundEffects.tap();
            }}
            className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition ${
              currentView === 'mesas'
                ? 'text-emerald-700 font-black'
                : 'text-stone-500 font-semibold hover:text-stone-800'
            }`}
          >
            <span className="absolute top-0 right-1 bg-emerald-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {availableTablesCount}
            </span>
            <div className={`p-1.5 rounded-xl transition ${currentView === 'mesas' ? 'bg-emerald-100' : ''}`}>
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-[9px] mt-0.5">Mesas</span>
          </button>

          {/* Vista Cliente (Menú QR) */}
          <button
            type="button"
            onClick={() => {
              setCurrentView('cliente');
              soundEffects.tap();
            }}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
              currentView === 'cliente'
                ? 'text-orange-600 font-black'
                : 'text-stone-500 font-semibold hover:text-stone-800'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition ${currentView === 'cliente' ? 'bg-orange-100' : ''}`}>
              <QrCode className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-[9px] mt-0.5 font-extrabold text-orange-700">Cliente QR</span>
          </button>

          {/* Cocina KDS with pending badge */}
          <button
            type="button"
            onClick={() => {
              setCurrentView('cocina');
              soundEffects.tap();
            }}
            className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition ${
              currentView === 'cocina'
                ? 'text-amber-600 font-black'
                : 'text-stone-500 font-semibold hover:text-stone-800'
            }`}
          >
            {pendingKitchenOrdersCount > 0 && (
              <span className="absolute top-0 right-1 bg-red-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                {pendingKitchenOrdersCount}
              </span>
            )}
            <div className={`p-1.5 rounded-xl transition ${currentView === 'cocina' ? 'bg-amber-100' : ''}`}>
              <ChefHat className="w-4 h-4" />
            </div>
            <span className="text-[9px] mt-0.5">Cocina</span>
          </button>

          {/* Panel Dueño */}
          <button
            type="button"
            onClick={() => {
              setCurrentView('dueno');
              setLatestClientOrder(null);
              soundEffects.tap();
            }}
            className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition ${
              currentView === 'dueno'
                ? 'text-stone-900 font-black'
                : 'text-stone-500 font-semibold hover:text-stone-800'
            }`}
          >
            {latestClientOrder && (
              <span className="absolute top-0 right-1 bg-red-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-ping">
                !
              </span>
            )}
            <div className={`p-1.5 rounded-xl transition ${currentView === 'dueno' ? 'bg-stone-200' : ''}`}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[9px] mt-0.5">Dueño</span>
          </button>
        </nav>
      )}

      {/* ── MODALS ── */}
      <QuickExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        registeredBy={currentView === 'cajero' ? 'Cajero (Mostrador)' : currentView === 'cocina' ? 'Cocina' : 'Dueño'}
      />

      <MenuConfigModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        menu={menu}
        onMenuUpdated={reloadData}
      />

      <WhatsAppConfigModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onPhoneUpdated={(newPhone) => setWhatsAppPhone(newPhone)}
      />

      {/* ── QR CODE SHARE MODAL FOR CLIENTS ── */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl text-center space-y-3.5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-1.5 text-stone-900 font-black text-sm">
                <QrCode className="w-4 h-4 text-orange-600" />
                <span>Menú Digital para Clientes</span>
              </div>
              <button
                onClick={() => setIsQRModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Simulated QR Code Graphic */}
            <div className="p-4 bg-stone-50 rounded-2xl border-2 border-stone-200 inline-block mx-auto">
              <div className="w-44 h-44 bg-white p-2 rounded-xl shadow-inner flex flex-col items-center justify-center border border-stone-300">
                {/* SVG QR Code Pattern */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-stone-900">
                  <path fill="currentColor" d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z" />
                  <path fill="currentColor" d="M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z" />
                  <path fill="currentColor" d="M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z" />
                  <path fill="currentColor" d="M38,10 h10 v10 h-10 z M54,10 h8 v8 h-8 z M38,26 h14 v6 h-14 z" />
                  <path fill="currentColor" d="M38,38 h24 v10 h-24 z M70,38 h12 v8 h-12 z M88,40 h12 v6 h-12 z" />
                  <path fill="currentColor" d="M10,40 h15 v8 h-15 z M12,54 h8 v10 h-8 z M26,52 h12 v6 h-12 z" />
                  <path fill="currentColor" d="M42,54 h18 v12 h-18 z M66,54 h14 v8 h-14 z M84,54 h16 v16 h-16 z" />
                  <path fill="currentColor" d="M38,72 h12 v12 h-12 z M56,72 h12 v18 h-12 z M74,74 h12 v8 h-12 z" />
                </svg>
              </div>
              <p className="text-[10px] text-stone-500 font-bold mt-2">
                Escanea con la cámara de tu celular
              </p>
            </div>

            <p className="text-xs text-stone-600 px-2">
              Pon este QR en las mesas o mostrador para que los clientes elijan su comida (comer aquí, para llevar o a domicilio) y te envíen la comanda directo a tu pantalla y WhatsApp.
            </p>

            {qrCopied && (
              <p className="text-xs font-bold text-emerald-600 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                ✓ ¡Enlace copiado al portapapeles!
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyClientLink}
                className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Enlace</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView('cliente');
                  setIsQRModalOpen(false);
                  soundEffects.tap();
                }}
                className="py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Menú</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl text-stone-800 space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-black text-stone-900 text-base">Cocina Express - Guía Completa</h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200">
                <p className="font-bold text-orange-900">🪑 Gestión de Mesas Disponibles</p>
                <p className="text-orange-800 mt-0.5">
                  El dueño y el cajero pueden ver en tiempo real qué mesa está libre (verde), ocupada (rojo) o pidiendo cuenta (amarillo), cuánto llevan consumido y liberar la mesa con 1 toque.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="font-bold text-emerald-900">📱 Vista Cliente (Comer Aquí, Llevar o Domicilio)</p>
                <p className="text-emerald-800 mt-0.5">
                  Los clientes pueden escanear el QR, ver las mesas disponibles para sentarse, o pedir para llevar/domicilio. Al confirmar, el pedido llega inmediatamente a la pantalla del dueño y se puede enviar al WhatsApp <strong>5584085644</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <p className="font-bold text-amber-900">👑 Panel del Dueño en Vivo</p>
                <p className="text-amber-800 mt-0.5">
                  Ventas acumuladas del día, ticket promedio, efectivo neto en caja chica, ranking de platillos más vendidos y alertas sonoras de nuevas comandas en línea.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-white text-xs mt-2"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ── DIGITAL TICKET INSPECTION (MODAL GLOBAL) ── */}
      {inspectTicketOrder && (
        <DigitalTicketModal
          order={inspectTicketOrder}
          onClose={() => setInspectTicketOrder(null)}
          storeName="Cocina Express"
        />
      )}
    </div>
  );
}
