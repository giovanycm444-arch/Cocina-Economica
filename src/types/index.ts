export type Category = 'menu_dia' | 'carta' | 'desayuno' | 'sopas' | 'bebida' | 'extra';

export interface MenuItem {
  id: string;
  name: string;
  shortName: string;
  category: Category;
  price: number;
  description: string;
  emoji: string;
  isAvailable: boolean;
  color?: string;
  isDailySpecial?: boolean;
  options?: string[]; // e.g., ['Salsa Verde', 'Salsa Roja', 'Mole']
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
  category: Category;
  selectedOption?: string; // e.g. "Salsa Verde"
  notes?: string;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';
export type DiningType = 'aqui' | 'llevar' | 'domicilio';
export type OrderStatus = 'en_cocina' | 'listo' | 'entregado' | 'cancelado' | 'completado';

export interface Order {
  id: string;
  orderNumber: string; // e.g., '#001'
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  timestamp: string;
  timeString: string;
  type: 'Menú del Día' | 'A la Carta' | 'Mixto';
  diningType: DiningType;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  tableNumber?: string;
  deliveryAddress?: string;
  pickupTime?: string;
  notes?: string;
  source?: 'cajero' | 'cliente_qr';
}

export type TableStatus = 'disponible' | 'ocupada' | 'cuenta';

export interface RestaurantTable {
  id: string;
  number: number;
  name: string; // e.g. 'Mesa 1', 'Mesa 2', 'Barra Mostrador'
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  currentOrderNumber?: string;
  customerName?: string;
  totalAmount?: number;
  occupiedSince?: string;
  notes?: string;
}

export type ExpenseCategory = 'insumos' | 'gas' | 'verdura' | 'tortillas' | 'otro';

export interface Expense {
  id: string;
  concept: string;
  amount: number;
  category: ExpenseCategory;
  timestamp: string;
  timeString: string;
  registeredBy: string;
}

export interface DailySummary {
  totalSales: number;
  orderCount: number;
  averageTicket: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  totalExpenses: number;
  netCash: number;
  topDishes: { name: string; count: number; revenue: number; emoji: string }[];
}
