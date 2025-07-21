import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, Eye, Printer, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { SERVICES, ADMIN_PASSWORD } from "@/lib/constants";
import { getTodayDate, formatCurrency, calculateInvoiceTotals } from "@/lib/utils";
import { ThermalReceipt } from "@/components/ui/thermal-receipt";
import { type Invoice, type InvoiceItem } from "@shared/schema";

const invoiceSchema = z.object({
  customerName: z.string().min(1, "El nombre es requerido"),
  customerPhone: z.string().optional(),
  customerTaxId: z.string().optional(),
  date: z.string().min(1, "La fecha es requerida"),
  items: z.array(z.object({
    serviceName: z.string().min(1, "El servicio es requerido"),
    quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
    unitPrice: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  })).min(1, "Debe agregar al menos un servicio"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export function InvoiceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<{ invoice: Invoice; items: InvoiceItem[] } | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerTaxId: "",
      date: getTodayDate(),
      items: [{ serviceName: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const watchedItems = form.watch("items");
  const totals = calculateInvoiceTotals(watchedItems);

  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [...currentItems, { serviceName: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue("items", currentItems.filter((_, i) => i !== index));
    }
  };

  const handleServiceChange = (index: number, serviceKey: string) => {
    const service = SERVICES[serviceKey as keyof typeof SERVICES];
    if (service) {
      const currentItems = form.getValues("items");
      currentItems[index].serviceName = service.name;
      currentItems[index].unitPrice = service.price;
      form.setValue("items", currentItems);
    }
  };

  const handleSubmit = async (data: InvoiceFormData, action: 'save' | 'print' = 'save') => {
    setIsLoading(true);
    
    try {
      const invoiceData = {
        customer: {
          name: data.customerName,
          phone: data.customerPhone,
          taxId: data.customerTaxId,
        },
        items: data.items,
        date: data.date,
        password: ADMIN_PASSWORD,
      };

      const response = await apiRequest("POST", "/api/invoices", invoiceData);
      
      // The response already contains the complete invoice data
      setLastCreatedInvoice(response);
      
      toast({
        title: "Factura creada",
        description: `Factura generada exitosamente para ${data.customerName}`,
      });
      
      // If action is print, immediately show print dialog
      if (action === 'print') {
        setShowPrintDialog(true);
      }
      
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la factura. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    const formData = form.getValues();
    const mockInvoice: Invoice = {
      id: 0,
      number: "VISTA-PREVIA",
      customerId: null,
      customerName: formData.customerName || "Cliente",
      customerPhone: formData.customerPhone || "",
      customerTaxId: formData.customerTaxId || "",
      subtotal: totals.subtotal.toString(),
      tax: "0.00",
      total: totals.total.toString(),
      status: "pending",
      date: formData.date,
      createdAt: new Date(),
    };

    const mockItems: InvoiceItem[] = formData.items.map((item, index) => ({
      id: index,
      invoiceId: 0,
      serviceName: item.serviceName || "Servicio",
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      total: (item.quantity * item.unitPrice).toString(),
    }));

    setLastCreatedInvoice({ invoice: mockInvoice, items: mockItems });
    setShowPreview(true);
  };

  const handlePrint = () => {
    if (receiptRef.current && lastCreatedInvoice) {
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        const invoiceNumber = lastCreatedInvoice.invoice.number || 'N/A';
        printWindow.document.write(`
          <html>
            <head>
              <title>Factura ${invoiceNumber}</title>
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Nueva Factura
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((data) => handleSubmit(data, 'save'))} className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre del Cliente</Label>
              <Input
                id="customerName"
                placeholder="Juan Pérez"
                {...form.register("customerName")}
                disabled={isLoading}
              />
              {form.formState.errors.customerName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Teléfono</Label>
              <Input
                id="customerPhone"
                placeholder="9876-5432"
                {...form.register("customerPhone")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerTaxId">RTN/Identidad</Label>
              <Input
                id="customerTaxId"
                placeholder="0801-1990-12345"
                {...form.register("customerTaxId")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Servicios</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Servicio
              </Button>
            </div>

            {watchedItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="space-y-2">
                  <Label>Servicio</Label>
                  <Select 
                    value={Object.entries(SERVICES).find(([, service]) => service.name === item.serviceName)?.[0] || ""}
                    onValueChange={(value) => handleServiceChange(index, value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SERVICES).map(([key, service]) => (
                        <SelectItem key={key} value={key}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Precio Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total</Label>
                  <div className="p-2 bg-gray-50 rounded border">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={isLoading || watchedItems.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ISV (15%):</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-3">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-brand-blue hover:bg-blue-800"
            >
              {isLoading ? "Generando..." : "Guardar Factura"}
            </Button>
            
            <Button
              type="button"
              onClick={() => form.handleSubmit((data) => handleSubmit(data, 'print'))()}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              {isLoading ? "Generando..." : "Guardar e Imprimir"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={isLoading || !form.getValues("customerName") || !form.getValues("items").some(item => item.serviceName)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Limpiar
            </Button>
          </div>

          {/* Live Preview Section */}
          {showPreview && (
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowDown className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">Vista Previa de Factura (Estilo SAP)</h3>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-blue-200">
                <div className="max-w-sm mx-auto">
                  <ThermalReceipt 
                    ref={receiptRef}
                    invoice={lastCreatedInvoice?.invoice || null}
                    items={lastCreatedInvoice?.items || null}
                  />
                </div>
                
                <div className="flex justify-center gap-3 mt-4 pt-4 border-t">
                  <Button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Vista Previa
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                  >
                    Cerrar Vista Previa
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
        
        {/* Print Dialog */}
        <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Factura Creada Exitosamente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                La factura ha sido guardada exitosamente. ¿Desea imprimirla ahora?
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Ahora
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowPrintDialog(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
