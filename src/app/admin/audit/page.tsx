
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
import { ShieldCheck, ArrowUpDown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    return sortableItems.filter(log => log.usuarioCedula.toLowerCase().includes(filter.toLowerCase()));
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

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <div>
          <h1 className="font-headline text-4xl font-bold">Registros de Auditoría</h1>
          <p className="text-muted-foreground">Consulta las acciones realizadas en el sistema.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cambios</CardTitle>
           <div className="pt-4">
             <Input 
                placeholder="Filtrar por Cédula de usuario..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-sm"
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
                <TableHead>Datos Anteriores</TableHead>
                <TableHead>Datos Nuevos</TableHead>
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
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.usuarioCedula}</TableCell>
                  <TableCell>{r.tipoAccion}</TableCell>
                  <TableCell>{r.nombreTabla}</TableCell>
                  <TableCell>{r.registroId}</TableCell>
                  <TableCell>{new Date(r.fechaHora).toLocaleString()}</TableCell>
                  <TableCell><pre className="text-xs whitespace-pre-wrap max-w-xs">{JSON.stringify(r.datosAnteriores, null, 2)}</pre></TableCell>
                  <TableCell><pre className="text-xs whitespace-pre-wrap max-w-xs">{JSON.stringify(r.datosNuevos, null, 2)}</pre></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
