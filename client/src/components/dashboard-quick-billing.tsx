import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ShoppingCart, User, Plus, Trash2, Receipt, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { type Inventory, type Invoice, type InvoiceItem } from "@shared/schema";
import { getTodayDate, formatCurrency, calculateInvoiceTotals } from "@/lib/utils";
import { SERVICES } from "@/lib/constants";

const quickBillingSchema = z.object({
  customerName: z.string().min(1, "Nombre del cliente requerido"),
  barcode: z.string().optional(),
  selectedService: z.string().optional(),
  selectedProduct: z.string().optional(),
  quantity: z.number().min(1, "Cantidad mínima 1").default(1),
});

type QuickBillingData = z.infer<typeof quickBillingSchema>;

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
  const [showFullBilling, setShowFullBilling] = useState(false);
  const { toast } = useToast();

  const { data: inventory } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const form = useForm<QuickBillingData>({
    resolver: zodResolver(quickBillingSchema),
    defaultValues: {
      customerName: "",
      barcode: "",
      quantity: 1,
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

  const handleQuickBilling = async (data: QuickBillingData) => {
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
      // Crear cliente rápido si no existe
      const customerResponse = await apiRequest("/api/crm/customers", "POST", {
        name: data.customerName,
        phone: "",
        email: "",
      });

      if (!customerResponse.ok) {
        throw new Error("Error al crear cliente");
      }

      const customer = await customerResponse.json();

      // Crear factura
      const total = calculateTotal();
      const invoiceItems = cart.map(item => ({
        type: item.type,
        item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const invoiceResponse = await apiRequest("/api/invoices", "POST", {
        customer_id: customer.id,
        subtotal: total,
        tax: 0,
        total: total,
        status: "pagada",
        payment_method: "efectivo",
        items: invoiceItems,
      });

      if (!invoiceResponse.ok) {
        throw new Error("Error al crear factura");
      }

      const invoice = await invoiceResponse.json();

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
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Zap className="w-5 h-5" />
            Facturación Rápida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(handleQuickBilling)} className="space-y-3">
            {/* Cliente */}
            <div>
              <Input
                placeholder="Nombre del cliente"
                {...form.register("customerName")}
                className="h-9"
              />
            </div>

            {/* Servicios rápidos */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Servicios Rápidos
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.slice(0, 4).map((service) => (
                  <Button
                    key={service.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addServiceToCart(service.id.toString())}
                    className="text-xs h-8"
                  >
                    {service.name}
                    <br />
                    <span className="text-green-600">{formatCurrency(service.price)}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Agregar producto manual */}
            <div className="flex gap-2">
              <Select onValueChange={(value) => form.setValue("selectedProduct", value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {inventory?.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} - {formatCurrency(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                placeholder="Cant"
                className="w-16 h-9"
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

            {/* Carrito */}
            {cart.length > 0 && (
              <div className="bg-white p-3 rounded border">
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={`${item.type}-${item.id}-${index}`} className="flex items-center justify-between text-sm">
                      <span className="flex-1">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id, item.type)}
                        className="h-6 w-6 p-0 ml-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || cart.length === 0 || !form.getValues("customerName")}
                className="flex-1 h-9"
              >
                <Receipt className="w-4 h-4 mr-1" />
                Facturar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFullBilling(true)}
                className="h-9"
              >
                Completa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal para facturación completa */}
      <Dialog open={showFullBilling} onOpenChange={setShowFullBilling}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Facturación Completa</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-center text-gray-500">
              Aquí se abriría el sistema completo de facturación...
            </p>
            <Button 
              onClick={() => setShowFullBilling(false)}
              className="mt-4 w-full"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}