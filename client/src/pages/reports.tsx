import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  BarChart3,
  Lock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, downloadCSV } from "@/lib/utils";
import { ReportData, Invoice, Appointment } from "@shared/schema";
import { ExportModal } from "@/components/modals/export-modal";

export default function Reports() {
  const { isAdminMode } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState("");

  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ["/api/reports", dateRange, startDate, endDate],
    enabled: isAdminMode,
  });

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    enabled: isAdminMode,
  });

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: isAdminMode,
  });

  const handleExport = (format: string) => {
    setExportType(format);
    setShowExportModal(true);
  };

  const generateCSVReport = () => {
    if (!invoices || !appointments) return;

    const csvData = [
      ["Reporte Carwash Peña Blanca"],
      ["Fecha de Generación", new Date().toLocaleDateString()],
      [""],
      ["RESUMEN FINANCIERO"],
      ["Total Ingresos", formatCurrency(reportData?.totalRevenue || 0)],
      ["Total Servicios", reportData?.totalServices?.toString() || "0"],
      ["Total Clientes", reportData?.totalCustomers?.toString() || "0"],
      ["Servicio Principal", reportData?.topService || "N/A"],
      [""],
      ["FACTURAS DETALLADAS"],
      ["Número", "Cliente", "Fecha", "Total", "Estado"],
      ...invoices.map(invoice => [
        invoice.number,
        invoice.customerName,
        formatDate(invoice.date),
        formatCurrency(invoice.total),
        invoice.status === 'paid' ? 'Pagado' : 'Pendiente'
      ]),
      [""],
      ["CITAS DETALLADAS"],
      ["Cliente", "Servicio", "Fecha", "Hora", "Estado"],
      ...appointments.map(appointment => [
        appointment.customerName,
        appointment.serviceName,
        formatDate(appointment.date),
        appointment.time,
        appointment.status === 'completed' ? 'Completado' : 
        appointment.status === 'confirmed' ? 'Confirmado' : 'Pendiente'
      ])
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const filename = `reporte_carwash_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
    
    toast({
      title: "Reporte Exportado",
      description: "El reporte ha sido descargado exitosamente.",
    });
  };

  const handleExportConfirm = () => {
    if (exportType === "excel" || exportType === "csv") {
      generateCSVReport();
    } else if (exportType === "pdf") {
      // Open a printable version
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Reporte - Carwash Peña Blanca</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .section { margin: 20px 0; }
                .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
                .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                @media print { .no-print { display: none; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>CARWASH PEÑA BLANCA</h1>
                <h2>Reporte Administrativo</h2>
                <p>Fecha: ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div class="section">
                <h3>Resumen Financiero</h3>
                <div class="stats">
                  <div class="stat-card">
                    <h4>Total Ingresos</h4>
                    <p style="font-size: 24px; color: #16a34a;">${formatCurrency(reportData?.totalRevenue || 0)}</p>
                  </div>
                  <div class="stat-card">
                    <h4>Servicios Prestados</h4>
                    <p style="font-size: 24px; color: #2563eb;">${reportData?.totalServices || 0}</p>
                  </div>
                  <div class="stat-card">
                    <h4>Clientes Atendidos</h4>
                    <p style="font-size: 24px; color: #9333ea;">${reportData?.totalCustomers || 0}</p>
                  </div>
                  <div class="stat-card">
                    <h4>Servicio Principal</h4>
                    <p style="font-size: 18px; color: #ea580c;">${reportData?.topService || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div class="section">
                <h3>Facturas Recientes</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${invoices?.slice(0, 10).map(invoice => `
                      <tr>
                        <td>${invoice.number}</td>
                        <td>${invoice.customerName}</td>
                        <td>${formatDate(invoice.date)}</td>
                        <td>${formatCurrency(invoice.total)}</td>
                        <td>${invoice.status === 'paid' ? 'Pagado' : 'Pendiente'}</td>
                      </tr>
                    `).join('') || '<tr><td colspan="5">No hay facturas</td></tr>'}
                  </tbody>
                </table>
              </div>

              <div class="no-print">
                <button onclick="window.print()">Imprimir</button>
                <button onclick="window.close()">Cerrar</button>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      }
    }
    setShowExportModal(false);
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
              <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reportes</h2>
          <p className="text-gray-600">Análisis y estadísticas del negocio</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reportes</h2>
          <p className="text-gray-600">Análisis y estadísticas del negocio</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateRange">Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">Este mes</SelectItem>
                  <SelectItem value="lastMonth">Mes pasado</SelectItem>
                  <SelectItem value="last3Months">Últimos 3 meses</SelectItem>
                  <SelectItem value="thisYear">Este año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateRange === "custom" && (
              <>
                <div>
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData?.totalRevenue || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Servicios Prestados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reportData?.totalServices || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes Atendidos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reportData?.totalCustomers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Servicio Principal</p>
                <p className="text-lg font-bold text-orange-600">
                  {reportData?.topService || "N/A"}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Facturas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices?.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-sm text-gray-600">{invoice.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(invoice.total)}</p>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!invoices || invoices.length === 0) && (
                <p className="text-gray-500 text-center py-4">No hay facturas para mostrar</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Citas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments?.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{appointment.customerName}</p>
                    <p className="text-sm text-gray-600">{appointment.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDate(appointment.date)}</p>
                    <p className="text-sm text-gray-600">{appointment.time}</p>
                  </div>
                </div>
              ))}
              {(!appointments || appointments.length === 0) && (
                <p className="text-gray-500 text-center py-4">No hay citas para mostrar</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        exportType={exportType}
        onConfirm={handleExportConfirm}
      />
    </div>
  );
}