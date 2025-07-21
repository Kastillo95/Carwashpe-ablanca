import { forwardRef } from "react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { BUSINESS_INFO } from "@/lib/constants";
import type { Invoice, InvoiceItem } from "@shared/schema";
import logoPath from "@assets/IMG_20250706_211100_1752220069225.jpg";

interface ThermalReceiptProps {
  invoice: Invoice | null;
  items: InvoiceItem[] | null;
}

export const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ invoice, items }, ref) => {
    if (!invoice) {
      return <div>Cargando factura...</div>;
    }
    
    const invoiceItems = items || [];
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const total = subtotal; // No mostrar impuestos

    return (
      <div
        ref={ref}
        className="thermal-receipt bg-white text-black font-mono text-xs leading-tight p-4"
        style={{
          width: '80mm',
          minHeight: 'auto',
          fontSize: '12px',
          lineHeight: '1.2',
          fontFamily: 'Courier, monospace'
        }}
      >
        {/* Header with Logo Area */}
        <div className="text-center mb-4">
          <div className="mx-auto mb-2 w-20 h-16 overflow-hidden rounded-lg">
            <img 
              src={logoPath} 
              alt="Carwash Peña Blanca"
              className="w-full h-full object-cover"
              style={{ 
                filter: 'contrast(1.1) brightness(1.1)',
                imageRendering: 'crisp-edges'
              }}
            />
          </div>
          <div className="font-bold text-sm uppercase">{BUSINESS_INFO.name}</div>
          <div className="text-xs">{BUSINESS_INFO.address}</div>
          <div className="text-xs">{BUSINESS_INFO.addressDetail}</div>
          <div className="text-xs">Tel: {BUSINESS_INFO.phone}</div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Invoice Info */}
        <div className="mb-3">
          <div className="flex justify-between">
            <span>Factura #:</span>
            <span className="font-bold">{(invoice as any)?.number || (invoice as any)?.invoiceNumber || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Fecha:</span>
            <span>{invoice?.date ? formatDate(invoice.date) : new Date().toLocaleDateString('es-HN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Hora:</span>
            <span>{new Date(invoice?.createdAt || new Date()).toLocaleTimeString('es-HN', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}</span>
          </div>
          <div className="flex justify-between">
            <span>Cliente:</span>
            <span className="font-semibold">{invoice?.customerName || 'Cliente'}</span>
          </div>
          {invoice?.customerPhone && (
            <div className="flex justify-between">
              <span>Teléfono:</span>
              <span>{invoice.customerPhone}</span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Items */}
        <div className="mb-3">
          <div className="font-bold mb-1">DETALLE DE SERVICIOS</div>
          {invoiceItems.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <span className="flex-1 pr-1">{item.serviceName}</span>
                <span className="w-12 text-right">{formatCurrency(item.unitPrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{item.quantity} x {formatCurrency(item.unitPrice)}</span>
                <span className="font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Totals */}
        <div className="mb-3">
          <div className="border-t border-solid border-gray-400 my-1"></div>
          <div className="flex justify-between font-bold text-sm">
            <span>TOTAL:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Footer */}
        <div className="text-center text-xs">
          <div className="mb-1">¡Gracias por su preferencia!</div>
          <div className="mb-1">{BUSINESS_INFO.hours.weekdays}</div>
          <div className="mb-1">{BUSINESS_INFO.hours.saturday}</div>
          <div className="mb-2">CAI: 123456-654321-123456-12</div>
          <div className="text-xs text-gray-600">
            Rango autorizado: 001-0001 al 001-5000
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Fecha límite: 31/12/2025
          </div>
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <div className="text-xs">
            "La factura es beneficio de todos, exígela"
          </div>
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = "ThermalReceipt";