import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_PASSWORD } from "@/lib/constants";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: string;
  onConfirm?: () => void;
}

export function ExportModal({ open, onOpenChange, exportType }: ExportModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { validatePassword } = useAuth();
  const { toast } = useToast();

  const exportTypeNames = {
    inventory: "Inventario",
    invoices: "Facturas", 
    reports: "Reportes"
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      toast({
        title: "Contraseña incorrecta",
        description: "Por favor, verifica tu contraseña",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/export/${exportType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Error al exportar datos');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Exportación exitosa",
        description: `${exportTypeNames[exportType as keyof typeof exportTypeNames]} exportado correctamente`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo completar la exportación. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  const handleCancel = () => {
    setPassword("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar {exportTypeNames[exportType as keyof typeof exportTypeNames]}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleExport} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Contraseña de Administrador
            </Label>
            <Input
              id="export-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-sm text-gray-600">
              Por seguridad, confirma tu contraseña para exportar los datos.
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isLoading || !password}
              className="flex-1 bg-brand-blue hover:bg-blue-800"
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading ? "Exportando..." : "Exportar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
