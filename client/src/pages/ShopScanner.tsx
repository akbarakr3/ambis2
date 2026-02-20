import { useState } from "react";
import { useOrder, useUpdateOrderStatus } from "../hooks/use-orders";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Search, Printer, CheckCircle } from "lucide-react";

export default function ShopScanner() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [scannedId, setScannedId] = useState<number | null>(null);
  const { data: order, isLoading, error } = useOrder(scannedId);
  const updateStatus = useUpdateOrderStatus();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput) return;
    setScannedId(Number(orderIdInput));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleComplete = () => {
    if (order) {
      updateStatus.mutate({ 
        id: order.id, 
        status: 'completed', 
        paymentStatus: 'paid' 
      });
    }
  };

  return (
    <div className="container px-4 py-8 max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-3xl mb-8 text-center">Order Scanner</h1>

      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleScan} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Enter Order ID / Scan QR..." 
                className="pl-10 text-lg h-12"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" size="lg" className="h-12">Search</Button>
          </form>
        </CardContent>
      </Card>

      {scannedId && isLoading && <div className="text-center">Loading order details...</div>}
      
      {scannedId && error && (
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
          Order not found or error fetching details.
        </div>
      )}

      {order && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6 border-b pb-6">
                <div>
                  <h2 className="font-bold text-2xl mb-1">Order #{order.id}</h2>
                  <p className="text-muted-foreground">User ID: {order.userId}</p>
                </div>
                <div className="text-right">
                  <Badge className="mb-2 text-lg px-3 py-1" variant={order.status === 'completed' ? 'secondary' : 'default'}>
                    {order.status.toUpperCase()}
                  </Badge>
                  <p className="font-bold text-xl">${Number(order.totalAmount).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-muted-foreground uppercase text-sm tracking-wider">Order Items</h3>
                <div className="space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="bg-secondary text-secondary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-lg">{item.product.name}</span>
                      </div>
                      <span className="font-mono">${Number(item.priceAtTime).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total Due</span>
                  <span>${Number(order.totalAmount).toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Payment Method</span>
                  <span className="uppercase">{order.paymentMethod}</span>
                </div>
              </div>

              <div className="flex gap-4 print:hidden">
                <Button variant="outline" className="flex-1" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" /> Print Bill
                </Button>
                {order.status !== 'completed' && (
                  <Button className="flex-1" onClick={handleComplete}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
