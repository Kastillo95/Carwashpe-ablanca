import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { 
  FileText, 
  Eye, 
  Printer,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Invoice } from "@shared/schema";

export default function Billing() {
  const { isAdminMode } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    enabled: isAdminMode,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "paid":
        return <Badge variant="default" className="bg-green-500">Pagado</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    // Open invoice details in a new window
    const invoiceWindow = window.open('', '_blank', 'width=800,height=600');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Factura ${invoice.number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .invoice-info { margin: 20px 0; }
              .amount { font-size: 18px; font-weight: bold; color: #2563eb; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>CARWASH PEÑA BLANCA</h1>
              <h2>Factura ${invoice.number}</h2>
            </div>
            <div class="invoice-info">
              <p><strong>Cliente:</strong> ${invoice.customerName}</p>
              <p><strong>Fecha:</strong> ${formatDate(invoice.date)}</p>
              <p><strong>Total:</strong> <span class="amount">${formatCurrency(invoice.total)}</span></p>
              <p><strong>Estado:</strong> ${invoice.status === 'paid' ? 'Pagado' : 'Pendiente'}</p>
            </div>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Factura ${invoice.number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .invoice-info { margin: 20px 0; }
              .amount { font-size: 18px; font-weight: bold; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>CARWASH PEÑA BLANCA</h1>
              <p>Peña Blanca, Cortés - WhatsApp: 94648987</p>
              <h2>Factura ${invoice.number}</h2>
            </div>
            <div class="invoice-info">
              <p><strong>Cliente:</strong> ${invoice.customerName}</p>
              <p><strong>Fecha:</strong> ${formatDate(invoice.date)}</p>
              <p><strong>Total:</strong> <span class="amount">${formatCurrency(invoice.total)}</span></p>
              <p><strong>Estado:</strong> ${invoice.status === 'paid' ? 'Pagado' : 'Pendiente'}</p>
            </div>
            <div class="no-print">
              <button onclick="window.print()">Imprimir</button>
              <button onclick="window.close()">Cerrar</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  // Redirect non-admin users
  if (!isAdminMode) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Facturación</h2>
          <p className="text-gray-600">Acceso restringido a administradores</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Acceso Restringido
              </h3>
              <p className="text-gray-600">
                Necesitas permisos de administrador para acceder a la facturación.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sistema de Facturación</h2>
          <p className="text-gray-600">Generación y gestión de facturas</p>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nueva Factura</h2>
            <p className="text-gray-600">Genera una nueva factura para un cliente</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowForm(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        <InvoiceForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sistema de Facturación</h2>
          <p className="text-gray-600">Generación y gestión de facturas</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-brand-blue hover:bg-blue-800"
        >
          <FileText className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No hay facturas registradas
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primera factura.
              </p>
              <Button onClick={() => setShowForm(true)} className="bg-brand-blue hover:bg-blue-800">
                <FileText className="w-4 h-4 mr-2" />
                Crear Primera Factura
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Número</th>
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-left py-2">Fecha</th>
                    <th className="text-left py-2">Total</th>
                    <th className="text-left py-2">Estado</th>
                    <th className="text-left py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices?.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{invoice.number}</td>
                      <td className="py-3">{invoice.customerName}</td>
                      <td className="py-3">{formatDate(invoice.date)}</td>
                      <td className="py-3">{formatCurrency(parseFloat(invoice.total))}</td>
                      <td className="py-3">{getStatusBadge(invoice.status)}</td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintInvoice(invoice)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
