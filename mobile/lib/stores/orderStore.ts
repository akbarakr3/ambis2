import { create } from 'zustand';
import { ordersAPI } from '../api';

interface Order {
  id: number;
  studentName: string;
  mobile: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'ready' | 'completed';
  items: any[];
  qrCode: string;
  createdAt: string;
}

interface OrderStore {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: number, status: string) => Promise<void>;
  fetchByQRCode: (qrCode: string) => Promise<Order | null>;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  isLoading: false,
  
  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const { data } = await ordersAPI.getAll();
      set({ orders: data });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateOrderStatus: async (id: number, status: string) => {
    await ordersAPI.updateStatus(id, status);
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, status: status as any } : order
      ),
    }));
  },
  
  fetchByQRCode: async (qrCode: string) => {
    try {
      const { data } = await ordersAPI.getByQRCode(qrCode);
      return data;
    } catch (error) {
      return null;
    }
  },
}));
