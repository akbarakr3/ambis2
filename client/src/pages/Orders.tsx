import { useOrders, useUpdateOrderStatus, useCreateOrder } from "../hooks/use-orders";
import { useProducts } from "../hooks/use-products";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  CheckCircle2, 
  Clock,
  ShoppingBag,
  Scan,
  BarChart3,
  Plus,
  ScanLine
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { OrderSearchBar } from "../components/OrderSearchBar";
import { QRScanner } from "../components/QRScanner";
import { Analytics } from "../components/Analytics";
import { ManualOrderDialog } from "../components/ManualOrderDialog";
import { useToast } from "../hooks/use-toast";

export default function Orders() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useProducts();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();

  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const createOrder = useCreateOrder();

  if (ordersLoading) return <div className="p-8">Loading orders...</div>;

  const pendingOrders = orders?.filter((o: any) => o.status === 'pending') || [];
  const activeOrders = orders?.filter((o: any) => ['confirmed', 'pending'].includes(o.status)) || [];
  const completedOrders = orders?.filter((o: any) => o.status === 'completed') || [];
  
  // Filter active orders based on search term
  const filteredActiveOrders = searchTerm 
    ? activeOrders.filter((o: any) => String(o.id).includes(searchTerm.trim()))
    : activeOrders;

  const handleStatusUpdate = (id: number, status: string, paymentStatus?: string) => {
    updateStatus.mutate({ id, status, paymentStatus });
  };

  const handleQRScan = (result: string) => {
    const orderId = parseInt(result.match(/\d+/)?.[0] || "0");
    const foundOrder = orders?.find((o: any) => o.id === orderId);
    if (foundOrder) {
      setSelectedOrder(foundOrder);
      setIsQRScannerOpen(false);
      toast({ title: "Order Found", description: `Order #${String(orderId).padStart(5, "0")} located` });
    } else {
      toast({ title: "Order Not Found", description: `No order with ID ${orderId}`, variant: "destructive" });
    }
  };

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    toast({ title: "Order Selected", description: `Order #${String(order.id).padStart(5, "0")} selected` });
  };

  const handleCreateManualOrder = async (
    items: any[],
    paymentMethod: string
  ) => {
    const newOrderPayload: any = {
      status: "confirmed",
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      paymentMethod,
      paymentStatus: "unpaid",
      orderType: "manual",
      createdAt: new Date().toISOString(),
    };

    try {
      const created = await createOrder.mutateAsync(newOrderPayload);
      toast({
        title: "Success",
        description: `Order #${String(created.id).padStart(5, "0")} created`,
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to create order", variant: "destructive" });
    }
  };

  const OrderList = ({ orders }: { orders: any[] }) => (
    <div className="grid gap-4">
      {orders.length === 0 && <div className="text-center p-8 text-muted-foreground">No orders in this category</div>}
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-bold">
                Order #{String(order.id).padStart(5, '0')}
              </CardTitle>
              {order.studentName && (
                <CardDescription className="mt-1 text-sm font-medium">
                  Student: {order.studentName}
                </CardDescription>
              )}
            </div>
            <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
              {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'} ({order.paymentMethod})
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start mb-4">
              <div className="w-full">
                <CardDescription className="mb-2">
                  {format(new Date(order.createdAt), "h:mm a")} • Total: ₹{Number(order.totalAmount).toFixed(0)}
                </CardDescription>
                <div className="space-y-1 bg-muted/30 p-2 rounded-lg">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="font-medium">{item.product?.name}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              {order.status === 'pending' && (
                <>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                  >
                    Reject
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white" 
                    onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                  >
                    Accept Order
                  </Button>
                </>
              )}
              {order.status === 'confirmed' && (
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusUpdate(order.id, 'completed', 'paid')}
                >
                  Mark Ready & Paid
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="pb-32">
      <div className="space-y-4">
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {/* Header with search bar and scanner button */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <h2 className="text-lg font-semibold">Active Orders</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:w-64">
                  <OrderSearchBar 
                    orders={activeOrders} 
                    onSelect={handleOrderSelect}
                    externalSearchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsQRScannerOpen(true)}
                  className="flex-shrink-0"
                  title="Scan Order QR"
                >
                  <ScanLine className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <OrderList orders={filteredActiveOrders} />
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <OrderList orders={completedOrders} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Analytics orders={orders || []} />
          </TabsContent>
        </Tabs>
      </div>

      <QRScanner 
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
      />

      {/* Floating Action Button for Manual Order */}
      <button
        onClick={() => setIsManualOrderOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 z-40"
        title="Create Manual Order"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Manual Order Dialog */}
      <ManualOrderDialog
        isOpen={isManualOrderOpen}
        onClose={() => setIsManualOrderOpen(false)}
        onCreateOrder={handleCreateManualOrder}
        products={products || []}
        isLoading={productsLoading}
      />
    </div>
  );
}
