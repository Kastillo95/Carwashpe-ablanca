import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  CalendarCheck, 
  Receipt 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>
          <p className="text-gray-600">Bienvenido al sistema de gestión de Carwash Peña Blanca</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Citas Hoy",
      value: stats?.todayAppointments || 0,
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
      bgColor: "bg-blue-500"
    },
    {
      title: "Ingresos del Día",
      value: formatCurrency(stats?.dailyRevenue || 0),
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      bgColor: "bg-green-500"
    },
    {
      title: "Productos Bajo Stock",
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      color: "bg-orange-100 text-orange-600",
      bgColor: "bg-orange-500"
    },
    {
      title: "Clientes Atendidos",
      value: stats?.servedCustomers || 0,
      icon: Users,
      color: "bg-purple-100 text-purple-600",
      bgColor: "bg-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Bienvenido al sistema de gestión de Carwash Peña Blanca</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sistema iniciado</p>
                <p className="text-xs text-gray-500">El sistema está funcionando correctamente</p>
              </div>
              <span className="text-xs text-gray-400">Ahora</span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Datos cargados</p>
                <p className="text-xs text-gray-500">Inventario y servicios disponibles</p>
              </div>
              <span className="text-xs text-gray-400">Hace 1 min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
