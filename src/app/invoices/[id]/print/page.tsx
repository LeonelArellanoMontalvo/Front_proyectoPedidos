
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/protected-route";

export default function ClientInvoicePrintPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const tokenString = window.localStorage.getItem('access_token');
        const token = tokenString ? JSON.parse(tokenString) : null;

        const response = await axios.get("/api/facturacion/mis-facturas", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const found = response.data.find((inv: Invoice) => String(inv.id) === String(params.id));
        
        if (found) {
          setInvoice(found);
        } else {
          toast({ variant: "destructive", title: "Error", description: "No se encontró la factura." });
          router.push("/invoices");
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la factura." });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchInvoice();
  }, [params.id, router, toast]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Preparando su comprobante...</p>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <ProtectedRoute allowedRoles={['CLIENTE']}>
      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Barra de herramientas - NO SE IMPRIME */}
        <div className="sticky top-0 z-50 w-full bg-white border-b px-4 py-3 print:hidden shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <div className="flex items-center gap-3">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Comprobante Electrónico de Compra</span>
               <Button onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Factura
                </Button>
            </div>
          </div>
        </div>

        {/* Formato de Factura para el Cliente */}
        <div className="max-w-4xl mx-auto py-10 px-4 print:p-0">
          <div id="printable-document" className="bg-white p-12 shadow-sm border print:shadow-none print:border-none print:p-0">
            
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-black text-primary mb-1">PEDIDO LISTO</h1>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Servicio de Alimentación</p>
                <p className="text-[10px] text-gray-400 mt-2">Ibarra, Imbabura - Ecuador</p>
              </div>
              <div className="text-right">
                <div className="border border-gray-200 p-4 bg-gray-50 min-w-[200px]">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Número de Documento</p>
                  <p className="text-2xl font-mono font-bold">{invoice.numeroFactura}</p>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">FECHA: {new Date(invoice.fechaFactura).toLocaleDateString('es-EC')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-12 text-sm border-y py-6 border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Cliente</p>
                <p className="text-lg font-bold">{invoice.usuario.nombre} {invoice.usuario.apellido}</p>
                <p><span className="text-gray-500">C.I.:</span> {invoice.usuarioCedula}</p>
                <p><span className="text-gray-500">Dirección:</span> {invoice.usuario.direccionPrincipal}</p>
              </div>
              <div className="text-right space-y-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Información de Pago</p>
                 <p><span className="text-gray-500">Estado:</span> <span className="font-bold uppercase">{invoice.estadoFactura}</span></p>
                 <p><span className="text-gray-500">Tipo:</span> {invoice.tipoFactura}</p>
              </div>
            </div>

            <table className="w-full text-sm mb-12">
              <thead>
                <tr className="border-b-2 border-black text-left">
                  <th className="py-3 font-bold w-16">CANT.</th>
                  <th className="py-3 font-bold">PRODUCTO / PLATILLO</th>
                  <th className="py-3 font-bold text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.detalles.map((det) => (
                  <tr key={det.id}>
                    <td className="py-4">{det.cantidad}</td>
                    <td className="py-4">
                      <p className="font-bold">{det.platillo?.nombreItem || det.descripcionItem}</p>
                      <p className="text-[10px] text-gray-400">P. Unitario: {formatCurrency(Number(det.precioUnitario))}</p>
                    </td>
                    <td className="py-4 text-right font-bold">{formatCurrency(Number(det.subtotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-16">
              <div className="w-[280px] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-medium">{formatCurrency(Number(invoice.montoSubtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">IVA 12%</span>
                  <span className="font-medium">{formatCurrency(Number(invoice.montoIva))}</span>
                </div>
                <div className="border-t-2 border-black pt-3 flex justify-between items-center">
                  <span className="text-lg font-black uppercase">Total Pagado</span>
                  <span className="text-2xl font-black text-primary">{formatCurrency(Number(invoice.montoTotal))}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-10 border-t border-gray-100">
              <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">¡Gracias por su compra!</p>
              <p className="text-[10px] text-gray-400">Este es un comprobante electrónico válido de su pedido realizado en Pedido Listo.</p>
            </div>

          </div>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              margin: 0;
              size: auto;
            }
            body {
              background-color: white !important;
              margin: 0;
              padding: 0;
            }
            .print\:hidden {
              display: none !important;
            }
            #printable-document {
              width: 100% !important;
              border: none !important;
              padding: 2cm !important;
            }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
