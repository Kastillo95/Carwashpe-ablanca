import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) {
    return "L. 0.00";
  }
  return `L. ${numericAmount.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-HN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateInvoiceTotals(items: Array<{quantity: number, price?: number, unitPrice?: number}>) {
  const subtotal = items.reduce((sum, item) => {
    const price = item.price || item.unitPrice || 0;
    const quantity = item.quantity || 0;
    return sum + (quantity * price);
  }, 0);
  
  const tax = 0; // No mostrar impuestos
  const total = subtotal;
  
  return {
    subtotal: isNaN(subtotal) ? 0 : subtotal,
    tax: 0, // Siempre 0
    total: isNaN(total) ? 0 : total
  };
}

export function generateInvoiceNumber(currentNumber: number): string {
  return `001-${String(currentNumber).padStart(4, '0')}`;
}

export function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function validateRTN(rtn: string): boolean {
  // Basic RTN validation for Honduras
  const cleanRTN = rtn.replace(/[-\s]/g, '');
  return /^\d{14}$/.test(cleanRTN);
}

export function formatRTN(rtn: string): string {
  const cleanRTN = rtn.replace(/[-\s]/g, '');
  if (cleanRTN.length === 14) {
    return `${cleanRTN.slice(0, 4)}-${cleanRTN.slice(4, 8)}-${cleanRTN.slice(8, 14)}`;
  }
  return rtn;
}
