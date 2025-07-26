import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, insertInventorySchema, insertServiceSchema } from "@shared/schema";
import { z } from "zod";

const ADMIN_PASSWORD = "742211010338";

// Validation schemas
const createInvoiceSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    taxId: z.string().optional(),
  }),
  items: z.array(z.object({
    serviceName: z.string().min(1),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })).min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const passwordSchema = z.object({
  password: z.string(),
});

// Middleware to validate admin password
function validateAdmin(req: any, res: any, next: any) {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener estadísticas del dashboard" });
    }
  });

  // Services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener servicios" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const { password, ...serviceData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const validatedData = insertServiceSchema.parse(serviceData);
      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al crear servicio" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const { password, ...serviceData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const id = parseInt(req.params.id);
      const service = await storage.updateService(id, serviceData);
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar servicio" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.json({ message: "Servicio eliminado" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al eliminar servicio" });
    }
  });

  // Appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      const { date } = req.query;
      let appointments;
      
      if (date) {
        appointments = await storage.getAppointmentsByDate(date as string);
      } else {
        appointments = await storage.getAppointments();
      }
      
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener citas" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al crear cita" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const { password, ...appointmentData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const id = parseInt(req.params.id);
      const appointment = await storage.updateAppointment(id, appointmentData);
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar cita" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteAppointment(id);
      res.json({ message: "Cita eliminada" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al eliminar cita" });
    }
  });

  // Inventory
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener inventario" });
    }
  });

  app.get("/api/inventory/barcode/:barcode", async (req, res) => {
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

  app.post("/api/inventory", async (req, res) => {
    try {
      const { password, ...itemData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      // Generar código automático si es un servicio y no tiene barcode
      if (itemData.isService && !itemData.barcode) {
        const nextServiceNumber = await storage.getNextServiceNumber();
        itemData.barcode = nextServiceNumber.toString().padStart(4, '0');
      }
      
      const validatedData = insertInventorySchema.parse(itemData);
      const item = await storage.createInventoryItem(validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al crear producto" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const { password, ...itemData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const id = parseInt(req.params.id);
      const item = await storage.updateInventoryItem(id, itemData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar producto" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteInventoryItem(id);
      res.json({ message: "Producto eliminado" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al eliminar producto" });
    }
  });

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener facturas" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
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

  app.post("/api/invoices", async (req, res) => {
    try {
      // Remove password validation for quick invoicing (users can create invoices)
      const result = await storage.createInvoice(req.body);
      res.json(result);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al crear factura" });
    }
  });

  app.put("/api/invoices/:id/status", async (req, res) => {
    try {
      const { password, status } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const id = parseInt(req.params.id);
      const invoice = await storage.updateInvoiceStatus(id, status);
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al actualizar estado de factura" });
    }
  });

  // Reports
  app.get("/api/reports", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Se requieren fechas de inicio y fin" });
      }
      
      const reportData = await storage.getReportData(startDate as string, endDate as string);
      res.json(reportData);
    } catch (error) {
      res.status(500).json({ message: "Error al generar reporte" });
    }
  });

  // Export endpoints (password protected)
  app.post("/api/export/inventory", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const inventory = await storage.getInventory();
      
      // Simple CSV export for now (can be enhanced with Excel library)
      const csvData = [
        ['ID', 'Nombre', 'Descripción', 'Cantidad', 'Precio', 'Proveedor', 'Categoría'].join(','),
        ...inventory.map(item => [
          item.id,
          item.name,
          item.description || '',
          item.quantity,
          item.price,
          item.supplier || '',
          item.category || ''
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="inventario.csv"');
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ message: "Error al exportar inventario" });
    }
  });

  app.post("/api/export/invoices", async (req, res) => {
    try {
      const { password } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const invoices = await storage.getInvoices();
      
      const csvData = [
        ['Número', 'Cliente', 'Teléfono', 'RTN', 'Subtotal', 'Impuesto', 'Total', 'Estado', 'Fecha'].join(','),
        ...invoices.map(invoice => [
          invoice.number,
          invoice.customerName,
          invoice.customerPhone || '',
          invoice.customerTaxId || '',
          invoice.subtotal,
          invoice.tax,
          invoice.total,
          invoice.status,
          invoice.date
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="facturas.csv"');
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ message: "Error al exportar facturas" });
    }
  });

  app.post("/api/export/reports", async (req, res) => {
    try {
      const { password, startDate, endDate } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      const reportData = await storage.getReportData(startDate, endDate);
      const appointments = await storage.getAppointments();
      
      const csvData = [
        ['Fecha', 'Cliente', 'Servicio', 'Precio', 'Estado'].join(','),
        ...appointments
          .filter(a => a.date >= startDate && a.date <= endDate)
          .map(appointment => [
            appointment.date,
            appointment.customerName,
            appointment.serviceName,
            appointment.servicePrice,
            appointment.status
          ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte.csv"');
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ message: "Error al exportar reporte" });
    }
  });

  // CRM - Customers Enhanced
  app.get("/api/crm/customers", async (req, res) => {
    try {
      const { query } = req.query;
      let customers;
      
      if (query && typeof query === 'string') {
        customers = await storage.searchCustomers(query);
      } else {
        customers = await storage.getCustomers();
      }
      
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener clientes" });
    }
  });

  app.get("/api/crm/customers/top", async (req, res) => {
    try {
      const { limit } = req.query;
      const customers = await storage.getTopCustomers(limit ? parseInt(limit as string) : 10);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener mejores clientes" });
    }
  });

  // CRM - Promotions
  app.get("/api/crm/promotions", async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener promociones" });
    }
  });

  app.post("/api/crm/promotions", async (req, res) => {
    try {
      const { password, ...promotionData } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
      
      // Validar datos de promoción
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
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al crear promoción" });
    }
  });

  app.post("/api/crm/promotions/:id/send", async (req, res) => {
    try {
      const { password, sendToAll, customerIds } = req.body;
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
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
        message: `Promoción enviada a ${sends.length} clientes`
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Error al enviar promoción" });
    }
  });

  app.get("/api/crm/promotions/:id/sends", async (req, res) => {
    try {
      const promotionId = parseInt(req.params.id);
      const sends = await storage.getPromotionSends(promotionId);
      res.json(sends);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener envíos de promoción" });
    }
  });

  // WhatsApp Integration
  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      const { phone, message } = req.body;
      
      if (!phone || !message) {
        return res.status(400).json({ message: "Teléfono y mensaje son requeridos" });
      }
      
      // Crear enlace de WhatsApp
      const cleanPhone = phone.replace(/[^\d]/g, '');
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

  // Admin validation endpoint
  app.post("/api/admin/validate", async (req, res) => {
    try {
      const { password } = passwordSchema.parse(req.body);
      if (password === ADMIN_PASSWORD) {
        res.json({ valid: true });
      } else {
        res.status(401).json({ valid: false, message: "Contraseña incorrecta" });
      }
    } catch (error) {
      res.status(400).json({ valid: false, message: "Datos inválidos" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
