import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportModal } from "@/components/modals/export-modal";
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, getTodayDate } from "@/lib/utils";
import { ReportData } from "@shared/schema";

export default function Reports() {
  const { isAdminMode } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState("monthly");
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<string>("");

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ["/api/reports", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) throw new Error("Error al obtener reporte");
      return response.json();
    },
    enabled: isAdminMode && !!startDate && !!endDate,
  });

  const handleExport = (type: string) => {
    setExportType(type);
    setShowExportModal(true);
  };

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona las fechas de inicio y fin",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generando reporte",
      description: "El reporte se está generando...",
    });
  };

  // Redirect non-admin users
  if (!isAdminMode) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reportes</h2>
          <p className="text-gray-600">Acceso restringido a administradores</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Acceso Restringido
              </h3>
              <p className="text-gray-600">
                Necesitas permisos de administrador para acceder a los reportes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reportes</h2>
        <p className="text-gray-600">Análisis y exportación de datos</p>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generar Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Reporte Diario</SelectItem>
                  <SelectItem value="weekly">Reporte Semanal</SelectItem>
                  <SelectItem value="monthly">Reporte Mensual</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="w-full bg-brand-blue hover:bg-blue-800"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {isLoading ? "Generando..." : "Generar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleExport("inventory")}
              className="bg-green-600 hover:bg-green-700 h-24 flex-col space-y-2"
            >
              <Download className="w-8 h-8" />
              <div className="text-center">
                <p className="font-medium">Exportar Inventario</p>
                <p className="text-sm opacity-75">Formato Excel</p>
              </div>
            </Button>
            
            <Button
              onClick={() => handleExport("invoices")}
              className="bg-blue-600 hover:bg-blue-700 h-24 flex-col space-y-2"
            >
              <Download className="w-8 h-8" />
              <div className="text-center">
                <p className="font-medium">Exportar Facturas</p>
                <p className="text-sm opacity-75">Formato Excel</p>
              </div>
            </Button>
            
            <Button
              onClick={() => handleExport("reports")}
              className="bg-purple-600 hover:bg-purple-700 h-24 flex-col space-y-2"
            >
              <Download className="w-8 h-8" />
              <div className="text-center">
                <p className="font-medium">Exportar Reportes</p>
                <p className="text-sm opacity-75">Formato Excel</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-800">Ingresos Totales</h4>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.totalRevenue)}
                </p>
                <p className="text-sm text-blue-600">Total del período</p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-800">Servicios Realizados</h4>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {reportData.totalServices}
                </p>
                <p className="text-sm text-green-600">Total de servicios</p>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-purple-800">Clientes Atendidos</h4>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {reportData.totalCustomers}
                </p>
                <p className="text-sm text-purple-600">Clientes únicos</p>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-orange-800">Servicio Más Popular</h4>
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-lg font-bold text-orange-600">
                  {reportData.topService}
                </p>
                <p className="text-sm text-orange-600">Más solicitado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        exportType={exportType}
      />
    </div>
  );
}
