import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, Eye, Printer, ArrowDown, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { SERVICES, ADMIN_PASSWORD } from "@/lib/constants";
import { getTodayDate, formatCurrency, calculateInvoiceTotals } from "@/lib/utils";
import { ThermalReceipt } from "@/components/ui/thermal-receipt";
import { type Invoice, type InvoiceItem } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { type Inventory } from "@shared/schema";

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

export function EnhancedInvoiceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Show preview by default
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<{ invoice: Invoice; items: InvoiceItem[] } | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch inventory for services and products (available to all users)
  const { data: inventory } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

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
  const watchedCustomer = form.watch("customerName");
  const totals = calculateInvoiceTotals(watchedItems);

  // Update preview whenever form data changes
  const updatePreview = () => {
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
  };

  // Update preview whenever watched values change
  React.useEffect(() => {
    updatePreview();
  }, [watchedItems, watchedCustomer, totals]);

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

  const handleServiceChange = (index: number, value: string) => {
    const currentItems = form.getValues("items");
    
    // First check predefined services
    const service = SERVICES[value as keyof typeof SERVICES];
    if (service) {
      currentItems[index].serviceName = service.name;
      currentItems[index].unitPrice = service.price;
      form.setValue("items", currentItems);
      return;
    }

    // Then check inventory items
    const inventoryItem = inventory?.find(item => item.id.toString() === value);
    if (inventoryItem) {
      currentItems[index].serviceName = inventoryItem.name;
      currentItems[index].unitPrice = parseFloat(inventoryItem.price.toString());
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
      };

      const result = await apiRequest("POST", "/api/invoices", invoiceData);
      // The API returns the invoice and items directly
      if (result && typeof result === 'object' && 'invoice' in result) {
        setLastCreatedInvoice(result as { invoice: Invoice; items: InvoiceItem[] });
      }
      
      toast({
        title: "Factura creada",
        description: `Factura generada exitosamente para ${data.customerName}`,
      });
      
      if (action === 'print') {
        setShowPrintDialog(true);
      } else {
        // Show print dialog for regular save action
        setTimeout(() => {
          setShowPrintDialog(true);
        }, 500);
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

  const allOptions = [
    // Predefined services
    ...Object.entries(SERVICES).map(([key, service]) => ({
      value: key,
      label: `${service.name} - ${formatCurrency(service.price)}`,
      price: service.price,
    })),
    // Inventory items (available to all users)
    ...(inventory?.map(item => ({
      value: item.id.toString(),
      label: `${item.name} - ${formatCurrency(parseFloat(item.price.toString()))}`,
      price: parseFloat(item.price.toString()),
    })) || []),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Section */}
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
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información del Cliente</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nombre del Cliente *</Label>
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
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Servicios y Productos</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
              </div>

              {watchedItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end border p-3 rounded-lg">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Servicio/Producto</Label>
                    <Select 
                      value={allOptions.find(option => 
                        (SERVICES[option.value as keyof typeof SERVICES]?.name === item.serviceName) ||
                        (inventory?.find(inv => inv.id.toString() === option.value)?.name === item.serviceName)
                      )?.value || ""}
                      onValueChange={(value) => handleServiceChange(index, value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" disabled>Seleccionar servicio o producto</SelectItem>
                        {allOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                <div className="w-full max-w-xs space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-wrap gap-3 border-t pt-4">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="bg-blue-600 hover:bg-blue-700"
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
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Limpiar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* SAP-Style Preview Section */}
      <Card className="lg:sticky lg:top-4 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Vista Previa SAP (Tiempo Real)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-blue-200 min-h-[600px]">
            <div className="max-w-sm mx-auto">
              <ThermalReceipt 
                ref={receiptRef}
                invoice={lastCreatedInvoice?.invoice || null}
                items={lastCreatedInvoice?.items || null}
              />
            </div>
            
            <div className="flex justify-center gap-3 mt-6 pt-4 border-t">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                disabled={!lastCreatedInvoice?.invoice?.customerName || lastCreatedInvoice?.invoice?.customerName === "Cliente"}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir Vista Previa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}