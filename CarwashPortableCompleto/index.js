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
  appointmentsRelations: () => appointmentsRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
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
  invoiceItemsRelations: () => invoiceItemsRelations,
  invoices: () => invoices,
  invoicesRelations: () => invoicesRelations,
  promotionSends: () => promotionSends,
  promotionSendsRelations: () => promotionSendsRelations,
  promotions: () => promotions,
  promotionsRelations: () => promotionsRelations,
  services: () => services,
  servicesRelations: () => servicesRelations
});
import { pgTable, text, integer, decimal, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  // in minutes
  active: boolean("active").default(true)
});
var customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  taxId: text("tax_id"),
  // RTN or ID number
  address: text("address"),
  notes: text("notes"),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0.00"),
  lastVisit: timestamp("last_visit"),
  createdAt: timestamp("created_at").defaultNow(),
  active: boolean("active").default(true)
});
var appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  serviceId: integer("service_id").references(() => services.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  serviceName: text("service_name").notNull(),
  servicePrice: decimal("service_price", { precision: 10, scale: 2 }).notNull(),
  date: text("date").notNull(),
  // YYYY-MM-DD format
  time: text("time").notNull(),
  // HH:MM format
  status: text("status").default("scheduled"),
  // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow()
});
var inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  barcode: text("barcode").unique(),
  quantity: integer("quantity").default(0),
  // Null para servicios
  minQuantity: integer("min_quantity"),
  // Null para servicios  
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  supplier: text("supplier"),
  category: text("category"),
  imageUrl: text("image_url"),
  // URL de la imagen del producto
  isService: boolean("is_service").default(false),
  // True para servicios como lavados
  active: boolean("active").default(true)
});
var invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerTaxId: text("customer_tax_id"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  // pending, paid, cancelled
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  serviceName: text("service_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull()
});
var promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  discount: text("discount"),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var promotionSends = pgTable("promotion_sends", {
  id: serial("id").primaryKey(),
  promotionId: integer("promotion_id").references(() => promotions.id),
  customerId: integer("customer_id").references(() => customers.id),
  sentAt: timestamp("sent_at").defaultNow(),
  status: text("status").default("sent")
  // sent, delivered, failed
});
var customersRelations = relations(customers, ({ many }) => ({
  appointments: many(appointments),
  invoices: many(invoices),
  promotionSends: many(promotionSends)
}));
var servicesRelations = relations(services, ({ many }) => ({
  appointments: many(appointments)
}));
var appointmentsRelations = relations(appointments, ({ one }) => ({
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id]
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id]
  })
}));
var invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id]
  }),
  items: many(invoiceItems)
}));
var invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id]
  })
}));
var promotionsRelations = relations(promotions, ({ many }) => ({
  sends: many(promotionSends)
}));
var promotionSendsRelations = relations(promotionSends, ({ one }) => ({
  promotion: one(promotions, {
    fields: [promotionSends.promotionId],
    references: [promotions.id]
  }),
  customer: one(customers, {
    fields: [promotionSends.customerId],
    references: [customers.id]
  })
}));
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
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
var DatabaseStorage = class {
  async getNextServiceNumber() {
    const allServices = await db.select().from(services);
    return allServices.length + 1;
  }
  // Services
  async getServices() {
    return await db.select().from(services).where(eq(services.active, true));
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
    return updated;
  }
  async deleteService(id) {
    await db.delete(services).where(eq(services.id, id));
  }
  // Customers
  async getCustomers() {
    return await db.select().from(customers);
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
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }
  async updateCustomer(id, customer) {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated;
  }
  async searchCustomers(query) {
    return await db.select().from(customers).where(
      sql`${customers.name} ILIKE ${`%${query}%`} OR 
          ${customers.phone} ILIKE ${`%${query}%`} OR 
          ${customers.email} ILIKE ${`%${query}%`}`
    );
  }
  async getTopCustomers(limit = 10) {
    return await db.select().from(customers).orderBy(desc(customers.totalSpent)).limit(limit);
  }
  async updateCustomerSpent(customerId, amount) {
    await db.update(customers).set({
      totalSpent: sql`${customers.totalSpent} + ${amount.toString()}`
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
    const [item] = await db.select().from(inventory).where(
      and(eq(inventory.barcode, barcode), eq(inventory.active, true))
    );
    return item || void 0;
  }
  async createInventoryItem(item) {
    const [newItem] = await db.insert(inventory).values(item).returning();
    return newItem;
  }
  async updateInventoryItem(id, item) {
    const [updated] = await db.update(inventory).set(item).where(eq(inventory.id, id)).returning();
    return updated;
  }
  async deleteInventoryItem(id) {
    await db.delete(inventory).where(eq(inventory.id, id));
  }
  async reduceStock(id, quantity) {
    const [updated] = await db.update(inventory).set({
      quantity: sql`${inventory.quantity} - ${quantity}`
    }).where(eq(inventory.id, id)).returning();
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
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return void 0;
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    return { invoice, items };
  }
  async createInvoice(data) {
    const invoiceNumber = await this.getNextInvoiceNumber();
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;
    const [invoice] = await db.insert(invoices).values({
      number: invoiceNumber,
      customerName: data.customer.name,
      customerPhone: data.customer.phone || null,
      customerTaxId: data.customer.taxId || null,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      date: data.date,
      status: "pending"
    }).returning();
    const items = await Promise.all(
      data.items.map(
        (item) => db.insert(invoiceItems).values({
          invoiceId: invoice.id,
          serviceName: item.serviceName,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          total: (item.quantity * item.unitPrice).toFixed(2)
        }).returning().then((result) => result[0])
      )
    );
    return { invoice, items };
  }
  async updateInvoiceStatus(id, status) {
    const [updated] = await db.update(invoices).set({ status }).where(eq(invoices.id, id)).returning();
    return updated;
  }
  async getNextInvoiceNumber() {
    const lastInvoice = await db.select().from(invoices).orderBy(desc(invoices.id)).limit(1);
    const nextNumber = lastInvoice.length > 0 ? parseInt(lastInvoice[0].number.replace(/\D/g, "")) + 1 : 1;
    return `INV-${nextNumber.toString().padStart(6, "0")}`;
  }
  // Reports
  async getDashboardStats() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const [todayAppointmentsResult] = await db.select({ count: sql`count(*)` }).from(appointments).where(eq(appointments.date, today));
    const [dailyRevenueResult] = await db.select({ total: sql`sum(${invoices.total}::numeric)` }).from(invoices).where(and(eq(invoices.date, today), eq(invoices.status, "paid")));
    const [lowStockItemsResult] = await db.select({ count: sql`count(*)` }).from(inventory).where(sql`${inventory.quantity} <= ${inventory.minQuantity} AND ${inventory.active} = true`);
    const [servedCustomersResult] = await db.select({ count: sql`count(distinct ${appointments.customerName})` }).from(appointments).where(eq(appointments.date, today));
    return {
      todayAppointments: todayAppointmentsResult?.count || 0,
      dailyRevenue: dailyRevenueResult?.total || 0,
      lowStockItems: lowStockItemsResult?.count || 0,
      servedCustomers: servedCustomersResult?.count || 0
    };
  }
  async getReportData(startDate, endDate) {
    const [revenueResult] = await db.select({ total: sql`sum(${invoices.total}::numeric)` }).from(invoices).where(and(
      gte(invoices.date, startDate),
      lte(invoices.date, endDate),
      eq(invoices.status, "paid")
    ));
    const [servicesResult] = await db.select({ count: sql`count(*)` }).from(appointments).where(and(
      gte(appointments.date, startDate),
      lte(appointments.date, endDate)
    ));
    const [customersResult] = await db.select({ count: sql`count(distinct ${appointments.customerName})` }).from(appointments).where(and(
      gte(appointments.date, startDate),
      lte(appointments.date, endDate)
    ));
    const [topServiceResult] = await db.select({
      serviceName: appointments.serviceName,
      count: sql`count(*)`
    }).from(appointments).where(and(
      gte(appointments.date, startDate),
      lte(appointments.date, endDate)
    )).groupBy(appointments.serviceName).orderBy(desc(sql`count(*)`)).limit(1);
    return {
      totalRevenue: revenueResult?.total || 0,
      totalServices: servicesResult?.count || 0,
      totalCustomers: customersResult?.count || 0,
      topService: topServiceResult[0]?.serviceName || "N/A",
      period: `${startDate} - ${endDate}`
    };
  }
  // Promotions
  async getPromotions() {
    return await db.select().from(promotions);
  }
  async getPromotion(id) {
    const [promotion] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promotion || void 0;
  }
  async createPromotion(promotion) {
    const [newPromotion] = await db.insert(promotions).values(promotion).returning();
    return newPromotion;
  }
  async updatePromotion(id, promotion) {
    const [updated] = await db.update(promotions).set(promotion).where(eq(promotions.id, id)).returning();
    return updated;
  }
  async deletePromotion(id) {
    await db.delete(promotions).where(eq(promotions.id, id));
  }
  async getActivePromotions() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(promotions).where(
      and(
        eq(promotions.active, true),
        lte(promotions.validFrom, now),
        gte(promotions.validUntil, now)
      )
    );
  }
  // Promotion Sends
  async sendPromotionToCustomer(promotionId, customerId) {
    const [send] = await db.insert(promotionSends).values({
      promotionId,
      customerId,
      status: "sent"
    }).returning();
    return send;
  }
  async sendPromotionToAllCustomers(promotionId) {
    const allCustomers = await this.getCustomers();
    const sends = await Promise.all(
      allCustomers.map(
        (customer) => db.insert(promotionSends).values({
          promotionId,
          customerId: customer.id,
          status: "sent"
        }).returning().then((result) => result[0])
      )
    );
    return sends;
  }
  async getPromotionSends(promotionId) {
    return await db.select().from(promotionSends).where(eq(promotionSends.promotionId, promotionId));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";

// server/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
var uploadsDir = path.join(process.cwd(), "uploads", "products");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
var storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
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
import path2 from "path";
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
  app2.use("/uploads", express.static(path2.join(process.cwd(), "uploads")));
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
import fs2 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
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
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist/public"),
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
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
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
  const distPath = path4.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
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
