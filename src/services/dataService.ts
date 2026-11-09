import { MenuItem, Order, Expense, DailySummary, OrderStatus, RestaurantTable, TableStatus, DiningType } from '../types';

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  // ── 🍱 PAQUETES Y MENÚS COMPLETOS ──
  {
    id: 'menu_dia',
    name: 'Menú del Día Completo',
    shortName: 'Menú del Día',
    category: 'menu_dia',
    price: 90,
    description: 'Sopa casera caliente + Arroz y frijoles + Guisado del día a elegir + Agua fresca 1L',
    emoji: '🍱',
    isAvailable: true,
    isDailySpecial: true,
    color: 'from-emerald-600 to-teal-700',
    options: ['Guisado 1: Bistec a la mexicana', 'Guisado 2: Cerdo en salsa verde', 'Guisado 3: Tinga de pollo'],
  },
  {
    id: 'menu_ejecutivo',
    name: 'Menú Ejecutivo / Especial',
    shortName: 'Menú Ejecutivo',
    category: 'menu_dia',
    price: 115,
    description: 'Sopa + Milanesa o Pechuga con papas + Arroz + Ensalada + Refresco + Postre',
    emoji: '⭐',
    isAvailable: true,
    isDailySpecial: true,
    color: 'from-amber-600 to-orange-700',
    options: ['Con Milanesa de Res', 'Con Pechuga Empanizada'],
  },
  {
    id: 'paquete_desayuno',
    name: 'Desayuno Completo de la Casa',
    shortName: 'Desayuno Casa',
    category: 'desayuno',
    price: 75,
    description: 'Chilaquiles con huevo o pollo + Frijoles refritos + Café de olla caliente',
    emoji: '🍳',
    isAvailable: true,
    color: 'from-yellow-500 to-amber-600',
    options: ['Con 2 Huevos estrellados', 'Con Pollo deshebrado'],
  },

  // ── 🧀 ESPECIALIDADES A LA CARTA ──
  {
    id: 'enchiladas',
    name: 'Orden de Enchiladas (3 pzas)',
    shortName: 'Enchiladas',
    category: 'carta',
    price: 85,
    description: '3 piezas rellenas de pollo con crema de rancho, queso fresco, cebolla y frijoles',
    emoji: '🧀',
    isAvailable: true,
    color: 'from-emerald-500 to-green-600',
    options: ['Salsa Verde', 'Salsa Roja', 'Suizas Gratinadas (+$15)'],
  },
  {
    id: 'flautas',
    name: 'Orden de Flautas Doradas (3 pzas)',
    shortName: 'Flautas',
    category: 'carta',
    price: 85,
    description: 'Crujientes flautas doradas al momento con lechuga fresca, crema, queso y salsa',
    emoji: '🌮',
    isAvailable: true,
    color: 'from-orange-500 to-amber-600',
    options: ['De Pollo', 'De Carne de Res', 'De Papa con queso'],
  },
  {
    id: 'enmoladas',
    name: 'Orden de Enmoladas con Ajonjolí',
    shortName: 'Enmoladas',
    category: 'carta',
    price: 90,
    description: '3 piezas de pollo bañadas en auténtico mole poblano artesanal, crema y ajonjolí',
    emoji: '🫔',
    isAvailable: true,
    color: 'from-amber-800 to-yellow-900',
  },
  {
    id: 'chilaquiles',
    name: 'Chilaquiles con Pollo / Huevo',
    shortName: 'Chilaquiles',
    category: 'desayuno',
    price: 80,
    description: 'Totopos fritos en salsa casera verde o roja, crema, queso fresco, cebolla y frijoles',
    emoji: '🍲',
    isAvailable: true,
    color: 'from-red-600 to-rose-700',
    options: ['Verdes con Pollo', 'Rojos con Pollo', 'Verdes con Huevo', 'Rojos con Huevo'],
  },
  {
    id: 'pechuga',
    name: 'Pechuga Empanizada o a la Plancha',
    shortName: 'Pechuga',
    category: 'carta',
    price: 95,
    description: 'Acompañada de papas a la francesa, arroz rojo casero y ensalada verde fresca',
    emoji: '🍗',
    isAvailable: true,
    color: 'from-amber-500 to-orange-600',
    options: ['Empanizada crujiente', 'A la plancha jugosa'],
  },
  {
    id: 'milanesa',
    name: 'Milanesa de Res con Papas',
    shortName: 'Milanesa Res',
    category: 'carta',
    price: 105,
    description: 'Filete de res empanizado, papas fritas, arroz, frijoles y ensalada',
    emoji: '🥩',
    isAvailable: true,
    color: 'from-stone-700 to-stone-900',
  },
  {
    id: 'quesadillas',
    name: 'Quesadillas de Comal (Orden de 2)',
    shortName: 'Quesadillas',
    category: 'carta',
    price: 65,
    description: 'Masa de maíz hecha a mano en comal, rellenas de guisado con queso oaxaca',
    emoji: '🥟',
    isAvailable: true,
    color: 'from-yellow-600 to-amber-700',
    options: ['Tinga de Pollo', 'Chicharrón Prensado', 'Champiñones con queso', 'Picadillo'],
  },
  {
    id: 'tacos_dorados',
    name: 'Tacos Dorados de Papa (4 pzas)',
    shortName: 'Tacos Dorados',
    category: 'carta',
    price: 70,
    description: 'Con col rallada, salsa verde tatemada, crema espesa y queso rallado',
    emoji: '🌮',
    isAvailable: true,
    color: 'from-orange-600 to-red-600',
  },
  {
    id: 'guisado_suelto',
    name: 'Guisado del Día (Plato Individual)',
    shortName: 'Guisado Suelto',
    category: 'carta',
    price: 75,
    description: 'Porción generosa del guisado del día acompañado con arroz, frijoles y tortillas',
    emoji: '🥘',
    isAvailable: true,
    color: 'from-red-600 to-amber-700',
  },

  // ── 🍲 SOPAS Y CALDOS ──
  {
    id: 'sopa_fideo',
    name: 'Sopa Casera de Fideo / Pasta',
    shortName: 'Sopa de Fideo',
    category: 'sopas',
    price: 35,
    description: 'Tazón caliente tradicional de fideo en caldillo de jitomate con verduras',
    emoji: '🍲',
    isAvailable: true,
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'consome_pollo',
    name: 'Consomé de Pollo con Arroz',
    shortName: 'Consomé Pollo',
    category: 'sopas',
    price: 55,
    description: 'Con pechuga deshebrada, garbanzo, arroz, cilantro, cebolla picada y limón',
    emoji: '🥣',
    isAvailable: true,
    color: 'from-amber-600 to-yellow-600',
  },
  {
    id: 'pozole',
    name: 'Pozole Tradicional de la Casa',
    shortName: 'Pozole',
    category: 'sopas',
    price: 95,
    description: 'Maíz pozolero con carne de cerdo o pollo, orégano, rábanos, lechuga y tostadas',
    emoji: '🍲',
    isAvailable: true,
    color: 'from-red-700 to-orange-800',
    options: ['Maciza de Cerdo', 'Pollo deshebrado', 'Mixto'],
  },

  // ── 🥤 BEBIDAS ──
  {
    id: 'agua_fresca_1l',
    name: 'Agua Fresca Natural 1 Litro',
    shortName: 'Agua Fresca 1L',
    category: 'bebida',
    price: 25,
    description: 'Vaso de 1 litro recién preparado: Horchata con canela, Jamaica o Limón con chía',
    emoji: '🍉',
    isAvailable: true,
    color: 'from-lime-500 to-green-600',
    options: ['Horchata', 'Jamaica', 'Limón con Chía'],
  },
  {
    id: 'agua_fresca_2l',
    name: 'Jarra de Agua Fresca 2 Litros',
    shortName: 'Jarra Agua 2L',
    category: 'bebida',
    price: 45,
    description: 'Jarra familiar de 2 litros para mesa o para llevar',
    emoji: '🫗',
    isAvailable: true,
    color: 'from-emerald-500 to-teal-600',
    options: ['Horchata', 'Jamaica', 'Limón con Chía'],
  },
  {
    id: 'refresco',
    name: 'Refresco 600ml / Lata',
    shortName: 'Refresco',
    category: 'bebida',
    price: 25,
    description: 'Coca-Cola, Sin Azúcar, Sidral Mundet, Sprite, Manzana o Joya bien frío',
    emoji: '🥤',
    isAvailable: true,
    color: 'from-blue-500 to-indigo-600',
    options: ['Coca-Cola Original', 'Coca Sin Azúcar', 'Manzanita', 'Sidral Mundet', 'Sprite'],
  },
  {
    id: 'cafe_olla',
    name: 'Café de Olla Tradicional',
    shortName: 'Café de Olla',
    category: 'bebida',
    price: 20,
    description: 'Preparado en jarro con canela en raja, piloncillo y café recién colado',
    emoji: '☕',
    isAvailable: true,
    color: 'from-amber-900 to-stone-900',
  },
  {
    id: 'agua_embotellada',
    name: 'Agua Natural Ciel 600ml',
    shortName: 'Agua Ciel 600ml',
    category: 'bebida',
    price: 15,
    description: 'Botella de agua purificada sellada',
    emoji: '💧',
    isAvailable: true,
    color: 'from-cyan-500 to-blue-600',
  },

  // ── 🍮 POSTRES Y COMPLEMENTOS EXTRAS ──
  {
    id: 'postre_flan',
    name: 'Flan Casero Napolitano',
    shortName: 'Flan Casero',
    category: 'extra',
    price: 30,
    description: 'Rebanada generosa de flan cremoso con caramelo líquido dorado',
    emoji: '🍮',
    isAvailable: true,
    color: 'from-amber-400 to-yellow-600',
  },
  {
    id: 'arroz_leche',
    name: 'Arroz con Leche de la Casa',
    shortName: 'Arroz con Leche',
    category: 'extra',
    price: 25,
    description: 'Postre frío casero con canela en polvo y pasitas',
    emoji: '🍚',
    isAvailable: true,
    color: 'from-stone-200 to-stone-400',
  },
  {
    id: 'extra_guacamole',
    name: 'Orden Extra de Guacamole y Totopos',
    shortName: 'Guacamole Extra',
    category: 'extra',
    price: 25,
    description: 'Aguacate hass fresco machacado con jitomate, cebolla, cilantro y totopos',
    emoji: '🥑',
    isAvailable: true,
    color: 'from-green-600 to-emerald-700',
  },
  {
    id: 'extra_arroz_frijol',
    name: 'Porción Extra de Arroz o Frijoles',
    shortName: 'Arroz / Frijol Extra',
    category: 'extra',
    price: 20,
    description: 'Tazón individual de arroz rojo o frijoles refritos con queso',
    emoji: '🍛',
    isAvailable: true,
    color: 'from-orange-500 to-amber-700',
  },
  {
    id: 'tortillas_docena',
    name: 'Docena de Tortillas de Maíz',
    shortName: 'Tortillas Docena',
    category: 'extra',
    price: 15,
    description: 'Tortillas calientitas de tortillería envueltas en papel',
    emoji: '🌽',
    isAvailable: true,
    color: 'from-yellow-400 to-amber-500',
  },
];

const STORAGE_KEYS = {
  MENU: 'cocina_express_menu_v2',
  ORDERS: 'cocina_express_orders_v2',
  EXPENSES: 'cocina_express_expenses_v2',
  TABLES: 'cocina_express_tables_v1',
};

export const DEFAULT_TABLES: RestaurantTable[] = [
  { id: 'mesa-1', number: 1, name: 'Mesa 1', capacity: 4, status: 'ocupada', currentOrderId: 'ord-104', currentOrderNumber: '#004', customerName: 'Mtro. Fernando', totalAmount: 130, occupiedSince: '12:45' },
  { id: 'mesa-2', number: 2, name: 'Mesa 2', capacity: 2, status: 'disponible' },
  { id: 'mesa-3', number: 3, name: 'Mesa 3', capacity: 4, status: 'disponible' },
  { id: 'mesa-4', number: 4, name: 'Mesa 4', capacity: 6, status: 'disponible' },
  { id: 'mesa-5', number: 5, name: 'Mesa 5', capacity: 4, status: 'disponible' },
  { id: 'mesa-6', number: 6, name: 'Mesa 6', capacity: 2, status: 'disponible' },
  { id: 'mesa-7', number: 7, name: 'Mesa 7', capacity: 4, status: 'disponible' },
  { id: 'mesa-8', number: 8, name: 'Mesa 8', capacity: 6, status: 'disponible' },
  { id: 'barra', number: 9, name: 'Barra Mostrador', capacity: 4, status: 'disponible' },
];


// Seed initial orders matching realistic lunch rush data
function generateSeedOrders(): Order[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'ord-101',
      orderNumber: '#001',
      customerName: 'Don Carlos',
      tableNumber: 'Mesa 2',
      items: [
        { menuItemId: 'menu_dia', name: 'Menú del Día', price: 90, quantity: 1, emoji: '🍱', category: 'menu_dia', selectedOption: 'Bistec a la mexicana' },
      ],
      total: 90,
      paymentMethod: 'efectivo',
      amountPaid: 100,
      change: 10,
      timestamp: `${today}T12:05:00`,
      timeString: '12:05',
      type: 'Menú del Día',
      diningType: 'aqui',
      status: 'entregado',
    },
    {
      id: 'ord-102',
      orderNumber: '#002',
      customerName: 'Laura Martínez',
      tableNumber: 'Mesa 4',
      items: [
        { menuItemId: 'enchiladas', name: 'Enchiladas Verdes', price: 85, quantity: 2, emoji: '🧀', category: 'carta', selectedOption: 'Salsa Verde' },
        { menuItemId: 'sopa_fideo', name: 'Sopa de Fideo', price: 35, quantity: 1, emoji: '🍲', category: 'sopas' },
      ],
      total: 205,
      paymentMethod: 'tarjeta',
      amountPaid: 205,
      change: 0,
      timestamp: `${today}T12:14:00`,
      timeString: '12:14',
      type: 'A la Carta',
      diningType: 'aqui',
      status: 'entregado',
    },
    {
      id: 'ord-103',
      orderNumber: '#003',
      customerName: 'Oficina Contable',
      items: [
        { menuItemId: 'menu_dia', name: 'Menú del Día', price: 90, quantity: 2, emoji: '🍱', category: 'menu_dia' },
        { menuItemId: 'flautas', name: 'Flautas Doradas', price: 85, quantity: 1, emoji: '🌮', category: 'carta', selectedOption: 'De Pollo' },
        { menuItemId: 'refresco', name: 'Refresco', price: 25, quantity: 2, emoji: '🥤', category: 'bebida', selectedOption: 'Coca-Cola Original' },
      ],
      total: 315,
      paymentMethod: 'efectivo',
      amountPaid: 500,
      change: 185,
      timestamp: `${today}T12:22:00`,
      timeString: '12:22',
      type: 'Mixto',
      diningType: 'llevar',
      status: 'listo',
    },
    {
      id: 'ord-104',
      orderNumber: '#004',
      customerName: 'Mtro. Fernando',
      tableNumber: 'Mesa 1',
      items: [
        { menuItemId: 'milanesa', name: 'Milanesa de Res', price: 105, quantity: 1, emoji: '🥩', category: 'carta' },
        { menuItemId: 'agua_fresca_1l', name: 'Agua Fresca 1L', price: 25, quantity: 1, emoji: '🍉', category: 'bebida', selectedOption: 'Horchata' },
      ],
      total: 130,
      paymentMethod: 'transferencia',
      amountPaid: 130,
      change: 0,
      timestamp: `${today}T12:45:00`,
      timeString: '12:45',
      type: 'A la Carta',
      diningType: 'aqui',
      status: 'en_cocina',
      notes: 'Papas bien doraditas por favor',
    },
    {
      id: 'ord-105',
      orderNumber: '#005',
      customerName: 'Para Llevar',
      items: [
        { menuItemId: 'chilaquiles', name: 'Chilaquiles con Pollo', price: 80, quantity: 1, emoji: '🍲', category: 'desayuno', selectedOption: 'Verdes con Pollo' },
        { menuItemId: 'cafe_olla', name: 'Café de Olla', price: 20, quantity: 1, emoji: '☕', category: 'bebida' },
      ],
      total: 100,
      paymentMethod: 'efectivo',
      amountPaid: 100,
      change: 0,
      timestamp: `${today}T13:10:00`,
      timeString: '13:10',
      type: 'A la Carta',
      diningType: 'llevar',
      status: 'en_cocina',
    },
  ];
}

function generateSeedExpenses(): Expense[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'exp-01',
      concept: 'Compra de verdura y cilantro al proveedor',
      amount: 140,
      category: 'verdura',
      timestamp: `${today}T11:30:00`,
      timeString: '11:30',
      registeredBy: 'Cajero',
    },
    {
      id: 'exp-02',
      concept: 'Tortillas de maíz del día (3 kg)',
      amount: 72,
      category: 'tortillas',
      timestamp: `${today}T12:00:00`,
      timeString: '12:00',
      registeredBy: 'Cajero',
    },
  ];
}

// Broadcaster channel for sub-second synchronization between tabs/devices
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('cocina_express_realtime_v2');
  } catch {
    broadcastChannel = null;
  }
}

export const dataService = {
  getMenu(): MenuItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MENU);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
        return DEFAULT_MENU_ITEMS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_MENU_ITEMS;
    }
  },

  updateMenuItem(item: MenuItem) {
    const menu = this.getMenu();
    const idx = menu.findIndex((m) => m.id === item.id);
    if (idx >= 0) {
      menu[idx] = item;
    } else {
      menu.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    this.notifySync();
  },

  addMenuItem(item: MenuItem) {
    const menu = this.getMenu();
    menu.push(item);
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    this.notifySync();
  },

  deleteMenuItem(id: string) {
    const menu = this.getMenu().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
    this.notifySync();
  },

  restoreDefaultMenu() {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
    this.notifySync();
  },

  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        const seed = generateSeedOrders();
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveOrder(order: Omit<Order, 'id' | 'orderNumber' | 'timestamp' | 'timeString'>): Order {
    const orders = this.getOrders();
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
    const nextNumber = (orders.length + 1).toString().padStart(3, '0');

    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderNumber: `#${nextNumber}`,
      timestamp: now.toISOString(),
      timeString,
      status: order.status || 'en_cocina',
    };

    const updated = [newOrder, ...orders];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));

    // If order is Dine-in with a Table assigned, automatically occupy that table
    if (order.diningType === 'aqui' && order.tableNumber && order.tableNumber !== 'Para Llevar') {
      this.occupyTable(
        order.tableNumber,
        newOrder.id,
        newOrder.orderNumber,
        order.customerName,
        order.total
      );
    }

    // Also write a discrete ping key to trigger instant storage event across browser windows
    try {
      localStorage.setItem('cocina_new_order_ping', JSON.stringify({
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        source: newOrder.source,
        total: newOrder.total,
        diningType: newOrder.diningType,
        customerName: newOrder.customerName,
        timestamp: Date.now(),
      }));
    } catch {
      // Ignore storage errors
    }

    this.notifySync({ type: 'NEW_ORDER', order: newOrder });
    return newOrder;
  },

  getTables(): RestaurantTable[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(DEFAULT_TABLES));
        return DEFAULT_TABLES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_TABLES;
    }
  },

  occupyTable(tableNameOrId: string, orderId: string, orderNumber: string, customerName?: string, totalAmount?: number): void {
    const tables = this.getTables();
    const table = tables.find((t) => t.id === tableNameOrId || t.name.toLowerCase() === tableNameOrId.toLowerCase());
    if (table) {
      table.status = 'ocupada';
      table.currentOrderId = orderId;
      table.currentOrderNumber = orderNumber;
      table.customerName = customerName || table.customerName || 'Comensal';
      table.totalAmount = totalAmount;
      table.occupiedSince = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
      this.notifySync();
    }
  },

  freeTable(tableNameOrId: string): void {
    const tables = this.getTables();
    const table = tables.find((t) => t.id === tableNameOrId || t.name.toLowerCase() === tableNameOrId.toLowerCase());
    if (table) {
      table.status = 'disponible';
      delete table.currentOrderId;
      delete table.currentOrderNumber;
      delete table.customerName;
      delete table.totalAmount;
      delete table.occupiedSince;
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
      this.notifySync();
    }
  },

  setTableStatus(tableNameOrId: string, status: TableStatus): void {
    const tables = this.getTables();
    const table = tables.find((t) => t.id === tableNameOrId || t.name.toLowerCase() === tableNameOrId.toLowerCase());
    if (table) {
      table.status = status;
      if (status === 'disponible') {
        delete table.currentOrderId;
        delete table.currentOrderNumber;
        delete table.customerName;
        delete table.totalAmount;
        delete table.occupiedSince;
      }
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
      this.notifySync();
    }
  },

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      this.notifySync();
    }
  },


  getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) {
        const seed = generateSeedExpenses();
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveExpense(expense: { concept: string; amount: number; category: Expense['category']; registeredBy: string }): Expense {
    const expenses = this.getExpenses();
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      concept: expense.concept,
      amount: expense.amount,
      category: expense.category,
      registeredBy: expense.registeredBy,
      timestamp: now.toISOString(),
      timeString,
    };

    const updated = [newExpense, ...expenses];
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    this.notifySync();
    return newExpense;
  },

  getDailySummary(): DailySummary {
    const orders = this.getOrders().filter((o) => o.status !== 'cancelado');
    const expenses = this.getExpenses();

    let totalSales = 0;
    let cashSales = 0;
    let cardSales = 0;
    let transferSales = 0;

    const dishCounts: Record<string, { count: number; revenue: number; emoji: string }> = {};

    for (const ord of orders) {
      totalSales += ord.total;
      if (ord.paymentMethod === 'efectivo') cashSales += ord.total;
      else if (ord.paymentMethod === 'tarjeta') cardSales += ord.total;
      else if (ord.paymentMethod === 'transferencia') transferSales += ord.total;

      for (const item of ord.items) {
        if (!dishCounts[item.name]) {
          dishCounts[item.name] = { count: 0, revenue: 0, emoji: item.emoji };
        }
        dishCounts[item.name].count += item.quantity;
        dishCounts[item.name].revenue += item.price * item.quantity;
      }
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netCash = cashSales - totalExpenses;
    const orderCount = orders.length;
    const averageTicket = orderCount > 0 ? Math.round((totalSales / orderCount) * 100) / 100 : 0;

    const topDishes = Object.entries(dishCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSales,
      orderCount,
      averageTicket,
      cashSales,
      cardSales,
      transferSales,
      totalExpenses,
      netCash,
      topDishes,
    };
  },

  resetDay(): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(
      STORAGE_KEYS.TABLES,
      JSON.stringify(
        DEFAULT_TABLES.map((t) => ({
          ...t,
          status: 'disponible',
          currentOrderId: undefined,
          currentOrderNumber: undefined,
          customerName: undefined,
          totalAmount: undefined,
          occupiedSince: undefined,
        }))
      )
    );
    this.notifySync();
  },

  loadDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(generateSeedOrders()));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(generateSeedExpenses()));
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(DEFAULT_TABLES));
    this.notifySync();
  },


  notifySync(meta?: { type: string; order?: Order }) {
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: meta?.type || 'SYNC_UPDATE',
        order: meta?.order,
        timestamp: Date.now(),
      });
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cocina_data_updated', {
          detail: meta || { type: 'SYNC_UPDATE', timestamp: Date.now() },
        })
      );
    }
  },

  subscribe(callback: (payload?: { type?: string; order?: Order }) => void) {
    if (typeof window === 'undefined') return () => {};

    const handleMessage = (e: MessageEvent) => {
      callback(e.data);
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cocina_new_order_ping' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback({ type: 'NEW_ORDER', order: parsed });
          return;
        } catch {
          // fallback
        }
      }
      if (Object.values(STORAGE_KEYS).includes(e.key || '')) {
        callback({ type: 'STORAGE_CHANGE' });
      }
    };
    const handleCustom = (e: Event) => {
      const custom = e as CustomEvent;
      callback(custom.detail);
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleMessage);
    }
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cocina_data_updated', handleCustom);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleMessage);
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cocina_data_updated', handleCustom);
    };
  },

  /**
   * Generates a simulated customer QR order to test real-time arrival to Owner and Kitchen
   */
  simulateClientOrder(diningType: DiningType = 'aqui', tableNumber?: string, customerName = 'Comensal Prueba'): Order {
    const freeTable = tableNumber || this.getTables().find((t) => t.status === 'disponible')?.name || 'Mesa 1';
    return this.saveOrder({
      items: [
        {
          id: 'menu-1',
          name: 'Orden de Tacos al Pastor',
          price: 65,
          quantity: 2,
          emoji: '🌮',
          selectedOption: 'Con Queso y Piña',
        },
        {
          id: 'menu-4',
          name: 'Agua Fresca del Día',
          price: 30,
          quantity: 2,
          emoji: '🥤',
          selectedOption: 'Horchata',
        },
      ],
      total: 190,
      paymentMethod: 'efectivo',
      status: 'en_cocina',
      source: 'cliente_qr',
      diningType,
      tableNumber: diningType === 'aqui' ? freeTable : 'Para Llevar',
      customerName,
      customerPhone: '5584085644',
      deliveryAddress: diningType === 'domicilio' ? 'Av. Hidalgo #45, Depto 2B' : undefined,
      pickupTime: diningType === 'llevar' ? '15-20 min' : undefined,
      notes: 'Salsa verde aparte por favor',
      change: 0,
      type: 'comida',
    });
  },
};
