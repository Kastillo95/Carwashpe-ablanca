import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { SERVICES, ADMIN_PASSWORD } from "@/lib/constants";
import { getTodayDate, formatCurrency, calculateInvoiceTotals } from "@/lib/utils";

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

  const onSubmit = async (data: InvoiceFormData) => {
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

      await apiRequest("POST", "/api/invoices", invoiceData);
      
      toast({
        title: "Factura creada",
        description: `Factura generada exitosamente para ${data.customerName}`,
      });
      
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Nueva Factura
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          <div className="flex space-x-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-brand-blue hover:bg-blue-800"
            >
              {isLoading ? "Generando..." : "Generar Factura"}
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
  );
}
