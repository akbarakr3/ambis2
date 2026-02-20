import { useState } from "react";
import { useCart, Product as CartProduct } from "../hooks/use-cart";
import { useProducts } from "../hooks/use-products";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { CreditCard, Building2, ShoppingCart, X, Plus, Minus, Banknote } from "lucide-react";
import { useCreateOrder } from "../hooks/use-orders"; 

// 3D Animation styles
const styles3D = `
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); }
    50% { box-shadow: 0 0 0 8px rgba(249, 115, 22, 0); }
  }
  
  .category-btn-3d {
    transition: all 0.3s ease;
  }
  
  .category-btn-3d.selected {
    animation: pulse-glow 2s infinite;
  }
`;

// Add styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = styles3D;
  document.head.appendChild(style);
}

interface ProductCatalogProps {
  onOrderComplete?: () => void;
}

export function ProductCatalog({ onOrderComplete }: ProductCatalogProps) {
  const { addToCart, items: cartItems, clearCart, total, updateQuantity } = useCart();
  const { data: products = [] } = useProducts();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSplitPaymentOpen, setIsSplitPaymentOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [splitPaymentDraft, setSplitPaymentDraft] = useState({ cashAmount: 0, onlineAmount: 0 });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Get unique categories from API products
  const categories = ["All", ...Array.from(new Set(products.map((product: any) => product.category || "Other")))];

  // Filter products based on selected category
  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter((product: any) => product.category === selectedCategory);

  const handleProductClick = (product: CartProduct) => {
    addToCart(product);
  };

  const printBill = (orderData: any) => {
    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Receipt</title>
          <style>
          * { margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; background: white; }
          .receipt { width: 80mm; margin: 0 auto; padding: 10mm; }
          .header { text-align: center; margin-bottom: 15mm; border-bottom: 2px dashed #000; padding-bottom: 5mm; }
          .header h1 { font-size: 20px; color: #000; margin-bottom: 3mm; }
          .header p { font-size: 12px; color: #666; }
          .order-info { font-size: 11px; margin-bottom: 10mm; padding-bottom: 5mm; border-bottom: 2px dashed #000; }
          .order-info div { margin: 2mm 0; }
          .items { margin: 10mm 0; }
          .item { display: flex; justify-content: space-between; font-size: 11px; margin: 3mm 0; }
          .item-name { flex: 1; }
          .item-price { text-align: right; }
          .divider { border-bottom: 2px dashed #000; margin: 8mm 0; }
          .total { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin: 5mm 0; }
          .footer { text-align: center; margin-top: 10mm; font-size: 11px; color: #666; }
          .payment-method { text-align: center; margin: 5mm 0; font-size: 11px; font-weight: bold; }
          @media print {
            body { margin: 0; padding: 0; }
            .receipt { width: 100%; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Ambi's Cafe</h1>
            <p>Order Receipt</p>
          </div>
          
          <div class="order-info">
            <div><strong>Order ID:</strong> ${String(orderData.id).padStart(5, '0')}</div>
            <div><strong>Date:</strong> ${new Date(orderData.createdAt).toLocaleString()}</div>
            <div><strong>Status:</strong> PAID</div>
          </div>

          <div class="items">
            <div style="font-weight: bold; font-size: 11px; margin-bottom: 4mm; display: flex; justify-content: space-between;">
              <span>Item</span>
              <span style="text-align: right;">Amount</span>
            </div>
            ${orderData.items.map((item: any) => `
              <div class="item">
                <div class="item-name">${item.name} x ${item.quantity}</div>
                <div class="item-price">₹${Number(item.price) * item.quantity}</div>
              </div>
            `).join('')}
          </div>

          <div class="divider"></div>

          <div class="total">
            <span>Total Amount:</span>
            <span>₹${orderData.totalAmount}</span>
          </div>

          <div class="payment-method">
            Payment Method: ${
              orderData.paymentMethod === "online" ? "Online Payment" : 
              orderData.paymentMethod === "cash" ? "Cash" : 
              `₹${orderData.cashAmount} Cash + ₹${orderData.onlineAmount} Online`
            }
          </div>

          <div class="divider"></div>

          <div class="footer">
            <p>Thank you for your order!</p>
            <p>Please come again</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Save the generated bill HTML to localStorage for records
    try {
      const saved = JSON.parse(localStorage.getItem('savedReceipts') || '[]');
      saved.push({ id: Date.now(), orderId: orderData.id, html: billHTML, createdAt: new Date().toISOString() });
      localStorage.setItem('savedReceipts', JSON.stringify(saved));
    } catch (e) {
      console.warn('Could not save receipt to localStorage', e);
    }

    const printWindow = window.open('', '', 'height=400,width=600');
    if (printWindow) {
      printWindow.document.write(billHTML);
      printWindow.document.close();
      // Print as soon as possible
      setTimeout(() => {
        printWindow.print();
      }, 50);
    }
  };

  const createOrder = useCreateOrder();

  const handlePayment = async (paymentMethod: string, cashAmount?: number, onlineAmount?: number) => {
    setSelectedPaymentMethod(paymentMethod);
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Prepare order payload
    const orderData: any = {
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
      })),
      paymentMethod,
      totalAmount: total,
      status: paymentMethod === "online" ? "confirmed" : "pending",
      paymentStatus: paymentMethod === "online" ? "paid" : "unpaid",
      orderType: "manual",
      createdAt: new Date().toISOString(),
    };
    if (paymentMethod === "both") {
      orderData.cashAmount = cashAmount;
      orderData.onlineAmount = onlineAmount;
    }

    // create via supabase
    try {
      const result = await createOrder.mutateAsync(orderData);
      // Print and notify
      printBill(result);
      const methodText = 
        paymentMethod === "online" ? "Online Payment" : 
        paymentMethod === "cash" ? "Cash" : 
        `₹${cashAmount} Cash + ₹${onlineAmount} Online`;
      alert(`Order placed successfully! Payment Method: ${methodText}`);
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }

    setIsProcessing(false);
    clearCart();
    setIsPaymentOpen(false);
    setIsSplitPaymentOpen(false);
    setSelectedPaymentMethod(null);
    setSplitPaymentDraft({ cashAmount: 0, onlineAmount: 0 });

    if (onOrderComplete) {
      onOrderComplete();
    }
  };

  // Category images mapping
  const categoryImages: { [key: string]: string } = {
    "All": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop",
    "Snacks": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=100&h=100&fit=crop",
    "Breakfast": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=100&h=100&fit=crop",
    "Drinks": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=100&h=100&fit=crop",
    "Sweets": "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=100&h=100&fit=crop",
    "Main Course": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&h=100&fit=crop",
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Buttons and Cart Header */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              title={category}
              className={`h-18 w-18 rounded-lg overflow-hidden border-2 transition-all duration-300 flex flex-col items-center justify-center category-btn-3d relative ${
                selectedCategory === category
                  ? "border-orange-500 shadow-lg selected"
                  : "border-gray-300 hover:border-orange-300"
              }`}
            >
              <img
                src={categoryImages[category]}
                alt={category}
                className="absolute inset-0 h-full w-full object-cover z-0"
                style={{ backfaceVisibility: 'hidden' }}
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <span className="text-xs font-bold text-white text-center px-1 z-10 line-clamp-2">
                {category}
              </span>
            </button>
          ))}
        </div>
        
        <Button
          onClick={() => setIsPaymentOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 whitespace-nowrap"
        >
          <ShoppingCart className="h-5 w-5" />
          View Cart
          {cartCount > 0 && (
            <span className="ml-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* Products Grid - Compact layout */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-2 border-gray-300 hover:border-orange-400"
            onClick={() => handleProductClick(product)}
          >
            <div className="relative h-20 overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                style={{ transform: "scale(1.1)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-1 left-1 right-1">
                <span className="text-xs font-medium bg-white/90 px-1 py-0.5 rounded-full text-orange-700 inline-block text-[10px]">
                  {product.category}
                </span>
              </div>
            </div>
            <CardContent className="p-2">
              <h3 className="font-bold text-xs mb-0.5 text-gray-800 line-clamp-1">{product.name}</h3>
              <div className="flex justify-between items-center gap-1">
                <span className="text-sm font-bold text-green-600">₹{product.price}</span>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-6 px-1">
                  <ShoppingCart className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart & Payment
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Your cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-200">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-gray-600">₹{Number(item.price) * item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 flex items-center justify-center"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-7 text-center font-bold">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0 flex items-center justify-center"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span className="text-lg text-green-600">₹{total}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Options */}
            {cartItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-700">Select Payment Method:</p>
                  <Button
                    onClick={() => { clearCart(); setIsPaymentOpen(false); }}
                    className="h-8 px-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded flex items-center gap-1"
                  >
                    <span>🗑️</span>
                    <span>Clear Cart</span>
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handlePayment("online")}
                    disabled={isProcessing}
                    className="h-16 flex flex-col items-center gap-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-xs">Online Pay</span>
                  </Button>
                  <Button
                    onClick={() => handlePayment("cash")}
                    disabled={isProcessing}
                    className="h-16 flex flex-col items-center gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <Banknote className="h-5 w-5" />
                    <span className="text-xs">Cash</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setSplitPaymentDraft({ cashAmount: Math.floor(total / 2), onlineAmount: Math.ceil(total / 2) });
                      setIsSplitPaymentOpen(true);
                    }}
                    disabled={isProcessing}
                    className="h-16 flex flex-col items-center gap-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <X className="h-5 w-5" style={{ transform: 'rotate(45deg)' }} />
                    <span className="text-xs">Both</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Split Payment Dialog */}
      <Dialog open={isSplitPaymentOpen} onOpenChange={setIsSplitPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Split Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash Amount (₹)
              </label>
              <Input
                type="number"
                min="0"
                max={total}
                value={splitPaymentDraft.cashAmount}
                onChange={(e) => {
                  const cashAmount = Math.max(0, Math.min(total, parseInt(e.target.value) || 0));
                  const onlineAmount = total - cashAmount;
                  setSplitPaymentDraft({ cashAmount, onlineAmount });
                }}
                placeholder="Enter cash amount"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Online: ₹{splitPaymentDraft.onlineAmount}</p>
            </div>

            <div className="bg-gray-100 p-3 rounded">
              <div className="flex justify-between text-sm font-medium">
                <span>Total Amount:</span>
                <span>₹{total}</span>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Cash: ₹{splitPaymentDraft.cashAmount} + Online: ₹{splitPaymentDraft.onlineAmount}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsSplitPaymentOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                handlePayment("both", splitPaymentDraft.cashAmount, splitPaymentDraft.onlineAmount);
                setIsSplitPaymentOpen(false);
              }}
              disabled={isProcessing || splitPaymentDraft.cashAmount + splitPaymentDraft.onlineAmount !== total}
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
