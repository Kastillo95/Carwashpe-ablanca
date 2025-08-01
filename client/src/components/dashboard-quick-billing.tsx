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
  customerTaxId: z.string().optional(),
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
      customerTaxId: "",
      quantity: 1,
      paymentMethod: "efectivo",
      notes: "",
    },
  });

  const addServiceToCart = (serviceId: string) => {
    const service = SERVICES.find(s => s.id.toString() === serviceId);
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
        price: parseFloat(product.price.toString()),
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
      // Preparar los items de la factura
      const invoiceItems = cart.map(item => ({
        serviceName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      // Crear factura usando el formato correcto
      const invoiceData = {
        customer: {
          name: data.customerName,
          phone: data.customerPhone || "",
          taxId: data.customerTaxId || "",
        },
        items: invoiceItems,
        date: getTodayDate(),
      };

      console.log("Sending invoice data:", invoiceData);

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Invoice creation result:", result);
      
      if (result && typeof result === 'object' && 'invoice' in result) {
        // Preparar la estructura completa para el componente SAP
        const fullInvoiceData = {
          ...result.invoice,
          number: result.invoice.number,
          date: result.invoice.date,
          subtotal: result.invoice.subtotal,
          tax: result.invoice.tax,
          total: result.invoice.total,
          status: result.invoice.status,
          payment_method: data.paymentMethod || "efectivo",
          notes: data.notes || "",
          customer: {
            name: data.customerName,
            phone: data.customerPhone || "",
            email: data.customerEmail || "",
            address: data.customerTaxId || ""
          },
          items: result.items.map((item: any, index: number) => ({
            ...item,
            type: cart.find(cartItem => cartItem.name === item.serviceName)?.type || 'service'
          }))
        };
        
        setLastInvoice(fullInvoiceData);
        setShowPreview(true);
        
        // Limpiar carrito
        setCart([]);
        form.reset();
        
        toast({
          title: "Factura creada exitosamente",
          description: `Factura ${result.invoice.number} generada para ${data.customerName}`,
        });
        
        // Invalidar queries para actualizar datos
        queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      } else {
        throw new Error("Error al crear factura");
      }

    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la factura",
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
                placeholder="RTN/Identidad (opcional)"
                {...form.register("customerTaxId")}
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
            <div ref={printRef} className="bg-white p-6 space-y-6">
              {/* Encabezado SAP-style con logo */}
              <div className="invoice-header border-2 border-blue-600 p-4 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Logo profesional de Carwash Peña Blanca */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        {/* Carro */}
                        <path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.22.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z"/>
                        {/* Gotas de agua */}
                        <circle cx="8" cy="3" r="1" className="animate-pulse"/>
                        <circle cx="12" cy="2" r="1.2" className="animate-pulse"/>
                        <circle cx="16" cy="3" r="1" className="animate-pulse"/>
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-blue-800">{BUSINESS_INFO.name}</h1>
                      <p className="text-blue-600 text-lg font-medium">Sistema de Gestión Integral</p>
                      <p className="text-blue-500 text-sm">Lavado Profesional • Detallado Premium</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg shadow-lg border border-blue-700">
                      <p className="text-2xl font-bold tracking-wide">FACTURA</p>
                      <p className="text-lg font-mono bg-blue-500 bg-opacity-30 px-2 py-1 rounded mt-1">
                        {lastInvoice?.number || 'N/A'}
                      </p>
                      <p className="text-xs mt-1 opacity-90">
                        {new Date().toLocaleDateString('es-HN')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Información de la empresa en estilo SAP */}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Dirección:</strong> {BUSINESS_INFO.address}</p>
                    <p><strong>Detalle:</strong> {BUSINESS_INFO.addressDetail}</p>
                    <p><strong>Teléfono:</strong> {BUSINESS_INFO.phone}</p>
                  </div>
                  <div>
                    <p><strong>RTN:</strong> {BUSINESS_INFO.rtn}</p>
                    <p><strong>Horarios:</strong> {BUSINESS_INFO.hours.weekdays}</p>
                    <p><strong>Domingos:</strong> {BUSINESS_INFO.hours.sunday}</p>
                  </div>
                </div>
              </div>

              {/* Información SAP-style en formato estructurado */}
              <div className="invoice-details bg-gray-50 p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-4 border border-blue-200 rounded">
                    <h3 className="font-bold text-blue-800 mb-3 border-b border-blue-200 pb-2">
                      DATOS DEL CLIENTE
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-600">Nombre:</span>
                        <span className="col-span-2">{lastInvoice.customer?.name}</span>
                      </div>
                      {lastInvoice.customer?.phone && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-semibold text-gray-600">Teléfono:</span>
                          <span className="col-span-2">{lastInvoice.customer.phone}</span>
                        </div>
                      )}
                      {lastInvoice.customer?.email && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-semibold text-gray-600">Email:</span>
                          <span className="col-span-2">{lastInvoice.customer.email}</span>
                        </div>
                      )}
                      {lastInvoice.customer?.address && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-semibold text-gray-600">Dirección:</span>
                          <span className="col-span-2">{lastInvoice.customer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 border border-blue-200 rounded">
                    <h3 className="font-bold text-blue-800 mb-3 border-b border-blue-200 pb-2">
                      DATOS DE LA FACTURA
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-600">Número:</span>
                        <span className="col-span-2 font-mono">{lastInvoice?.number || 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-600">Fecha:</span>
                        <span className="col-span-2">{lastInvoice?.date ? new Date(lastInvoice.date).toLocaleDateString('es-HN') : 'N/A'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-600">M. Pago:</span>
                        <span className="col-span-2 capitalize">{lastInvoice?.payment_method || 'efectivo'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-semibold text-gray-600">Estado:</span>
                        <span className="col-span-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {lastInvoice?.status || 'pendiente'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla SAP-style con mejor diseño */}
              <div className="bg-white border border-blue-200 rounded">
                <div className="bg-blue-600 text-white p-3 rounded-t">
                  <h3 className="font-bold text-lg">DETALLE DE SERVICIOS Y PRODUCTOS</h3>
                </div>
                <table className="invoice-table w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="border border-blue-200 p-3 text-left font-semibold text-blue-800">Código</th>
                      <th className="border border-blue-200 p-3 text-left font-semibold text-blue-800">Descripción</th>
                      <th className="border border-blue-200 p-3 text-center font-semibold text-blue-800">Cant.</th>
                      <th className="border border-blue-200 p-3 text-right font-semibold text-blue-800">Precio Unit.</th>
                      <th className="border border-blue-200 p-3 text-right font-semibold text-blue-800">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastInvoice.items?.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-blue-200 p-3 text-center font-mono text-sm">
                          {String(index + 1).padStart(3, '0')}
                        </td>
                        <td className="border border-blue-200 p-3">
                          <div>
                            <span className="font-semibold">{item.serviceName}</span>
                            <br />
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {item.type === 'service' ? 'SERVICIO' : 'PRODUCTO'}
                            </span>
                          </div>
                        </td>
                        <td className="border border-blue-200 p-3 text-center font-semibold">{item.quantity}</td>
                        <td className="border border-blue-200 p-3 text-right font-mono">{formatCurrency(item.unitPrice || 0)}</td>
                        <td className="border border-blue-200 p-3 text-right font-mono font-semibold text-green-700">
                          {formatCurrency(item.total || (item.quantity * item.unitPrice))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales SAP-style */}
              <div className="invoice-total">
                <div className="flex justify-end">
                  <div className="w-80 bg-blue-50 border border-blue-200 rounded p-4">
                    <h4 className="font-bold text-blue-800 mb-3 border-b border-blue-200 pb-2">
                      RESUMEN FINANCIERO
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Subtotal (Base imponible):</span>
                        <span className="font-mono bg-white px-3 py-1 rounded border">
                          {formatCurrency(lastInvoice?.subtotal || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">ISV (15% incluido):</span>
                        <span className="font-mono bg-white px-3 py-1 rounded border">
                          {formatCurrency(lastInvoice?.tax || 0)}
                        </span>
                      </div>
                      <div className="border-t border-blue-300 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-blue-800">TOTAL A PAGAR:</span>
                          <span className="text-xl font-bold font-mono bg-green-100 text-green-800 px-4 py-2 rounded border-2 border-green-300">
                            {formatCurrency(lastInvoice?.total || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {lastInvoice?.notes && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <h3 className="font-bold text-yellow-800 mb-2 border-b border-yellow-200 pb-2">OBSERVACIONES</h3>
                  <p className="text-gray-700 text-sm">{lastInvoice.notes}</p>
                </div>
              )}

              {/* Footer SAP-style */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded">
                <div className="text-center">
                  <h4 className="text-lg font-bold mb-2">¡GRACIAS POR SU PREFERENCIA!</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Horarios de Atención</p>
                      <p>{BUSINESS_INFO.hours.weekdays}</p>
                      <p>{BUSINESS_INFO.hours.sunday}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Contacto</p>
                      <p>📞 {BUSINESS_INFO.phone}</p>
                      <p>📍 {BUSINESS_INFO.address}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Sistema Integrado</p>
                      <p>Factura generada automáticamente</p>
                      <p>Documento válido para efectos fiscales</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="flex-1"
            >
              Cerrar
            </Button>
            <Button
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}