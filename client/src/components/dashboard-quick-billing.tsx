import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, ShoppingCart, User, Plus, Trash2, Receipt, Eye, Printer, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { type Inventory, type Invoice, type InvoiceItem } from "@shared/schema";
import { getTodayDate, formatCurrency, calculateInvoiceTotals } from "@/lib/utils";
import { SERVICES, BUSINESS_INFO, TAX_RATE } from "@/lib/constants";

const invoiceSchema = z.object({
  customerName: z.string().min(1, "Nombre del cliente requerido"),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  customerAddress: z.string().optional(),
  selectedService: z.string().optional(),
  selectedProduct: z.string().optional(),
  quantity: z.number().min(1, "Cantidad mínima 1").default(1),
  paymentMethod: z.string().default("efectivo"),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  type: 'service' | 'product';
}

export function DashboardQuickBilling() {
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: inventory } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: customers } = useQuery<any[]>({
    queryKey: ["/api/crm/customers"],
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      quantity: 1,
      paymentMethod: "efectivo",
      notes: "",
    },
  });

  const addServiceToCart = (serviceId: string) => {
    const service = SERVICES.find((s) => s.id.toString() === serviceId);
    if (service) {
      addToCart({
        id: service.id,
        name: service.name,
        price: service.price,
        quantity: 1,
        type: 'service'
      });
    }
  };

  const addProductToCart = (productId: string, quantity: number = 1) => {
    const product = inventory?.find(p => p.id.toString() === productId);
    if (product) {
      if (product.quantity && product.quantity < quantity) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${product.quantity} unidades disponibles`,
          variant: "destructive",
        });
        return;
      }

      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        type: 'product'
      });
    }
  };

  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => 
        cartItem.id === item.id && cartItem.type === item.type
      );
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id && cartItem.type === item.type
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }
      
      return [...prevCart, item];
    });

    toast({
      title: "Agregado al carrito",
      description: `${item.name} x${item.quantity}`,
    });
  };

  const removeFromCart = (id: number, type: 'service' | 'product') => {
    setCart(prevCart => prevCart.filter(item => !(item.id === id && item.type === type)));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Factura ${lastInvoice?.invoice_number || ''}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; }
                .invoice-details { margin-bottom: 20px; }
                .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .invoice-table th { background-color: #f2f2f2; }
                .invoice-total { text-align: right; font-weight: bold; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agregue al menos un producto o servicio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Crear cliente si no existe
      const customerResponse = await apiRequest("/api/crm/customers", "POST", {
        name: data.customerName,
        phone: data.customerPhone || "",
        email: data.customerEmail || "",
        address: data.customerAddress || "",
      });

      if (!customerResponse.ok) {
        throw new Error("Error al crear cliente");
      }

      const customer = await customerResponse.json();

      // Crear factura - El ISV ya está incluido en los precios
      const total = calculateTotal();
      const subtotal = total / (1 + TAX_RATE);
      const tax = total - subtotal;
      
      const invoiceItems = cart.map(item => ({
        type: item.type,
        item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const invoiceResponse = await apiRequest("/api/invoices", "POST", {
        customer_id: customer.id,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        status: "pendiente",
        payment_method: data.paymentMethod,
        notes: data.notes,
        items: invoiceItems,
      });

      if (!invoiceResponse.ok) {
        throw new Error("Error al crear factura");
      }

      const invoice = await invoiceResponse.json();
      
      // Preparar datos completos para vista previa
      const fullInvoice = {
        ...invoice,
        customer: customer,
        items: invoiceItems.map(item => ({
          ...item,
          total_price: item.quantity * item.unit_price
        }))
      };
      
      setLastInvoice(fullInvoice);
      setShowPreview(true);

      toast({
        title: "¡Factura creada!",
        description: `Factura ${invoice.invoice_number} por ${formatCurrency(total)}`,
      });

      // Limpiar carrito y formulario
      setCart([]);
      form.reset();
      
      // Invalidar queries para actualizar datos
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

  return (
    <>
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <FileText className="w-5 h-5" />
            Facturación Completa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(handleCreateInvoice)} className="space-y-3">
            {/* Datos del Cliente */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Información del Cliente</Label>
              <Input
                placeholder="Nombre del cliente *"
                {...form.register("customerName")}
                className="h-9"
              />
              <Input
                placeholder="Teléfono"
                {...form.register("customerPhone")}
                className="h-9"
              />
              <Input
                placeholder="Email"
                {...form.register("customerEmail")}
                className="h-9"
              />
              <Input
                placeholder="Dirección"
                {...form.register("customerAddress")}
                className="h-9"
              />
            </div>

            {/* Servicios disponibles */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Servicios Disponibles
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {SERVICES.map((service) => (
                  <Button
                    key={service.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addServiceToCart(service.id.toString())}
                    className="text-sm h-10 justify-between"
                  >
                    <span>{service.name}</span>
                    <span className="text-green-600 font-bold">{formatCurrency(service.price)}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Agregar productos */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Agregar Productos</Label>
              <div className="flex gap-2">
                <Select onValueChange={(value) => form.setValue("selectedProduct", value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory?.map(product => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - {formatCurrency(product.price)} (Stock: {product.quantity || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  placeholder="Cantidad"
                  className="w-20 h-9"
                  {...form.register("quantity", { valueAsNumber: true })}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const productId = form.getValues("selectedProduct");
                    const quantity = form.getValues("quantity");
                    if (productId) {
                      addProductToCart(productId, quantity);
                    }
                  }}
                  className="h-9"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Carrito de compras */}
            {cart.length > 0 && (
              <div className="bg-white p-3 rounded border">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Carrito de Compras</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={`${item.type}-${item.id}-${index}`} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-500">
                          {item.type === 'service' ? 'Servicio' : 'Producto'} - 
                          Cantidad: {item.quantity} - 
                          Precio unitario: {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-bold">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id, item.type)}
                          className="h-6 w-6 p-0 mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Totales */}
                <div className="border-t pt-3 mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal (sin ISV):</span>
                    <span>{formatCurrency(calculateTotal() / (1 + TAX_RATE))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ISV (15% incluido):</span>
                    <span>{formatCurrency(calculateTotal() - (calculateTotal() / (1 + TAX_RATE)))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Información Adicional</Label>
              <Select onValueChange={(value) => form.setValue("paymentMethod", value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Notas adicionales (opcional)"
                {...form.register("notes")}
                className="min-h-[60px]"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || cart.length === 0 || !form.getValues("customerName")}
                className="flex-1 h-10"
              >
                <Receipt className="w-4 h-4 mr-2" />
                {isLoading ? "Procesando..." : "Crear Factura"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de Vista Previa e Impresión */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Vista Previa de Factura
            </DialogTitle>
          </DialogHeader>
          
          {lastInvoice && (
            <div ref={printRef} className="space-y-6">
              {/* Encabezado de la factura */}
              <div className="invoice-header text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">{BUSINESS_INFO.name}</h1>
                <p className="text-gray-600">{BUSINESS_INFO.address}</p>
                <p className="text-gray-600">{BUSINESS_INFO.addressDetail}</p>
                <p className="text-gray-600">{BUSINESS_INFO.phone}</p>
                <p className="text-sm text-gray-500">RTN: {BUSINESS_INFO.rtn}</p>
              </div>

              {/* Información de la factura */}
              <div className="invoice-details grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Información del Cliente</h3>
                  <p><strong>Nombre:</strong> {lastInvoice.customer?.name}</p>
                  {lastInvoice.customer?.phone && <p><strong>Teléfono:</strong> {lastInvoice.customer.phone}</p>}
                  {lastInvoice.customer?.email && <p><strong>Email:</strong> {lastInvoice.customer.email}</p>}
                  {lastInvoice.customer?.address && <p><strong>Dirección:</strong> {lastInvoice.customer.address}</p>}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Información de la Factura</h3>
                  <p><strong>Número:</strong> {lastInvoice.invoice_number}</p>
                  <p><strong>Fecha:</strong> {new Date(lastInvoice.date).toLocaleDateString('es-HN')}</p>
                  <p><strong>Método de Pago:</strong> {lastInvoice.payment_method}</p>
                  <p><strong>Estado:</strong> {lastInvoice.status}</p>
                </div>
              </div>

              {/* Tabla de items */}
              <div>
                <table className="invoice-table w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Descripción</th>
                      <th className="border border-gray-300 p-2 text-center">Cantidad</th>
                      <th className="border border-gray-300 p-2 text-right">Precio Unit.</th>
                      <th className="border border-gray-300 p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastInvoice.items?.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">
                          {item.name}
                          <br />
                          <small className="text-gray-500">
                            {item.type === 'service' ? 'Servicio' : 'Producto'}
                          </small>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="invoice-total">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(lastInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ISV (15%):</span>
                      <span>{formatCurrency(lastInvoice.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(lastInvoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {lastInvoice.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Notas</h3>
                  <p className="text-gray-600">{lastInvoice.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-sm text-gray-500 border-t pt-4">
                <p>¡Gracias por su preferencia!</p>
                <p>{BUSINESS_INFO.hours.weekdays}</p>
                <p>{BUSINESS_INFO.hours.sunday}</p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 mt-6">
            <Button
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowPreview(false);
                setLastInvoice(null);
              }}
              className="flex-1"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}