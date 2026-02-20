import { create } from 'zustand';
import { productsAPI } from '../api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  isLoading: false,
  
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const { data } = await productsAPI.getAll();
      set({ products: data });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addProduct: async (product) => {
    const { data } = await productsAPI.create(product);
    set((state) => ({ products: [...state.products, data] }));
  },
  
  updateProduct: async (id, product) => {
    await productsAPI.update(id, product);
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...product } : p
      ),
    }));
  },
  
  deleteProduct: async (id) => {
    await productsAPI.delete(id);
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },
}));
