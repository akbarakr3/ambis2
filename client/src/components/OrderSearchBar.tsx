import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, X } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { format } from "date-fns";

interface Order {
  id: number;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  items?: any[];
  studentName?: string;
}

interface OrderSearchBarProps {
  orders: Order[];
  onSelect?: (order: Order) => void;
  externalSearchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export function OrderSearchBar({ orders, onSelect, externalSearchTerm, onSearchChange }: OrderSearchBarProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchTerm(value);
    }
    setShowResults(true);
  };

  const handleClear = () => {
    if (onSearchChange) {
      onSearchChange("");
    } else {
      setInternalSearchTerm("");
    }
    setShowResults(false);
  };

  const filteredOrders = orders.filter((order) =>
    String(order.id).includes(searchTerm.trim())
  );

  const handleSelectOrder = (order: Order) => {
    handleClear();
    onSelect?.(order);
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {showResults && searchTerm && filteredOrders.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {filteredOrders.slice(0, 10).map((order) => (
              <button
                key={order.id}
                onClick={() => handleSelectOrder(order)}
                className="w-full text-left border-b last:border-b-0 p-3 hover:bg-muted transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold">Order #{String(order.id).padStart(5, "0")}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM dd, yyyy h:mm a")}
                    </div>
                    {order.studentName && (
                      <div className="text-xs font-medium mt-1">{order.studentName}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{Number(order.totalAmount).toFixed(0)}</div>
                    <Badge className="text-xs mt-1">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {showResults && searchTerm && filteredOrders.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50">
          <CardContent className="p-4 text-center text-muted-foreground">
            No orders found with ID "{searchTerm}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}
