import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentForm } from "@/components/forms/appointment-form";
import { User, Phone, Clock, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { getTodayDate, formatCurrency, formatTime } from "@/lib/utils";
import { Appointment } from "@shared/schema";
import { ADMIN_PASSWORD } from "@/lib/constants";

export default function Appointments() {
  const { isAdminMode } = useAuth();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: todayAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", getTodayDate()],
    queryFn: async () => {
      const response = await fetch(`/api/appointments?date=${getTodayDate()}`);
      if (!response.ok) throw new Error("Error al obtener citas del día");
      return response.json();
    },
  });

  const handleDeleteAppointment = async (id: number) => {
    if (!isAdminMode) return;
    
    setDeletingId(id);
    
    try {
      await apiRequest("DELETE", `/api/appointments/${id}`, {
        password: ADMIN_PASSWORD,
      });
      
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada exitosamente.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita. Inténtalo nuevamente.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">Programada</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completada</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sistema de Citas</h2>
          <p className="text-gray-600">Programa tu cita o gestiona las citas existentes</p>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sistema de Citas</h2>
        <p className="text-gray-600">Programa tu cita o gestiona las citas existentes</p>
      </div>

      {/* Appointment Form */}
      <AppointmentForm />

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Citas de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay citas programadas para hoy.
            </p>
          ) : (
            <div className="space-y-3">
              {todayAppointments?.map((appointment) => (
                <div 
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.customerName}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {appointment.customerPhone}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.serviceName}</p>
                    </div>
                  </div>
                  
                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <p className="font-medium flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(appointment.time)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(parseFloat(appointment.servicePrice))}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      
                      {isAdminMode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          disabled={deletingId === appointment.id}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Appointments (Admin Only) */}
      {isAdminMode && (
        <Card>
          <CardHeader>
            <CardTitle>Todas las Citas</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay citas registradas.
              </p>
            ) : (
              <div className="space-y-3">
                {appointments?.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.customerName}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {appointment.customerPhone}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.serviceName}</p>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center space-x-4">
                      <div>
                        <p className="font-medium">
                          {appointment.date} - {formatTime(appointment.time)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(parseFloat(appointment.servicePrice))}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(appointment.status)}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          disabled={deletingId === appointment.id}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
