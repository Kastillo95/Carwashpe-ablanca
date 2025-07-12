import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShoppingCart, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { type Inventory } from "@shared/schema";
import { getTodayDate, formatCurrency, calculateInvoiceTotals } from "@/lib/utils";

const quickInvoiceSchema = z.object({
  customerName: z.string().min(1, "El nombre del cliente es requerido"),
  barcode: z.string().min(1, "Escanee el código de barras"),
});

type QuickInvoiceFormData = z.infer<typeof quickInvoiceSchema>;

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

    if (product.quantity <= 0) {
      toast({
        title: "Sin stock",
        description: "Este producto no tiene stock disponible",
        variant: "destructive",
      });
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.quantity) {
          toast({
            title: "Stock insuficiente",
            description: "No hay más unidades disponibles",
            variant: "destructive",
          });
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: parseFloat(String(product.price)),
          quantity: 1,
          barcode: product.barcode || "",
        }];
      }
    });

    form.setValue("barcode", "");
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
    if (product && newQuantity > product.quantity) {
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

  const totals = calculateInvoiceTotals(cart);

  const handleBarcodeSubmit = (data: QuickInvoiceFormData) => {
    if (data.barcode) {
      addToCart(data.barcode);
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
      const now = new Date();
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

      await apiRequest("POST", "/api/invoices", invoiceData);
      
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
              El carrito está vacío. Escanee un código de barras para agregar productos.
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
    </div>
  );
}