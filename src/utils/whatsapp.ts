import { Order, DailySummary } from '../types';

const STORAGE_KEY_WHATSAPP = 'cocina_express_whatsapp_phone_v1';
export const DEFAULT_WHATSAPP_PHONE = '5584085644';

/**
 * Clean phone number to international WhatsApp format.
 * Default is Mexico (+52). If 10 digits are provided (e.g. 5584085644), prepends 52.
 */
export function formatPhoneForWhatsApp(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `52${digits}`;
  }
  if (digits.startsWith('52') && digits.length === 12) {
    return digits;
  }
  return digits || `52${DEFAULT_WHATSAPP_PHONE}`;
}

export function getSavedWhatsAppPhone(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_WHATSAPP) || DEFAULT_WHATSAPP_PHONE;
  } catch {
    return DEFAULT_WHATSAPP_PHONE;
  }
}

export function saveWhatsAppPhone(phone: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_WHATSAPP, phone.replace(/\D/g, ''));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Builds a formatted WhatsApp text message for an order ticket
 */
export function buildOrderWhatsAppMessage(order: Order, storeName = 'Cocina Express'): string {
  let diningLabel = '🍽️ Comer aquí en el negocio';
  if (order.diningType === 'llevar') {
    diningLabel = '🛍️ Para Llevar (Pickup en mostrador)';
  } else if (order.diningType === 'domicilio') {
    diningLabel = '🛵 Entrega a Domicilio';
  }

  const isClientSource = order.source === 'cliente_qr';
  const customerInfo = order.customerName ? `\n👤 *Cliente:* ${order.customerName}` : '';
  const phoneInfo = order.customerPhone ? `\n📞 *Teléfono:* ${order.customerPhone}` : '';
  const tableInfo = order.diningType === 'aqui' && order.tableNumber ? `\n🪑 *Mesa Asignada:* ${order.tableNumber}` : '';
  const pickupInfo = order.pickupTime ? `\n⏰ *Hora de recogida:* ${order.pickupTime}` : '';
  const addressInfo = order.deliveryAddress ? `\n📍 *Dirección de Entrega:* ${order.deliveryAddress}` : '';

  const itemsText = order.items
    .map((item) => {
      const optionDetail = item.selectedOption ? ` _(${item.selectedOption})_` : '';
      const notesDetail = item.notes ? ` [${item.notes}]` : '';
      return `• *${item.quantity}x* ${item.emoji ? item.emoji + ' ' : ''}${item.name}${optionDetail}${notesDetail} - $${(item.price * item.quantity).toFixed(2)}`;
    })
    .join('\n');

  let paymentText = `*Pago:* ${order.paymentMethod.toUpperCase()}`;
  if (order.paymentMethod === 'efectivo' && order.amountPaid) {
    paymentText += ` (Paga con: $${order.amountPaid} | Cambio: $${order.change.toFixed(2)})`;
  }

  const notesText = order.notes ? `\n📝 *Instrucciones especiales:* ${order.notes}` : '';

  const header = isClientSource
    ? `🌮 *NUEVO PEDIDO RECIBIDO - ${storeName.toUpperCase()}*`
    : `⚡ *${storeName.toUpperCase()} - TICKET DE PEDIDO*`;

  return `${header}
━━━━━━━━━━━━━━━━━━
📋 *Orden:* ${order.orderNumber}
⏰ *Hora:* ${order.timeString}${customerInfo}${phoneInfo}${tableInfo}${pickupInfo}${addressInfo}
📍 *Modalidad:* ${diningLabel}
🏷️ *Tipo:* ${order.type}

*PLATILLOS SOLICITADOS:*
${itemsText}
━━━━━━━━━━━━━━━━━━
💰 *TOTAL A PAGAR: $${order.total.toFixed(2)} MXN*
💳 ${paymentText}${notesText}
━━━━━━━━━━━━━━━━━━
${isClientSource ? '🔔 _Pedido realizado por cliente desde el Menú Digital_' : '¡Gracias por su preferencia! Buen provecho. 🌮😋'}`;
}


/**
 * Builds an official digital ticket / receipt for the customer's personal WhatsApp
 */
export function buildCustomerTicketMessage(order: Order, storeName = 'Cocina Express'): string {
  let diningLabel = '🍽️ Comer en el Restaurante';
  if (order.diningType === 'llevar') {
    diningLabel = '🛍️ Para Llevar (Recoger en Mostrador)';
  } else if (order.diningType === 'domicilio') {
    diningLabel = '🛵 Servicio a Domicilio';
  }

  const dateStr = new Date(order.timestamp).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const tableInfo = order.diningType === 'aqui' && order.tableNumber ? `\n🪑 *Mesa:* ${order.tableNumber}` : '';
  const addressInfo = order.deliveryAddress ? `\n📍 *Dirección de Entrega:* ${order.deliveryAddress}` : '';
  const pickupInfo = order.pickupTime ? `\n⏰ *Hora estimada de recogida:* ${order.pickupTime}` : '';
  const clientName = order.customerName ? `\n👤 *Cliente:* ${order.customerName}` : '';
  const clientPhone = order.customerPhone ? `\n📞 *Teléfono:* ${order.customerPhone}` : '';

  const itemsList = order.items
    .map((item) => {
      const option = item.selectedOption ? ` (${item.selectedOption})` : '';
      return `• ${item.quantity}x ${item.name}${option} - $${(item.price * item.quantity).toFixed(2)}`;
    })
    .join('\n');

  const notes = order.notes ? `\n📝 *Notas:* ${order.notes}` : '';

  return `🧾 *COMPROBANTE / TICKET DE PEDIDO*
🏪 *${storeName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━
🔖 *Folio:* ${order.orderNumber}
📅 *Fecha:* ${dateStr} | ⏰ ${order.timeString}${clientName}${clientPhone}
🛵 *Modalidad:* ${diningLabel}${tableInfo}${pickupInfo}${addressInfo}

📋 *DETALLE DE TU CONSUMO:*
${itemsList}
━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL A PAGAR: $${order.total.toFixed(2)} MXN*
💳 *Forma de Pago:* ${order.paymentMethod.toUpperCase()}${notes}
━━━━━━━━━━━━━━━━━━━━
🟢 *Estado del Pedido:* RECIBIDO EN COCINA
📞 *Atención del Negocio:* 55 8408 5644
¡Gracias por tu compra! Conserva este ticket digital como comprobante de tu pedido. 🌮✨`;
}

/**
 * Sends digital ticket to the customer's own WhatsApp or opens share dialog
 */
export function sendCustomerTicketViaWhatsApp(order: Order, clientPhone?: string, storeName?: string): void {
  const message = buildCustomerTicketMessage(order, storeName);
  const encodedText = encodeURIComponent(message);
  
  if (clientPhone && clientPhone.trim()) {
    const cleaned = formatPhoneForWhatsApp(clientPhone);
    const url = `https://wa.me/${cleaned}?text=${encodedText}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } else {
    // If no client phone specified, open WhatsApp universal send to let client pick their own chat / keep in notes
    const url = `https://api.whatsapp.com/send?text=${encodedText}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}

/**
 * Opens WhatsApp with prefilled message to the Owner
 */
export function sendOrderViaWhatsApp(order: Order, customPhone?: string, storeName?: string): void {
  const targetPhone = customPhone || getSavedWhatsAppPhone();
  const cleanedPhone = formatPhoneForWhatsApp(targetPhone);
  const message = buildOrderWhatsAppMessage(order, storeName);
  const encodedText = encodeURIComponent(message);
  const url = `https://wa.me/${cleanedPhone}?text=${encodedText}`;

  // Open WhatsApp in new tab / mobile app
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Sends general daily sales report to WhatsApp
 */
export function sendDailyReportViaWhatsApp(summary: DailySummary, customPhone?: string): void {
  const targetPhone = customPhone || getSavedWhatsAppPhone();
  const cleanedPhone = formatPhoneForWhatsApp(targetPhone);
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const formatMoney = (val: number) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const text = `📊 *REPORTE DE VENTAS - COCINA EXPRESS*
📅 ${today}
⏱️ *Hora:* ${time}

━━━━━━━━━━━━━━━━━━
💰 *VENTA TOTAL DEL DÍA:* ${formatMoney(summary.totalSales)} MXN
🧾 *Total de Pedidos:* ${summary.orderCount}
🎯 *Ticket Promedio:* ${formatMoney(summary.averageTicket)} MXN

*DESGLOSE DE PAGOS:*
💵 Efectivo: ${formatMoney(summary.cashSales)}
💳 Tarjeta: ${formatMoney(summary.cardSales)}
📱 Transferencia: ${formatMoney(summary.transferSales)}

*CONTROL DE CAJA CHICA:*
🔻 Total Gastos del Día: ${formatMoney(summary.totalExpenses)}
✅ *EFECTIVO NETO EN CAJA:* ${formatMoney(summary.netCash)}

*TOP PLATILLOS:*
${summary.topDishes.slice(0, 4).map((d, i) => `${i + 1}. ${d.emoji} ${d.name}: ${d.count} órdenes (${formatMoney(d.revenue)})`).join('\n')}
━━━━━━━━━━━━━━━━━━
_Generado automáticamente desde Cocina Express PWA_`;

  const url = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(text)}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
