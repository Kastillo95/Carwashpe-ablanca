import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, MessageSquare, TrendingUp, Search, Plus, Send, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Customer, Promotion } from "@shared/schema";

export default function CRM() {
  const { isAdminMode, requestAdminPassword } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

  // Cargar clientes
  const { data: customers = [], isLoading: loadingCustomers } = useQuery<Customer[]>({
    queryKey: ['/api/crm/customers', searchQuery],
    queryFn: async () => {
      const url = searchQuery ? `/api/crm/customers?query=${encodeURIComponent(searchQuery)}` : '/api/crm/customers';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar clientes');
      return response.json();
    }
  });

  // Cargar mejores clientes
  const { data: topCustomers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/crm/customers/top'],
    queryFn: async () => {
      const response = await fetch('/api/crm/customers/top?limit=5');
      if (!response.ok) throw new Error('Error al cargar mejores clientes');
      return response.json();
    }
  });

  // Cargar promociones
  const { data: promotions = [], isLoading: loadingPromotions } = useQuery<Promotion[]>({
    queryKey: ['/api/crm/promotions'],
    queryFn: async () => {
      const response = await fetch('/api/crm/promotions');
      if (!response.ok) throw new Error('Error al cargar promociones');
      return response.json();
    }
  });

  // Crear promoción
  const createPromotionMutation = useMutation({
    mutationFn: async (data: any) => {
      const password = await requestAdminPassword();
      const response = await fetch('/api/crm/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, password })
      });
      if (!response.ok) throw new Error('Error al crear promoción');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/promotions'] });
      setShowPromotionForm(false);
      toast({ title: "Promoción creada exitosamente" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Enviar promoción con plantilla automática
  const sendPromotionMutation = useMutation({
    mutationFn: async ({ promotionId, sendToAll }: { promotionId: number; sendToAll: boolean }) => {
      const password = await requestAdminPassword();
      const response = await fetch(`/api/crm/promotions/${promotionId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password, 
          sendToAll, 
          customerIds: sendToAll ? undefined : selectedCustomers 
        })
      });
      if (!response.ok) throw new Error('Error al enviar promoción');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "¡Promoción enviada!", description: data.message });
      
      // Abrir automáticamente todos los enlaces de WhatsApp
      if (data.sends && Array.isArray(data.sends)) {
        // Abrir el primer enlace inmediatamente
        if (data.sends.length > 0) {
          window.open(data.sends[0].whatsappUrl, '_blank');
        }
        
        // Si hay más de un cliente, mostrar confirmación para abrir todos
        if (data.sends.length > 1) {
          const openAll = confirm(
            `¿Deseas abrir WhatsApp para todos los ${data.sends.length} clientes? Se abrirán ${data.sends.length} pestañas.`
          );
          
          if (openAll) {
            // Abrir con pequeño delay para evitar bloqueo del navegador
            data.sends.slice(1).forEach((send: any, index: number) => {
              setTimeout(() => {
                window.open(send.whatsappUrl, '_blank');
              }, (index + 1) * 500); // 500ms entre cada apertura
            });
          }
        }
      }
      
      setSelectedCustomers([]);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Enviar WhatsApp individual
  const sendWhatsAppMutation = useMutation({
    mutationFn: async ({ phone, message }: { phone: string; message: string }) => {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      });
      if (!response.ok) throw new Error('Error al generar enlace de WhatsApp');
      return response.json();
    },
    onSuccess: (data) => {
      window.open(data.whatsappUrl, '_blank');
      toast({ title: "WhatsApp abierto", description: "Se abrió WhatsApp con el mensaje prellenado" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handlePromotionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createPromotionMutation.mutate({
      title: formData.get('title'),
      message: formData.get('message'),
      discount: formData.get('discount') || null,
      validFrom: new Date(formData.get('validFrom') as string),
      validUntil: new Date(formData.get('validUntil') as string),
      active: true
    });
  };

  const createQuickPromotion = (type: string) => {
    const promotions = {
      weekend: {
        title: "Oferta de Fin de Semana",
        message: "¡Aprovecha nuestros precios especiales de fin de semana! Lavado completo con cera incluida.",
        discount: "15",
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      },
      loyalty: {
        title: "Cliente Preferencial",
        message: "Como cliente frecuente, tienes descuento especial en todos nuestros servicios premium.",
        discount: "20",
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      },
      referral: {
        title: "Trae un Amigo",
        message: "¡Trae un amigo y ambos reciben descuento! Válido para cualquier servicio de lavado.",
        discount: "25",
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 días
      }
    };

    const promo = promotions[type as keyof typeof promotions];
    if (promo) {
      createPromotionMutation.mutate({
        title: promo.title,
        message: promo.message,
        discount: promo.discount,
        validFrom: promo.validFrom,
        validUntil: promo.validUntil,
        active: true
      });
    }
  };

  const handleSendWhatsApp = (customer: Customer, message?: string) => {
    if (!customer.phone) {
      toast({ title: "Error", description: "Este cliente no tiene número de teléfono", variant: "destructive" });
      return;
    }

    const defaultMessage = message || `¡Hola ${customer.name}! Tenemos ofertas especiales en Carwash Peña Blanca. ¡Ven a visitarnos!`;
    sendWhatsAppMutation.mutate({ phone: customer.phone, message: defaultMessage });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">CRM - Gestión de Clientes</h1>
          <p className="text-muted-foreground">Administra clientes y promociones</p>
        </div>
        {isAdminMode && (
          <div className="flex gap-2">
            <Button onClick={() => setShowPromotionForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Promoción
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  Promociones Rápidas
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Crear Promoción Automática</h4>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => createQuickPromotion('weekend')}
                    >
                      🌟 Oferta de Fin de Semana (15% desc.)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => createQuickPromotion('loyalty')}
                    >
                      👑 Cliente Preferencial (20% desc.)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => createQuickPromotion('referral')}
                    >
                      👥 Trae un Amigo (25% desc.)
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promociones Activas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promotions.filter(p => p.active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mejor Cliente</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {topCustomers[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              L. {topCustomers[0]?.totalSpent || "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="promotions">Promociones</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          {/* Búsqueda de clientes */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes por nombre, teléfono o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Tabla de clientes */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                {selectedCustomers.length > 0 && (
                  <span className="text-gray-800">
                    {selectedCustomers.length} cliente(s) seleccionado(s)
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seleccionar</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Total Gastado</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Cargando...</TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No se encontraron clientes</TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCustomers([...selectedCustomers, customer.id]);
                              } else {
                                setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone || "N/A"}</TableCell>
                        <TableCell>L. {customer.totalSpent}</TableCell>
                        <TableCell>
                          {customer.lastVisit 
                            ? format(new Date(customer.lastVisit), "dd/MM/yyyy", { locale: es })
                            : "N/A"
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendWhatsApp(customer)}
                            disabled={!customer.phone}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            WhatsApp
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Promociones</CardTitle>
              <CardDescription>Gestiona y envía promociones a tus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingPromotions ? (
                  <p>Cargando promociones...</p>
                ) : promotions.length === 0 ? (
                  <p>No hay promociones creadas</p>
                ) : (
                  promotions.map((promotion) => (
                    <Card key={promotion.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{promotion.title}</CardTitle>
                            <CardDescription>{promotion.message}</CardDescription>
                            {promotion.discount && (
                              <Badge variant="secondary" className="mt-2">
                                {promotion.discount}% de descuento
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {isAdminMode && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendPromotionMutation.mutate({ 
                                    promotionId: promotion.id, 
                                    sendToAll: false 
                                  })}
                                  disabled={selectedCustomers.length === 0 || sendPromotionMutation.isPending}
                                >
                                  <Send className="w-4 h-4 mr-1" />
                                  {sendPromotionMutation.isPending ? "Enviando..." : `Enviar a ${selectedCustomers.length} Seleccionados`}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => sendPromotionMutation.mutate({ 
                                    promotionId: promotion.id, 
                                    sendToAll: true 
                                  })}
                                  disabled={sendPromotionMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Send className="w-4 h-4 mr-1" />
                                  {sendPromotionMutation.isPending ? "Enviando..." : "Enviar a Todos (WhatsApp Automático)"}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Válida del {format(new Date(promotion.validFrom), "dd/MM/yyyy", { locale: es })} 
                          al {format(new Date(promotion.validUntil), "dd/MM/yyyy", { locale: es })}
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mejores Clientes</CardTitle>
              <CardDescription>Top 5 clientes por total gastado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">L. {customer.totalSpent}</p>
                      <p className="text-sm text-muted-foreground">
                        Última visita: {customer.lastVisit 
                          ? format(new Date(customer.lastVisit), "dd/MM/yyyy", { locale: es })
                          : "N/A"
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para crear promoción */}
      <Dialog open={showPromotionForm} onOpenChange={setShowPromotionForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Promoción</DialogTitle>
            <DialogDescription>
              Crea una nueva promoción para enviar a tus clientes. Se generará automáticamente una plantilla profesional con logo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handlePromotionSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" required placeholder="Ej: Oferta Especial" />
              </div>
              <div>
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" name="message" required placeholder="Describe tu promoción..." />
              </div>
              <div>
                <Label htmlFor="discount">Descuento (%) - Opcional</Label>
                <Input id="discount" name="discount" type="number" min="0" max="100" placeholder="15" />
              </div>
              <div>
                <Label htmlFor="validFrom">Válida desde</Label>
                <Input id="validFrom" name="validFrom" type="date" required />
              </div>
              <div>
                <Label htmlFor="validUntil">Válida hasta</Label>
                <Input id="validUntil" name="validUntil" type="date" required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowPromotionForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPromotionMutation.isPending}>
                  {createPromotionMutation.isPending ? "Creando..." : "Crear Promoción"}
                </Button>
              </div>
            </form>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Vista Previa del Mensaje WhatsApp:</h4>
              <div className="bg-white p-3 rounded-lg border text-sm whitespace-pre-line font-mono">
                🚗✨ CARWASH PEÑA BLANCA ✨🚗
━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 *TU PROMOCIÓN* 🎉

Tu mensaje de promoción aparecerá aquí...

💰 *¡15% DE DESCUENTO!*

📅 *Válida:* 26/7/2025 - 2/8/2025

━━━━━━━━━━━━━━━━━━━━━━━━━
📍 *Ubicación:* Peña Blanca, Cortés
📞 *Teléfono:* +504 9464-8987
🕒 *Horarios:*
   Lun-Sáb: 8:00 AM - 5:00 PM
   Domingo: 8:00 AM - 3:00 PM

¡Te esperamos para brindarte el mejor servicio! 🚗💨
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Esta plantilla se genera automáticamente con logo y información del negocio.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}