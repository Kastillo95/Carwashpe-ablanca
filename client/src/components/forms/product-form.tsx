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
  quantity: z.number().min(0, "La cantidad debe ser mayor o igual a 0"),
  minQuantity: z.number().min(0, "La cantidad mínima debe ser mayor o igual a 0"),
  price: z.string().min(1, "El precio es requerido"),
  supplier: z.string().optional(),
  category: z.string().optional(),
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
      quantity: product?.quantity || 0,
      minQuantity: product?.minQuantity || 5,
      price: product?.price || "",
      supplier: product?.supplier || "",
      category: product?.category || "",
    },
  });

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
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                placeholder="Limpieza"
                {...form.register("category")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
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

            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                placeholder="45.00"
                {...form.register("price")}
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
