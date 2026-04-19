import { create } from 'zustand';

const SEED = [
  { id:'1', name:'Nike Air Max 270', sku:'SKU-001', ean:'3614524061049', price:12500, stock:0, minStock:5, category:'Chaussures', supplier:'Sport Pro', emoji:'👟' },
  { id:'2', name:'Robe Été Fleurie', sku:'SKU-002', ean:'6111111011011', price:4800, stock:0, minStock:5, category:'Vêtements', supplier:'Mode Alger', emoji:'👗' },
  { id:'3', name:'Sac Cuir Marron', sku:'SKU-003', ean:'7612345678900', price:8200, stock:3, minStock:5, category:'Accessoires', supplier:'Atlas Maroc', emoji:'👜' },
  { id:'4', name:'T-shirt Oversize', sku:'SKU-004', ean:'3560070014309', price:1900, stock:42, minStock:10, category:'Vêtements', supplier:'Cotton Co', emoji:'👕' },
  { id:'5', name:'Lunettes UV400', sku:'SKU-005', ean:'8001234567890', price:3500, stock:18, minStock:5, category:'Accessoires', supplier:'Med Style', emoji:'🕶' },
  { id:'6', name:'Crème SPF50', sku:'SKU-006', ean:'3337875539119', price:2300, stock:5, minStock:8, category:'Beauté', supplier:'Pharma DZ', emoji:'🧴' },
];

const SEED_ORDERS = [
  { id:'CMD-001', customer:'Amine B.', items:'2x T-shirt · 1x Lunettes', total:7300, status:'pending', date:'Il y a 23 min' },
  { id:'CMD-002', customer:'Sara M.', items:'1x Sac Cuir', total:8200, status:'shipped', date:'Il y a 1h' },
  { id:'CMD-003', customer:'Karim L.', items:'3x Crème SPF · 2x Robe', total:16500, status:'delivered', date:'Il y a 3h' },
];

export const useStore = create((set, get) => ({
  products: SEED,
  orders: SEED_ORDERS,
  movements: [],
  returns: [],

  adjustStock: (id, qty, type, method='manual') => {
    const p = get().products.find(p => p.id === id);
    if (!p) return;
    const delta = (type==='in'||type==='return') ? qty : -qty;
    set(s => ({
      products: s.products.map(p => p.id===id ? {...p, stock:Math.max(0,p.stock+delta)} : p),
      movements: [{ id:`m${Date.now()}`, productId:id, productName:p.name, type, qty, method, date:new Date().toLocaleTimeString() }, ...s.movements],
    }));
  },

  addReturn: (productId, productName, qty, reason, action) => {
    if (action==='restock') get().adjustStock(productId, qty, 'return');
    set(s => ({ returns: [{ id:`r${Date.now()}`, productId, productName, qty, reason, action, date:new Date().toLocaleTimeString() }, ...s.returns] }));
  },

  addProduct: (p) => set(s => ({ products: [...s.products, {...p, id:`p${Date.now()}`}] })),
  updateProduct: (id, data) => set(s => ({ products: s.products.map(p => p.id===id ? {...p,...data} : p) })),
  deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id!==id) })),
  updateOrderStatus: (id, status) => set(s => ({ orders: s.orders.map(o => o.id===id ? {...o,status} : o) })),

  getByEAN: (ean) => get().products.find(p => p.ean===ean),
  getBySKU: (sku) => get().products.find(p => p.sku===sku),
  getLow: () => get().products.filter(p => p.stock>0 && p.stock<=p.minStock),
  getOut: () => get().products.filter(p => p.stock===0),
}));
