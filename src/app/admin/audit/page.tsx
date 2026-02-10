
"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, ArrowUpDown, Eye, FileJson, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
    id: string;
    usuarioCedula: string;
    fechaHora: string;
    tipoAccion: string;
    nombreTabla: string;
    registroId: string;
    datosAnteriores: any;
    datosNuevos: any;
}

type SortKey = keyof AuditLog;

const GET_AUDITORIAS_QUERY = `
  query {
    auditorias {
      id
      usuarioCedula
      fechaHora
      tipoAccion
      nombreTabla
      registroId
      datosAnteriores
      datosNuevos
    }
  }
`;

export default function AuditPage() {
  const [registros, setRegistros] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'fechaHora', direction: 'descending' });
  const { toast } = useToast();

  // Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [selectedDataType, setSelectedDataType] = useState<'Anteriores' | 'Nuevos'>('Nuevos');
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/graphql", { 
                query: GET_AUDITORIAS_QUERY 
            });
            setRegistros(response.data.data?.auditorias || []);
        } catch (err) {
            console.error("Error cargando auditoría:", err);
            toast({
                variant: "destructive",
                title: "Error al cargar auditoría",
                description: "No se pudieron obtener los datos de la API.",
            });
        } finally {
            setLoading(false);
        }
    };
    fetchAuditLogs();
  }, [toast]);

  const sortedAndFilteredRegistros = useMemo(() => {
    let sortableItems = [...registros];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(log => 
      log.usuarioCedula.toLowerCase().includes(filter.toLowerCase()) ||
      log.tipoAccion.toLowerCase().includes(filter.toLowerCase()) ||
      log.nombreTabla.toLowerCase().includes(filter.toLowerCase())
    );
  }, [registros, filter, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-2 opacity-30" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const openDataDetail = (log: AuditLog, type: 'Anteriores' | 'Nuevos') => {
    const data = type === 'Anteriores' ? log.datosAnteriores : log.datosNuevos;
    if (!data) {
        toast({
            title: "Sin datos",
            description: `No hay registros ${type.toLowerCase()} para esta acción.`,
        });
        return;
    }
    setActiveLog(log);
    setSelectedData(data);
    setSelectedDataType(type);
    setDetailModalOpen(true);
  };

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('INSERT') || act.includes('CREATE')) return <Badge className="bg-green-500">INSERT</Badge>;
    if (act.includes('UPDATE')) return <Badge className="bg-blue-500">UPDATE</Badge>;
    if (act.includes('DELETE')) return <Badge variant="destructive">DELETE</Badge>;
    if (act.includes('LOGIN')) return <Badge variant="outline" className="border-primary text-primary">LOGIN</Badge>;
    return <Badge variant="secondary">{action}</Badge>;
  };

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold">Registros de Auditoría</h1>
          <p className="text-muted-foreground">Consulta las acciones realizadas en el sistema con detalle granular.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cambios</CardTitle>
           <div className="pt-4">
             <Input 
                placeholder="Filtrar por Cédula, Acción o Tabla..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-md"
              />
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Button variant="ghost" onClick={() => requestSort('id')}>ID {getSortIcon('id')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('usuarioCedula')}>Cédula Usuario {getSortIcon('usuarioCedula')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('tipoAccion')}>Acción {getSortIcon('tipoAccion')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('nombreTabla')}>Tabla {getSortIcon('nombreTabla')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('registroId')}>ID Registro {getSortIcon('registroId')}</Button></TableHead>
                <TableHead><Button variant="ghost" onClick={() => requestSort('fechaHora')}>Fecha {getSortIcon('fechaHora')}</Button></TableHead>
                <TableHead className="text-center">Ant.</TableHead>
                <TableHead className="text-center">Nuevos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                        <TableCell colSpan={8}>
                            <Skeleton className="h-8 w-full" />
                        </TableCell>
                    </TableRow>
                 ))
              ) : sortedAndFilteredRegistros.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs font-mono">{r.id}</TableCell>
                  <TableCell>{r.usuarioCedula}</TableCell>
                  <TableCell>{getActionBadge(r.tipoAccion)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-muted-foreground">{r.nombreTabla}</span>
                  </TableCell>
                  <TableCell className="font-mono">{r.registroId || 'N/A'}</TableCell>
                  <TableCell className="text-xs">{new Date(r.fechaHora).toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={!r.datosAnteriores}
                        onClick={() => openDataDetail(r, 'Anteriores')}
                    >
                        <FileJson className={`h-4 w-4 ${r.datosAnteriores ? 'text-blue-500' : 'text-muted-foreground/30'}`} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={!r.datosNuevos}
                        onClick={() => openDataDetail(r, 'Nuevos')}
                    >
                        <Eye className={`h-4 w-4 ${r.datosNuevos ? 'text-primary' : 'text-muted-foreground/30'}`} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Detalle de Datos {selectedDataType}
            </DialogTitle>
            <DialogDescription>
                Acción: {activeLog?.tipoAccion} | Tabla: {activeLog?.nombreTabla} | ID: {activeLog?.registroId}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 mt-4 rounded-md border bg-slate-950 p-6">
            <pre className="text-sm font-mono text-slate-50 leading-relaxed whitespace-pre-wrap">
              {JSON.stringify(selectedData, null, 2)}
            </pre>
          </ScrollArea>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setDetailModalOpen(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
