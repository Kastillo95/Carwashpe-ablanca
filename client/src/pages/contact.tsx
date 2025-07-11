import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Clock, 
  ExternalLink,
  Car,
  Droplets,
  Shield,
  Star
} from "lucide-react";
import { BUSINESS_INFO, SERVICES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function Contact() {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Hola, me interesa agendar una cita para el carwash. ¿Podrían ayudarme?");
    window.open(`https://wa.me/${BUSINESS_INFO.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Información de Contacto</h2>
        <p className="text-gray-600">Datos de contacto y servicios disponibles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-brand-blue" />
              {BUSINESS_INFO.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Dirección</h3>
                <p className="text-gray-600">{BUSINESS_INFO.address}</p>
                <p className="text-gray-600">{BUSINESS_INFO.addressDetail}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">WhatsApp</h3>
                <p className="text-gray-600">{BUSINESS_INFO.phone}</p>
                <Button
                  onClick={handleWhatsAppContact}
                  className="mt-2 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </Button>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Horarios de Atención</h3>
                <div className="text-gray-600 space-y-1">
                  <p>{BUSINESS_INFO.hours.weekdays}</p>
                  <p>{BUSINESS_INFO.hours.saturday}</p>
                  <p>{BUSINESS_INFO.hours.sunday}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-brand-blue" />
              Nuestros Servicios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(SERVICES).map(([key, service]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-800">{service.name}</span>
                  </div>
                  <span className="text-brand-blue font-bold">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-brand-blue" />
              </div>
              <h3 className="font-semibold text-gray-800">Calidad Garantizada</h3>
              <p className="text-sm text-gray-600">
                Utilizamos productos de alta calidad para el cuidado de tu vehículo
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Servicio Rápido</h3>
              <p className="text-sm text-gray-600">
                Servicios eficientes sin comprometer la calidad del trabajo
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Experiencia</h3>
              <p className="text-sm text-gray-600">
                Años de experiencia en el cuidado y mantenimiento de vehículos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-brand-blue text-white">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">¿Listo para darle el mejor cuidado a tu vehículo?</h3>
            <p className="text-blue-100">
              Agenda tu cita ahora y experimenta nuestro servicio profesional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleWhatsAppContact}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contactar por WhatsApp
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brand-blue"
                onClick={() => window.location.href = '/appointments'}
              >
                <Clock className="w-4 h-4 mr-2" />
                Programar Cita Online
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
