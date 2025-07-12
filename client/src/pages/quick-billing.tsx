import { QuickInvoiceForm } from "@/components/forms/quick-invoice-form";

export default function QuickBilling() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Facturación Rápida</h1>
        <p className="text-gray-600 mt-2">
          Sistema de facturación rápida con escáner de código de barras
        </p>
      </div>
      
      <QuickInvoiceForm />
    </div>
  );
}