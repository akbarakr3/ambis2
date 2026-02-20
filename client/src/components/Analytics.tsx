import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Calendar } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  isWithinInterval,
} from "date-fns";

interface Order {
  id: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  items?: any[];
  studentName?: string;
}

interface AnalyticsProps {
  orders: Order[];
}

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];

export function Analytics({ orders }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("day");

  // Calculate date range
  const now = new Date();
  let dateRange: { start: Date; end: Date };

  switch (timeRange) {
    case "day":
      dateRange = { start: startOfDay(now), end: endOfDay(now) };
      break;
    case "week":
      dateRange = { start: startOfWeek(now), end: endOfWeek(now) };
      break;
    case "month":
      dateRange = { start: startOfMonth(now), end: endOfMonth(now) };
      break;
    case "year":
      dateRange = { start: startOfYear(now), end: endOfYear(now) };
      break;
  }

  // Filter orders by date range
  const filteredOrders = orders.filter((order) =>
    isWithinInterval(new Date(order.createdAt), dateRange)
  );

  // Get paid orders only
  const paidOrders = filteredOrders.filter((o) => o.paymentStatus === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Prepare chart data based on time range
  const getChartData = () => {
    let intervals: Date[];

    switch (timeRange) {
      case "day":
        // By hour
        intervals = Array.from({ length: 24 }, (_, i) => {
          const date = new Date(now);
          date.setHours(i, 0, 0, 0);
          return date;
        });
        return intervals.map((date) => {
          const hourOrders = filteredOrders.filter(
            (o) =>
              new Date(o.createdAt).getHours() === date.getHours()
          );
          return {
            name: format(date, "HH:00"),
            orders: hourOrders.length,
            revenue: hourOrders
              .filter((o) => o.paymentStatus === "paid")
              .reduce((sum, o) => sum + Number(o.totalAmount), 0),
          };
        });

      case "week":
        intervals = eachDayOfInterval(dateRange);
        return intervals.map((date) => {
          const dayOrders = filteredOrders.filter(
            (o) =>
              startOfDay(new Date(o.createdAt)).getTime() === startOfDay(date).getTime()
          );
          return {
            name: format(date, "EEE"),
            orders: dayOrders.length,
            revenue: dayOrders
              .filter((o) => o.paymentStatus === "paid")
              .reduce((sum, o) => sum + Number(o.totalAmount), 0),
          };
        });

      case "month":
        intervals = eachDayOfInterval(dateRange);
        return intervals.map((date) => {
          const dayOrders = filteredOrders.filter(
            (o) =>
              startOfDay(new Date(o.createdAt)).getTime() === startOfDay(date).getTime()
          );
          return {
            name: format(date, "dd"),
            orders: dayOrders.length,
            revenue: dayOrders
              .filter((o) => o.paymentStatus === "paid")
              .reduce((sum, o) => sum + Number(o.totalAmount), 0),
          };
        });

      case "year":
        intervals = eachMonthOfInterval(dateRange);
        return intervals.map((date) => {
          const monthOrders = filteredOrders.filter(
            (o) =>
              startOfMonth(new Date(o.createdAt)).getTime() === startOfMonth(date).getTime()
          );
          return {
            name: format(date, "MMM"),
            orders: monthOrders.length,
            revenue: monthOrders
              .filter((o) => o.paymentStatus === "paid")
              .reduce((sum, o) => sum + Number(o.totalAmount), 0),
          };
        });
    }
  };

  const chartData = getChartData();

  // Order status breakdown
  const statusData = [
    {
      name: "Completed",
      value: filteredOrders.filter((o) => o.status === "completed").length,
    },
    {
      name: "Pending",
      value: filteredOrders.filter((o) => o.status === "pending").length,
    },
    {
      name: "Confirmed",
      value: filteredOrders.filter((o) => o.status === "confirmed").length,
    },
    {
      name: "Cancelled",
      value: filteredOrders.filter((o) => o.status === "cancelled").length,
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sales & Billing Analytics</h2>
        <p className="text-muted-foreground mt-2">Track your cafe revenue and order metrics</p>
      </div>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="day">Per Day</TabsTrigger>
          <TabsTrigger value="week">Weekly</TabsTrigger>
          <TabsTrigger value="month">Monthly</TabsTrigger>
          <TabsTrigger value="year">Per Year</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">From paid orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground">Orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidOrders.length}</div>
            <p className="text-xs text-muted-foreground">Payment completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              {timeRange === "day" && "Orders by hour"}
              {timeRange === "week" && "Orders by day"}
              {timeRange === "month" && "Orders by day"}
              {timeRange === "year" && "Orders by month"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "revenue") return `₹${Number(value).toFixed(0)}`;
                    return value;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of orders</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders Summary</CardTitle>
          <CardDescription>Latest transactions in this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders in this period
              </div>
            ) : (
              filteredOrders.slice(-10).reverse().map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">Order #{String(order.id).padStart(5, "0")}</p>
                    {order.studentName && (
                      <p className="text-sm font-medium">{order.studentName}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">₹{Number(order.totalAmount).toFixed(0)}</p>
                      <div className="flex gap-2 justify-end mt-1">
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                        <Badge
                          variant={order.paymentStatus === "paid" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
