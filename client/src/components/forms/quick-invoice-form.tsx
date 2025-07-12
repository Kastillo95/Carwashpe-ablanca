import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ShoppingCart, User, Plus, Trash2, Eye, Printer } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { ThermalReceipt } from "@/components/ui/thermal-receipt";
import { type Inventory, type Invoice, type InvoiceItem } from "@shared/schema";
import { getTodayDate, formatCurrency, calculateInvoiceTotals } from "@/lib/utils";

const quickInvoiceSchema = z.object({
  customerName: z.string().min(1, "El nombre del cliente es requerido"),
  barcode: z.string().optional(),
});

const manualAddSchema = z.object({
  selectedProductId: z.string().min(1, "Seleccione un producto"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
});

type QuickInvoiceFormData = z.infer<typeof quickInvoiceSchema>;
type ManualAddFormData = z.infer<typeof manualAddSchema>;

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
}

export function QuickInvoiceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<{ invoice: Invoice; items: InvoiceItem[] } | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: inventory } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const form = useForm<QuickInvoiceFormData>({
    resolver: zodResolver(quickInvoiceSchema),
    defaultValues: {
      customerName: "",
      barcode: "",
    },
  });

  const manualForm = useForm<ManualAddFormData>({
    resolver: zodResolver(manualAddSchema),
    defaultValues: {
      selectedProductId: "",
      quantity: 1,
    },
  });

  const addToCart = (barcode: string) => {
    const product = inventory?.find(item => item.barcode === barcode);
    if (!product) {
      toast({
        title: "Producto no encontrado",
        description: "El código de barras no corresponde a ningún producto",
        variant: "destructive",
      });
      return;
    }

    // Los servicios no requieren verificación de stock
    if (!product.isService && (product.quantity || 0) <= 0) {
      toast({
        title: "Sin stock",
        description: "Este producto no tiene stock disponible",
        variant: "destructive",
      });
      return;
    }

    addProductToCart(product, 1);
  };

  const addProductToCart = (product: Inventory, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // Solo verificar stock para productos físicos, no servicios
        if (!product.isService && existingItem.quantity + quantity > (product.quantity || 0)) {
          toast({
            title: "Stock insuficiente",
            description: "No hay más unidades disponibles",
            variant: "destructive",
          });
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: parseFloat(String(product.price)),
          quantity: quantity,
          barcode: product.barcode || "",
        }];
      }
    });

    toast({
      title: "Producto agregado",
      description: `${product.name} agregado al carrito`,
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    const product = inventory?.find(item => item.id === id);
    // Solo verificar stock para productos físicos, no servicios
    if (product && !product.isService && newQuantity > (product.quantity || 0)) {
      toast({
        title: "Stock insuficiente",
        description: "No hay suficientes unidades disponibles",
        variant: "destructive",
      });
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleManualAdd = (data: ManualAddFormData) => {
    const product = inventory?.find(item => item.id === parseInt(data.selectedProductId));
    if (product) {
      addProductToCart(product, data.quantity);
      manualForm.reset();
      setShowManualAdd(false);
    }
  };

  const totals = calculateInvoiceTotals(cart);

  const handleBarcodeSubmit = (data: QuickInvoiceFormData) => {
    if (data.barcode) {
      addToCart(data.barcode);
      form.setValue("barcode", "");
    }
  };

  const generateInvoice = async () => {
    if (!form.getValues("customerName")) {
      toast({
        title: "Error",
        description: "Ingrese el nombre del cliente",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Agregue al menos un producto al carrito",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const invoiceData = {
        customer: {
          name: form.getValues("customerName"),
          phone: "",
          taxId: "",
        },
        items: cart.map(item => ({
          serviceName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        inventoryItems: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
        })),
        date: getTodayDate(),
      };

      const result = await apiRequest("POST", "/api/invoices", invoiceData);
      
      // Set the created invoice for preview
      setLastCreatedInvoice(result);
      setShowInvoicePreview(true);
      
      toast({
        title: "Factura creada",
        description: "La factura se ha generado exitosamente",
      });

      // Reset form and cart
      form.reset({
        customerName: "",
        barcode: "",
      });
      setCart([]);
      
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la factura",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (receiptRef.current && lastCreatedInvoice?.invoice) {
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        const invoiceNumber = (lastCreatedInvoice.invoice as any).number || (lastCreatedInvoice.invoice as any).invoiceNumber || 'N/A';
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName">Nombre del Cliente *</Label>
              <Input
                id="customerName"
                {...form.register("customerName")}
                placeholder="Ingrese el nombre del cliente"
                className="text-lg"
              />
              {form.formState.errors.customerName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Escáner de Código de Barras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleBarcodeSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="barcode">Código de Barras</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  {...form.register("barcode")}
                  placeholder="Escanee o ingrese el código de barras"
                  className="text-lg"
                  autoComplete="off"
                />
                <Button type="submit" disabled={!form.watch("barcode")}>
                  Agregar
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowManualAdd(!showManualAdd)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showManualAdd ? "Ocultar" : "Agregar"} Producto Manual
            </Button>
          </div>

          {showManualAdd && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Seleccionar Producto/Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={manualForm.handleSubmit(handleManualAdd)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="selectedProductId">Producto/Servicio</Label>
                    <Select onValueChange={(value) => manualForm.setValue("selectedProductId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un producto o servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory?.filter(item => item.active).map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{item.name}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant={item.isService ? "default" : "secondary"}>
                                  {item.isService ? "Servicio" : "Producto"}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {formatCurrency(parseFloat(String(item.price)))}
                                </span>
                                {!item.isService && (
                                  <span className="text-xs text-gray-500">
                                    Stock: {item.quantity || 0}
                                  </span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {manualForm.formState.errors.selectedProductId && (
                      <p className="text-sm text-red-500">
                        {manualForm.formState.errors.selectedProductId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      defaultValue={1}
                      {...manualForm.register("quantity", { valueAsNumber: true })}
                    />
                    {manualForm.formState.errors.quantity && (
                      <p className="text-sm text-red-500">
                        {manualForm.formState.errors.quantity.message}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Agregar al Carrito
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowManualAdd(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito ({cart.length} productos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              El carrito está vacío. Escanee un código de barras o use selección manual para agregar productos.
            </p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">Código: {item.barcode}</p>
                    <p className="text-sm font-semibold">{formatCurrency(item.price)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2"
                    >
                      ×
                    </Button>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 space-y-2">
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
          )}
        </CardContent>
      </Card>

      {cart.length > 0 && (
        <Button
          onClick={generateInvoice}
          disabled={isLoading || !form.getValues("customerName")}
          className="w-full text-lg py-6"
        >
          {isLoading ? "Generando..." : `Generar Factura - ${formatCurrency(totals.total)}`}
        </Button>
      )}

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa de Factura
            </DialogTitle>
          </DialogHeader>
          {lastCreatedInvoice?.invoice && (
            <div className="space-y-4">
              <ThermalReceipt
                ref={receiptRef}
                invoice={lastCreatedInvoice.invoice}
                items={lastCreatedInvoice.items || []}
              />
              <div className="flex gap-2 no-print">
                <Button
                  onClick={handlePrintReceipt}
                  className="flex-1 bg-brand-blue hover:bg-blue-800"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir Factura
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInvoicePreview(false)}
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