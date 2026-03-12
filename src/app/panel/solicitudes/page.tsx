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
  RefreshCw,
  ClipboardList,
  Users,
  Image as ImageIcon,
  CreditCard,
  Phone,
  AlertCircle,
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      .channel('loans-realtime-solicitudes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        () => {
          fetchSolicitudes();
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
        .eq('status', 'pending')
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
        description: `La solicitud ha sido movida a ${status === 'accepted' ? 'Aceptados' : 'Rechazados'}.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: err.message,
      });
    }
  }

  const filteredSolicitudes = solicitudes.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const phone = (s.phone || '').toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());
  });

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
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Solicitudes Pendientes</h1>
          <p className="text-muted-foreground mt-1">Gestión de nuevas solicitudes recibidas.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar nombre o celular..." 
              className="pl-9 bg-card border-border rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSolicitudes}
            className="rounded-xl border-primary/20 hover:bg-primary/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
          </Button>
          <Badge variant="outline" className="px-4 py-2 text-primary border-primary/20 bg-primary/5 font-bold">
            {filteredSolicitudes.length} PENDIENTES
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Conexión</AlertTitle>
          <AlertDescription>
            {error}. Verifica la conexión con Supabase.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {filteredSolicitudes.length === 0 ? (
          <Card className="bg-card/30 border-dashed border-border p-16 text-center shadow-inner">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
                <ClipboardList className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-white">No hay resultados</h3>
            </div>
          </Card>
        ) : (
          filteredSolicitudes.map((solicitud) => (
            <Card key={solicitud.id} className="bg-card border-none shadow-xl hover:shadow-primary/5 transition-all overflow-hidden border-l-4 border-l-transparent hover:border-l-primary group">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                <div className="flex items-center space-x-5">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden border border-border/50">
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
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {solicitud.first_name} {solicitud.last_name}
                      </h3>
                      <span className="text-primary font-bold text-lg bg-primary/10 px-3 py-0.5 rounded-lg border border-primary/20">
                        {solicitud.phone || 'S/N'}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-primary animate-ping" title="Nuevo" />
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
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:ml-auto md:ml-0">
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
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary transition-colors">
                        <Eye className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[90vh] bg-card border-none shadow-2xl p-0 overflow-hidden">
                      <DialogHeader className="p-8 pb-4 bg-muted/10 border-b border-border">
                        <DialogTitle className="text-2xl font-black text-white flex items-center uppercase tracking-tighter">
                          {solicitud.first_name} {solicitud.last_name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="p-8 pt-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                          <div className="space-y-8 lg:col-span-1">
                            <div>
                              <SectionTitle icon={DollarSign} title="Detalles" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                <DataBox label="Monto Solicitado" value={`$${formatAmount(solicitud.amount)}`} bold highlight />
                                <DataBox label="Plazo de Pago (Días)" value={`${solicitud.payment_term} Días`} />
                                <DataBox label="Celular" value={solicitud.phone} highlight />
                                <DataBox label="Estado Actual" value={statusMap[solicitud.status]} />
                              </div>
                            </div>
                            <div>
                              <SectionTitle icon={CreditCard} title="Información Bancaria" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                <DataBox label="Banco" value={solicitud.bank_name || 'No especificado'} />
                                <DataBox label="Número de Cuenta" value={solicitud.account_number || 'Pendiente'} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-8 lg:col-span-1">
                            <div>
                              <SectionTitle icon={User} title="Perfil del Solicitante" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                <DataBox label="Género" value={solicitud.gender} />
                                <DataBox label="Correo Electrónico" value={solicitud.email} />
                                <DataBox label="Documento ID" value={solicitud.doc_number} />
                                <DataBox label="Fecha Nacimiento" value={solicitud.dob} />
                              </div>
                            </div>
                            <div>
                              <SectionTitle icon={MapPin} title="Ubicación" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                <DataBox label="Dirección" value={solicitud.address} />
                                <DataBox label="Ciudad" value={solicitud.city} />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-8 lg:col-span-1">
                            <div>
                              <SectionTitle icon={Users} title="Referencias" />
                              <div className="space-y-4 mt-4">
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                  <p className="text-[10px] text-primary font-black uppercase mb-1">Referencia 1</p>
                                  <p className="text-sm font-bold text-white">{solicitud.ref1_name}</p>
                                  <p className="text-xs text-muted-foreground mt-1"><Phone className="h-3 w-3 inline mr-1" /> {solicitud.ref1_phone}</p>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                  <p className="text-[10px] text-primary font-black uppercase mb-1">Referencia 2</p>
                                  <p className="text-sm font-bold text-white">{solicitud.ref2_name}</p>
                                  <p className="text-xs text-muted-foreground mt-1"><Phone className="h-3 w-3 inline mr-1" /> {solicitud.ref2_phone}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <SectionTitle icon={ImageIcon} title="Multimedia" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                {solicitud.face_photo_url && (
                                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border">
                                    <img src={solicitud.face_photo_url} alt="Selfie" className="object-cover w-full h-full" />
                                  </div>
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
      <h4 className="text-sm font-black text-white uppercase tracking-widest">{title}</h4>
    </div>
  );
}

function DataBox({ label, value, bold, highlight }: any) {
  return (
    <div className="p-4 bg-muted/20 rounded-2xl border border-border/40">
      <p className="text-[10px] text-muted-foreground font-black uppercase mb-1.5">{label}</p>
      <p className={`text-base ${bold ? 'font-black' : 'font-semibold'} ${highlight ? 'text-primary' : 'text-white'}`}>
        {value || 'N/A'}
      </p>
    </div>
  );
}