import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "@/components/forms/product-form";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { Inventory } from "@shared/schema";
import { ADMIN_PASSWORD } from "@/lib/constants";

export default function InventoryPage() {
  const { isAdminMode } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Inventory | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: inventory, isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Inventory) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!isAdminMode) return;
    
    setDeletingId(id);
    
    try {
      await apiRequest("DELETE", `/api/inventory/${id}`, {
        password: ADMIN_PASSWORD,
      });
      
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getStockStatus = (item: Inventory) => {
    if (item.quantity <= 0) {
      return { 
        status: "out", 
        label: "Sin Stock", 
        variant: "destructive" as const,
        icon: AlertTriangle
      };
    } else if (item.quantity <= item.minQuantity) {
      return { 
        status: "low", 
        label: "Bajo Stock", 
        variant: "secondary" as const,
        icon: AlertTriangle
      };
    } else {
      return { 
        status: "ok", 
        label: "En Stock", 
        variant: "default" as const,
        icon: CheckCircle
      };
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Inventario</h2>
            <p className="text-gray-600">Gestión de productos y suministros</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {editingProduct ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <p className="text-gray-600">
            {editingProduct ? "Actualiza la información del producto" : "Agrega un nuevo producto al inventario"}
          </p>
        </div>

        <ProductForm 
          product={editingProduct || undefined}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Inventario</h2>
          <p className="text-gray-600">Gestión de productos y suministros</p>
        </div>
        {isAdminMode && (
          <Button
            onClick={handleAddProduct}
            className="bg-brand-blue hover:bg-blue-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        )}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory?.map((item) => {
          const stockStatus = getStockStatus(item);
          const StatusIcon = stockStatus.icon;
          
          return (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge variant={stockStatus.variant} className="flex items-center gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {stockStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cantidad:</span>
                      <span className={`font-medium ${
                        item.quantity <= item.minQuantity ? 'text-orange-600' : 'text-gray-800'
                      }`}>
                        {item.quantity} {item.category === 'Limpieza' ? 'unidades' : 'piezas'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(item.price))}</span>
                    </div>
                    
                    {item.supplier && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proveedor:</span>
                        <span className="font-medium">{item.supplier}</span>
                      </div>
                    )}
                    
                    {item.category && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoría:</span>
                        <span className="font-medium">{item.category}</span>
                      </div>
                    )}
                  </div>
                  
                  {isAdminMode && (
                    <div className="flex space-x-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(item)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(item.id)}
                        disabled={deletingId === item.id}
                        className="flex-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {inventory?.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No hay productos en el inventario
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando productos para gestionar tu inventario.
              </p>
              {isAdminMode && (
                <Button onClick={handleAddProduct} className="bg-brand-blue hover:bg-blue-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Producto
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
