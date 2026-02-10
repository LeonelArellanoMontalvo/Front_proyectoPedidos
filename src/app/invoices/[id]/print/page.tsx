
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
          document.title = found.numeroFactura;
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
        <p>Preparando documento...</p>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <ProtectedRoute allowedRoles={['CLIENTE']}>
      <div className="min-h-screen bg-white print:m-0">
        
        {/* 1. VISTA PREVIA PROFESIONAL (SOLO PANTALLA) */}
        <div className="print:hidden min-h-screen bg-gray-50">
          <div className="sticky top-0 z-50 w-full bg-white border-b px-4 py-3 shadow-sm">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                 <span className="text-xs font-bold text-gray-400 uppercase">Comprobante de Compra</span>
                 <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Factura
                  </Button>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="bg-white p-12 shadow-lg border rounded-xl">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-4xl font-black text-primary mb-1">PEDIDO LISTO</h1>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Servicio de Alimentación</p>
                </div>
                <div className="text-right border-2 border-primary p-4 rounded-lg">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Comprobante No.</p>
                  <p className="text-2xl font-mono font-bold">{invoice.numeroFactura}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-12 text-sm border-y py-6 border-gray-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Mis Datos</p>
                  <p className="text-lg font-bold">{invoice.usuario.nombre} {invoice.usuario.apellido}</p>
                  <p><span className="text-gray-500">C.I.:</span> {invoice.usuarioCedula}</p>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Fecha de Compra</p>
                   <p className="font-bold">{new Date(invoice.fechaFactura).toLocaleDateString()}</p>
                   <p className="text-gray-500">{invoice.tipoFactura}</p>
                </div>
              </div>

              <table className="w-full text-sm mb-12">
                <thead>
                  <tr className="border-b-2 border-primary text-left">
                    <th className="py-3 font-bold w-16">CANT.</th>
                    <th className="py-3 font-bold">PRODUCTO</th>
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

              <div className="flex justify-end">
                <div className="w-[280px] space-y-3 bg-muted/20 p-6 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatCurrency(Number(invoice.montoSubtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">IVA 12%</span>
                    <span className="font-medium">{formatCurrency(Number(invoice.montoIva))}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                    <span className="text-lg font-black uppercase">Total Pagado</span>
                    <span className="text-2xl font-black text-primary">{formatCurrency(Number(invoice.montoTotal))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. FORMATO DE DOCUMENTO SIMPLE (SIN ENCABEZADOS DE NAVEGADOR) */}
        <div className="hidden print:block text-black text-sm p-8 m-0 w-full bg-white">
           <div className="border-b border-black pb-4 mb-6">
              <h1 className="text-xl font-bold">PEDIDO LISTO - COMPROBANTE DE COMPRA</h1>
              <p>Ibarra, Ecuador | Documento Digital</p>
           </div>

           <div className="flex justify-between mb-8">
              <div>
                 <p><strong>CLIENTE:</strong> {invoice.usuario.nombre} {invoice.usuario.apellido}</p>
                 <p><strong>C.I.:</strong> {invoice.usuarioCedula}</p>
              </div>
              <div className="text-right">
                 <p><strong>NÚMERO:</strong> {invoice.numeroFactura}</p>
                 <p><strong>FECHA:</strong> {new Date(invoice.fechaFactura).toLocaleDateString()}</p>
              </div>
           </div>

           <table className="w-full border-collapse mb-8">
              <thead>
                 <tr className="border-y border-black">
                    <th className="py-1 text-left">CANT.</th>
                    <th className="py-1 text-left">DESCRIPCIÓN</th>
                    <th className="py-1 text-right">SUBTOTAL</th>
                 </tr>
              </thead>
              <tbody>
                 {invoice.detalles.map((det) => (
                    <tr key={det.id} className="border-b border-gray-100">
                       <td className="py-2">{det.cantidad}</td>
                       <td className="py-2">{det.platillo?.nombreItem || det.descripcionItem}</td>
                       <td className="py-2 text-right">{formatCurrency(Number(det.subtotal))}</td>
                    </tr>
                 ))}
              </tbody>
           </table>

           <div className="flex justify-end">
              <div className="w-48 space-y-1">
                 <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>{formatCurrency(Number(invoice.montoSubtotal))}</span>
                 </div>
                 <div className="flex justify-between">
                    <span>IVA 12%:</span>
                    <span>{formatCurrency(Number(invoice.montoIva))}</span>
                 </div>
                 <div className="flex justify-between font-bold border-t border-black pt-1">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(Number(invoice.montoTotal))}</span>
                 </div>
              </div>
           </div>
        </div>

        <style jsx global>{`
          @media print {
            @page {
              margin: 0;
              size: auto;
            }
            html, body {
              height: auto !important;
              overflow: visible !important;
              background-color: white !important;
              margin: 0 !important;
            }
            .print\:hidden {
              display: none !important;
            }
            .hidden.print\:block {
              display: block !important;
            }
            header, nav, aside {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
