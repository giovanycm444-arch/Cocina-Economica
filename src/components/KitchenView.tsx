import React, { useState, useEffect } from 'react';
import { 
  ChefHat, Clock, CheckCircle2, AlertTriangle, UtensilsCrossed, 
  ShoppingBag, Bell, MessageSquare, Volume2, VolumeX, Sparkles, RefreshCw
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { dataService } from '../services/dataService';
import { soundEffects } from '../utils/audio';
import { sendOrderViaWhatsApp, getSavedWhatsAppPhone } from '../utils/whatsapp';

export const KitchenView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(dataService.getOrders());
  const [filter, setFilter] = useState<'pendientes' | 'listos' | 'todos'>('pendientes');
  const [now, setNow] = useState(Date.now());
  const savedPhone = getSavedWhatsAppPhone();

  // Keep orders synced and update elapsed time every 10 seconds
  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setOrders(dataService.getOrders());
    });

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const handleUpdateStatus = (orderId: string, nextStatus: OrderStatus) => {
    soundEffects.cashRegister();
    dataService.updateOrderStatus(orderId, nextStatus);
    setOrders(dataService.getOrders());
  };

  const getMinutesElapsed = (timestamp: string) => {
    const orderTime = new Date(timestamp).getTime();
    const diffMs = now - orderTime;
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  // Filter orders
  const activeOrders = orders.filter((o) => {
    if (filter === 'pendientes') return o.status === 'en_cocina';
    if (filter === 'listos') return o.status === 'listo';
    return true;
  });

  const pendingCount = orders.filter((o) => o.status === 'en_cocina').length;
  const readyCount = orders.filter((o) => o.status === 'listo').length;

  return (
    <div className="flex flex-col min-h-screen bg-stone-900 text-stone-100 pb-28 md:pb-6">
      {/* ── TOP KITCHEN BAR ── */}
      <header className="sticky top-0 z-30 bg-stone-950 text-white border-b border-stone-800 px-3.5 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center font-black text-lg shadow-md">
            👨‍🍳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm tracking-tight leading-none text-white">
                PANTALLA DE COCINA (KDS)
              </h1>
              <span className="text-[10px] bg-red-600/80 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                {pendingCount} Pendiente{pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">Comandas en preparación en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.tap();
              setOrders(dataService.getOrders());
            }}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
            title="Actualizar comandas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── FILTER TABS ── */}
      <div className="max-w-lg mx-auto w-full px-3 pt-3">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-800 rounded-2xl">
          <button
            onClick={() => {
              setFilter('pendientes');
              soundEffects.tap();
            }}
            className={`py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              filter === 'pendientes'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>En Cocina ({pendingCount})</span>
          </button>

          <button
            onClick={() => {
              setFilter('listos');
              soundEffects.tap();
            }}
            className={`py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              filter === 'listos'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Listos ({readyCount})</span>
          </button>

          <button
            onClick={() => {
              setFilter('todos');
              soundEffects.tap();
            }}
            className={`py-2 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
              filter === 'todos'
                ? 'bg-stone-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>Todos ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* ── TICKETS GRID ── */}
      <main className="flex-1 max-w-lg mx-auto w-full px-3 py-3 space-y-3">
        {activeOrders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-stone-800 rounded-full flex items-center justify-center text-3xl">
              ✨
            </div>
            <p className="font-black text-stone-300 text-base">¡Cocina al día!</p>
            <p className="text-xs text-stone-500">
              {filter === 'pendientes'
                ? 'No hay pedidos pendientes de cocinar en este momento'
                : 'No hay pedidos en este estado'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((ord) => {
              const minutes = getMinutesElapsed(ord.timestamp);
              const isUrgent = minutes >= 10 && ord.status === 'en_cocina';
              const isVeryUrgent = minutes >= 15 && ord.status === 'en_cocina';

              return (
                <div
                  key={ord.id}
                  className={`rounded-3xl p-4 transition border-2 shadow-xl ${
                    ord.status === 'listo'
                      ? 'bg-stone-800 border-emerald-500/80'
                      : ord.status === 'entregado'
                      ? 'bg-stone-850 border-stone-700 opacity-75'
                      : isVeryUrgent
                      ? 'bg-stone-800 border-red-500 ring-2 ring-red-500/40 animate-pulse'
                      : isUrgent
                      ? 'bg-stone-800 border-amber-500'
                      : 'bg-stone-850 border-stone-700'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between pb-2.5 border-b border-stone-700">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-amber-400 tracking-tight">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1 ${
                            ord.diningType === 'aqui'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {ord.diningType === 'aqui' ? (
                            <>
                              <UtensilsCrossed className="w-3 h-3" />
                              <span>{ord.tableNumber || 'Comer Aquí'}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3 h-3" />
                              <span>Para Llevar</span>
                            </>
                          )}
                        </span>
                      </div>

                      {ord.customerName && (
                        <p className="text-xs font-bold text-stone-300 mt-1">
                          Cliente: <span className="text-white">{ord.customerName}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-lg ${
                          isVeryUrgent
                            ? 'bg-red-500 text-white animate-bounce'
                            : isUrgent
                            ? 'bg-amber-500 text-stone-950 font-black'
                            : 'bg-stone-700 text-stone-300'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>Hace {minutes} min</span>
                      </span>
                      <p className="text-[10px] text-stone-500 mt-1">{ord.timeString}</p>
                    </div>
                  </div>

                  {/* Dishes list */}
                  <div className="py-3 space-y-2">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between p-2 rounded-xl bg-stone-900/90 border border-stone-800"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xl shrink-0 mt-0.5">{item.emoji}</span>
                          <div>
                            <p className="font-extrabold text-sm text-white">
                              <span className="text-amber-400 font-black mr-1.5">{item.quantity}x</span>
                              {item.name}
                            </p>
                            {item.selectedOption && (
                              <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                                ➔ {item.selectedOption}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special note */}
                  {ord.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-bold mb-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Nota de comensal: {ord.notes}</span>
                    </div>
                  )}

                  {/* Kitchen Action Buttons */}
                  <div className="pt-1 flex gap-2">
                    {ord.status === 'en_cocina' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ord.id, 'listo')}
                        className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg active:scale-98 transition flex items-center justify-center gap-2"
                      >
                        <Bell className="w-4 h-4 fill-white" />
                        <span>¡LISTO PARA SERVIR / ENTREGAR!</span>
                      </button>
                    )}

                    {ord.status === 'listo' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(ord.id, 'entregado')}
                          className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ENTREGADO AL CLIENTE</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundEffects.tap();
                            sendOrderViaWhatsApp(ord, savedPhone);
                          }}
                          className="p-3 bg-emerald-700 hover:bg-emerald-600 rounded-2xl text-white transition active:scale-95"
                          title="Avisar por WhatsApp"
                        >
                          <MessageSquare className="w-5 h-5 fill-white" />
                        </button>
                      </>
                    )}

                    {ord.status === 'entregado' && (
                      <div className="w-full py-2 bg-stone-800 rounded-xl text-center text-xs font-bold text-stone-400 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Orden completada y servida</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
