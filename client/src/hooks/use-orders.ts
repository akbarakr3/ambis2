import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Local type definitions
export interface Order {
  id: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  studentName?: string;
  items?: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  // match server response
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  orderType?: string;
}

export type CreateOrderRequest = Omit<Order, "id" | "status">;

const jsonHeaders = { "Content-Type": "application/json" };

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = (await res.json()) as Order[];
      return (data || []).filter((o) => o.orderType !== "manual");
    },
  });
}

export function useOrder(id: number | null) {
  return useQuery({
    queryKey: ["order", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/orders/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch order");
      return (await res.json()) as Order;
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: jsonHeaders,
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.status === 201) return (await res.json()) as Order;
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || "Failed to create order");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, paymentStatus }: { id: number; status: string; paymentStatus?: string }) => {
      const updates: any = { status };
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: jsonHeaders,
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to update order");
      }
      const data = (await res.json()) as Order;
      return data as Order;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
    },
  });
}
