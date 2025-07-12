import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { ThermalReceipt } from "@/components/ui/thermal-receipt";
import { 
  FileText, 
  Eye, 
  Printer,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Invoice, InvoiceItem } from "@shared/schema";

export default function Billing() {
  const { isAdminMode } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{ invoice: Invoice; items: InvoiceItem[] } | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

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

  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      const invoiceWithItems = await apiRequest("GET", `/api/invoices/${invoice.id}`);
      setSelectedInvoice(invoiceWithItems);
      setShowReceiptDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar los detalles de la factura",
        variant: "destructive",
      });
    }
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      const invoiceWithItems = await apiRequest("GET", `/api/invoices/${invoice.id}`);
      setSelectedInvoice(invoiceWithItems);
      setShowReceiptDialog(true);
      
      // Small delay to ensure the dialog is rendered
      setTimeout(() => {
        if (receiptRef.current) {
          const printWindow = window.open('', '_blank', 'width=400,height=600');
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>Factura ${invoice.invoiceNumber}</title>
                  <style>
                    body { margin: 0; padding: 0; }
                    .thermal-receipt { margin: 0 auto; }
                    @media print {
                      body { margin: 0; }
                      .no-print { display: none; }
                    }
                  </style>
                </head>
                <body>
                  ${receiptRef.current.innerHTML}
                  <script>
                    window.onload = function() {
                      window.print();
                      window.close();
                    };
                  </script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
        }
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo imprimir la factura",
        variant: "destructive",
      });
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
                      <td className="py-3 font-medium">{(invoice as any).number || (invoice as any).invoiceNumber}</td>
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

      {/* Thermal Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista Previa de Factura</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <ThermalReceipt
                ref={receiptRef}
                invoice={selectedInvoice.invoice}
                items={selectedInvoice.items}
              />
              <div className="flex gap-2 no-print">
                <Button
                  onClick={() => {
                    if (receiptRef.current) {
                      const printWindow = window.open('', '_blank', 'width=400,height=600');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Factura ${(selectedInvoice.invoice as any).number || (selectedInvoice.invoice as any).invoiceNumber}</title>
                              <style>
                                body { margin: 0; padding: 0; }
                                .thermal-receipt { margin: 0 auto; }
                                @media print {
                                  body { margin: 0; }
                                  .no-print { display: none; }
                                }
                              </style>
                            </head>
                            <body>
                              ${receiptRef.current.innerHTML}
                              <script>
                                window.onload = function() {
                                  window.print();
                                  window.close();
                                };
                              </script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }
                  }}
                  className="flex-1"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReceiptDialog(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
