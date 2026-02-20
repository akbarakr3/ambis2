import { 
  products, orders, orderItems, students, admins,
  type Product, type InsertProduct,
  type Order, type InsertOrder, 
  type OrderItem, type InsertOrderItem,
  type CreateOrderRequest, type OrderWithItems,
  type Student, type InsertStudent,
  type Admin, type InsertAdmin
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Orders
  getOrders(userId?: string): Promise<OrderWithItems[]>; // If userId provided, filter by it
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(userId: string, order: CreateOrderRequest): Promise<Order>;
  updateOrderStatus(id: number, status: string, paymentStatus?: string): Promise<Order | undefined>;

  // Analytics
  getAnalytics(startDate?: Date, endDate?: Date): Promise<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    salesByDay: { date: string; sales: number; orders: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.category);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getOrders(userId?: string): Promise<OrderWithItems[]> {
    // Basic fetch - eager loading would be better but doing manual join for simplicity/control
    let query = db.select().from(orders).orderBy(desc(orders.createdAt));
    
    if (userId) {
      query = query.where(eq(orders.userId, userId)) as any;
    }
    
    const ordersList = await query;
    
    // Fetch items for each order
    const results: OrderWithItems[] = [];
    for (const order of ordersList) {
      const items = await db.select({
          item: orderItems,
          product: products
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id))
        .leftJoin(products, eq(orderItems.productId, products.id));
      
      results.push({
        ...order,
        items: items.map((i: any) => ({ ...i.item, product: i.product! }))
      });
    }
    
    return results;
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db.select({
        item: orderItems,
        product: products
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))
      .leftJoin(products, eq(orderItems.productId, products.id));

    return {
      ...order,
      items: items.map((i: any) => ({ ...i.item, product: i.product! }))
    };
  }

  async createOrder(userId: string, request: CreateOrderRequest): Promise<Order> {
    return await db.transaction(async (tx: any) => {
      let total = 0;
      
      // Calculate total and verify products
      for (const item of request.items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!product) throw new Error(`Product ${item.productId} not found`);
        total += Number(product.price) * item.quantity;
      }

      // Create Order
      const [newOrder] = await tx.insert(orders).values({
        userId,
        totalAmount: total.toString(),
        paymentMethod: request.paymentMethod,
        status: 'pending',
        paymentStatus: 'pending'
      }).returning();

      // Create Order Items
      for (const item of request.items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: product.price
        });
      }

      return newOrder;
    });
  }

  async updateOrderStatus(id: number, status: string, paymentStatus?: string): Promise<Order | undefined> {
    const updates: any = { status };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    const [updated] = await db.update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getAnalytics(startDate?: Date, endDate?: Date): Promise<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    salesByDay: { date: string; sales: number; orders: number }[];
  }> {
    // Build where clause for date filtering
    let whereClause: any = eq(orders.status, 'completed');
    
    if (startDate && endDate) {
      whereClause = and(
        eq(orders.status, 'completed'),
        gte(orders.createdAt, startDate),
        lte(orders.createdAt, endDate)
      );
    } else if (startDate) {
      whereClause = and(
        eq(orders.status, 'completed'),
        gte(orders.createdAt, startDate)
      );
    } else if (endDate) {
      whereClause = and(
        eq(orders.status, 'completed'),
        lte(orders.createdAt, endDate)
      );
    }

    // Get all completed orders within date range
    const ordersList = await db.select().from(orders).where(whereClause);
    
    // Calculate totals
    const totalSales = ordersList.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);
    const totalOrders = ordersList.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Group sales by day
    const salesByDayMap = new Map<string, { sales: number; orders: number }>();
    
    for (const order of ordersList) {
      const dateKey = order.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      const existing = salesByDayMap.get(dateKey) || { sales: 0, orders: 0 };
      salesByDayMap.set(dateKey, {
        sales: existing.sales + Number(order.totalAmount),
        orders: existing.orders + 1
      });
    }

    // Convert to array and sort by date
    const salesByDay = Array.from(salesByDayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      salesByDay
    };
  }

  // Student methods
  async getStudentByMobile(mobile: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.mobile, mobile));
    return student;
  }

  async getStudentById(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async createStudent(data: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(data).returning();
    return student;
  }

  async updateStudentOtp(mobile: string, otp: string, expiry: Date): Promise<Student | undefined> {
    const [updated] = await db.update(students)
      .set({ otp, otpExpiry: expiry })
      .where(eq(students.mobile, mobile))
      .returning();
    return updated;
  }

  async updateStudentProfile(id: number, data: { email?: string; name?: string }): Promise<Student | undefined> {
    const [updated] = await db.update(students)
      .set(data)
      .where(eq(students.id, id))
      .returning();
    return updated;
  }

  async clearStudentOtp(id: number): Promise<void> {
    await db.update(students)
      .set({ otp: null, otpExpiry: null })
      .where(eq(students.id, id));
  }

  // Admin methods
  async getAdminByMobile(mobile: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.mobile, mobile));
    return admin;
  }

  async getAdminById(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async createAdmin(data: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(data).returning();
    return admin;
  }

  async updateAdminPassword(id: number, hashedPassword: string): Promise<Admin | undefined> {
    const [updated] = await db.update(admins)
      .set({ password: hashedPassword })
      .where(eq(admins.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
