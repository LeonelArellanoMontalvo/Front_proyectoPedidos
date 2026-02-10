/**
 * @fileOverview Utilidades de cálculo para facturación y carrito.
 * Estas funciones son "puras", lo que las hace ideales para TDD.
 */

import { CartItem } from "./types";

/**
 * Calcula el subtotal de un ítem específico incluyendo sus notas si afectaran al precio (opcional).
 */
export const calculateItemSubtotal = (price: number, quantity: number): number => {
  return price * quantity;
};

/**
 * Calcula el subtotal total de una lista de ítems.
 */
export const calculateCartSubtotal = (items: CartItem[]): number => {
  return items.reduce((acc, item) => acc + calculateItemSubtotal(item.precio, item.quantity), 0);
};

/**
 * Calcula el valor del impuesto (IVA). Por defecto 12% (Ecuador).
 */
export const calculateIVA = (amount: number, rate: number = 0.12): number => {
  return amount * rate;
};

/**
 * Calcula el total final sumando subtotal e impuestos.
 */
export const calculateTotal = (subtotal: number, tax: number): number => {
  return subtotal + tax;
};

/**
 * Formatea un número a moneda (USD).
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Genera un código de factura temporal para la UI.
 * Nota: El código real DEBE ser generado por el Backend.
 */
export const generateTempInvoiceCode = (id: number | string): string => {
  const date = new Date();
  const year = date.getFullYear();
  return `FAC-${year}-${String(id).padStart(5, '0')}`;
};
