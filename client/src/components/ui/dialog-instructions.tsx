import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileSpreadsheet, Download } from 'lucide-react';

interface ExcelInstructionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExcelInstructions({ open, onOpenChange }: ExcelInstructionsProps) {
  const downloadTemplate = () => {
    // Crear un template de Excel con las columnas esperadas
    const templateData = [
      {
        'Nombre': 'Champú para Autos',
        'Descripción': 'Champú premium para lavado de vehículos, rinde hasta 100 lavados',
        'Precio': 45.50,
        'Cantidad': 25,
        'Código de Barras': 'CH001',
        'Proveedor': 'Auto Supplies SA',
        'Imagen URL': 'https://ejemplo.com/mi-imagen.jpg',
        'Es Servicio': 'No',
        'Activo': 'Sí'
      },
      {
        'Nombre': 'Lavado Completo',
        'Descripción': 'Servicio de lavado completo con encerado y aspirado',
        'Precio': 150.00,
        'Cantidad': 0,
        'Código de Barras': 'SV001',
        'Proveedor': '',
        'Imagen URL': 'https://ejemplo.com/lavado-completo.jpg',
        'Es Servicio': 'Sí',
        'Activo': 'Sí'
      }
    ];

    // Simular descarga de template
    const ws = window.XLSX?.utils?.json_to_sheet(templateData);
    if (ws && window.XLSX) {
      const wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Template Productos");
      window.XLSX.writeFile(wb, "template-productos-con-imagenes.xlsx");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar Productos con Imágenes - Guía Completa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Paso 1: Preparar imágenes */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-600">📸 Paso 1: Preparar las Imágenes</h3>
              <div className="space-y-3">
                <p><strong>Opciones para agregar imágenes:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Subir a un servicio de imágenes:</strong> Usa Imgur, Google Drive (público), o Dropbox</li>
                  <li><strong>Usar imágenes existentes:</strong> Copia la URL de imágenes ya disponibles en internet</li>
                  <li><strong>Servidor local:</strong> Si tienes un sitio web, sube las imágenes ahí</li>
                </ul>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm"><strong>💡 Recomendación:</strong> Las imágenes deben estar en formato JPG, PNG o WEBP, y preferiblemente no mayores a 500KB para carga rápida.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paso 2: Preparar Excel */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3 text-green-600">📊 Paso 2: Preparar el Archivo Excel</h3>
              <div className="space-y-3">
                <p>Tu archivo Excel debe tener estas columnas <strong>exactamente</strong>:</p>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                  <div className="grid grid-cols-3 gap-4">
                    <div>• Nombre</div>
                    <div>• Descripción</div>
                    <div>• Precio</div>
                    <div>• Cantidad</div>
                    <div>• Código de Barras</div>
                    <div>• Proveedor</div>
                    <div>• <strong className="text-red-600">Imagen URL</strong></div>
                    <div>• Es Servicio</div>
                    <div>• Activo</div>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm"><strong>🔗 Para la columna "Imagen URL":</strong> Pega la URL completa de la imagen (ej: https://i.imgur.com/abc123.jpg)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ejemplo visual */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3 text-purple-600">📋 Ejemplo de Datos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-2">Nombre</th>
                      <th className="border border-gray-300 p-2">Descripción</th>
                      <th className="border border-gray-300 p-2">Precio</th>
                      <th className="border border-gray-300 p-2">Imagen URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">Champú Auto</td>
                      <td className="border border-gray-300 p-2">Champú premium para autos</td>
                      <td className="border border-gray-300 p-2">45.50</td>
                      <td className="border border-gray-300 p-2 text-blue-600 underline">https://i.imgur.com/ejemplo.jpg</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">Cera Protectora</td>
                      <td className="border border-gray-300 p-2">Cera líquida de larga duración</td>
                      <td className="border border-gray-300 p-2">75.00</td>
                      <td className="border border-gray-300 p-2 text-blue-600 underline">https://i.imgur.com/cera123.png</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Paso 3: Importar */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3 text-orange-600">🚀 Paso 3: Importar al Sistema</h3>
              <div className="space-y-3">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Guarda tu archivo Excel con todas las columnas completas</li>
                  <li>Haz clic en "Importar Excel" en la página de inventario</li>
                  <li>Selecciona tu archivo Excel</li>
                  <li>El sistema procesará cada producto y descargará las imágenes automáticamente</li>
                  <li>¡Las imágenes aparecerán en las tarjetas de productos!</li>
                </ol>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm"><strong>✅ Resultado:</strong> Cada producto mostrará su imagen, descripción y precio de forma visual y profesional.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Descargar Template de Ejemplo
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              ¡Entendido!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}