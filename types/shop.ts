export type OrderStatus =
  | 'Order Placed'
  | 'Preparing'
  | 'Packed'
  | 'Shipped'
  | 'Out For Delivery'
  | 'Delivered';

export type Product = {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  rawCategory: string;
  price: number;
  rating: number;
  image: string;
  tagline: string;
  description: string;
  badge?: string;
  brand?: string;
  discountLabel?: string;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  tint: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type Order = {
  id: string;
  productId: string;
  quantity: number;
  total: number;
  placedAt: string;
  statusIndex: number;
  outForDeliveryAt: number | null;
  nextStatusAt: number | null;
};
