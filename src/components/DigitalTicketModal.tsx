import React, { useState } from 'react';
import { 
  CheckCircle2, Printer, Copy, Check, MessageSquare, 
  Send, X, Sparkles, Phone, MapPin, Clock, UtensilsCrossed,
  ShoppingBag, Bike, ShieldCheck, Download
} from 'lucide-react';
import { Order } from '../types';
import { 
  buildCustomerTicketMessage, 
  sendCustomerTicketViaWhatsApp, 
  sendOrderViaWhatsApp,
  getSavedWhatsAppPhone 
} from '../utils/whatsapp';
import { soundEffects } from '../utils/audio';

interface DigitalTicketModalProps {
  order: Order;
  onClose: () => void;
  onNewOrder?: () => void;
  storeName?: string;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  order,
  onClose,
  onNewOrder,
  storeName = 'Cocina Express',
}) => {
  const [clientPhone, setClientPhone] = useState(order.customerPhone || '');
  const [copied, setCopied] = useState(false);
  const [sentToClient, setSentToClient] = useState(false);
  const [sentToOwner, setSentToOwner] = useState(false);
  const ownerPhone = getSavedWhatsAppPhone();

  // Send to Client's own WhatsApp
  const handleSendToMyWhatsApp = () => {
    soundEffects.tap();
    sendCustomerTicketViaWhatsApp(order, clientPhone, storeName);
    setSentToClient(true);
    setTimeout(() => setSentToClient(false), 4000);
  };

  // Send directly to the Owner's WhatsApp (5584085644)
  const handleSendToOwnerWhatsApp = () => {
    soundEffects.cashRegister();
    sendOrderViaWhatsApp(order, ownerPhone, storeName);
    setSentToOwner(true);
    setTimeout(() => setSentToOwner(false), 4000);
  };

  // Copy plain text receipt to clipboard
  const handleCopyTicket = () => {
    soundEffects.tap();
    const text = buildCustomerTicketMessage(order, storeName);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Print ticket
  const handlePrint = () => {
    soundEffects.tap();
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const diningLabel = 
    order.diningType === 'aqui' 
      ? `🍽️ Comer Aquí • ${order.tableNumber || 'Mesa'}` 
      : order.diningType === 'domicilio' 
      ? `🛵 Servicio a Domicilio` 
      : `🛍️ Para Llevar (Recoger en mostrador)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-md my-auto rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-stone-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-lg">
              🧾
            </div>
            <div>
              <h2 className="font-black text-base leading-tight">Ticket Digital del Cliente</h2>
              <p className="text-[11px] text-emerald-100">
                ¡Pedido #{order.orderNumber} recibido con éxito!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition active:scale-90"
            title="Cerrar ticket"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          
          {/* Status Alert Box */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-extrabold text-emerald-900">
                ¡Pedido registrado y enviado al dueño!
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                La cocina ya tiene tu comanda en pantalla. Conserva este ticket en tu WhatsApp o celular.
              </p>
            </div>
          </div>

          {/* ── THERMAL RECEIPT CONTAINER (Estilizado como Ticket Físico) ── */}
          <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl p-4 font-mono text-stone-800 shadow-inner space-y-3 text-xs">
            {/* Store branding */}
            <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-stone-300">
              <p className="text-base font-black tracking-wider text-stone-900">
                {storeName.toUpperCase()}
              </p>
              <p className="text-[10px] text-stone-500">Av. Principal #123, Centro • RFC: CEX-240101-9A1</p>
              <p className="text-[10px] text-stone-500 font-bold">Tel / WhatsApp: {ownerPhone}</p>
            </div>

            {/* Ticket Info */}
            <div className="flex items-center justify-between text-[11px]">
              <div>
                <span className="font-black text-stone-900 text-sm">FOLIO: {order.orderNumber}</span>
                <p className="text-stone-500">{order.timeString} • {new Date(order.timestamp).toLocaleDateString('es-MX')}</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded">
                  🟢 EN COCINA
                </span>
                <p className="text-[10px] text-stone-500 capitalize">{order.paymentMethod}</p>
              </div>
            </div>

            {/* Client & Dining Details */}
            <div className="p-2 bg-white rounded-xl border border-stone-200 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                {order.diningType === 'aqui' ? (
                  <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
                ) : order.diningType === 'domicilio' ? (
                  <Bike className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{diningLabel}</span>
              </div>

              {order.customerName && (
                <p className="text-stone-700">
                  <span className="font-bold">Cliente:</span> {order.customerName}
                </p>
              )}

              {order.customerPhone && (
                <p className="text-stone-700">
                  <span className="font-bold">Teléfono:</span> {order.customerPhone}
                </p>
              )}

              {order.deliveryAddress && (
                <p className="text-blue-900 font-medium">
                  <span className="font-bold">Dirección:</span> {order.deliveryAddress}
                </p>
              )}

              {order.pickupTime && (
                <p className="text-amber-900 font-medium">
                  <span className="font-bold">Listo en:</span> {order.pickupTime}
                </p>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-bold text-stone-500 uppercase border-b border-stone-300 pb-0.5">
                <span>Cant • Descripción</span>
                <span>Importe</span>
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs">
                  <div className="pr-2">
                    <p className="font-bold text-stone-900">
                      {item.quantity}x {item.emoji || ''} {item.name}
                    </p>
                    {item.selectedOption && (
                      <p className="text-[10px] text-stone-600 pl-4">➔ {item.selectedOption}</p>
                    )}
                    {item.notes && (
                      <p className="text-[10px] text-stone-500 italic pl-4">Nota: {item.notes}</p>
                    )}
                  </div>
                  <span className="font-extrabold text-stone-900 shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-900">
                <span className="font-bold">Indicaciones especiales:</span> {order.notes}
              </div>
            )}

            {/* Total Section */}
            <div className="pt-2 border-t-2 border-dashed border-stone-300 space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-black text-stone-800 text-sm">TOTAL A PAGAR:</span>
                <span className="font-black text-stone-950 text-xl tracking-tight">
                  ${order.total.toFixed(2)} MXN
                </span>
              </div>
              <p className="text-[10px] text-stone-500 text-center pt-1">
                Pagar en caja al recibir tu comida o al repartidor
              </p>
            </div>

            {/* Visual Barcode */}
            <div className="text-center pt-2 space-y-1">
              <div className="inline-block tracking-[0.3em] font-black text-stone-400 text-xs">
                ||||| | |||| || ||||| |||| | ||
              </div>
              <p className="text-[9px] text-stone-400">
                COCINA-EXP-ORD-{order.orderNumber.replace('#', '')}-{order.id.slice(-4)}
              </p>
            </div>
          </div>

          {/* ── ACTION BUTTONS: ENVIAR AL CLIENTE Y AL DUEÑO ── */}
          <div className="space-y-2.5">
            
            {/* 1. ENVIAR TICKET AL WHATSAPP DEL CLIENTE */}
            <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span>1. Enviar Ticket a MI WhatsApp / Celular:</span>
                </label>
              </div>

              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-stone-400 text-xs">
                    🇲🇽 +52
                  </span>
                  <input
                    type="tel"
                    placeholder="Tu número (10 dígitos)"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full pl-16 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendToMyWhatsApp}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sentToClient ? '¡Enviando!' : 'Enviar a Mi Chat'}</span>
                </button>
              </div>
              <p className="text-[10px] text-stone-500">
                Abre WhatsApp con tu ticket listo para que lo tengas guardado en tu teléfono.
              </p>
            </div>

            {/* 2. ENVIAR COMANDA AL DUEÑO (5584085644) */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>2. Avisar al Dueño por WhatsApp ({ownerPhone}):</span>
                </span>
                <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                  Directo
                </span>
              </div>
              <button
                type="button"
                onClick={handleSendToOwnerWhatsApp}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>
                  {sentToOwner 
                    ? '✓ ¡Comanda Abierta en WhatsApp del Dueño!' 
                    : `📲 Enviar Pedido al Dueño (${ownerPhone})`}
                </span>
              </button>
            </div>

            {/* Auxiliary Actions: Imprimir & Copiar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyTicket}
                className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Ticket'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Printer className="w-4 h-4 text-stone-500" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-2">
          {onNewOrder && (
            <button
              type="button"
              onClick={onNewOrder}
              className="px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition"
            >
              Hacer Otro Pedido
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs text-center transition"
          >
            Cerrar Ticket (Sigue Guardado)
          </button>
        </div>

      </div>
    </div>
  );
};
