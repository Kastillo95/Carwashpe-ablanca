import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(), // SQLite no tiene decimal nativo
  duration: integer("duration").notNull(), // in minutes
  active: integer("active", { mode: 'boolean' }).default(true),
});

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  taxId: text("tax_id"), // RTN or ID number
  address: text("address"),
  notes: text("notes"),
  totalSpent: text("total_spent").default("0.00"),
  lastVisit: text("last_visit"), // SQLite almacena como texto
  createdAt: text("created_at").default("datetime('now')"),
  active: integer("active", { mode: 'boolean' }).default(true),
});

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id),
  serviceId: integer("service_id").references(() => services.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  serviceName: text("service_name").notNull(),
  servicePrice: text("service_price").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  status: text("status").default("scheduled"), // scheduled, completed, cancelled
  createdAt: text("created_at").default("datetime('now')"),
});

export const inventory = sqliteTable("inventory", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  barcode: text("barcode").unique(),
  quantity: integer("quantity").default(0), // Null para servicios
  minQuantity: integer("min_quantity"), // Null para servicios  
  price: text("price").notNull(),
  supplier: text("supplier"),
  category: text("category"),
  imageUrl: text("image_url"), // URL de la imagen del producto
  isService: integer("is_service", { mode: 'boolean' }).default(false), // True para servicios como lavados
  active: integer("active", { mode: 'boolean' }).default(true),
});

export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: text("number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerTaxId: text("customer_tax_id"),
  subtotal: text("subtotal").notNull(),
  tax: text("tax").notNull(),
  total: text("total").notNull(),
  status: text("status").default("pending"), // pending, paid, cancelled
  date: text("date").notNull(),
  createdAt: text("created_at").default("datetime('now')"),
});

export const invoiceItems = sqliteTable("invoice_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  serviceName: text("service_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: text("unit_price").notNull(),
  total: text("total").notNull(),
});

export const promotions = sqliteTable("promotions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  discount: text("discount"),
  validFrom: text("valid_from").notNull(),
  validUntil: text("valid_until").notNull(),
  active: integer("active", { mode: 'boolean' }).default(true),
  createdAt: text("created_at").default("datetime('now')"),
});

export const promotionSends = sqliteTable("promotion_sends", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  promotionId: integer("promotion_id").references(() => promotions.id),
  customerId: integer("customer_id").references(() => customers.id),
  sentAt: text("sent_at").default("datetime('now')"),
  status: text("status").default("sent"), // sent, delivered, failed
});

// Insert schemas
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ 
  id: true, 
  customerId: true, 
  serviceId: true,
  createdAt: true 
});
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, barcode: true }).extend({
  quantity: z.number().min(0).optional().nullable(),
  minQuantity: z.number().min(0).optional().nullable(),
  barcode: z.string().nullable().optional(), // Se genera automáticamente si no se proporciona
  isService: z.boolean().optional(),
  description: z.string().nullable().optional(),
  supplier: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(), // URL de la imagen del producto
  price: z.union([z.string(), z.number()]).transform(val => String(val)), // Acepta número o string
});
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ 
  id: true, 
  customerId: true, 
  createdAt: true 
});
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ 
  id: true, 
  invoiceId: true 
});
export const insertPromotionSchema = createInsertSchema(promotions).omit({ 
  id: true, 
  createdAt: true 
});
export const insertPromotionSendSchema = createInsertSchema(promotionSends).omit({ 
  id: true, 
  sentAt: true 
});

// Types
export type Service = typeof services.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type PromotionSend = typeof promotionSends.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type InsertPromotionSend = z.infer<typeof insertPromotionSendSchema>;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

// Extended types for business logic
export type CreateInvoiceData = {
  customer: {
    name: string;
    phone?: string;
    taxId?: string;
  };
  items: {
    serviceName: string;
    quantity: number;
    unitPrice: number;
  }[];
  date: string;
};

export type DashboardStats = {
  todayAppointments: number;
  dailyRevenue: number;
  lowStockItems: number;
  servedCustomers: number;
};

export type ReportData = {
  totalRevenue: number;
  totalServices: number;
  totalCustomers: number;
  topService: string;
  period: string;
};
