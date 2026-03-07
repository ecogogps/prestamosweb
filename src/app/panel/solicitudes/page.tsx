'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  User, 
  DollarSign, 
  MapPin, 
  Phone,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const statusMap: Record<string, string> = {
    'pending': 'PENDIENTE',
    'accepted': 'ACEPTADO',
    'rejected': 'RECHAZADO',
    'paid': 'PAGADO',
    'overdue': 'MORA'
  };

  const formatAmount = (amount: number | string) => {
    return new Intl.NumberFormat('en-US').format(Number(amount));
  };

  useEffect(() => {
    fetchSolicitudes();

    const channel = supabase
      .channel('loans-realtime-panel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSolicitudes(prev => [payload.new, ...prev]);
            toast({
              title: "Nueva Solicitud",
              description: `Nueva solicitud recibida de ${payload.new.first_name || 'un cliente'}.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setSolicitudes(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
          } else if (payload.eventType === 'DELETE') {
            setSolicitudes(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchSolicitudes() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSolicitudes(data || []);
    } catch (err: any) {
      console.error("Error fetching loans:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id: string, status: 'accepted' | 'rejected') {
    try {
      const { error: updateError } = await supabase
        .from('loans')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: status === 'accepted' ? "Solicitud Aceptada" : "Solicitud Rechazada",
        description: `La solicitud ha sido actualizada a ${status === 'accepted' ? 'Aceptada' : 'Rechazada'}.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: err.message,
      });
    }
  }

  if (loading) return (
    <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Sincronizando con MONEYBIC...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Solicitudes de Préstamo</h1>
          <p className="text-muted-foreground mt-1">Gestión administrativa en tiempo real.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSolicitudes}
            className="rounded-xl border-primary/20 hover:bg-primary/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
          </Button>
          <Badge variant="outline" className="px-4 py-2 text-primary border-primary/20 bg-primary/5 font-bold">
            {solicitudes.length} REGISTROS
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Conexión</AlertTitle>
          <AlertDescription>
            {error}. Verifica las políticas RLS y la conexión con Supabase.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {solicitudes.length === 0 && !error ? (
          <Card className="bg-card/30 border-dashed border-border p-16 text-center shadow-inner">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Bandeja de entrada vacía</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2">No hay solicitudes pendientes en este momento.</p>
              </div>
            </div>
          </Card>
        ) : (
          solicitudes.map((solicitud) => (
            <Card key={solicitud.id} className="bg-card border-none shadow-xl hover:shadow-primary/5 transition-all overflow-hidden border-l-4 border-l-transparent hover:border-l-primary group">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                <div className="flex items-center space-x-5">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0 overflow-hidden border border-border/50">
                    {solicitud.face_photo_url ? (
                      <img 
                        src={solicitud.face_photo_url} 
                        alt={`${solicitud.first_name} rostro`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {solicitud.first_name || 'Cliente'} {solicitud.last_name || 'Nuevo'}
                      </h3>
                      {solicitud.status === 'pending' && (
                        <span className="h-2 w-2 rounded-full bg-primary animate-ping" title="Nuevo" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center font-bold text-primary">
                        <DollarSign className="h-4 w-4 mr-0.5" />
                        {formatAmount(solicitud.amount)}
                      </span>
                      <span className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1.5 opacity-70" />
                        {solicitud.payment_term} Días
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-white/60 uppercase tracking-widest border border-white/10">
                        {solicitud.payment_method}
                      </span>
                      <Badge variant="outline" className={`font-bold tracking-widest rounded-lg border-none hover:bg-inherit ${
                        solicitud.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        solicitud.status === 'accepted' ? 'bg-primary/20 text-primary' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {statusMap[solicitud.status]}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:ml-auto md:ml-0">
                  {solicitud.status === 'pending' && (
                    <div className="flex items-center bg-muted/10 p-1 rounded-2xl border border-border/50">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 font-black px-4 h-10 rounded-xl"
                        onClick={() => handleUpdateStatus(solicitud.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-2" /> RECHAZAR
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90 text-white font-black px-4 h-10 rounded-xl shadow-lg shadow-primary/20 ml-1"
                        onClick={() => handleUpdateStatus(solicitud.id, 'accepted')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2 text-white" /> ACEPTAR
                      </Button>
                    </div>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors">
                        <Eye className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[90vh] bg-card border-none shadow-2xl p-0 overflow-hidden">
                      <div className="p-8 pb-4 bg-muted/10 border-b border-border">
                        <DialogTitle className="text-2xl font-black text-white flex items-center uppercase tracking-tighter">
                          {solicitud.first_name} {solicitud.last_name}
                        </DialogTitle>
                      </div>
                      <div className="p-8 pt-6 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                          {/* Columna 1: Finanzas */}
                          <div className="space-y-8 lg:col-span-1">
                            <div>
                              <SectionTitle icon={DollarSign} title="Detalles" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                <DataBox label="Monto Solicitado" value={`$${formatAmount(solicitud.amount)}`} bold highlight />
                                <DataBox label="Plazo de Pago (Días)" value={`${solicitud.payment_term} Días`} />
                                <DataBox label="Forma de Pago" value={solicitud.payment_method} />
                                <DataBox label="Estado Actual" value={statusMap[solicitud.status]} />
                              </div>
                            </div>

                            <div>
                              <SectionTitle icon={Users} title="Información Bancaria" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                <DataBox label="Banco" value={solicitud.bank_name || 'No especificado'} />
                                <DataBox label="Número de Cuenta" value={solicitud.account_number || 'Pendiente'} />
                              </div>
                            </div>
                          </div>

                          {/* Columna 2: Perfil */}
                          <div className="space-y-8 lg:col-span-1">
                            <div>
                              <SectionTitle icon={User} title="Perfil del Solicitante" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                <DataBox label="Género" value={solicitud.gender} />
                                <DataBox label="Correo Electrónico" value={solicitud.email} />
                                <DataBox label="Documento ID" value={solicitud.doc_number} />
                                <DataBox label="Fecha Nacimiento" value={solicitud.dob} />
                                <DataBox label="Estado Civil" value={solicitud.marital_status} />
                                <DataBox label="Nivel Académico" value={solicitud.education_level} />
                              </div>
                            </div>

                            <div>
                              <SectionTitle icon={MapPin} title="Ubicación y Domicilio" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                <DataBox label="Dirección Completa" value={solicitud.address} />
                                <DataBox label="Provincia/Estado" value={solicitud.province} />
                                <DataBox label="Ciudad" value={solicitud.city} />
                                <DataBox label="Tipo de Vivienda" value={solicitud.housing_type} />
                              </div>
                            </div>
                          </div>

                          {/* Columna 3: Multimedia */}
                          <div className="space-y-8 lg:col-span-1">
                            <div>
                              <SectionTitle icon={ImageIcon} title="Verificación Visual" />
                              <div className="grid grid-cols-1 gap-6 mt-4">
                                {solicitud.face_photo_url ? (
                                  <div className="space-y-2">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Foto de Rostro</p>
                                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border bg-muted/20">
                                      <img src={solicitud.face_photo_url} alt="Rostro" className="object-cover w-full h-full" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-8 rounded-2xl border border-dashed border-border text-center text-[10px] text-muted-foreground font-bold">SIN FOTO ROSTRO</div>
                                )}
                                
                                {solicitud.id_front_url ? (
                                  <div className="space-y-2">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Documento de Identidad</p>
                                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-muted/20">
                                      <img src={solicitud.id_front_url} alt="Documento" className="object-cover w-full h-full" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-8 rounded-2xl border border-dashed border-border text-center text-[10px] text-muted-foreground font-bold">SIN FOTO DOCUMENTO</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: any) {
  return (
    <div className="flex items-center space-x-3 border-l-4 border-primary pl-4">
      <Icon className="h-5 w-5 text-primary" />
      <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">{title}</h4>
    </div>
  );
}

function DataBox({ label, value, bold, colSpan, highlight }: any) {
  return (
    <div className={`p-4 bg-muted/20 rounded-2xl border border-border/40 ${colSpan === 2 ? 'col-span-2' : ''}`}>
      <p className="text-[10px] text-muted-foreground font-black uppercase mb-1.5 tracking-widest">{label}</p>
      <p className={`text-base tracking-tight ${bold ? 'font-black' : 'font-semibold'} ${highlight ? 'text-primary' : 'text-white'}`}>
        {value || 'Información no disponible'}
      </p>
    </div>
  );
}