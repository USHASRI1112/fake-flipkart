import { create } from 'zustand';

import { fetchCatalogProducts, getProductById, type CatalogProduct } from '../services/catalog';
import { formatOrderDate } from '../services/format';
import type { CartItem, Order } from '../types/shop';

const WALLET_START = 100000000;
const ORDER_STATUS_LIMIT = 5;

type ShopState = {
  catalog: CatalogProduct[];
  catalogStatus: 'idle' | 'loading' | 'ready' | 'error';
  catalogError: string | null;
  walletBalance: number;
  cart: CartItem[];
  orders: Order[];
  cartCount: number;
  cartTotal: number;
  totalSpent: number;
  loadCatalog: () => Promise<void>;
  addToCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: () => void;
  advanceOrderStatuses: () => void;
};

function calculateCartTotal(cart: CartItem[], catalog: CatalogProduct[]) {
  return cart.reduce((sum, item) => {
    const product = getProductById(catalog, item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function calculateOrderTotal(orders: Order[]) {
  return orders.reduce((sum, order) => sum + order.total, 0);
}

export const useShopStore = create<ShopState>((set, get) => ({
  catalog: [],
  catalogStatus: 'idle',
  catalogError: null,
  walletBalance: WALLET_START,
  cart: [],
  orders: [],
  cartCount: 0,
  cartTotal: 0,
  totalSpent: 0,
  loadCatalog: async () => {
    const { catalogStatus } = get();
    if (catalogStatus === 'loading' || catalogStatus === 'ready') {
      return;
    }

    set({ catalogStatus: 'loading', catalogError: null });

    try {
      const catalog = await fetchCatalogProducts();
      set((state) => ({
        catalog,
        catalogStatus: 'ready',
        cartTotal: calculateCartTotal(state.cart, catalog),
      }));
    } catch (error) {
      set({
        catalogStatus: 'error',
        catalogError: error instanceof Error ? error.message : 'Failed to load catalog',
      });
    }
  },
  addToCart: (productId) =>
    set((state) => {
      const existing = state.cart.find((item) => item.productId === productId);
      const nextCart = existing
        ? state.cart.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...state.cart, { productId, quantity: 1 }];

      return {
        cart: nextCart,
        cartCount: nextCart.reduce((sum, item) => sum + item.quantity, 0),
        cartTotal: calculateCartTotal(nextCart, state.catalog),
      };
    }),
  updateQuantity: (productId, delta) =>
    set((state) => {
      const nextCart = state.cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0);

      return {
        cart: nextCart,
        cartCount: nextCart.reduce((sum, item) => sum + item.quantity, 0),
        cartTotal: calculateCartTotal(nextCart, state.catalog),
      };
    }),
  removeFromCart: (productId) =>
    set((state) => {
      const nextCart = state.cart.filter((item) => item.productId !== productId);

      return {
        cart: nextCart,
        cartCount: nextCart.reduce((sum, item) => sum + item.quantity, 0),
        cartTotal: calculateCartTotal(nextCart, state.catalog),
      };
    }),
  clearCart: () =>
    set({
      cart: [],
      cartCount: 0,
      cartTotal: 0,
    }),
  placeOrder: () => {
    const { cart, cartTotal, walletBalance, catalog } = get();

    if (!cart.length) {
      return;
    }

    const nextOrders = [
      ...cart.map((item, index) => {
        const product = getProductById(catalog, item.productId);

        return {
          id: `${Date.now()}-${item.productId}-${index}`,
          productId: item.productId,
          quantity: item.quantity,
          total: product ? product.price * item.quantity : 0,
          placedAt: formatOrderDate(),
          statusIndex: 0,
        };
      }),
      ...get().orders,
    ];

    set({
      orders: nextOrders,
      walletBalance: Math.max(0, walletBalance - cartTotal),
      cart: [],
      cartCount: 0,
      cartTotal: 0,
      totalSpent: calculateOrderTotal(nextOrders),
    });
  },
  advanceOrderStatuses: () =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.statusIndex >= ORDER_STATUS_LIMIT
          ? order
          : { ...order, statusIndex: order.statusIndex + 1 },
      ),
    })),
}));
