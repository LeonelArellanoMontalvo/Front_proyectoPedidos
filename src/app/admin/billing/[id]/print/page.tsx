
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function AdminInvoicePrintPage() {
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
        
        const response = await axios.get("/api/facturacion", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const found = response.data.find((inv: Invoice) => String(inv.id) === String(params.id));
        
        if (found) {
          setInvoice(found);
        } else {
          toast({ variant: "destructive", title: "Error", description: "No se encontró la factura." });
          router.push("/admin/billing");
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
        <p>Generando documento...</p>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Barra de herramientas de vista previa - NO SE IMPRIME */}
      <div className="sticky top-0 z-50 w-full bg-white border-b px-4 py-3 print:hidden shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Vista de Impresión Oficial</span>
            <Button onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir ahora
            </Button>
          </div>
        </div>
      </div>

      {/* Formato de Factura Profesional */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div id="printable-document" className="bg-white p-12 shadow-sm border print:shadow-none print:border-none print:p-0">
          
          {/* Encabezado */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-black text-black mb-1">PEDIDO LISTO</h1>
              <p className="text-sm font-bold tracking-widest text-gray-500">RUC: 1005299489001</p>
              <p className="text-xs text-gray-500 max-w-xs">Matriz: Av. Principal y 10 de Agosto, Ibarra, Ecuador. Tel: (06) 2645-123</p>
            </div>
            <div className="text-right border-2 border-black p-4 min-w-[250px]">
              <p className="text-lg font-bold">FACTURA</p>
              <p className="text-2xl font-mono font-bold text-primary">{invoice.numeroFactura}</p>
              <p className="text-xs mt-2">FECHA DE EMISIÓN</p>
              <p className="font-medium">{new Date(invoice.fechaFactura).toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
            <div className="space-y-2">
              <p className="border-b border-black font-bold text-[10px] pb-1 uppercase">DATOS DEL CLIENTE</p>
              <p><span className="font-bold">SEÑOR(ES):</span> {invoice.usuario.nombre} {invoice.usuario.apellido}</p>
              <p><span className="font-bold">C.I. / RUC:</span> {invoice.usuarioCedula}</p>
              <p><span className="font-bold">DIRECCIÓN:</span> {invoice.usuario.direccionPrincipal}</p>
            </div>
            <div className="space-y-2">
              <p className="border-b border-black font-bold text-[10px] pb-1 uppercase">DETALLES ADICIONALES</p>
              <p><span className="font-bold">TIPO:</span> {invoice.tipoFactura}</p>
              <p><span className="font-bold">ESTADO:</span> {invoice.estadoFactura}</p>
              <p><span className="font-bold">TELÉFONO:</span> {invoice.usuario.telefono}</p>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="mb-10">
            <table className="w-full text-sm border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100 print:bg-gray-100 border-b border-black">
                  <th className="border-r border-black p-2 text-center w-20">CANT.</th>
                  <th className="border-r border-black p-2 text-left">DESCRIPCIÓN</th>
                  <th className="border-r border-black p-2 text-right w-32">P. UNITARIO</th>
                  <th className="p-2 text-right w-32">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {invoice.detalles.map((det) => (
                  <tr key={det.id} className="border-b border-gray-300">
                    <td className="border-r border-black p-2 text-center">{det.cantidad}</td>
                    <td className="border-r border-black p-2">
                      <span className="font-bold">{det.platillo?.nombreItem || det.descripcionItem}</span>
                      {det.platillo?.categoriaNombre && <span className="text-[10px] text-gray-500 block">{det.platillo.categoriaNombre}</span>}
                    </td>
                    <td className="border-r border-black p-2 text-right">{formatCurrency(Number(det.precioUnitario))}</td>
                    <td className="p-2 text-right font-medium">{formatCurrency(Number(det.subtotal))}</td>
                  </tr>
                ))}
                {/* Filas vacías para rellenar el formato si hay pocos ítems */}
                {invoice.detalles.length < 5 && Array.from({ length: 5 - invoice.detalles.length }).map((_, i) => (
                   <tr key={`empty-${i}`} className="border-b border-gray-200 h-8">
                     <td className="border-r border-black"></td>
                     <td className="border-r border-black"></td>
                     <td className="border-r border-black"></td>
                     <td></td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales y Firmas */}
          <div className="flex justify-between items-start">
            <div className="w-1/2 mt-10">
               <div className="border-t border-black w-48 text-center pt-2">
                 <p className="text-[10px] font-bold">FIRMA AUTORIZADA</p>
               </div>
               <p className="text-[9px] text-gray-400 mt-10">Original: Cliente | Copia: Emisor</p>
            </div>
            <div className="w-[280px]">
              <table className="w-full text-sm border border-black border-t-0">
                <tbody>
                  <tr>
                    <td className="border-r border-black p-2 font-bold bg-gray-50">SUBTOTAL</td>
                    <td className="p-2 text-right">{formatCurrency(Number(invoice.montoSubtotal))}</td>
                  </tr>
                  <tr>
                    <td className="border-r border-black p-2 font-bold bg-gray-50">IVA 12%</td>
                    <td className="p-2 text-right">{formatCurrency(Number(invoice.montoIva))}</td>
                  </tr>
                  <tr className="border-t border-black bg-gray-100">
                    <td className="border-r border-black p-2 font-black text-lg">TOTAL</td>
                    <td className="p-2 text-right font-black text-xl">{formatCurrency(Number(invoice.montoTotal))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-20 text-center text-[10px] text-gray-500 border-t pt-4 border-dashed border-gray-300">
            <p>GRACIAS POR SU PREFERENCIA - PEDIDO LISTO ES CALIDAD Y SABOR</p>
            <p className="mt-1">Documento generado electrónicamente | Sistema de Gestión Pedido Listo v1.0</p>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
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
            padding: 1.5cm !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
