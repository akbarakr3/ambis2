import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Local type definitions
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  quantity?: number;
  category?: string;
  imageUrl?: string;
  inStock?: boolean;
}

export type InsertProduct = Omit<Product, "id">;

const jsonHeaders = { "Content-Type": "application/json" };

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return (await res.json()) as Product[];
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: jsonHeaders,
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.status === 201) return (await res.json()) as Product;
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || "Failed to create product");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertProduct>) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: jsonHeaders,
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to update product");
      }
      return (await res.json()) as Product;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 204) return { success: true };
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || "Failed to delete product");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}
