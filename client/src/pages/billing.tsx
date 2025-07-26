import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnhancedInvoiceForm } from "@/components/forms/enhanced-invoice-form";
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
      const response = await fetch(`/api/invoices/${invoice.id}`);
      const data = await response.json();
      console.log("Invoice response:", data);
      setSelectedInvoice(data);
      setShowReceiptDialog(true);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar los detalles de la factura",
        variant: "destructive",
      });
    }
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`);
      const invoiceWithItems = await response.json();
      setSelectedInvoice(invoiceWithItems);
      setShowReceiptDialog(true);
      
      // Small delay to ensure the dialog is rendered
      setTimeout(() => {
        if (receiptRef.current) {
          const printWindow = window.open('', '_blank', 'width=400,height=600');
          if (printWindow) {
            const invoiceNumber = (invoice as any).number || (invoice as any).invoiceNumber || 'N/A';
            printWindow.document.write(`
              <html>
                <head>
                  <title>Factura ${invoiceNumber}</title>
                  <style>
                    * { box-sizing: border-box; }
                    body { 
                      margin: 0; padding: 15px; font-family: 'Courier New', monospace;
                      font-size: 12px; line-height: 1.2; background: white; color: black;
                    }
                    .thermal-receipt { 
                      width: 80mm; margin: 0 auto; background: white; color: black;
                      font-family: 'Courier New', monospace; font-size: 12px; padding: 10px;
                    }
                    .thermal-receipt img {
                      max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 8px;
                    }
                    .no-print { display: none !important; }
                    .text-center { text-align: center; }
                    .text-xs { font-size: 10px; } .text-sm { font-size: 11px; }
                    .font-bold { font-weight: bold; } .font-semibold { font-weight: 600; }
                    .uppercase { text-transform: uppercase; }
                    .border-t { border-top: 1px solid #000; }
                    .border-dashed { border-style: dashed; }
                    .border-solid { border-style: solid; }
                    .border-gray-400 { border-color: #666; }
                    .text-gray-600 { color: #666; }
                    .mb-1 { margin-bottom: 4px; } .mb-2 { margin-bottom: 8px; }
                    .mb-3 { margin-bottom: 12px; } .mb-4 { margin-bottom: 16px; }
                    .my-1 { margin-top: 4px; margin-bottom: 4px; }
                    .my-2 { margin-top: 8px; margin-bottom: 8px; }
                    .flex { display: flex; } .justify-between { justify-content: space-between; }
                    .flex-1 { flex: 1; } .pr-1 { padding-right: 4px; }
                    .w-12 { width: 48px; } .text-right { text-align: right; }
                    .w-20 { width: 80px; } .h-16 { height: 64px; }
                    .overflow-hidden { overflow: hidden; }
                    .rounded-lg { border-radius: 8px; } .object-cover { object-fit: cover; }
                    @media print {
                      body { margin: 0; padding: 0; }
                      .thermal-receipt { width: 100%; margin: 0; padding: 5px; }
                      img { max-width: 100% !important; height: auto !important; 
                            print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    }
                    @page { size: 80mm auto; margin: 0; }
                  </style>
                </head>
                <body>
                  ${receiptRef.current.innerHTML}
                  <script>
                    window.onload = function() {
                      const images = document.querySelectorAll('img');
                      let loadedImages = 0;
                      
                      if (images.length === 0) {
                        printAndClose();
                      } else {
                        images.forEach(img => {
                          if (img.complete) {
                            loadedImages++;
                            if (loadedImages === images.length) printAndClose();
                          } else {
                            img.onload = img.onerror = () => {
                              loadedImages++;
                              if (loadedImages === images.length) printAndClose();
                            };
                          }
                        });
                      }
                      
                      function printAndClose() {
                        setTimeout(() => {
                          window.print();
                          setTimeout(() => window.close(), 1000);
                        }, 500);
                      }
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
      console.error("Print error:", error);
      toast({
        title: "Error",
        description: "No se pudo imprimir la factura",
        variant: "destructive",
      });
    }
  };

  // Non-admin users can create and view invoices but can't edit them
  if (!isAdminMode) {
    if (showForm) {
      return (
        <div className="space-y-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Nueva Factura</h2>
              <p className="text-gray-600">Crear nueva factura con vista previa en tiempo real</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Volver a Lista
            </Button>
          </div>
          
          <EnhancedInvoiceForm />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Facturas</h2>
            <p className="text-gray-600">Ver facturas creadas</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Nueva Factura
          </Button>
        </div>

        {/* Invoice List for Non-Admin (Read-Only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Lista de Facturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Número</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices?.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{invoice.number}</td>
                      <td className="p-2">{invoice.customerName}</td>
                      <td className="p-2">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="p-2 font-semibold">L. {parseFloat(invoice.total).toFixed(2)}</td>
                      <td className="p-2">
                        <Badge 
                          variant={invoice.status === "paid" ? "default" : "secondary"}
                        >
                          {invoice.status === "paid" ? "Pagada" : "Pendiente"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        <EnhancedInvoiceForm />
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
        <DialogContent className="max-w-md" aria-describedby="invoice-preview-description">
          <DialogHeader>
            <DialogTitle>Vista Previa de Factura</DialogTitle>
          </DialogHeader>
          <div id="invoice-preview-description" className="sr-only">
            Vista previa de la factura con opciones para imprimir o cerrar
          </div>
          {selectedInvoice?.invoice ? (
            <div className="space-y-4">
              <ThermalReceipt
                ref={receiptRef}
                invoice={selectedInvoice.invoice}
                items={selectedInvoice.items || []}
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
          ) : (
            <div className="p-4 text-center">
              <p>Cargando factura...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
