
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
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Hash,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogScrollArea
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSolicitudes();

    // Configurar Realtime
    const channel = supabase
      .channel('loans-realtime')
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
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cargar solicitudes",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(id: string, status: 'accepted' | 'rejected') {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? "Solicitud Aceptada" : "Solicitud Rechazada",
        description: `La solicitud ha sido actualizada a ${status}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message,
      });
    }
  }

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Solicitudes Recientes</h1>
          <p className="text-muted-foreground mt-1">Gestión de préstamos en tiempo real.</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5">
          {solicitudes.length} Totales
        </Badge>
      </div>

      <div className="grid gap-4">
        {solicitudes.length === 0 ? (
          <Card className="bg-card/30 border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No hay solicitudes pendientes en este momento.</p>
          </Card>
        ) : (
          solicitudes.map((solicitud) => (
            <Card key={solicitud.id} className="bg-card border-none shadow-xl overflow-hidden group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <User className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                      Solicitud: {solicitud.first_name} {solicitud.last_name}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" />{solicitud.amount}</span>
                      <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{solicitud.payment_term} Cuotas</span>
                      <span className="flex items-center font-bold text-primary/80">{solicitud.payment_method}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {solicitud.status === 'pending' ? (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 font-bold px-4"
                        onClick={() => handleUpdateStatus(solicitud.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-2" /> RECHAZAR
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4"
                        onClick={() => handleUpdateStatus(solicitud.id, 'accepted')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> ACEPTAR
                      </Button>
                    </>
                  ) : (
                    <Badge className={`px-4 py-1 font-bold ${
                      solicitud.status === 'accepted' ? 'bg-primary/20 text-primary' : 'bg-red-400/20 text-red-400'
                    }`}>
                      {solicitud.status.toUpperCase()}
                    </Badge>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-xl border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] bg-card border-none shadow-2xl p-0">
                      <DialogHeader className="p-8 pb-0">
                        <DialogTitle className="text-2xl font-bold text-primary flex items-center uppercase tracking-tighter">
                          <ClipboardList className="mr-3 h-7 w-7" /> 
                          Expediente Completo: {solicitud.first_name} {solicitud.last_name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="p-8 pt-6 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Columna 1: Datos de Préstamo */}
                          <div className="space-y-6">
                            <SectionTitle icon={Wallet} title="Detalles del Préstamo" />
                            <div className="grid grid-cols-2 gap-4">
                              <DataBox label="Monto" value={`$${solicitud.amount}`} bold />
                              <DataBox label="Plazo" value={`${solicitud.payment_term} Cuotas`} />
                              <DataBox label="Método" value={solicitud.payment_method} />
                              <DataBox label="Estado" value={solicitud.status} highlight />
                            </div>

                            <SectionTitle icon={CreditCard} title="Datos Bancarios" />
                            <div className="grid grid-cols-1 gap-4">
                              <DataBox label="Banco" value={solicitud.bank_name || 'N/A'} />
                              <DataBox label="Nº Cuenta" value={solicitud.account_number || 'N/A'} />
                            </div>

                            <SectionTitle icon={History} title="Referencias Personales" />
                            <div className="space-y-4">
                              <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
                                <p className="text-[10px] text-primary font-bold uppercase mb-2">Referencia 1</p>
                                <p className="text-sm font-bold text-white">{solicitud.ref1_name}</p>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                  <Users className="h-3 w-3 mr-1" /> {solicitud.ref1_relation} | <Phone className="h-3 w-3 mx-1" /> {solicitud.ref1_phone}
                                </p>
                              </div>
                              <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
                                <p className="text-[10px] text-primary font-bold uppercase mb-2">Referencia 2</p>
                                <p className="text-sm font-bold text-white">{solicitud.ref2_name}</p>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                  <Users className="h-3 w-3 mr-1" /> {solicitud.ref2_relation} | <Phone className="h-3 w-3 mx-1" /> {solicitud.ref2_phone}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Columna 2: Datos Personales */}
                          <div className="space-y-6">
                            <SectionTitle icon={User} title="Información del Cliente" />
                            <div className="grid grid-cols-2 gap-4">
                              <DataBox label="Email" value={solicitud.email} colSpan={2} />
                              <DataBox label="Género" value={solicitud.gender} />
                              <DataBox label="Fec. Nac" value={solicitud.dob} />
                              <DataBox label="Nº Documento" value={solicitud.doc_number} />
                              <DataBox label="Estado Civil" value={solicitud.marital_status} />
                              <DataBox label="Educación" value={solicitud.education_level} />
                            </div>

                            <SectionTitle icon={MapPin} title="Ubicación y Vivienda" />
                            <div className="grid grid-cols-2 gap-4">
                              <DataBox label="Dirección" value={solicitud.address} colSpan={2} />
                              <DataBox label="Provincia" value={solicitud.province} />
                              <DataBox label="Ciudad" value={solicitud.city} />
                              <DataBox label="Vivienda" value={solicitud.housing_type} />
                            </div>

                            <SectionTitle icon={Briefcase} title="Multimedia" />
                            <div className="flex flex-wrap gap-3">
                              {solicitud.face_photo_url && (
                                <a href={solicitud.face_photo_url} target="_blank" rel="noreferrer">
                                  <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl bg-muted/30 hover:bg-primary/20 hover:text-primary transition-all border border-border">
                                    <User className="h-4 w-4 mr-2" /> Foto Rostro
                                  </Button>
                                </a>
                              )}
                              {solicitud.id_front_url && (
                                <a href={solicitud.id_front_url} target="_blank" rel="noreferrer">
                                  <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl bg-muted/30 hover:bg-primary/20 hover:text-primary transition-all border border-border">
                                    <CreditCard className="h-4 w-4 mr-2" /> Foto ID
                                  </Button>
                                </a>
                              )}
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
    <div className="flex items-center space-x-2 border-l-2 border-primary pl-3 mb-4">
      <Icon className="h-4 w-4 text-primary" />
      <h4 className="text-xs font-bold text-white uppercase tracking-widest">{title}</h4>
    </div>
  );
}

function DataBox({ label, value, bold, colSpan, highlight }: any) {
  return (
    <div className={`p-3 bg-muted/10 rounded-xl border border-border/30 ${colSpan === 2 ? 'col-span-2' : ''}`}>
      <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">{label}</p>
      <p className={`text-sm tracking-tight ${bold ? 'font-bold' : 'font-medium'} ${highlight ? 'text-primary' : 'text-white'}`}>
        {value || 'No provisto'}
      </p>
    </div>
  );
}
