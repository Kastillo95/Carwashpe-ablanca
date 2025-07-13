import { 
  Service, Customer, Appointment, Inventory, Invoice, InvoiceItem,
  InsertService, InsertCustomer, InsertAppointment, InsertInventory, 
  InsertInvoice, InsertInvoiceItem, CreateInvoiceData, DashboardStats, ReportData,
  services, customers, appointments, inventory, invoices, invoiceItems
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;

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

  // Helper methods
  getNextServiceNumber(): Promise<number>;
}

export class MemStorage implements IStorage {
  // DEPRECATED: Esta clase ya no se usa, se mantiene solo para compatibilidad
  async getNextServiceNumber(): Promise<number> {
    return 1; // Placeholder para compatibilidad
  }
  private services: Map<number, Service> = new Map();
  private customers: Map<number, Customer> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private inventory: Map<number, Inventory> = new Map();
  private invoices: Map<number, Invoice> = new Map();
  private invoiceItems: Map<number, InvoiceItem> = new Map();
  private invoiceItemsIndex: Map<number, number[]> = new Map(); // invoiceId -> itemIds[]
  
  private currentServiceId = 1;
  private currentCustomerId = 1;
  private currentAppointmentId = 1;
  private currentInventoryId = 1;
  private currentInvoiceId = 1;
  private currentInvoiceItemId = 1;
  private currentInvoiceNumber = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Services
    const services = [
      { name: "Lavado Básico", description: "Lavado exterior básico", price: "80.00", duration: 30 },
      { name: "Lavado Completo", description: "Lavado exterior e interior", price: "150.00", duration: 45 },
      { name: "Lavado Premium", description: "Lavado completo con detalles", price: "250.00", duration: 60 },
      { name: "Encerado", description: "Aplicación de cera protectora", price: "200.00", duration: 30 },
      { name: "Detallado Completo", description: "Servicio completo de detallado", price: "400.00", duration: 90 },
    ];

    services.forEach(service => {
      this.services.set(this.currentServiceId, {
        id: this.currentServiceId,
        ...service,
        active: true,
      });
      this.currentServiceId++;
    });

    // Inventory
    const inventoryItems = [
      { name: "Champú para Autos", description: "Champú concentrado para lavado", barcode: "001", quantity: 25, minQuantity: 5, price: "45.00", supplier: "AutoClean", category: "Limpieza" },
      { name: "Cera Automotriz", description: "Cera protectora premium", barcode: "002", quantity: 3, minQuantity: 5, price: "120.00", supplier: "CarCare Pro", category: "Protección" },
      { name: "Toallas de Microfibra", description: "Toallas de secado premium", barcode: "003", quantity: 50, minQuantity: 10, price: "15.00", supplier: "Textiles HN", category: "Accesorios" },
      { name: "Desengrasante", description: "Desengrasante industrial", barcode: "004", quantity: 8, minQuantity: 3, price: "85.00", supplier: "AutoClean", category: "Limpieza" },
      { name: "Limpiador de Llantas", description: "Limpiador especializado para llantas", barcode: "005", quantity: 12, minQuantity: 5, price: "65.00", supplier: "CarCare Pro", category: "Limpieza" },
    ];

    inventoryItems.forEach(item => {
      this.inventory.set(this.currentInventoryId, {
        id: this.currentInventoryId,
        ...item,
        active: true,
      });
      this.currentInventoryId++;
    });
  }

  // Services
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.active);
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(service: InsertService): Promise<Service> {
    const newService: Service = {
      id: this.currentServiceId++,
      ...service,
      active: service.active ?? true,
    };
    this.services.set(newService.id, newService);
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    const existing = this.services.get(id);
    if (!existing) throw new Error("Service not found");
    
    const updated = { ...existing, ...service };
    this.services.set(id, updated);
    return updated;
  }

  async deleteService(id: number): Promise<void> {
    this.services.delete(id);
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const newCustomer: Customer = {
      id: this.currentCustomerId++,
      ...customer,
    };
    this.customers.set(newCustomer.id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const existing = this.customers.get(id);
    if (!existing) throw new Error("Customer not found");
    
    const updated = { ...existing, ...customer };
    this.customers.set(id, updated);
    return updated;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(a => a.date === date);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const newAppointment: Appointment = {
      id: this.currentAppointmentId++,
      ...appointment,
      status: appointment.status ?? "scheduled",
      createdAt: new Date(),
    };
    this.appointments.set(newAppointment.id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const existing = this.appointments.get(id);
    if (!existing) throw new Error("Appointment not found");
    
    const updated = { ...existing, ...appointment };
    this.appointments.set(id, updated);
    return updated;
  }

  async deleteAppointment(id: number): Promise<void> {
    this.appointments.delete(id);
  }

  // Inventory
  async getInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(i => i.active);
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async getInventoryItemByBarcode(barcode: string): Promise<Inventory | undefined> {
    return Array.from(this.inventory.values()).find(item => item.barcode === barcode && item.active);
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const newItem: Inventory = {
      id: this.currentInventoryId++,
      ...item,
      active: item.active ?? true,
    };
    this.inventory.set(newItem.id, newItem);
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory> {
    const existing = this.inventory.get(id);
    if (!existing) throw new Error("Inventory item not found");
    
    const updated = { ...existing, ...item };
    this.inventory.set(id, updated);
    return updated;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    this.inventory.delete(id);
  }

  async reduceStock(id: number, quantity: number): Promise<Inventory> {
    const item = this.inventory.get(id);
    if (!item) throw new Error("Inventory item not found");
    
    if (item.quantity < quantity) {
      throw new Error("Insufficient stock");
    }
    
    const updated = { ...item, quantity: item.quantity - quantity };
    this.inventory.set(id, updated);
    return updated;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoiceWithItems(id: number): Promise<{ invoice: Invoice; items: InvoiceItem[] } | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const itemIds = this.invoiceItemsIndex.get(id) || [];
    const items = itemIds.map(itemId => this.invoiceItems.get(itemId)!).filter(Boolean);
    
    return { invoice, items };
  }

  async createInvoice(data: CreateInvoiceData & { inventoryItems?: { id: number; quantity: number }[] }): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    const invoiceNumber = await this.getNextInvoiceNumber();
    
    // Reduce inventory stock if provided
    if (data.inventoryItems) {
      for (const inventoryItem of data.inventoryItems) {
        await this.reduceStock(inventoryItem.id, inventoryItem.quantity);
      }
    }
    
    // Calculate totals (sin mostrar impuestos)
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = 0; // No mostrar impuestos
    const total = subtotal;
    
    // Create invoice
    const invoice: Invoice = {
      id: this.currentInvoiceId++,
      number: invoiceNumber,
      customerId: null,
      customerName: data.customer.name,
      customerPhone: data.customer.phone || null,
      customerTaxId: data.customer.taxId || null,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      status: "pending",
      date: data.date,
      createdAt: new Date(),
    };
    
    this.invoices.set(invoice.id, invoice);
    
    // Create invoice items
    const items: InvoiceItem[] = [];
    const itemIds: number[] = [];
    
    for (const itemData of data.items) {
      const item: InvoiceItem = {
        id: this.currentInvoiceItemId++,
        invoiceId: invoice.id,
        serviceName: itemData.serviceName,
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice.toFixed(2),
        total: (itemData.quantity * itemData.unitPrice).toFixed(2),
      };
      
      this.invoiceItems.set(item.id, item);
      items.push(item);
      itemIds.push(item.id);
    }
    
    this.invoiceItemsIndex.set(invoice.id, itemIds);
    
    return { invoice, items };
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
    const existing = this.invoices.get(id);
    if (!existing) throw new Error("Invoice not found");
    
    const updated = { ...existing, status };
    this.invoices.set(id, updated);
    return updated;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const number = String(this.currentInvoiceNumber).padStart(4, '0');
    this.currentInvoiceNumber++;
    return `001-${number}`;
  }

  // Reports
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = await this.getAppointmentsByDate(today);
    
    const dailyRevenue = todayAppointments
      .filter(a => a.status === "completed")
      .reduce((sum, a) => sum + parseFloat(a.servicePrice), 0);
    
    const lowStockItems = Array.from(this.inventory.values())
      .filter(i => i.active && i.quantity <= i.minQuantity).length;
    
    const servedCustomers = todayAppointments.filter(a => a.status === "completed").length;
    
    return {
      todayAppointments: todayAppointments.length,
      dailyRevenue,
      lowStockItems,
      servedCustomers,
    };
  }

  async getReportData(startDate: string, endDate: string): Promise<ReportData> {
    const appointments = Array.from(this.appointments.values())
      .filter(a => a.date >= startDate && a.date <= endDate && a.status === "completed");
    
    const invoices = Array.from(this.invoices.values())
      .filter(i => i.date >= startDate && i.date <= endDate);
    
    const totalRevenue = invoices.reduce((sum, i) => sum + parseFloat(i.total), 0);
    const totalServices = appointments.length;
    const totalCustomers = new Set(appointments.map(a => a.customerName)).size;
    
    // Find most popular service
    const serviceCounts = appointments.reduce((counts, a) => {
      counts[a.serviceName] = (counts[a.serviceName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const topService = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";
    
    return {
      totalRevenue,
      totalServices,
      totalCustomers,
      topService,
      period: `${startDate} a ${endDate}`,
    };
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Services
  async getServices(): Promise<Service[]> {
    const result = await db.select().from(services).where(eq(services.active, true));
    return result;
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service> {
    const [updated] = await db.update(services).set(service).where(eq(services.id, id)).returning();
    if (!updated) throw new Error("Service not found");
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

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    if (!updated) throw new Error("Customer not found");
    return updated;
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
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const [updated] = await db.update(appointments).set(appointment).where(eq(appointments.id, id)).returning();
    if (!updated) throw new Error("Appointment not found");
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
    const [item] = await db.select().from(inventory).where(and(
      eq(inventory.barcode, barcode),
      eq(inventory.active, true)
    ));
    return item || undefined;
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory> {
    const [updated] = await db.update(inventory).set(item).where(eq(inventory.id, id)).returning();
    if (!updated) throw new Error("Inventory item not found");
    return updated;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  async reduceStock(id: number, quantity: number): Promise<Inventory> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    if (!item) throw new Error("Inventory item not found");
    
    // Skip stock reduction for services
    if (item.isService) {
      return item;
    }
    
    if ((item.quantity || 0) < quantity) {
      throw new Error(`Stock insuficiente para ${item.name}`);
    }
    
    const [updated] = await db.update(inventory)
      .set({ quantity: (item.quantity || 0) - quantity })
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
    console.log("Getting invoice with ID:", id);
    const invoice = await this.getInvoice(id);
    console.log("Found invoice:", invoice);
    if (!invoice) return undefined;
    
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    console.log("Found items:", items);
    return { invoice, items };
  }

  async createInvoice(data: CreateInvoiceData & { inventoryItems?: { id: number; quantity: number }[] }): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    return await db.transaction(async (tx) => {
      // Reduce inventory stock if provided (only for physical products, not services)
      if (data.inventoryItems) {
        for (const inventoryItem of data.inventoryItems) {
          const [item] = await tx.select().from(inventory).where(eq(inventory.id, inventoryItem.id));
          if (!item) throw new Error("Inventory item not found");
          
          // Only check and reduce stock for physical products (not services)
          if (!item.isService) {
            if ((item.quantity || 0) < inventoryItem.quantity) {
              throw new Error(`Stock insuficiente para ${item.name}`);
            }
            
            await tx.update(inventory)
              .set({ quantity: (item.quantity || 0) - inventoryItem.quantity })
              .where(eq(inventory.id, inventoryItem.id));
          }
        }
      }

      // Get next invoice number
      const invoiceNumber = await this.getNextInvoiceNumber();
      
      // Calculate totals (sin mostrar impuestos)
      const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const tax = 0; // No mostrar impuestos
      const total = subtotal;
      
      // Create invoice
      const [invoice] = await tx.insert(invoices).values({
        number: invoiceNumber,
        customerName: data.customer.name,
        customerPhone: data.customer.phone || null,
        customerTaxId: data.customer.taxId || null,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        status: "pending",
        date: data.date,
      }).returning();
      
      // Create invoice items
      const itemsData = data.items.map(item => ({
        invoiceId: invoice.id,
        serviceName: item.serviceName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        total: (item.quantity * item.unitPrice).toFixed(2),
      }));
      
      const items = await tx.insert(invoiceItems).values(itemsData).returning();
      
      return { invoice, items };
    });
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
    const [updated] = await db.update(invoices).set({ status }).where(eq(invoices.id, id)).returning();
    if (!updated) throw new Error("Invoice not found");
    return updated;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const [result] = await db.select({ maxId: sql<number>`MAX(${invoices.id})` }).from(invoices);
    const nextNumber = (result?.maxId || 0) + 1;
    return `001-${String(nextNumber).padStart(4, '0')}`;
  }

  async getNextServiceNumber(): Promise<number> {
    const [result] = await db.select({ 
      count: sql<number>`COUNT(*)` 
    }).from(inventory).where(eq(inventory.isService, true));
    return (result?.count || 0) + 1;
  }

  // Reports
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    
    const [todayAppointmentsResult] = await db.select({ 
      count: sql<number>`COUNT(*)` 
    }).from(appointments).where(eq(appointments.date, today));
    
    const [dailyRevenueResult] = await db.select({ 
      revenue: sql<number>`COALESCE(SUM(CAST(${invoices.total} AS DECIMAL)), 0)` 
    }).from(invoices).where(eq(invoices.date, today));
    
    const [lowStockResult] = await db.select({ 
      count: sql<number>`COUNT(*)` 
    }).from(inventory).where(and(
      sql`${inventory.quantity} <= ${inventory.minQuantity}`,
      eq(inventory.active, true)
    ));
    
    const [customersResult] = await db.select({ 
      count: sql<number>`COUNT(DISTINCT ${invoices.customerName})` 
    }).from(invoices);
    
    return {
      todayAppointments: todayAppointmentsResult?.count || 0,
      dailyRevenue: dailyRevenueResult?.revenue || 0,
      lowStockItems: lowStockResult?.count || 0,
      servedCustomers: customersResult?.count || 0,
    };
  }

  async getReportData(startDate: string, endDate: string): Promise<ReportData> {
    const [revenueResult] = await db.select({ 
      revenue: sql<number>`COALESCE(SUM(CAST(${invoices.total} AS DECIMAL)), 0)` 
    }).from(invoices).where(and(
      gte(invoices.date, startDate),
      lte(invoices.date, endDate)
    ));
    
    const [servicesResult] = await db.select({ 
      count: sql<number>`COUNT(*)` 
    }).from(invoiceItems).where(and(
      gte(invoices.date, startDate),
      lte(invoices.date, endDate)
    ));
    
    const [customersResult] = await db.select({ 
      count: sql<number>`COUNT(DISTINCT ${invoices.customerName})` 
    }).from(invoices).where(and(
      gte(invoices.date, startDate),
      lte(invoices.date, endDate)
    ));
    
    const [topServiceResult] = await db.select({ 
      serviceName: invoiceItems.serviceName,
      count: sql<number>`COUNT(*)` 
    }).from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .where(and(
        gte(invoices.date, startDate),
        lte(invoices.date, endDate)
      ))
      .groupBy(invoiceItems.serviceName)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(1);
    
    return {
      totalRevenue: revenueResult?.revenue || 0,
      totalServices: servicesResult?.count || 0,
      totalCustomers: customersResult?.count || 0,
      topService: topServiceResult?.serviceName || "N/A",
      period: `${startDate} - ${endDate}`,
    };
  }
}

export const storage = new DatabaseStorage();
