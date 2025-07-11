import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { SERVICES, TIME_SLOTS } from "@/lib/constants";
import { getTodayDate } from "@/lib/utils";

const appointmentSchema = z.object({
  customerName: z.string().min(1, "El nombre es requerido"),
  customerPhone: z.string().min(8, "El teléfono debe tener al menos 8 dígitos"),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida"),
  serviceType: z.string().min(1, "El servicio es requerido"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export function AppointmentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      date: getTodayDate(),
      time: "",
      serviceType: "",
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true);
    
    try {
      const service = SERVICES[data.serviceType as keyof typeof SERVICES];
      
      const appointmentData = {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        date: data.date,
        time: data.time,
        serviceName: service.name,
        servicePrice: service.price.toString(),
      };

      await apiRequest("POST", "/api/appointments", appointmentData);
      
      toast({
        title: "Cita programada",
        description: `Tu cita para ${service.name} ha sido programada para el ${data.date} a las ${data.time}`,
      });
      
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo programar la cita. Inténtalo nuevamente.",
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
          <Calendar className="w-5 h-5" />
          Programar Nueva Cita
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                <User className="w-4 h-4 inline mr-2" />
                Nombre del Cliente
              </Label>
              <Input
                id="customerName"
                placeholder="Juan Pérez"
                {...form.register("customerName")}
                disabled={isLoading}
              />
              {form.formState.errors.customerName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono
              </Label>
              <Input
                id="customerPhone"
                placeholder="9876-5432"
                {...form.register("customerPhone")}
                disabled={isLoading}
              />
              {form.formState.errors.customerPhone && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.customerPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                <Calendar className="w-4 h-4 inline mr-2" />
                Fecha
              </Label>
              <Input
                type="date"
                min={getTodayDate()}
                {...form.register("date")}
                disabled={isLoading}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                <Clock className="w-4 h-4 inline mr-2" />
                Hora
              </Label>
              <Select 
                value={form.watch("time")} 
                onValueChange={(value) => form.setValue("time", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.time && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.time.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Servicio</Label>
              <Select 
                value={form.watch("serviceType")} 
                onValueChange={(value) => form.setValue("serviceType", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar servicio" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICES).map(([key, service]) => (
                    <SelectItem key={key} value={key}>
                      {service.name} - L. {service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.serviceType && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.serviceType.message}
                </p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-brand-blue hover:bg-blue-800"
          >
            {isLoading ? "Programando..." : "Programar Cita"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
