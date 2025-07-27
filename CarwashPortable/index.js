var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  appointments: () => appointments,
  customers: () => customers,
  insertAppointmentSchema: () => insertAppointmentSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertInventorySchema: () => insertInventorySchema,
  insertInvoiceItemSchema: () => insertInvoiceItemSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertPromotionSchema: () => insertPromotionSchema,
  insertPromotionSendSchema: () => insertPromotionSendSchema,
  insertServiceSchema: () => insertServiceSchema,
  inventory: () => inventory,
  invoiceItems: () => invoiceItems,
  invoices: () => invoices,
  promotionSends: () => promotionSends,
  promotions: () => promotions,
  services: () => services
});
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  // SQLite no tiene decimal nativo
  duration: integer("duration").notNull(),
  // in minutes
  active: integer("active", { mode: "boolean" }).default(true)
});
var customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  taxId: text("tax_id"),
  // RTN or ID number
  address: text("address"),
  notes: text("notes"),
  totalSpent: text("total_spent").default("0.00"),
  lastVisit: text("last_visit"),
  // SQLite almacena como texto
  createdAt: text("created_at").default("datetime('now')"),
  active: integer("active", { mode: "boolean" }).default(true)
});
var appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id),
  serviceId: integer("service_id").references(() => services.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  serviceName: text("service_name").notNull(),
  servicePrice: text("service_price").notNull(),
  date: text("date").notNull(),
  // YYYY-MM-DD format
  time: text("time").notNull(),
  // HH:MM format
  status: text("status").default("scheduled"),
  // scheduled, completed, cancelled
  createdAt: text("created_at").default("datetime('now')")
});
var inventory = sqliteTable("inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  barcode: text("barcode").unique(),
  quantity: integer("quantity").default(0),
  // Null para servicios
  minQuantity: integer("min_quantity"),
  // Null para servicios  
  price: text("price").notNull(),
  supplier: text("supplier"),
  category: text("category"),
  imageUrl: text("image_url"),
  // URL de la imagen del producto
  isService: integer("is_service", { mode: "boolean" }).default(false),
  // True para servicios como lavados
  active: integer("active", { mode: "boolean" }).default(true)
});
var invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: text("number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerTaxId: text("customer_tax_id"),
  subtotal: text("subtotal").notNull(),
  tax: text("tax").notNull(),
  total: text("total").notNull(),
  status: text("status").default("pending"),
  // pending, paid, cancelled
  date: text("date").notNull(),
  createdAt: text("created_at").default("datetime('now')")
});
var invoiceItems = sqliteTable("invoice_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  serviceName: text("service_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  total: text("total").notNull()
});
var promotions = sqliteTable("promotions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  discount: text("discount"),
  validFrom: text("valid_from").notNull(),
  validUntil: text("valid_until").notNull(),
  active: integer("active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default("datetime('now')")
});
var promotionSends = sqliteTable("promotion_sends", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  promotionId: integer("promotion_id").references(() => promotions.id),
  customerId: integer("customer_id").references(() => customers.id),
  sentAt: text("sent_at").default("datetime('now')"),
  status: text("status").default("sent")
  // sent, delivered, failed
});
var insertServiceSchema = createInsertSchema(services).omit({ id: true });
var insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
var insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  customerId: true,
  serviceId: true,
  createdAt: true
});
var insertInventorySchema = createInsertSchema(inventory).omit({ id: true, barcode: true }).extend({
  quantity: z.number().min(0).optional().nullable(),
  minQuantity: z.number().min(0).optional().nullable(),
  barcode: z.string().nullable().optional(),
  // Se genera automáticamente si no se proporciona
  isService: z.boolean().optional(),
  description: z.string().nullable().optional(),
  supplier: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  // URL de la imagen del producto
  price: z.union([z.string(), z.number()]).transform((val) => String(val))
  // Acepta número o string
});
var insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  customerId: true,
  createdAt: true
});
var insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
  invoiceId: true
});
var insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true
});
var insertPromotionSendSchema = createInsertSchema(promotionSends).omit({
  id: true,
  sentAt: true
});

// server/db.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
var isElectron = process.env.ELECTRON_MODE === "true";
var dbPath = isElectron ? process.env.DATABASE_URL?.replace("file:", "") || "carwash.db" : path.join(process.cwd(), "carwash.db");
if (isElectron) {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}
var sqlite = new Database(dbPath);
var db = drizzle(sqlite, { schema: schema_exports });

// server/storage.ts
import { eq, and, gte, lte, sql } from "drizzle-orm";
var MemStorage = class {
  // DEPRECATED: Esta clase ya no se usa, se mantiene solo para compatibilidad
  async getNextServiceNumber() {
    return this.currentServiceId;
  }
  services = /* @__PURE__ */ new Map();
  customers = /* @__PURE__ */ new Map();
  appointments = /* @__PURE__ */ new Map();
  inventory = /* @__PURE__ */ new Map();
  invoices = /* @__PURE__ */ new Map();
  invoiceItems = /* @__PURE__ */ new Map();
  invoiceItemsIndex = /* @__PURE__ */ new Map();
  // invoiceId -> itemIds[]
  currentServiceId = 1;
  currentCustomerId = 1;
  currentAppointmentId = 1;
  currentInventoryId = 1;
  currentInvoiceId = 1;
  currentInvoiceItemId = 1;
  currentInvoiceNumber = 1;
  constructor() {
    this.seedInitialData();
  }
  seedInitialData() {
    const services2 = [
      { name: "Lavado B\xE1sico", description: "Lavado exterior b\xE1sico", price: "80.00", duration: 30 },
      { name: "Lavado Completo", description: "Lavado exterior e interior", price: "150.00", duration: 45 },
      { name: "Lavado Premium", description: "Lavado completo con detalles", price: "250.00", duration: 60 },
      { name: "Encerado", description: "Aplicaci\xF3n de cera protectora", price: "200.00", duration: 30 },
      { name: "Detallado Completo", description: "Servicio completo de detallado", price: "400.00", duration: 90 }
    ];
    services2.forEach((service) => {
      this.services.set(this.currentServiceId, {
        id: this.currentServiceId,
        ...service,
        active: true
      });
      this.currentServiceId++;
    });
    const inventoryItems = [
      { name: "Champ\xFA para Autos", description: "Champ\xFA concentrado para lavado", barcode: "001", quantity: 25, minQuantity: 5, price: "45.00", supplier: "AutoClean", category: "Limpieza" },
      { name: "Cera Automotriz", description: "Cera protectora premium", barcode: "002", quantity: 3, minQuantity: 5, price: "120.00", supplier: "CarCare Pro", category: "Protecci\xF3n" },
      { name: "Toallas de Microfibra", description: "Toallas de secado premium", barcode: "003", quantity: 50, minQuantity: 10, price: "15.00", supplier: "Textiles HN", category: "Accesorios" },
      { name: "Desengrasante", description: "Desengrasante industrial", barcode: "004", quantity: 8, minQuantity: 3, price: "85.00", supplier: "AutoClean", category: "Limpieza" },
      { name: "Limpiador de Llantas", description: "Limpiador especializado para llantas", barcode: "005", quantity: 12, minQuantity: 5, price: "65.00", supplier: "CarCare Pro", category: "Limpieza" }
    ];
    inventoryItems.forEach((item) => {
      this.inventory.set(this.currentInventoryId, {
        id: this.currentInventoryId,
        ...item,
        active: true,
        imageUrl: null,
        isService: false
      });
      this.currentInventoryId++;
    });
  }
  // Services
  async getServices() {
    return Array.from(this.services.values()).filter((s) => s.active);
  }
  async getService(id) {
    return this.services.get(id);
  }
  async createService(service) {
    const newService = {
      id: this.currentServiceId++,
      ...service,
      description: service.description ?? null,
      active: service.active ?? true
    };
    this.services.set(newService.id, newService);
    return newService;
  }
  async updateService(id, service) {
    const existing = this.services.get(id);
    if (!existing) throw new Error("Service not found");
    const updated = { ...existing, ...service };
    this.services.set(id, updated);
    return updated;
  }
  async deleteService(id) {
    this.services.delete(id);
  }
  // Customers
  async getCustomers() {
    return Array.from(this.customers.values());
  }
  async getCustomer(id) {
    return this.customers.get(id);
  }
  async createCustomer(customer) {
    const newCustomer = {
      id: this.currentCustomerId++,
      ...customer,
      active: customer.active ?? true,
      phone: customer.phone ?? null,
      email: customer.email ?? null,
      taxId: customer.taxId ?? null,
      address: customer.address ?? null,
      notes: customer.notes ?? null,
      totalSpent: customer.totalSpent ?? "0.00",
      lastVisit: customer.lastVisit ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.customers.set(newCustomer.id, newCustomer);
    return newCustomer;
  }
  async updateCustomer(id, customer) {
    const existing = this.customers.get(id);
    if (!existing) throw new Error("Customer not found");
    const updated = { ...existing, ...customer };
    this.customers.set(id, updated);
    return updated;
  }
  async getCustomerByPhone(phone) {
    return Array.from(this.customers.values()).find((c) => c.phone === phone);
  }
  async searchCustomers(query) {
    const searchTerm = query.toLowerCase();
    return Array.from(this.customers.values()).filter(
      (c) => c.name.toLowerCase().includes(searchTerm) || c.phone && c.phone.includes(searchTerm) || c.email && c.email.toLowerCase().includes(searchTerm)
    );
  }
  async getTopCustomers(limit = 10) {
    return Array.from(this.customers.values()).sort((a, b) => parseFloat(b.totalSpent || "0") - parseFloat(a.totalSpent || "0")).slice(0, limit);
  }
  async updateCustomerSpent(customerId, amount) {
    const customer = this.customers.get(customerId);
    if (customer) {
      const currentSpent = parseFloat(customer.totalSpent || "0");
      const updated = { ...customer, totalSpent: (currentSpent + amount).toFixed(2) };
      this.customers.set(customerId, updated);
    }
  }
  // Appointments
  async getAppointments() {
    return Array.from(this.appointments.values());
  }
  async getAppointment(id) {
    return this.appointments.get(id);
  }
  async getAppointmentsByDate(date) {
    return Array.from(this.appointments.values()).filter((a) => a.date === date);
  }
  async createAppointment(appointment) {
    const newAppointment = {
      id: this.currentAppointmentId++,
      ...appointment,
      customerId: null,
      serviceId: null,
      customerPhone: appointment.customerPhone ?? null,
      status: appointment.status ?? "scheduled",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.appointments.set(newAppointment.id, newAppointment);
    return newAppointment;
  }
  async updateAppointment(id, appointment) {
    const existing = this.appointments.get(id);
    if (!existing) throw new Error("Appointment not found");
    const updated = { ...existing, ...appointment };
    this.appointments.set(id, updated);
    return updated;
  }
  async deleteAppointment(id) {
    this.appointments.delete(id);
  }
  // Inventory
  async getInventory() {
    return Array.from(this.inventory.values()).filter((i) => i.active);
  }
  async getInventoryItem(id) {
    return this.inventory.get(id);
  }
  async getInventoryItemByBarcode(barcode) {
    return Array.from(this.inventory.values()).find((item) => item.barcode === barcode && item.active);
  }
  async createInventoryItem(item) {
    const newItem = {
      id: this.currentInventoryId++,
      ...item,
      description: item.description ?? null,
      barcode: item.barcode ?? null,
      quantity: item.quantity ?? 0,
      minQuantity: item.minQuantity ?? null,
      supplier: item.supplier ?? null,
      category: item.category ?? null,
      imageUrl: item.imageUrl ?? null,
      isService: item.isService ?? false,
      active: item.active ?? true
    };
    this.inventory.set(newItem.id, newItem);
    return newItem;
  }
  async updateInventoryItem(id, item) {
    const existing = this.inventory.get(id);
    if (!existing) throw new Error("Inventory item not found");
    const updated = { ...existing, ...item };
    this.inventory.set(id, updated);
    return updated;
  }
  async deleteInventoryItem(id) {
    this.inventory.delete(id);
  }
  async reduceStock(id, quantity) {
    const item = this.inventory.get(id);
    if (!item) throw new Error("Inventory item not found");
    if ((item.quantity ?? 0) < quantity) {
      throw new Error("Insufficient stock");
    }
    const updated = { ...item, quantity: (item.quantity ?? 0) - quantity };
    this.inventory.set(id, updated);
    return updated;
  }
  // Invoices
  async getInvoices() {
    return Array.from(this.invoices.values());
  }
  async getInvoice(id) {
    return this.invoices.get(id);
  }
  async getInvoiceWithItems(id) {
    const invoice = this.invoices.get(id);
    if (!invoice) return void 0;
    const itemIds = this.invoiceItemsIndex.get(id) || [];
    const items = itemIds.map((itemId) => this.invoiceItems.get(itemId)).filter(Boolean);
    return { invoice, items };
  }
  async createInvoice(data) {
    const invoiceNumber = await this.getNextInvoiceNumber();
    if (data.inventoryItems) {
      for (const inventoryItem of data.inventoryItems) {
        await this.reduceStock(inventoryItem.id, inventoryItem.quantity);
      }
    }
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = 0;
    const total = subtotal;
    const invoice = {
      id: this.currentInvoiceId++,
      number: invoiceNumber,
      customerId: null,
      customerName: data.customer.name,
      customerPhone: data.customer.phone || null,
      customerTaxId: data.customer.taxId || null,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      status: "paid",
      date: data.date,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.invoices.set(invoice.id, invoice);
    const items = [];
    const itemIds = [];
    for (const itemData of data.items) {
      const item = {
        id: this.currentInvoiceItemId++,
        invoiceId: invoice.id,
        serviceName: itemData.serviceName,
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice.toFixed(2),
        total: (itemData.quantity * itemData.unitPrice).toFixed(2)
      };
      this.invoiceItems.set(item.id, item);
      items.push(item);
      itemIds.push(item.id);
    }
    this.invoiceItemsIndex.set(invoice.id, itemIds);
    return { invoice, items };
  }
  async updateInvoiceStatus(id, status) {
    const existing = this.invoices.get(id);
    if (!existing) throw new Error("Invoice not found");
    const updated = { ...existing, status };
    this.invoices.set(id, updated);
    return updated;
  }
  async getNextInvoiceNumber() {
    const number = String(this.currentInvoiceNumber).padStart(4, "0");
    this.currentInvoiceNumber++;
    return `001-${number}`;
  }
  // Reports
  async getDashboardStats() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const todayAppointments = await this.getAppointmentsByDate(today);
    const dailyRevenue = todayAppointments.filter((a) => a.status === "completed").reduce((sum, a) => sum + parseFloat(a.servicePrice), 0);
    const lowStockItems = Array.from(this.inventory.values()).filter((i) => i.active && (i.quantity ?? 0) <= (i.minQuantity ?? 0)).length;
    const servedCustomers = todayAppointments.filter((a) => a.status === "completed").length;
    return {
      todayAppointments: todayAppointments.length,
      dailyRevenue,
      lowStockItems,
      servedCustomers
    };
  }
  async getReportData(startDate, endDate) {
    const appointments2 = Array.from(this.appointments.values()).filter((a) => a.date >= startDate && a.date <= endDate && a.status === "completed");
    const invoices2 = Array.from(this.invoices.values()).filter((i) => i.date >= startDate && i.date <= endDate);
    const totalRevenue = invoices2.reduce((sum, i) => sum + parseFloat(i.total), 0);
    const totalServices = appointments2.length;
    const totalCustomers = new Set(appointments2.map((a) => a.customerName)).size;
    const serviceCounts = appointments2.reduce((counts, a) => {
      counts[a.serviceName] = (counts[a.serviceName] || 0) + 1;
      return counts;
    }, {});
    const topService = Object.entries(serviceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";
    return {
      totalRevenue,
      totalServices,
      totalCustomers,
      topService,
      period: `${startDate} a ${endDate}`
    };
  }
  // CRM - Promotions methods
  promotions = /* @__PURE__ */ new Map();
  promotionSends = /* @__PURE__ */ new Map();
  currentPromotionId = 1;
  currentPromotionSendId = 1;
  async getPromotions() {
    return Array.from(this.promotions.values());
  }
  async getPromotion(id) {
    return this.promotions.get(id);
  }
  async createPromotion(promotion) {
    const newPromotion = {
      id: this.currentPromotionId++,
      ...promotion
    };
    this.promotions.set(newPromotion.id, newPromotion);
    return newPromotion;
  }
  async updatePromotion(id, promotion) {
    const existing = this.promotions.get(id);
    if (!existing) throw new Error("Promotion not found");
    const updated = { ...existing, ...promotion };
    this.promotions.set(id, updated);
    return updated;
  }
  async deletePromotion(id) {
    this.promotions.delete(id);
  }
  async getActivePromotions() {
    return Array.from(this.promotions.values()).filter((p) => p.active);
  }
  async sendPromotionToCustomer(promotionId, customerId) {
    const promotionSend = {
      id: this.currentPromotionSendId++,
      promotionId,
      customerId,
      sentAt: /* @__PURE__ */ new Date(),
      status: "sent"
    };
    this.promotionSends.set(promotionSend.id, promotionSend);
    return promotionSend;
  }
  async sendPromotionToAllCustomers(promotionId) {
    const customers2 = await this.getCustomers();
    const sends = [];
    for (const customer of customers2) {
      const send = await this.sendPromotionToCustomer(promotionId, customer.id);
      sends.push(send);
    }
    return sends;
  }
  async getPromotionSends(promotionId) {
    return Array.from(this.promotionSends.values()).filter((ps) => ps.promotionId === promotionId);
  }
};
var DatabaseStorage = class {
  // Services
  async getServices() {
    const result = await db.select().from(services).where(eq(services.active, true));
    return result;
  }
  async getService(id) {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || void 0;
  }
  async createService(service) {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }
  async updateService(id, service) {
    const [updated] = await db.update(services).set(service).where(eq(services.id, id)).returning();
    if (!updated) throw new Error("Service not found");
    return updated;
  }
  async deleteService(id) {
    await db.delete(services).where(eq(services.id, id));
  }
  // Customers - CRM
  async getCustomers() {
    return await db.select().from(customers).orderBy(customers.lastVisit);
  }
  async getCustomer(id) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || void 0;
  }
  async getCustomerByPhone(phone) {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer || void 0;
  }
  async createCustomer(customer) {
    const [newCustomer] = await db.insert(customers).values({
      ...customer,
      createdAt: /* @__PURE__ */ new Date(),
      lastVisit: /* @__PURE__ */ new Date()
    }).returning();
    return newCustomer;
  }
  async updateCustomer(id, customer) {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    if (!updated) throw new Error("Customer not found");
    return updated;
  }
  async searchCustomers(query) {
    return await db.select().from(customers).where(
      sql`${customers.name} ILIKE ${`%${query}%`} OR ${customers.phone} ILIKE ${`%${query}%`} OR ${customers.email} ILIKE ${`%${query}%`}`
    );
  }
  async getTopCustomers(limit = 10) {
    return await db.select().from(customers).orderBy(sql`${customers.totalSpent} DESC`).limit(limit);
  }
  async updateCustomerSpent(customerId, amount) {
    await db.update(customers).set({
      totalSpent: sql`${customers.totalSpent} + ${amount}`,
      lastVisit: /* @__PURE__ */ new Date()
    }).where(eq(customers.id, customerId));
  }
  // Appointments
  async getAppointments() {
    return await db.select().from(appointments);
  }
  async getAppointment(id) {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || void 0;
  }
  async getAppointmentsByDate(date) {
    return await db.select().from(appointments).where(eq(appointments.date, date));
  }
  async createAppointment(appointment) {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }
  async updateAppointment(id, appointment) {
    const [updated] = await db.update(appointments).set(appointment).where(eq(appointments.id, id)).returning();
    if (!updated) throw new Error("Appointment not found");
    return updated;
  }
  async deleteAppointment(id) {
    await db.delete(appointments).where(eq(appointments.id, id));
  }
  // Inventory
  async getInventory() {
    return await db.select().from(inventory).where(eq(inventory.active, true));
  }
  async getInventoryItem(id) {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || void 0;
  }
  async getInventoryItemByBarcode(barcode) {
    const [item] = await db.select().from(inventory).where(and(
      eq(inventory.barcode, barcode),
      eq(inventory.active, true)
    ));
    return item || void 0;
  }
  async createInventoryItem(item) {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }
  async updateInventoryItem(id, item) {
    const [updated] = await db.update(inventory).set(item).where(eq(inventory.id, id)).returning();
    if (!updated) throw new Error("Inventory item not found");
    return updated;
  }
  async deleteInventoryItem(id) {
    await db.delete(inventory).where(eq(inventory.id, id));
  }
  async reduceStock(id, quantity) {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    if (!item) throw new Error("Inventory item not found");
    if (item.isService) {
      return item;
    }
    if ((item.quantity || 0) < quantity) {
      throw new Error(`Stock insuficiente para ${item.name}`);
    }
    const [updated] = await db.update(inventory).set({ quantity: (item.quantity || 0) - quantity }).where(eq(inventory.id, id)).returning();
    return updated;
  }
  // Invoices
  async getInvoices() {
    return await db.select().from(invoices);
  }
  async getInvoice(id) {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || void 0;
  }
  async getInvoiceWithItems(id) {
    console.log("Getting invoice with ID:", id);
    const invoice = await this.getInvoice(id);
    console.log("Found invoice:", invoice);
    if (!invoice) return void 0;
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    console.log("Found items:", items);
    return { invoice, items };
  }
  async createInvoice(data) {
    return await db.transaction(async (tx) => {
      if (data.inventoryItems && data.inventoryItems.length > 0) {
        console.log("Processing inventory items:", data.inventoryItems);
        for (const inventoryItem of data.inventoryItems) {
          const [item] = await tx.select().from(inventory).where(eq(inventory.id, inventoryItem.id));
          if (!item) {
            console.error(`Inventory item not found: ID ${inventoryItem.id}`);
            throw new Error(`Inventory item not found: ID ${inventoryItem.id}`);
          }
          const isService = item.isService || item.name?.toLowerCase().includes("servicio");
          console.log(`Item ${item.name}: isService=${item.isService}, calculated isService=${isService}`);
          if (!isService) {
            if ((item.quantity || 0) < inventoryItem.quantity) {
              throw new Error(`Stock insuficiente para ${item.name}`);
            }
            await tx.update(inventory).set({ quantity: (item.quantity || 0) - inventoryItem.quantity }).where(eq(inventory.id, inventoryItem.id));
          } else {
            console.log(`Skipping stock reduction for service: ${item.name}`);
          }
        }
      }
      const invoiceNumber = await this.getNextInvoiceNumber();
      const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const tax = 0;
      const total = subtotal;
      let customerId = null;
      if (data.customer.phone) {
        let existingCustomer = await this.getCustomerByPhone(data.customer.phone);
        if (existingCustomer) {
          await tx.update(customers).set({
            name: data.customer.name,
            lastVisit: /* @__PURE__ */ new Date(),
            totalSpent: sql`${customers.totalSpent} + ${total}`
          }).where(eq(customers.id, existingCustomer.id));
          customerId = existingCustomer.id;
        } else {
          const [newCustomer] = await tx.insert(customers).values({
            name: data.customer.name,
            phone: data.customer.phone,
            email: null,
            taxId: data.customer.taxId || null,
            address: null,
            notes: "Cliente creado autom\xE1ticamente desde facturaci\xF3n",
            totalSpent: total.toFixed(2),
            lastVisit: /* @__PURE__ */ new Date(),
            createdAt: /* @__PURE__ */ new Date(),
            active: true
          }).returning();
          customerId = newCustomer.id;
        }
      }
      const [invoice] = await tx.insert(invoices).values({
        number: invoiceNumber,
        customerId,
        customerName: data.customer.name,
        customerPhone: data.customer.phone || null,
        customerTaxId: data.customer.taxId || null,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        status: "paid",
        date: data.date
      }).returning();
      const itemsData = data.items.map((item) => ({
        invoiceId: invoice.id,
        serviceName: item.serviceName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toFixed(2),
        total: (item.quantity * item.unitPrice).toFixed(2)
      }));
      const items = await tx.insert(invoiceItems).values(itemsData).returning();
      return { invoice, items };
    });
  }
  async updateInvoiceStatus(id, status) {
    const [updated] = await db.update(invoices).set({ status }).where(eq(invoices.id, id)).returning();
    if (!updated) throw new Error("Invoice not found");
    return updated;
  }
  async getNextInvoiceNumber() {
    const [result] = await db.select({ maxId: sql`MAX(${invoices.id})` }).from(invoices);
    const nextNumber = (result?.maxId || 0) + 1;
    return `001-${String(nextNumber).padStart(4, "0")}`;
  }
  async getNextServiceNumber() {
    const [result] = await db.select({
      count: sql`COUNT(*)`
    }).from(inventory).where(eq(inventory.isService, true));
    return (result?.count || 0) + 1;
  }
  // Reports
  async getDashboardStats() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const [todayAppointmentsResult] = await db.select({
      count: sql`COUNT(*)`
    }).from(appointments).where(eq(appointments.date, today));
    const [dailyRevenueResult] = await db.select({
      revenue: sql`COALESCE(SUM(CAST(${invoices.total} AS DECIMAL)), 0)`
    }).from(invoices).where(eq(invoices.date, today));
    const [lowStockResult] = await db.select({
      count: sql`COUNT(*)`
    }).from(inventory).where(and(
      sql`${inventory.quantity} <= ${inventory.minQuantity}`,
      eq(inventory.active, true)
    ));
    const [customersResult] = await db.select({
      count: sql`COUNT(DISTINCT ${invoices.customerName})`
    }).from(invoices);
    return {
      todayAppointments: todayAppointmentsResult?.count || 0,
      dailyRevenue: dailyRevenueResult?.revenue || 0,
      lowStockItems: lowStockResult?.count || 0,
      servedCustomers: customersResult?.count || 0
    };
  }
  async getReportData(startDate, endDate) {
    const [revenueResult] = await db.select({
      revenue: sql`COALESCE(SUM(CAST(${invoices.total} AS DECIMAL)), 0)`
    }).from(invoices).where(and(
      gte(invoices.date, startDate),
      lte(invoices.date, endDate)
    ));
    const [servicesResult] = await db.select({
      count: sql`COUNT(*)`
    }).from(invoiceItems).where(and(
      gte(invoices.date, startDate),
      lte(invoices.date, endDate)
    ));
    const [customersResult] = await db.select({
      count: sql`COUNT(DISTINCT ${invoices.customerName})`
    }).from(invoices).where(and(
      gte(invoices.date, startDate),
      lte(invoices.date, endDate)
    ));
    const [topServiceResult] = await db.select({
      serviceName: invoiceItems.serviceName,
      count: sql`COUNT(*)`
    }).from(invoiceItems).innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id)).where(and(
      gte(invoices.date, startDate),
      lte(invoices.date, endDate)
    )).groupBy(invoiceItems.serviceName).orderBy(sql`COUNT(*) DESC`).limit(1);
    return {
      totalRevenue: revenueResult?.revenue || 0,
      totalServices: servicesResult?.count || 0,
      totalCustomers: customersResult?.count || 0,
      topService: topServiceResult?.serviceName || "N/A",
      period: `${startDate} - ${endDate}`
    };
  }
  // Promotions - CRM
  async getPromotions() {
    return await db.select().from(promotions).orderBy(sql`${promotions.createdAt} DESC`);
  }
  async getPromotion(id) {
    const [promotion] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promotion || void 0;
  }
  async createPromotion(promotion) {
    const [newPromotion] = await db.insert(promotions).values({
      ...promotion,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newPromotion;
  }
  async updatePromotion(id, promotion) {
    const [updated] = await db.update(promotions).set(promotion).where(eq(promotions.id, id)).returning();
    if (!updated) throw new Error("Promotion not found");
    return updated;
  }
  async deletePromotion(id) {
    await db.delete(promotions).where(eq(promotions.id, id));
  }
  async getActivePromotions() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(promotions).where(and(
      eq(promotions.active, true),
      lte(promotions.validFrom, now),
      gte(promotions.validUntil, now)
    ));
  }
  // Crear plantilla automática profesional con logo
  createPromotionTemplate(promotion) {
    const logoText = "\u{1F697}\u2728 CARWASH PE\xD1A BLANCA \u2728\u{1F697}";
    const separator = "\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501";
    let template = `${logoText}
${separator}

`;
    template += `\u{1F389} *${promotion.title.toUpperCase()}* \u{1F389}

`;
    template += `${promotion.message}

`;
    if (promotion.discount) {
      template += `\u{1F4B0} *\xA1${promotion.discount}% DE DESCUENTO!*

`;
    }
    const validFrom = new Date(promotion.validFrom).toLocaleDateString("es-HN");
    const validUntil = new Date(promotion.validUntil).toLocaleDateString("es-HN");
    template += `\u{1F4C5} *V\xE1lida:* ${validFrom} - ${validUntil}

`;
    template += `${separator}
`;
    template += `\u{1F4CD} *Ubicaci\xF3n:* Pe\xF1a Blanca, Cort\xE9s
`;
    template += `\u{1F4DE} *Tel\xE9fono:* +504 9464-8987
`;
    template += `\u{1F552} *Horarios:*
`;
    template += `   Lun-S\xE1b: 8:00 AM - 5:00 PM
`;
    template += `   Domingo: 8:00 AM - 3:00 PM

`;
    template += `\xA1Te esperamos para brindarte el mejor servicio! \u{1F697}\u{1F4A8}`;
    return template;
  }
  // Promotion Sends con plantillas automáticas
  async sendPromotionToCustomer(promotionId, customerId) {
    const customer = await this.getCustomer(customerId);
    if (!customer || !customer.phone) {
      throw new Error("Cliente no encontrado o sin tel\xE9fono");
    }
    const [promotion] = await db.select().from(promotions).where(eq(promotions.id, promotionId));
    if (!promotion) {
      throw new Error("Promoci\xF3n no encontrada");
    }
    const promotionMessage = this.createPromotionTemplate(promotion);
    const cleanPhone = customer.phone.replace(/[^\d]/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(promotionMessage)}`;
    const [send] = await db.insert(promotionSends).values({
      promotionId,
      customerId,
      sentAt: /* @__PURE__ */ new Date(),
      status: "sent"
    }).returning();
    return { ...send, whatsappUrl, customerName: customer.name, phone: customer.phone };
  }
  async sendPromotionToAllCustomers(promotionId) {
    const allCustomers = await this.getCustomers();
    const activeCustomers = allCustomers.filter((c) => c.active && c.phone);
    const [promotion] = await db.select().from(promotions).where(eq(promotions.id, promotionId));
    if (!promotion) {
      throw new Error("Promoci\xF3n no encontrada");
    }
    const promotionMessage = this.createPromotionTemplate(promotion);
    const sends = [];
    for (const customer of activeCustomers) {
      if (customer.phone) {
        const cleanPhone = customer.phone.replace(/[^\d]/g, "");
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(promotionMessage)}`;
        const [send] = await db.insert(promotionSends).values({
          promotionId,
          customerId: customer.id,
          sentAt: /* @__PURE__ */ new Date(),
          status: "sent"
        }).returning();
        sends.push({ ...send, whatsappUrl, customerName: customer.name, phone: customer.phone });
      }
    }
    return sends;
  }
  async getPromotionSends(promotionId) {
    return await db.select().from(promotionSends).where(eq(promotionSends.promotionId, promotionId));
  }
};
async function initializeDatabase() {
  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price TEXT NOT NULL,
      duration INTEGER NOT NULL,
      active INTEGER DEFAULT 1
    )`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      tax_id TEXT,
      address TEXT,
      notes TEXT,
      total_spent TEXT DEFAULT '0.00',
      last_visit TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      active INTEGER DEFAULT 1
    )`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      service_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      service_name TEXT NOT NULL,
      service_price TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      barcode TEXT UNIQUE,
      quantity INTEGER DEFAULT 0,
      min_quantity INTEGER,
      price TEXT NOT NULL,
      supplier TEXT,
      category TEXT,
      image_url TEXT,
      is_service INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    )`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT NOT NULL UNIQUE,
      customer_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT,
      customer_tax_id TEXT,
      subtotal TEXT NOT NULL,
      tax TEXT NOT NULL,
      total TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER,
      service_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price TEXT NOT NULL,
      total TEXT NOT NULL
    )`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      discount TEXT,
      valid_from TEXT NOT NULL,
      valid_until TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    await db.run(sql`CREATE TABLE IF NOT EXISTS promotion_sends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      promotion_id INTEGER,
      customer_id INTEGER,
      sent_at TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'sent'
    )`);
    console.log("\u2705 Base de datos SQLite inicializada correctamente");
  } catch (error) {
    console.error("\u274C Error inicializando base de datos:", error);
  }
}
if (process.env.ELECTRON_MODE === "true") {
  initializeDatabase();
}
var storage = process.env.ELECTRON_MODE === "true" ? new DatabaseStorage() : new MemStorage();

// server/routes.ts
import { z as z2 } from "zod";

// server/upload.ts
import multer from "multer";
import path2 from "path";
import fs2 from "fs";
var uploadsDir = path2.join(process.cwd(), "uploads", "products");
if (!fs2.existsSync(uploadsDir)) {
  fs2.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path2.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});
var fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos de imagen"), false);
  }
};
var uploadProductImage = multer({
  storage: storage2,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB máximo
  }
});

// server/routes.ts
import path3 from "path";
import express from "express";
var ADMIN_PASSWORD = "742211010338";
var createInvoiceSchema = z2.object({
  customer: z2.object({
    name: z2.string().min(1),
    phone: z2.string().optional(),
    taxId: z2.string().optional()
  }),
  items: z2.array(z2.object({
    serviceName: z2.string().min(1),
    quantity: z2.number().min(1),
    unitPrice: z2.number().min(0)
  })).min(1),
  date: z2.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
var passwordSchema = z2.object({
  password: z2.string()
});
async function registerRoutes(app2) {
  app2.use("/uploads", express.static(path3.join(process.cwd(), "uploads")));
  app2.post("/api/upload/product-image", uploadProductImage.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No se subi\xF3 ning\xFAn archivo" });
      }
      const imageUrl = `/uploads/products/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Error al subir imagen" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener estad\xEDsticas del dashboard" });
    }
  });
  app2.get("/api/services", async (req, res) => {
    try {
      const services2 = await storage.getServices();
      res.json(services2);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener servicios" });
    }
  });
  app2.post("/api/services", async (req, res) => {
    try {
      const { password, ...serviceData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const validatedData = insertServiceSchema.parse(serviceData);
      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al crear servicio" });
    }
  });
  app2.put("/api/services/:id", async (req, res) => {
    try {
      const { password, ...serviceData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const id = parseInt(req.params.id);
      const service = await storage.updateService(id, serviceData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar servicio" });
    }
  });
  app2.delete("/api/services/:id", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.json({ message: "Servicio eliminado" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al eliminar servicio" });
    }
  });
  app2.get("/api/appointments", async (req, res) => {
    try {
      const { date } = req.query;
      let appointments2;
      if (date) {
        appointments2 = await storage.getAppointmentsByDate(date);
      } else {
        appointments2 = await storage.getAppointments();
      }
      res.json(appointments2);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener citas" });
    }
  });
  app2.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al crear cita" });
    }
  });
  app2.put("/api/appointments/:id", async (req, res) => {
    try {
      const { password, ...appointmentData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const id = parseInt(req.params.id);
      const appointment = await storage.updateAppointment(id, appointmentData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar cita" });
    }
  });
  app2.delete("/api/appointments/:id", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteAppointment(id);
      res.json({ message: "Cita eliminada" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al eliminar cita" });
    }
  });
  app2.get("/api/inventory", async (req, res) => {
    try {
      const inventory2 = await storage.getInventory();
      res.json(inventory2);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener inventario" });
    }
  });
  app2.get("/api/inventory/barcode/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      const item = await storage.getInventoryItemByBarcode(barcode);
      if (!item) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Error al buscar producto" });
    }
  });
  app2.post("/api/inventory", async (req, res) => {
    try {
      const { password, ...itemData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      if (itemData.isService && !itemData.barcode) {
        const nextServiceNumber = await storage.getNextServiceNumber();
        itemData.barcode = nextServiceNumber.toString().padStart(4, "0");
      }
      const validatedData = insertInventorySchema.parse(itemData);
      const item = await storage.createInventoryItem(validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al crear producto" });
    }
  });
  app2.put("/api/inventory/:id", async (req, res) => {
    try {
      const { password, ...itemData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const id = parseInt(req.params.id);
      const item = await storage.updateInventoryItem(id, itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar producto" });
    }
  });
  app2.delete("/api/inventory/:id", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteInventoryItem(id);
      res.json({ message: "Producto eliminado" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al eliminar producto" });
    }
  });
  app2.get("/api/invoices", async (req, res) => {
    try {
      const invoices2 = await storage.getInvoices();
      res.json(invoices2);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener facturas" });
    }
  });
  app2.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Fetching invoice with ID:", id);
      const result = await storage.getInvoiceWithItems(id);
      console.log("Invoice data from storage:", result);
      if (!result) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Error al obtener factura" });
    }
  });
  app2.post("/api/invoices", async (req, res) => {
    try {
      const result = await storage.createInvoice(req.body);
      res.json(result);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al crear factura" });
    }
  });
  app2.put("/api/invoices/:id/status", async (req, res) => {
    try {
      const { password, status } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const id = parseInt(req.params.id);
      const invoice = await storage.updateInvoiceStatus(id, status);
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar estado de factura" });
    }
  });
  app2.get("/api/reports", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Se requieren fechas de inicio y fin" });
      }
      const reportData = await storage.getReportData(startDate, endDate);
      res.json(reportData);
    } catch (error) {
      res.status(500).json({ message: "Error al generar reporte" });
    }
  });
  app2.post("/api/export/inventory", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const inventory2 = await storage.getInventory();
      const csvData = [
        ["ID", "Nombre", "Descripci\xF3n", "Cantidad", "Precio", "Proveedor", "Categor\xEDa"].join(","),
        ...inventory2.map((item) => [
          item.id,
          item.name,
          item.description || "",
          item.quantity,
          item.price,
          item.supplier || "",
          item.category || ""
        ].join(","))
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="inventario.csv"');
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ message: "Error al exportar inventario" });
    }
  });
  app2.post("/api/export/invoices", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const invoices2 = await storage.getInvoices();
      const csvData = [
        ["N\xFAmero", "Cliente", "Tel\xE9fono", "RTN", "Subtotal", "Impuesto", "Total", "Estado", "Fecha"].join(","),
        ...invoices2.map((invoice) => [
          invoice.number,
          invoice.customerName,
          invoice.customerPhone || "",
          invoice.customerTaxId || "",
          invoice.subtotal,
          invoice.tax,
          invoice.total,
          invoice.status,
          invoice.date
        ].join(","))
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="facturas.csv"');
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ message: "Error al exportar facturas" });
    }
  });
  app2.post("/api/export/reports", async (req, res) => {
    try {
      const { password, startDate, endDate } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const reportData = await storage.getReportData(startDate, endDate);
      const appointments2 = await storage.getAppointments();
      const csvData = [
        ["Fecha", "Cliente", "Servicio", "Precio", "Estado"].join(","),
        ...appointments2.filter((a) => a.date >= startDate && a.date <= endDate).map((appointment) => [
          appointment.date,
          appointment.customerName,
          appointment.serviceName,
          appointment.servicePrice,
          appointment.status
        ].join(","))
      ].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="reporte.csv"');
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ message: "Error al exportar reporte" });
    }
  });
  app2.get("/api/crm/customers", async (req, res) => {
    try {
      const { query } = req.query;
      let customers2;
      if (query && typeof query === "string") {
        customers2 = await storage.searchCustomers(query);
      } else {
        customers2 = await storage.getCustomers();
      }
      res.json(customers2);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener clientes" });
    }
  });
  app2.get("/api/crm/customers/top", async (req, res) => {
    try {
      const { limit } = req.query;
      const customers2 = await storage.getTopCustomers(limit ? parseInt(limit) : 10);
      res.json(customers2);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener mejores clientes" });
    }
  });
  app2.get("/api/crm/promotions", async (req, res) => {
    try {
      const promotions2 = await storage.getPromotions();
      res.json(promotions2);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener promociones" });
    }
  });
  app2.post("/api/crm/promotions", async (req, res) => {
    try {
      const { password, ...promotionData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const validatedData = {
        title: promotionData.title,
        message: promotionData.message,
        discount: promotionData.discount ? promotionData.discount.toString() : null,
        validFrom: new Date(promotionData.validFrom),
        validUntil: new Date(promotionData.validUntil),
        active: promotionData.active !== false
      };
      const promotion = await storage.createPromotion(validatedData);
      res.json(promotion);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al crear promoci\xF3n" });
    }
  });
  app2.post("/api/crm/promotions/:id/send", async (req, res) => {
    try {
      const { password, sendToAll, customerIds } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contrase\xF1a incorrecta" });
      }
      const promotionId = parseInt(req.params.id);
      let sends = [];
      if (sendToAll) {
        sends = await storage.sendPromotionToAllCustomers(promotionId);
      } else if (customerIds && Array.isArray(customerIds)) {
        for (const customerId of customerIds) {
          const send = await storage.sendPromotionToCustomer(promotionId, customerId);
          sends.push(send);
        }
      }
      res.json({
        success: true,
        sentCount: sends.length,
        sends,
        // Incluir enlaces de WhatsApp
        message: `Promoci\xF3n con plantilla autom\xE1tica enviada a ${sends.length} clientes`
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al enviar promoci\xF3n" });
    }
  });
  app2.get("/api/crm/promotions/:id/sends", async (req, res) => {
    try {
      const promotionId = parseInt(req.params.id);
      const sends = await storage.getPromotionSends(promotionId);
      res.json(sends);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener env\xEDos de promoci\xF3n" });
    }
  });
  app2.post("/api/whatsapp/send", async (req, res) => {
    try {
      const { phone, message } = req.body;
      if (!phone || !message) {
        return res.status(400).json({ message: "Tel\xE9fono y mensaje son requeridos" });
      }
      const cleanPhone = phone.replace(/[^\d]/g, "");
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
      res.json({
        success: true,
        whatsappUrl,
        message: "Enlace de WhatsApp generado exitosamente"
      });
    } catch (error) {
      res.status(400).json({ message: "Error al generar enlace de WhatsApp" });
    }
  });
  app2.post("/api/admin/validate", async (req, res) => {
    try {
      const { password } = passwordSchema.parse(req.body);
      if (password === ADMIN_PASSWORD) {
        res.json({ valid: true });
      } else {
        res.status(401).json({ valid: false, message: "Contrase\xF1a incorrecta" });
      }
    } catch (error) {
      res.status(400).json({ valid: false, message: "Datos inv\xE1lidos" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs3 from "fs";
import path5 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path4 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path4.resolve(import.meta.dirname, "client", "src"),
      "@shared": path4.resolve(import.meta.dirname, "shared"),
      "@assets": path4.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path4.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path4.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path5.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path5.resolve(import.meta.dirname, "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path5.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
