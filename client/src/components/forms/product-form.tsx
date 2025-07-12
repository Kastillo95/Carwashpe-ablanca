import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ADMIN_PASSWORD } from "@/lib/constants";
import { Inventory } from "@shared/schema";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  barcode: z.string().min(1, "El código de barras es requerido"),
  quantity: z.number().min(0).optional(),
  minQuantity: z.number().min(0).optional(),
  price: z.number().min(0.01, "El precio debe ser mayor a 0"),
  supplier: z.string().optional(),
  category: z.string().optional(),
  isService: z.boolean().default(false),
  active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Inventory;
  onCancel: () => void;
}

export function ProductForm({ product, onCancel }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEdit = !!product;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      barcode: product?.barcode || "",
      quantity: product?.quantity || 0,
      minQuantity: product?.minQuantity || 5,
      price: parseFloat(String(product?.price)) || 0,
      supplier: product?.supplier || "",
      category: product?.category || "",
      isService: product?.isService || false,
      active: product?.active ?? true,
    },
  });

  const isService = form.watch("isService");

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    
    try {
      const productData = {
        ...data,
        password: ADMIN_PASSWORD,
      };

      if (isEdit) {
        await apiRequest("PUT", `/api/inventory/${product.id}`, productData);
        toast({
          title: "Producto actualizado",
          description: `El producto ${data.name} ha sido actualizado exitosamente.`,
        });
      } else {
        await apiRequest("POST", "/api/inventory", productData);
        toast({
          title: "Producto creado",
          description: `El producto ${data.name} ha sido creado exitosamente.`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onCancel();
      
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo ${isEdit ? "actualizar" : "crear"} el producto. Inténtalo nuevamente.`,
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
          <Package className="w-5 h-5" />
          {isEdit ? "Editar Producto" : "Nuevo Producto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                placeholder="Champú para Autos"
                {...form.register("name")}
                disabled={isLoading}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                placeholder={isService ? "LAV001" : "001"}
                {...form.register("barcode")}
                disabled={isLoading}
              />
              {form.formState.errors.barcode && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.barcode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                placeholder={isService ? "Servicios" : "Limpieza"}
                {...form.register("category")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>
                <input
                  type="checkbox"
                  {...form.register("isService")}
                  className="mr-2"
                />
                Es un servicio (no requiere inventario)
              </Label>
            </div>

            {!isService && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad en Stock</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    {...form.register("quantity", { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {form.formState.errors.quantity && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.quantity.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Cantidad Mínima</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    min="0"
                    {...form.register("minQuantity", { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {form.formState.errors.minQuantity && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.minQuantity.message}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="price">Precio (L.)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder={isService ? "80.00" : "45.00"}
                {...form.register("price", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor</Label>
              <Input
                id="supplier"
                placeholder="AutoClean"
                {...form.register("supplier")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del producto..."
                {...form.register("description")}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="bg-brand-blue hover:bg-blue-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Guardando..." : (isEdit ? "Actualizar" : "Crear")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
