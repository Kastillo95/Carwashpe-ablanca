import { 
  Service, Customer, Appointment, Inventory, Invoice, InvoiceItem, Promotion, PromotionSend,
  InsertService, InsertCustomer, InsertAppointment, InsertInventory, 
  InsertInvoice, InsertInvoiceItem, InsertPromotion, InsertPromotionSend,
  CreateInvoiceData, DashboardStats, ReportData,
  services, customers, appointments, inventory, invoices, invoiceItems, promotions, promotionSends
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Customers - CRM
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  searchCustomers(query: string): Promise<Customer[]>;
  getTopCustomers(limit?: number): Promise<Customer[]>;
  updateCustomerSpent(customerId: number, amount: number): Promise<void>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;

  // Inventory
  getInventory(): Promise<Inventory[]>;
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  getInventoryItemByBarcode(barcode: string): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventoryItem(id: number): Promise<void>;
  reduceStock(id: number, quantity: number): Promise<Inventory>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceWithItems(id: number): Promise<{ invoice: Invoice; items: InvoiceItem[] } | undefined>;
  createInvoice(data: CreateInvoiceData): Promise<{ invoice: Invoice; items: InvoiceItem[] }>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice>;
  getNextInvoiceNumber(): Promise<string>;

  // Reports
  getDashboardStats(): Promise<DashboardStats>;
  getReportData(startDate: string, endDate: string): Promise<ReportData>;

  // Promotions - CRM
  getPromotions(): Promise<Promotion[]>;
  getPromotion(id: number): Promise<Promotion | undefined>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion>;
  deletePromotion(id: number): Promise<void>;
  getActivePromotions(): Promise<Promotion[]>;
  
  // Promotion Sends
  sendPromotionToCustomer(promotionId: number, customerId: number): Promise<PromotionSend>;
  sendPromotionToAllCustomers(promotionId: number): Promise<PromotionSend[]>;
  getPromotionSends(promotionId: number): Promise<PromotionSend[]>;

  // Helper methods
  getNextServiceNumber(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getNextServiceNumber(): Promise<number> {
    const allServices = await db.select().from(services);
    return allServices.length + 1;
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.active, true));
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values(service)
      .returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    const [updated] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    return await db.select().from(customers).where(
      sql`${customers.name} ILIKE ${`%${query}%`} OR 
          ${customers.phone} ILIKE ${`%${query}%`} OR 
          ${customers.email} ILIKE ${`%${query}%`}`
    );
  }

  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    return await db.select().from(customers)
      .orderBy(desc(customers.totalSpent))
      .limit(limit);
  }

  async updateCustomerSpent(customerId: number, amount: number): Promise<void> {
    await db
      .update(customers)
      .set({ 
        totalSpent: sql`${customers.totalSpent} + ${amount.toString()}` 
      })
      .where(eq(customers.id, customerId));
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.date, date));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const [updated] = await db
      .update(appointments)
      .set(appointment)
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  // Inventory
  async getInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory).where(eq(inventory.active, true));
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }

  async getInventoryItemByBarcode(barcode: string): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(
      and(eq(inventory.barcode, barcode), eq(inventory.active, true))
    );
    return item || undefined;
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db
      .insert(inventory)
      .values(item)
      .returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory> {
    const [updated] = await db
      .update(inventory)
      .set(item)
      .where(eq(inventory.id, id))
      .returning();
    return updated;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  async reduceStock(id: number, quantity: number): Promise<Inventory> {
    const [updated] = await db
      .update(inventory)
      .set({ 
        quantity: sql`${inventory.quantity} - ${quantity}` 
      })
      .where(eq(inventory.id, id))
      .returning();
    return updated;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices);
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getInvoiceWithItems(id: number): Promise<{ invoice: Invoice; items: InvoiceItem[] } | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;
    
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    return { invoice, items };
  }

  async createInvoice(data: CreateInvoiceData): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    const invoiceNumber = await this.getNextInvoiceNumber();
    
    // Calculate totals from items
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = 0; // No tax for now
    const total = subtotal + tax;
    
    // Crear factura con los datos recibidos directamente
    const [invoice] = await db.insert(invoices).values({
      number: invoiceNumber,
      customerId: null,
      customerName: data.customer.name,
      customerPhone: data.customer.phone || null,
      customerTaxId: data.customer.taxId || null,
      subtotal: subtotal,
      tax: tax,
      total: total,
      date: data.date,
      status: "pending"
    }).returning();
    
    // Crear items de la factura
    const items = await Promise.all(
      data.items.map((item) => 
        db.insert(invoiceItems).values({
          invoiceId: invoice.id,
          serviceName: item.serviceName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        }).returning().then(result => result[0])
      )
    );
    
    return { invoice, items };
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
    const [updated] = await db
      .update(invoices)
      .set({ status })
      .where(eq(invoices.id, id))
      .returning();
    return updated;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const lastInvoice = await db.select().from(invoices)
      .orderBy(desc(invoices.id))
      .limit(1);
    
    const nextNumber = lastInvoice.length > 0 ? 
      parseInt(lastInvoice[0].number.replace(/\D/g, '')) + 1 : 1;
    
    return `INV-${nextNumber.toString().padStart(6, '0')}`;
  }

  // Reports
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's appointments count
      const todayAppointments = await db.select().from(appointments)
        .where(eq(appointments.date, today));
      
      // Get daily revenue for paid invoices
      const dailyInvoices = await db.select().from(invoices)
        .where(and(eq(invoices.date, today), eq(invoices.status, "paid")));
      
      const dailyRevenue = dailyInvoices.reduce((sum, invoice) => {
        return sum + parseFloat(invoice.total);
      }, 0);
      
      // Get low stock items count
      const allInventory = await db.select().from(inventory)
        .where(eq(inventory.active, true));
      
      const lowStockItems = allInventory.filter(item => 
        item.quantity <= item.minQuantity
      ).length;
      
      // Get served customers count (unique customers today)
      const todayCustomers = new Set(
        todayAppointments.map(apt => apt.customerName)
      );
      
      return {
        todayAppointments: todayAppointments.length,
        dailyRevenue: dailyRevenue,
        lowStockItems: lowStockItems,
        servedCustomers: todayCustomers.size
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        todayAppointments: 0,
        dailyRevenue: 0,
        lowStockItems: 0,
        servedCustomers: 0
      };
    }
  }

  async getReportData(startDate: string, endDate: string): Promise<ReportData> {
    try {
      // Get paid invoices in date range
      const invoicesInPeriod = await db.select().from(invoices)
        .where(and(
          gte(invoices.date, startDate),
          lte(invoices.date, endDate),
          eq(invoices.status, "paid")
        ));
      
      const totalRevenue = invoicesInPeriod.reduce((sum, invoice) => {
        return sum + parseFloat(invoice.total);
      }, 0);
      
      // Get appointments in date range
      const appointmentsInPeriod = await db.select().from(appointments)
        .where(and(
          gte(appointments.date, startDate),
          lte(appointments.date, endDate)
        ));
      
      const totalServices = appointmentsInPeriod.length;
      
      // Get unique customers
      const uniqueCustomers = new Set(
        appointmentsInPeriod.map(apt => apt.customerName)
      );
      
      // Get top service
      const serviceCount: Record<string, number> = {};
      appointmentsInPeriod.forEach(apt => {
        serviceCount[apt.serviceName] = (serviceCount[apt.serviceName] || 0) + 1;
      });
      
      const topService = Object.entries(serviceCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A";
      
      return {
        totalRevenue: totalRevenue,
        totalServices: totalServices,
        totalCustomers: uniqueCustomers.size,
        topService: topService,
        period: `${startDate} - ${endDate}`
      };
    } catch (error) {
      console.error('Error getting report data:', error);
      return {
        totalRevenue: 0,
        totalServices: 0,
        totalCustomers: 0,
        topService: "N/A",
        period: `${startDate} - ${endDate}`
      };
    }
  }

  // Promotions
  async getPromotions(): Promise<Promotion[]> {
    return await db.select().from(promotions);
  }

  async getPromotion(id: number): Promise<Promotion | undefined> {
    const [promotion] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promotion || undefined;
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const [newPromotion] = await db
      .insert(promotions)
      .values(promotion)
      .returning();
    return newPromotion;
  }

  async updatePromotion(id: number, promotion: Partial<InsertPromotion>): Promise<Promotion> {
    const [updated] = await db
      .update(promotions)
      .set(promotion)
      .where(eq(promotions.id, id))
      .returning();
    return updated;
  }

  async deletePromotion(id: number): Promise<void> {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return await db.select().from(promotions).where(
      and(
        eq(promotions.active, true),
        lte(promotions.validFrom, now),
        gte(promotions.validUntil, now)
      )
    );
  }

  // Promotion Sends
  async sendPromotionToCustomer(promotionId: number, customerId: number): Promise<PromotionSend> {
    const [send] = await db
      .insert(promotionSends)
      .values({
        promotionId,
        customerId,
        status: "sent"
      })
      .returning();
    return send;
  }

  async sendPromotionToAllCustomers(promotionId: number): Promise<PromotionSend[]> {
    const allCustomers = await this.getCustomers();
    
    const sends = await Promise.all(
      allCustomers.map(customer =>
        db.insert(promotionSends).values({
          promotionId,
          customerId: customer.id,
          status: "sent"
        }).returning().then(result => result[0])
      )
    );
    
    return sends;
  }

  async getPromotionSends(promotionId: number): Promise<PromotionSend[]> {
    return await db.select().from(promotionSends)
      .where(eq(promotionSends.promotionId, promotionId));
  }
}

export const storage = new DatabaseStorage();