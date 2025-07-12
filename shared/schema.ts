import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  active: boolean("active").default(true),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  taxId: text("tax_id"), // RTN or ID number
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  serviceId: integer("service_id").references(() => services.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  serviceName: text("service_name").notNull(),
  servicePrice: decimal("service_price", { precision: 10, scale: 2 }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  status: text("status").default("scheduled"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  barcode: text("barcode").unique(),
  quantity: integer("quantity").default(0), // Null para servicios
  minQuantity: integer("min_quantity"), // Null para servicios  
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  supplier: text("supplier"),
  category: text("category"),
  isService: boolean("is_service").default(false), // True para servicios como lavados
  active: boolean("active").default(true),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerTaxId: text("customer_tax_id"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"), // pending, paid, cancelled
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  serviceName: text("service_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
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

// Types
export type Service = typeof services.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
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
