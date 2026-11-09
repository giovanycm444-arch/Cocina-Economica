import React, { useState } from 'react';
import { X, MessageSquare, Phone, Check, Send, Sparkles } from 'lucide-react';
import { getSavedWhatsAppPhone, saveWhatsAppPhone, DEFAULT_WHATSAPP_PHONE } from '../utils/whatsapp';
import { soundEffects } from '../utils/audio';

interface WhatsAppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhoneUpdated?: (phone: string) => void;
}

export const WhatsAppConfigModal: React.FC<WhatsAppConfigModalProps> = ({
  isOpen,
  onClose,
  onPhoneUpdated,
}) => {
  const [phone, setPhone] = useState(getSavedWhatsAppPhone());
  const [savedBadge, setSavedBadge] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) return;

    saveWhatsAppPhone(cleanDigits);
    soundEffects.cashRegister();
    setSavedBadge(true);
    if (onPhoneUpdated) {
      onPhoneUpdated(cleanDigits);
    }
    setTimeout(() => {
      setSavedBadge(false);
      onClose();
    }, 800);
  };

  const handleSendTest = () => {
    const cleanDigits = phone.replace(/\D/g, '') || DEFAULT_WHATSAPP_PHONE;
    const international = cleanDigits.length === 10 ? `52${cleanDigits}` : cleanDigits;
    const testMsg = encodeURIComponent(
      '👋 ¡Hola! Este es un mensaje de prueba desde *Cocina Express PWA*. Tu número está listo para recibir pedidos y reportes en tiempo real. 🌮'
    );
    window.open(`https://wa.me/${international}?text=${testMsg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">Enviar Pedidos a WhatsApp</h2>
              <p className="text-xs text-stone-500">Número configurado para recibir comandas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl active:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Número asignado por defecto:</span>
            </p>
            <p className="text-stone-700">
              Cada vez que cobres un pedido o quieras compartir una comanda, podrás enviarla con 1 toque a este número de WhatsApp.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Número de Celular (10 dígitos)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm flex items-center gap-1">
                🇲🇽 +52
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="5584085644"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-20 pr-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-lg font-black text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Ejemplo: <strong className="text-stone-800">5584085644</strong> (Ciudad de México y área metropolitana)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSendTest}
              className="w-1/2 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enviar Prueba</span>
            </button>
            <button
              type="button"
              onClick={() => setPhone(DEFAULT_WHATSAPP_PHONE)}
              className="w-1/2 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition"
            >
              Restablecer a 5584085644
            </button>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-2xl bg-stone-100 font-bold text-stone-700 text-xs"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="w-2/3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              {savedBadge ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <span>Guardar Número</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
