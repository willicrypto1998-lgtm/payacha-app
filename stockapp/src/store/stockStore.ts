import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku: string;
  ean: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  supplierId: string;
  supplierName: string;
  emoji: string;
  variants?: { size?: string; color?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'return' | 'adjustment';
  quantity: number;
  reason?: string;
  scanMethod: 'barcode' | 'qr' | 'manual';
  userId: string;
  createdAt: string;
}

export interface Return {
  id: string;
  productId: string;
  productName: string;
  orderId?: string;
  quantity: number;
  reason: 'wrong_size' | 'defect' | 'changed_mind' | 'damaged' | 'other';
  action: 'restock' | 'discard';
  scanMethod: 'barcode' | 'qr' | 'manual';
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  deliveryDays: number;
  reliability: number;
  productCount: number;
}

interface StockState {
  products: Product[];
  movements: Movement[];
  returns: Return[];
  orders: Order[];
  suppliers: Supplier[];
  isLoading: boolean;
  lastSyncAt: string | null;

  // Actions
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, qty: number, type: Movement['type'], reason?: string, method?: Movement['scanMethod']) => void;
  addReturn: (r: Omit<Return, 'id' | 'createdAt'>) => void;
  addOrder: (o: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  addSupplier: (s: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  setLoading: (v: boolean) => void;
  getProductByEAN: (ean: string) => Product | undefined;
  getProductBySKU: (sku: string) => Product | undefined;
  getLowStockProducts: () => Product[];
  getOutOfStockProducts: () => Product[];
  getMonthlyStats: () => { totalSales: number; revenue: number; avgBasket: number; returnRate: number };
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const seedProducts: Product[] = [
  { id: 'p1', name: 'Nike Air Max 270', sku: 'SKU-00142', ean: '3614524061049', price: 12500, stock: 0, minStock: 5, category: 'Chaussures', supplierId: 's1', supplierName: 'Sport Pro Distribution', emoji: '👟', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p2', name: 'Robe Été Fleurie', sku: 'SKU-00089', ean: '6111111011011', price: 4800, stock: 0, minStock: 5, category: 'Vêtements', supplierId: 's2', supplierName: 'Mode & Tissus Alger', emoji: '👗', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p3', name: 'Sac Cuir Marron', sku: 'SKU-00234', ean: '7612345678900', price: 8200, stock: 3, minStock: 5, category: 'Accessoires', supplierId: 's3', supplierName: 'Maroquinerie Atlas', emoji: '👜', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p4', name: 'T-shirt Oversize Blanc', sku: 'SKU-00012', ean: '3560070014309', price: 1900, stock: 42, minStock: 10, category: 'Vêtements', supplierId: 's4', supplierName: 'Cotton & Co Import', emoji: '👕', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p5', name: 'Lunettes Soleil UV400', sku: 'SKU-00178', ean: '8001234567890', price: 3500, stock: 18, minStock: 5, category: 'Accessoires', supplierId: 's5', supplierName: 'Accessoires Méditerranée', emoji: '🕶', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'p6', name: 'Crème Hydratante SPF50', sku: 'SKU-00301', ean: '3337875539119', price: 2300, stock: 5, minStock: 8, category: 'Beauté', supplierId: 's2', supplierName: 'Mode & Tissus Alger', emoji: '🧴', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const seedSuppliers: Supplier[] = [
  { id: 's1', name: 'Sport Pro Distribution', phone: '0550123456', city: 'Tizi Ouzou', deliveryDays: 3, reliability: 98, productCount: 12 },
  { id: 's2', name: 'Mode & Tissus Alger', phone: '0560987654', city: 'Alger', deliveryDays: 5, reliability: 91, productCount: 34 },
  { id: 's3', name: 'Maroquinerie Atlas', phone: '0540554433', city: 'Béjaïa', deliveryDays: 7, reliability: 95, productCount: 8 },
  { id: 's4', name: 'Cotton & Co Import', phone: '0550778899', city: 'Oran', deliveryDays: 4, reliability: 97, productCount: 28 },
  { id: 's5', name: 'Accessoires Méditerranée', phone: '0561234567', city: 'Annaba', deliveryDays: 5, reliability: 93, productCount: 15 },
];

const seedOrders: Order[] = [
  { id: 'o1', customerId: 'c1', customerName: 'Amine B.', items: [{ productId: 'p4', productName: 'T-shirt Oversize Blanc', quantity: 2, price: 1900 }, { productId: 'p5', productName: 'Lunettes Soleil UV400', quantity: 1, price: 3500 }], total: 7300, status: 'pending', createdAt: new Date(Date.now() - 23 * 60 * 1000).toISOString() },
  { id: 'o2', customerId: 'c2', customerName: 'Sara M.', items: [{ productId: 'p3', productName: 'Sac Cuir Marron', quantity: 1, price: 8200 }], total: 8200, status: 'shipped', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: 'o3', customerId: 'c3', customerName: 'Karim L.', items: [{ productId: 'p6', productName: 'Crème SPF50', quantity: 3, price: 2300 }, { productId: 'p2', productName: 'Robe Été Fleurie', quantity: 2, price: 4800 }], total: 16500, status: 'delivered', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
];

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStockStore = create<StockState>((set, get) => ({
  products: seedProducts,
  movements: [],
  returns: [],
  orders: seedOrders,
  suppliers: seedSuppliers,
  isLoading: false,
  lastSyncAt: null,

  addProduct: (p) => set((s) => ({
    products: [...s.products, {
      ...p,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]
  })),

  updateProduct: (id, updates) => set((s) => ({
    products: s.products.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
  })),

  deleteProduct: (id) => set((s) => ({ products: s.products.filter(p => p.id !== id) })),

  adjustStock: (productId, qty, type, reason, method = 'manual') => {
    const product = get().products.find(p => p.id === productId);
    if (!product) return;
    const delta = (type === 'in' || type === 'return') ? qty : -qty;
    set((s) => ({
      products: s.products.map(p => p.id === productId
        ? { ...p, stock: Math.max(0, p.stock + delta), updatedAt: new Date().toISOString() }
        : p),
      movements: [{
        id: `m${Date.now()}`,
        productId,
        productName: product.name,
        type,
        quantity: qty,
        reason,
        scanMethod: method,
        userId: 'admin',
        createdAt: new Date().toISOString(),
      }, ...s.movements],
    }));
  },

  addReturn: (r) => {
    const ret: Return = { ...r, id: `r${Date.now()}`, createdAt: new Date().toISOString() };
    if (r.action === 'restock') {
      get().adjustStock(r.productId, r.quantity, 'return', r.reason, r.scanMethod);
    }
    set((s) => ({ returns: [ret, ...s.returns] }));
  },

  addOrder: (o) => set((s) => ({
    orders: [{ ...o, id: `ord${Date.now()}`, createdAt: new Date().toISOString() }, ...s.orders]
  })),

  updateOrderStatus: (id, status) => set((s) => ({
    orders: s.orders.map(o => o.id === id ? { ...o, status } : o)
  })),

  addSupplier: (s) => set((state) => ({
    suppliers: [...state.suppliers, { ...s, id: `sup${Date.now()}` }]
  })),

  updateSupplier: (id, updates) => set((s) => ({
    suppliers: s.suppliers.map(sup => sup.id === id ? { ...sup, ...updates } : sup)
  })),

  setLoading: (v) => set({ isLoading: v }),

  getProductByEAN: (ean) => get().products.find(p => p.ean === ean),
  getProductBySKU: (sku) => get().products.find(p => p.sku === sku),
  getLowStockProducts: () => get().products.filter(p => p.stock > 0 && p.stock <= p.minStock),
  getOutOfStockProducts: () => get().products.filter(p => p.stock === 0),

  getMonthlyStats: () => {
    const orders = get().orders.filter(o => o.status !== 'cancelled');
    const revenue = orders.reduce((acc, o) => acc + o.total, 0);
    const totalSales = orders.length;
    const avgBasket = totalSales > 0 ? Math.round(revenue / totalSales) : 0;
    const returnRate = get().returns.length > 0
      ? Math.round((get().returns.length / totalSales) * 100) : 0;
    return { totalSales, revenue, avgBasket, returnRate };
  },
}));
