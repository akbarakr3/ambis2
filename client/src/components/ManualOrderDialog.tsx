import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface ManualOrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface ManualOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (
    items: ManualOrderItem[],
    paymentMethod: string
  ) => Promise<void>;
  products?: any[];
  isLoading?: boolean;
}

export function ManualOrderDialog({
  isOpen,
  onClose,
  onCreateOrder,
  products = [],
  isLoading = false,
}: ManualOrderDialogProps) {
  const [items, setItems] = useState<ManualOrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast({ title: "Error", description: "Select or enter a product", variant: "destructive" });
      return;
    }

    // Try find by id first, then by name
    let product = products.find((p) => String(p.id) === selectedProduct.trim());
    if (!product) {
      product = products.find((p) => p.name.toLowerCase().startsWith(selectedProduct.trim().toLowerCase()));
    }

    if (!product) {
      toast({ title: "Error", description: "Product not found", variant: "destructive" });
      return;
    }

    const existingItem = items.find((item) => item.productId === product.id);
    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          name: product.name,
          quantity,
          price: parseFloat(product.price),
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const handleIncrement = (productId: number) => {
    setItems(items.map((it) => (it.productId === productId ? { ...it, quantity: it.quantity + 1 } : it)));
  };

  const handleDecrement = (productId: number) => {
    setItems(items.map((it) => (it.productId === productId ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it)));
  };

  const handleChangeItemQuantity = (productId: number, value: string) => {
    const q = parseInt(value || "0", 10) || 0;
    setItems(items.map((it) => (it.productId === productId ? { ...it, quantity: Math.max(1, q) } : it)));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCreateOrder = async () => {
    if (items.length === 0) {
      toast({ title: "Error", description: "Add at least one item", variant: "destructive" });
      return;
    }

    try {
      await onCreateOrder(items, paymentMethod);
      toast({ title: "Success", description: "Order created successfully" });
      setItems([]);
      setPaymentMethod("cash");
      setSelectedProduct("");
      setQuantity(1);
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create order", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Manual Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Items */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="font-semibold">Add Items</div>
            <div className="space-y-2">
              <Label htmlFor="product-select">Select Product</Label>
              <div className="flex gap-2">
                <input
                  id="product-select"
                  list="products-list"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Type product id or name"
                />
                <datalist id="products-list">
                  {products.map((product) => (
                    <option key={product.id} value={String(product.id)}>
                      {product.name} - ₹{product.price}
                    </option>
                  ))}
                </datalist>
                <Input
                  type="text"
                  value={String(quantity)}
                  onChange={(e) => setQuantity(parseInt(e.target.value || "0") || 1)}
                  disabled={isLoading}
                  className="w-20"
                  placeholder="Qty"
                />
                <Button onClick={handleAddItem} disabled={isLoading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="space-y-2">
            <div className="font-semibold">Order Items</div>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items added</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-center p-2 border rounded-md bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="mr-2">₹{item.price.toFixed(0)}</span>
                        <span className="mr-2">= ₹{(item.quantity * item.price).toFixed(0)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleDecrement(item.productId)} disabled={isLoading}>-</Button>
                      <Input
                        value={String(item.quantity)}
                        onChange={(e) => handleChangeItemQuantity(item.productId, e.target.value)}
                        className="w-16 text-center"
                      />
                      <Button size="sm" onClick={() => handleIncrement(item.productId)} disabled={isLoading}>+</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="cash">Cash</option>
              <option value="gpay">GPay</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Total */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Total Amount</CardTitle>
                <Badge className="text-lg px-3 py-1">
                  ₹{totalAmount.toFixed(0)}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleCreateOrder}
              disabled={isLoading || items.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Creating..." : "Create & Proceed to Billing"}
            </Button>
            <Button onClick={onClose} variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
