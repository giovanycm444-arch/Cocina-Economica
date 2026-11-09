import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingCart, DollarSign, Wallet, CreditCard, 
  Smartphone, Share2, RefreshCw, Flame, AlertTriangle, ArrowDownRight, 
  CheckCircle, Clock, ShieldCheck, ChevronRight, FileText,
  MessageSquare, Send, Users, UtensilsCrossed, ShoppingBag, Bike, Sparkles, Bell
} from 'lucide-react';
import { DailySummary, Order, Expense, RestaurantTable, OrderStatus } from '../types';
import { dataService } from '../services/dataService';
import { soundEffects } from '../utils/audio';
import { 
  getSavedWhatsAppPhone, 
  sendOrderViaWhatsApp, 
  sendDailyReportViaWhatsApp 
} from '../utils/whatsapp';
import { TableGrid } from './TableGrid';
import { DigitalTicketModal } from './DigitalTicketModal';

interface OwnerDashboardProps {
  onOpenExpenseModal: () => void;
  onSwitchToCashier: () => void;
  onOpenWhatsAppConfig?: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  onOpenExpenseModal,
  onSwitchToCashier,
  onOpenWhatsAppConfig,
}) => {
  const [summary, setSummary] = useState<DailySummary>(dataService.getDailySummary());
  const [orders, setOrders] = useState<Order[]>(dataService.getOrders());
  const [expenses, setExpenses] = useState<Expense[]>(dataService.getExpenses());
  const [tables, setTables] = useState<RestaurantTable[]>(dataService.getTables());
  const [ownerTab, setOwnerTab] = useState<'ventas' | 'mesas' | 'pedidos'>('ventas');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Ahora');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [selectedTicketOrder, setSelectedTicketOrder] = useState<Order | null>(null);
  const savedPhone = getSavedWhatsAppPhone();

  // Sync state and listen for real-time changes
  const refreshData = () => {
    setSummary(dataService.getDailySummary());
    setOrders(dataService.getOrders());
    setExpenses(dataService.getExpenses());
    setTables(dataService.getTables());
    setLastSyncTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = dataService.subscribe((payload) => {
      refreshData();
      if (payload?.type === 'NEW_ORDER') {
        soundEffects.incomingOrderAlert();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTestIncomingOrder = () => {
    soundEffects.incomingOrderAlert();
    dataService.simulateClientOrder('aqui', undefined, 'Cliente de Prueba');
    refreshData();
    setOwnerTab('pedidos');
  };

  // Format currency
  const formatMoney = (val: number) => {
    return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Table calculations
  const availableCount = tables.filter((t) => t.status === 'disponible').length;
  const occupiedCount = tables.filter((t) => t.status === 'ocupada').length;
  const billingCount = tables.filter((t) => t.status === 'cuenta').length;
  const totalInTables = tables.filter((t) => t.totalAmount).reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  // Online orders from customers
  const onlineOrders = orders.filter((o) => o.source === 'cliente_qr');
  const pendingOnlineOrders = onlineOrders.filter((o) => o.status === 'en_cocina' || o.status === 'listo');

  // WhatsApp formatted report copy
  const handleShareReport = () => {
    const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const text = `📊 *REPORTE DE VENTAS - COCINA EXPRESS*
📅 ${today}
⏱️ Hora de corte: ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}

💰 *VENTA TOTAL:* ${formatMoney(summary.totalSales)} MXN
🧾 *Total Pedidos:* ${summary.orderCount}
🎯 *Ticket Promedio:* ${formatMoney(summary.averageTicket)} MXN

*Estado de Mesas:*
🟢 Libres: ${availableCount} | 🔴 Ocupadas: ${occupiedCount} | 🟡 En Cuenta: ${billingCount}
💵 Consumo activo en mesas: ${formatMoney(totalInTables)}

*Formas de Pago:*
💵 Efectivo: ${formatMoney(summary.cashSales)}
💳 Tarjeta: ${formatMoney(summary.cardSales)}
📱 Transferencia: ${formatMoney(summary.transferSales)}

*Caja Chica & Gastos:*
🔻 Total Gastos: ${formatMoney(summary.totalExpenses)}
✅ *EFECTIVO NETO EN CAJA:* ${formatMoney(summary.netCash)}

*Platillos Más Vendidos:*
${summary.topDishes.slice(0, 4).map((d, i) => `${i + 1}. ${d.emoji} ${d.name}: ${d.count} órdenes (${formatMoney(d.revenue)})`).join('\n')}

_Generado automáticamente desde Cocina Express PWA_`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    soundEffects.tap();
    setTimeout(() => setCopiedReport(false), 3000);
  };

  const handleSendReportToWhatsApp = () => {
    soundEffects.cashRegister();
    sendDailyReportViaWhatsApp(summary, savedPhone);
  };

  const handleConfirmReset = () => {
    dataService.resetDay();
    setShowResetConfirm(false);
    soundEffects.tap();
  };

  const handleLoadDemo = () => {
    dataService.loadDemoData();
    soundEffects.cashRegister();
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    soundEffects.tap();
    dataService.updateOrderStatus(orderId, status);
  };

  const handleChatWithCustomer = (order: Order) => {
    if (!order.customerPhone) {
      alert('Este cliente no dejó número telefónico.');
      return;
    }
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `¡Hola ${order.customerName || 'amig@'}! Te saludamos de Cocina Express referente a tu pedido ${order.orderNumber}. Ya lo estamos preparando con mucho gusto. 🌮😋`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-100 text-stone-900 pb-28 md:pb-6">
      {/* ── HEADER DEL DUEÑO ── */}
      <header className="sticky top-0 z-30 bg-stone-900 text-white shadow-md px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-sm">
            👑
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-sm tracking-tight leading-none text-white">PANEL DEL DUEÑO</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold">
                EN VIVO
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-none mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sincronizado: {lastSyncTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Probar llegada de pedido al dueño live test */}
          <button
            onClick={handleTestIncomingOrder}
            className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-stone-950 px-2 py-1.5 rounded-lg text-xs font-black shadow-xs active:scale-95 transition"
            title="Probar que los pedidos de clientes lleguen al dueño en tiempo real"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
            <span className="hidden sm:inline">Probar Llegada</span>
          </button>

          {/* Direct WhatsApp Report Send */}
          <button
            onClick={handleSendReportToWhatsApp}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-xs active:scale-95 transition"
            title={`Enviar reporte completo al WhatsApp (${savedPhone})`}
          >
            <MessageSquare className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={handleShareReport}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
            title="Copiar texto para compartir"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-2 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition"
            title="Registrar gasto de caja"
          >
            <DollarSign className="w-3.5 h-3.5 text-red-400" />
            <span>Gasto</span>
          </button>
        </div>
      </header>

      {/* ── PERSISTENT TABLE AVAILABILITY BAR (DUEÑO SABE EN VIVO) ── */}
      <div 
        onClick={() => setOwnerTab('mesas')}
        className="bg-amber-950/90 text-amber-100 text-xs px-3.5 py-2 border-b border-amber-900/60 cursor-pointer hover:bg-amber-950 transition flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-amber-300 flex items-center gap-1">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
            <span>Mesas:</span>
          </span>
          <span className="bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-700/50">
            🟢 {availableCount} Libres
          </span>
          <span className="bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded-md border border-red-700/50">
            🔴 {occupiedCount} Ocupadas
          </span>
          {billingCount > 0 && (
            <span className="bg-yellow-950 text-yellow-300 font-bold px-2 py-0.5 rounded-md border border-yellow-700/50">
              🟡 {billingCount} Cuenta
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
          <span>Ver Mapa</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* ── OWNER TAB NAVIGATION ── */}
      <div className="bg-white border-b border-stone-200 px-3 py-1.5 flex items-center justify-around shadow-2xs max-w-lg mx-auto w-full">
        <button
          type="button"
          onClick={() => {
            setOwnerTab('ventas');
            soundEffects.tap();
          }}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-black transition ${
            ownerTab === 'ventas'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span>Ventas & Caja</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setOwnerTab('mesas');
            soundEffects.tap();
          }}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-black transition ${
            ownerTab === 'mesas'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mesas ({availableCount} Libres)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setOwnerTab('pedidos');
            soundEffects.tap();
          }}
          className={`relative flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-black transition ${
            ownerTab === 'pedidos'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          {pendingOnlineOrders.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
          )}
          <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
          <span>Comandas ({orders.length})</span>
        </button>
      </div>

      {/* ── MAIN CONTENT (Mobile Phone Centric) ── */}
      <main className="flex-1 max-w-lg mx-auto w-full px-3 py-3 space-y-3">
        {/* Copied notification banner */}
        {copiedReport && (
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top">
            <span>✓ Reporte copiado en portapapeles (listo para WhatsApp)</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">OK</span>
          </div>
        )}

        {/* ── ACTIVE ONLINE ORDERS ALERT BANNER (LLEGADA DE PEDIDO AL DUEÑO) ── */}
        {pendingOnlineOrders.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg space-y-2 animate-in slide-in-from-top">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white/20 rounded-xl">
                  <Bell className="w-4 h-4 animate-bounce" />
                </span>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider">
                    ¡{pendingOnlineOrders.length} Pedido(s) de Cliente en Línea!
                  </h3>
                  <p className="text-[11px] text-orange-100">
                    Ordenados desde el Menú Digital para cocina y entrega
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOwnerTab('pedidos')}
                className="text-[11px] bg-white text-orange-950 font-black px-2.5 py-1 rounded-xl shadow-xs active:scale-95 transition"
              >
                Ver Comandas
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ TAB 1: VENTAS & FINANZAS ══════════════ */}
        {ownerTab === 'ventas' && (
          <div className="space-y-3">
            {/* HERO BANNER: VENTA TOTAL DEL DÍA */}
            <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 text-white rounded-3xl p-5 shadow-xl border border-stone-800">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                    Venta Acumulada del Día
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-black text-white tracking-tight">
                      {formatMoney(summary.totalSales)}
                    </span>
                    <span className="text-xs font-bold text-amber-300">MXN</span>
                  </div>
                </div>
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs text-amber-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
                <div className="bg-white/5 rounded-xl p-2">
                  <span className="block text-[11px] text-stone-400 font-medium">Pedidos</span>
                  <span className="text-base font-black text-white">{summary.orderCount}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <span className="block text-[11px] text-stone-400 font-medium">Ticket Prom.</span>
                  <span className="text-base font-black text-amber-300">{formatMoney(summary.averageTicket)}</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <span className="block text-[11px] text-stone-400 font-medium">Caja Neta</span>
                  <span className="text-base font-black text-emerald-400">{formatMoney(summary.netCash)}</span>
                </div>
              </div>
            </section>

            {/* DESGLOSE DE DINERO Y MÉTODOS DE PAGO */}
            <section className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-stone-500" />
                  <span>Desglose por Método de Pago</span>
                </h2>
                <span className="text-[11px] font-semibold text-stone-500">
                  {summary.orderCount} transacciones
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-1 text-emerald-800 text-[11px] font-bold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Efectivo</span>
                  </div>
                  <p className="text-sm font-black text-emerald-900 mt-1">{formatMoney(summary.cashSales)}</p>
                  <p className="text-[10px] text-emerald-600 font-medium">
                    {summary.totalSales > 0 ? Math.round((summary.cashSales / summary.totalSales) * 100) : 0}% del total
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-1 text-blue-800 text-[11px] font-bold">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tarjeta</span>
                  </div>
                  <p className="text-sm font-black text-blue-900 mt-1">{formatMoney(summary.cardSales)}</p>
                  <p className="text-[10px] text-blue-600 font-medium">
                    {summary.totalSales > 0 ? Math.round((summary.cardSales / summary.totalSales) * 100) : 0}% del total
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="flex items-center gap-1 text-purple-800 text-[11px] font-bold">
                    <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                    <span>Transf.</span>
                  </div>
                  <p className="text-sm font-black text-purple-900 mt-1">{formatMoney(summary.transferSales)}</p>
                  <p className="text-[10px] text-purple-600 font-medium">
                    {summary.totalSales > 0 ? Math.round((summary.transferSales / summary.totalSales) * 100) : 0}% del total
                  </p>
                </div>
              </div>

              {/* Caja chica reconciliation row */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-stone-700">Control de Caja Chica:</p>
                  <p className="text-[11px] text-stone-500">
                    Efectivo recibido (${summary.cashSales}) - Gastos rápidos (${summary.totalExpenses})
                  </p>
                </div>
                <div className="text-right">
                  <span className="block font-black text-sm text-stone-900">{formatMoney(summary.netCash)}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700">En cajón</span>
                </div>
              </div>
            </section>

            {/* PLATILLOS MÁS VENDIDOS */}
            <section className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-stone-600">
                  Ranking de Platillos Vendidos
                </h2>
                <span className="text-[11px] text-stone-500 font-medium">Por órdenes</span>
              </div>

              {summary.topDishes.length === 0 ? (
                <p className="text-xs text-stone-400 py-3 text-center">Aún no hay comandas registradas hoy</p>
              ) : (
                <div className="space-y-2">
                  {summary.topDishes.slice(0, 5).map((dish, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-stone-50">
                      <div className="flex items-center gap-2">
                        <span className="w-5 font-black text-xs text-stone-400">{idx + 1}.</span>
                        <span className="text-lg">{dish.emoji}</span>
                        <div>
                          <p className="font-bold text-xs text-stone-900">{dish.name}</p>
                          <p className="text-[10px] text-stone-500">{dish.count} órdenes registradas</p>
                        </div>
                      </div>
                      <span className="font-black text-xs text-stone-800">{formatMoney(dish.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* GASTOS DE LA JORNADA */}
            <section className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-500" />
                  <span>Gastos de la Jornada ({expenses.length})</span>
                </h2>
                <span className="text-xs font-black text-red-600">-{formatMoney(summary.totalExpenses)}</span>
              </div>

              {expenses.length === 0 ? (
                <p className="text-xs text-stone-400 py-2 text-center">No se han registrado salidas de dinero</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-2 rounded-xl bg-red-50/60 border border-red-100 text-xs">
                      <div>
                        <p className="font-bold text-stone-800">{exp.concept}</p>
                        <p className="text-[10px] text-stone-500">{exp.timeString} • Por: {exp.registeredBy}</p>
                      </div>
                      <span className="font-black text-red-700">-{formatMoney(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ══════════════ TAB 2: MESAS DEL NEGOCIO (CORE FEATURE) ══════════════ */}
        {ownerTab === 'mesas' && (
          <div className="space-y-3 animate-in fade-in">
            {/* Header / Intro Card */}
            <section className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-sm text-stone-900 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                    <span>Control de Mesas en Tiempo Real</span>
                  </h2>
                  <p className="text-xs text-stone-500">
                    Toca cualquier mesa para ver la comanda, liberar la mesa o marcar cuenta
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-black text-orange-600">{formatMoney(totalInTables)}</span>
                  <span className="text-[10px] text-stone-400">En consumo</span>
                </div>
              </div>

              {/* Floor Plan Component */}
              <div className="pt-2">
                <TableGrid tables={tables} showActions={true} />
              </div>
            </section>
          </div>
        )}

        {/* ══════════════ TAB 3: COMANDAS & PEDIDOS EN LÍNEA ══════════════ */}
        {ownerTab === 'pedidos' && (
          <div className="space-y-3 animate-in fade-in">
            {/* Online orders special attention box */}
            {onlineOrders.length > 0 && (
              <section className="bg-amber-50 rounded-2xl p-3 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs uppercase text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Pedidos Realizados por Clientes ({onlineOrders.length})</span>
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                    Menú Digital QR
                  </span>
                </div>

                <div className="space-y-2">
                  {onlineOrders.map((ord) => (
                    <div 
                      key={ord.id} 
                      className={`p-3 rounded-xl border bg-white shadow-xs space-y-2 ${
                        ord.status === 'en_cocina'
                          ? 'border-orange-400 ring-2 ring-orange-400/20'
                          : ord.status === 'listo'
                          ? 'border-emerald-400'
                          : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-stone-900">{ord.orderNumber}</span>
                            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                              {ord.diningType === 'aqui' ? `🪑 ${ord.tableNumber}` : ord.diningType === 'domicilio' ? '🛵 Domicilio' : '🛍️ Para Llevar'}
                            </span>
                            <span className="text-[10px] text-stone-400 font-semibold">{ord.timeString}</span>
                          </div>
                          <p className="font-extrabold text-xs text-stone-800 mt-1">
                            👤 {ord.customerName || 'Cliente'} {ord.customerPhone && <span className="font-normal text-stone-500">({ord.customerPhone})</span>}
                          </p>
                          {ord.deliveryAddress && (
                            <p className="text-xs text-stone-600 font-medium mt-0.5">
                              📍 <strong>Dirección:</strong> {ord.deliveryAddress}
                            </p>
                          )}
                          {ord.pickupTime && (
                            <p className="text-xs text-amber-700 font-bold mt-0.5">
                              ⏰ Recoge: {ord.pickupTime}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="block font-black text-base text-stone-900">{formatMoney(ord.total)}</span>
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            ord.status === 'en_cocina'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.status === 'listo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {ord.status === 'en_cocina' ? 'En Cocina' : ord.status === 'listo' ? 'Listo' : ord.status}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-2 bg-stone-50 rounded-lg text-xs space-y-1">
                        {ord.items.map((i, idx) => (
                          <div key={idx} className="flex justify-between text-stone-700">
                            <span>{i.quantity}x {i.name} {i.selectedOption ? `(${i.selectedOption})` : ''}</span>
                            <span className="font-bold">${i.price * i.quantity}</span>
                          </div>
                        ))}
                        {ord.notes && (
                          <p className="text-[11px] text-amber-800 font-medium pt-1 border-t border-stone-200">
                            📝 Nota: {ord.notes}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicketOrder(ord);
                            soundEffects.tap();
                          }}
                          className="py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1 border border-stone-300 shadow-2xs"
                          title="Ver Ticket Digital del cliente"
                        >
                          <FileText className="w-3.5 h-3.5 text-stone-600" />
                          <span>Ticket</span>
                        </button>

                        {ord.customerPhone && (
                          <button
                            type="button"
                            onClick={() => handleChatWithCustomer(ord)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-white" />
                            <span>WhatsApp</span>
                          </button>
                        )}

                        {ord.status === 'en_cocina' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'listo')}
                            className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-lg transition shadow-2xs"
                          >
                            Marcar Listo
                          </button>
                        )}

                        {ord.status === 'listo' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'entregado')}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-2xs"
                          >
                            Entregar / Cobrar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FEED DE TODAS LAS COMANDAS */}
            <section className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-xs uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Historial de Comandas del Día ({orders.length})</span>
                </h2>
                <span className="text-[11px] font-semibold text-emerald-600">Tiempo Real</span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-6 text-stone-400 space-y-1">
                  <p className="text-sm font-semibold">Sin comandas activas</p>
                  <p className="text-xs">Usa el modo cajero o la vista cliente para agregar pedidos</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between hover:bg-stone-100 transition"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-stone-900">{ord.orderNumber}</span>
                          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-bold">
                            {ord.timeString}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            ord.diningType === 'aqui' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : ord.diningType === 'domicilio'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.diningType === 'aqui' ? (ord.tableNumber || 'Mesa') : ord.diningType === 'domicilio' ? 'Domicilio' : 'Llevar'}
                          </span>
                          {ord.source === 'cliente_qr' && (
                            <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 rounded">
                              QR Cliente
                            </span>
                          )}
                        </div>
                        <p className="text-stone-600 text-[11px] mt-0.5">
                          {ord.customerName ? `${ord.customerName} • ` : ''}
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="block font-black text-sm text-stone-900">{formatMoney(ord.total)}</span>
                          <span className="text-[10px] capitalize font-medium text-stone-500">
                            {ord.paymentMethod}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicketOrder(ord);
                            soundEffects.tap();
                          }}
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition active:scale-90"
                          title={`Ver ticket de orden ${ord.orderNumber}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-stone-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundEffects.tap();
                            sendOrderViaWhatsApp(ord, savedPhone);
                          }}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition active:scale-90"
                          title={`Reenviar orden ${ord.orderNumber} por WhatsApp (${savedPhone})`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── GESTIÓN DE JORNADA / CORTE DE CAJA ── */}
        <section className="p-3.5 bg-stone-200/60 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-stone-800">Corte de Caja / Limpieza</p>
            <p className="text-stone-500 text-[11px]">Cerrar turno o resetear ventas del día</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleLoadDemo}
              className="px-2.5 py-1.5 rounded-lg bg-stone-300 hover:bg-stone-400 text-stone-800 font-bold text-[11px] active:scale-95 transition"
            >
              Cargar Demo
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] active:scale-95 transition"
            >
              Cerrar Turno
            </button>
          </div>
        </section>
      </main>

      {/* ── RESET CONFIRMATION MODAL ── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-black text-stone-900 text-lg">¿Hacer Corte de Caja?</h3>
            <p className="text-xs text-stone-600">
              Esto archivará y limpiará los pedidos del día ({orders.length} pedidos por {formatMoney(summary.totalSales)}) para iniciar una nueva jornada en ceros.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReset}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs"
              >
                Sí, Limpiar Turno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DIGITAL TICKET MODAL FOR OWNER INSPECTION & PRINT ── */}
      {selectedTicketOrder && (
        <DigitalTicketModal
          order={selectedTicketOrder}
          onClose={() => setSelectedTicketOrder(null)}
          storeName="Cocina Express"
        />
      )}
    </div>
  );
};
