import { 
  Service, Customer, Appointment, Inventory, Invoice, InvoiceItem,
  InsertService, InsertCustomer, InsertAppointment, InsertInventory, 
  InsertInvoice, InsertInvoiceItem, CreateInvoiceData, DashboardStats, ReportData
} from "@shared/schema";

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
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, item: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventoryItem(id: number): Promise<void>;

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
}

export class MemStorage implements IStorage {
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
      { name: "Champú para Autos", description: "Champú concentrado para lavado", quantity: 25, minQuantity: 5, price: "45.00", supplier: "AutoClean", category: "Limpieza" },
      { name: "Cera Automotriz", description: "Cera protectora premium", quantity: 3, minQuantity: 5, price: "120.00", supplier: "CarCare Pro", category: "Protección" },
      { name: "Toallas de Microfibra", description: "Toallas de secado premium", quantity: 50, minQuantity: 10, price: "15.00", supplier: "Textiles HN", category: "Accesorios" },
      { name: "Desengrasante", description: "Desengrasante industrial", quantity: 8, minQuantity: 3, price: "85.00", supplier: "AutoClean", category: "Limpieza" },
      { name: "Llantas", description: "Limpiador de llantas", quantity: 12, minQuantity: 5, price: "65.00", supplier: "CarCare Pro", category: "Limpieza" },
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

  async createInvoice(data: CreateInvoiceData): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    const invoiceNumber = await this.getNextInvoiceNumber();
    
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.15; // 15% ISV
    const total = subtotal + tax;
    
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

export const storage = new MemStorage();
