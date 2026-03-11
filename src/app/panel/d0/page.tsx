'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Eye, 
  DollarSign, 
  RefreshCw,
  User,
  CalendarCheck,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  CreditCard,
  Phone,
  Image as ImageIcon
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

export default function DZeroPage() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const formatAmount = (amount: number | string) => {
    return new Intl.NumberFormat('en-US').format(Number(amount));
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Pendiente';
    try {
      const cleanDate = dateStr.split('T')[0];
      const date = new Date(cleanDate + 'T12:00:00');
      if (isNaN(date.getTime())) return dateStr;

      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'America/Mexico_City'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const getMexicoTodayStr = () => {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  };

  useEffect(() => {
    fetchPrestamos();

    const channel = supabase
      .channel('loans-realtime-d0')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, () => fetchPrestamos())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchPrestamos() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'accepted')
        .not('disbursed_at', 'is', null);

      if (error) throw error;

      const todayStr = getMexicoTodayStr();
      
      const filtered = (data || []).filter(loan => {
        const disbursement = new Date(loan.disbursed_at.split('T')[0] + 'T12:00:00');
        const dueDate = new Date(disbursement);
        dueDate.setDate(dueDate.getDate() + (loan.payment_term || 0));
        
        const dueDateStr = dueDate.toISOString().split('T')[0];
        return dueDateStr === todayStr;
      });

      setPrestamos(filtered);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase text-primary">Módulo D0</h1>
          <p className="text-muted-foreground mt-1">Día de cobro actual (Hora México).</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchPrestamos} className="rounded-xl border-primary/20">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
          </Button>
          <Badge variant="outline" className="px-4 py-2 text-primary border-primary/20 bg-primary/5 font-bold">
            {prestamos.length} PARA HOY
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {prestamos.length === 0 && !loading ? (
          <Card className="bg-card/30 border-dashed border-border p-16 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <CalendarCheck className="h-10 w-10 text-muted-foreground/50" />
              <h3 className="text-xl font-bold text-white">Sin cobros programados para hoy</h3>
              <p className="text-muted-foreground">La agenda de hoy está libre de vencimientos.</p>
            </div>
          </Card>
        ) : prestamos.map((prestamo) => {
          const disbursement = new Date(prestamo.disbursed_at.split('T')[0] + 'T12:00:00');
          const dueDate = new Date(disbursement);
          dueDate.setDate(dueDate.getDate() + (prestamo.payment_term || 0));

          return (
            <Card key={prestamo.id} className="bg-card border-none shadow-xl border-l-4 border-l-primary overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                <div className="flex items-center space-x-5">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden border border-border/50">
                    {prestamo.face_photo_url ? (
                      <img src={prestamo.face_photo_url} alt="Rostro" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{prestamo.first_name} {prestamo.last_name}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center font-bold text-primary">
                        <DollarSign className="h-4 w-4 mr-0.5" />
                        {formatAmount(prestamo.amount)}
                      </span>
                      <span className="flex items-center text-muted-foreground">
                        <CalendarIcon className="h-4 w-4 mr-1.5 opacity-70" />
                        Desembolso: {formatDateDisplay(prestamo.disbursed_at)}
                      </span>
                      <span className="flex items-center text-primary font-bold">
                        <CalendarCheck className="h-4 w-4 mr-1.5" />
                        Vence: Hoy ({formatDateDisplay(dueDate.toISOString().split('T')[0])})
                      </span>
                    </div>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary">
                      <Eye className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[90vh] bg-card border-none shadow-2xl p-0 overflow-hidden">
                    <div className="p-8 pb-4 bg-muted/10 border-b border-border">
                      <DialogTitle className="text-2xl font-black text-white flex items-center uppercase tracking-tighter">
                        {prestamo.first_name} {prestamo.last_name}
                      </DialogTitle>
                    </div>
                    <div className="p-8 pt-6 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="space-y-8 lg:col-span-1">
                          <div>
                            <SectionTitle icon={DollarSign} title="Detalles" />
                            <div className="grid grid-cols-1 gap-4 mt-4">
                              <DataBox label="Monto Solicitado" value={`$${formatAmount(prestamo.amount)}`} bold highlight />
                              <DataBox label="Plazo de Pago (Días)" value={`${prestamo.payment_term} Días`} />
                              <DataBox label="Forma de Pago" value={prestamo.payment_method} />
                              <DataBox label="Fecha Desembolso" value={formatDateDisplay(prestamo.disbursed_at)} />
                              <DataBox label="Fecha Vencimiento" value={formatDateDisplay(dueDate.toISOString().split('T')[0])} highlight />
                            </div>
                          </div>
                          <div>
                            <SectionTitle icon={CreditCard} title="Información Bancaria" />
                            <div className="grid grid-cols-1 gap-4 mt-4">
                              <DataBox label="Banco" value={prestamo.bank_name || 'No especificado'} />
                              <DataBox label="Número de Cuenta" value={prestamo.account_number || 'Pendiente'} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8 lg:col-span-1">
                          <div>
                            <SectionTitle icon={User} title="Perfil del Solicitante" />
                            <div className="grid grid-cols-1 gap-4 mt-4">
                              <DataBox label="Género" value={prestamo.gender} />
                              <DataBox label="Correo Electrónico" value={prestamo.email} />
                              <DataBox label="Documento ID" value={prestamo.doc_number} />
                              <DataBox label="Fecha Nacimiento" value={prestamo.dob} />
                              <DataBox label="Estado Civil" value={prestamo.marital_status} />
                              <DataBox label="Nivel Académico" value={prestamo.education_level} />
                            </div>
                          </div>
                          <div>
                            <SectionTitle icon={MapPin} title="Ubicación y Domicilio" />
                            <div className="grid grid-cols-1 gap-4 mt-4">
                              <DataBox label="Dirección Completa" value={prestamo.address} />
                              <DataBox label="Provincia/Estado" value={prestamo.province} />
                              <DataBox label="Ciudad" value={prestamo.city} />
                              <DataBox label="Tipo de Vivienda" value={prestamo.housing_type} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8 lg:col-span-1">
                          <div>
                            <SectionTitle icon={Users} title="Referencias" />
                            <div className="space-y-4 mt-4">
                              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <p className="text-[10px] text-primary font-black uppercase mb-1 tracking-widest">Referencia Primaria</p>
                                <p className="text-sm font-bold text-white">{prestamo.ref1_name || 'N/A'}</p>
                                <div className="flex flex-col mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center capitalize">{prestamo.ref1_relation}</span>
                                  <span className="flex items-center mt-1"><Phone className="h-3 w-3 mr-1.5 text-primary" /> {prestamo.ref1_phone}</span>
                                </div>
                              </div>
                              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <p className="text-[10px] text-primary font-black uppercase mb-1 tracking-widest">Referencia Secundaria</p>
                                <p className="text-sm font-bold text-white">{prestamo.ref2_name || 'N/A'}</p>
                                <div className="flex flex-col mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center capitalize">{prestamo.ref2_relation}</span>
                                  <span className="flex items-center mt-1"><Phone className="h-3 w-3 mr-1.5 text-primary" /> {prestamo.ref2_phone}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <SectionTitle icon={ImageIcon} title="Verificación Visual" />
                            <div className="grid grid-cols-1 gap-6 mt-4">
                              {prestamo.face_photo_url && (
                                <div className="space-y-2">
                                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Foto de Rostro</p>
                                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border">
                                    <img src={prestamo.face_photo_url} alt="Rostro" className="object-cover w-full h-full" />
                                  </div>
                                </div>
                              )}
                              {prestamo.id_front_url && (
                                <div className="space-y-2">
                                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Documento ID</p>
                                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border">
                                    <img src={prestamo.id_front_url} alt="ID" className="object-cover w-full h-full" />
                                  </div>
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
            </Card>
          );
        })}
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

function DataBox({ label, value, bold, highlight }: any) {
  return (
    <div className="p-4 bg-muted/20 rounded-2xl border border-border/40">
      <p className="text-[10px] text-muted-foreground font-black uppercase mb-1.5 tracking-widest">{label}</p>
      <p className={`text-base tracking-tight ${bold ? 'font-black' : 'font-semibold'} ${highlight ? 'text-primary' : 'text-white'}`}>
        {value || 'Información no disponible'}
      </p>
    </div>
  );
}