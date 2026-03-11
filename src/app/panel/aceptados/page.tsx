
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Eye, 
  Clock, 
  User, 
  DollarSign, 
  MapPin, 
  RefreshCw,
  CheckCircle2,
  Calendar as CalendarIcon,
  Loader2,
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AceptadosPage() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const formatAmount = (amount: number | string) => {
    return new Intl.NumberFormat('en-US').format(Number(amount));
  };

  useEffect(() => {
    fetchPrestamos();

    const channel = supabase
      .channel('loans-realtime-aceptados')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        () => {
          fetchPrestamos();
        }
      )
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
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPrestamos(data || []);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateDisbursement(id: string, date: string) {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('loans')
        .update({ disbursed_at: date })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Desembolso Actualizado",
        description: "La fecha de desembolso ha sido registrada correctamente.",
      });
      fetchPrestamos();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return (
    <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Cargando Aceptados...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Préstamos Aceptados</h1>
          <p className="text-muted-foreground mt-1">Gestión de desembolsos y seguimiento financiero.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPrestamos}
            className="rounded-xl border-primary/20 hover:bg-primary/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
          </Button>
          <Badge variant="outline" className="px-4 py-2 text-primary border-primary/20 bg-primary/5 font-bold">
            {prestamos.length} ACTIVOS
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {prestamos.length === 0 ? (
          <Card className="bg-card/30 border-dashed border-border p-16 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-white">No hay préstamos aceptados</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">Los préstamos aparecerán aquí una vez que sean aprobados en Solicitudes.</p>
            </div>
          </Card>
        ) : (
          prestamos.map((prestamo) => (
            <Card key={prestamo.id} className="bg-card border-none shadow-xl hover:shadow-primary/5 transition-all overflow-hidden border-l-4 border-l-primary group">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                <div className="flex items-center space-x-5">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden border border-border/50">
                    {prestamo.face_photo_url ? (
                      <img 
                        src={prestamo.face_photo_url} 
                        alt="Rostro"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      {prestamo.first_name} {prestamo.last_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center font-bold text-primary">
                        <DollarSign className="h-4 w-4 mr-0.5" />
                        {formatAmount(prestamo.amount)}
                      </span>
                      <span className="flex items-center text-muted-foreground">
                        <CalendarIcon className="h-4 w-4 mr-1.5 opacity-70" />
                        Desembolso: {prestamo.disbursed_at ? new Date(prestamo.disbursed_at).toLocaleDateString() : 'Pendiente'}
                      </span>
                      <Badge className="bg-primary/20 text-primary border-none font-bold">ACEPTADO</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="secondary" 
                        className="bg-primary/10 hover:bg-primary/20 text-primary font-black rounded-xl h-10 px-6"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" /> FECHA DESEMBOLSO
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-none text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter">Registrar Desembolso</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Seleccionar Fecha</Label>
                          <Input 
                            id="date" 
                            type="date" 
                            defaultValue={prestamo.disbursed_at ? prestamo.disbursed_at.split('T')[0] : new Date().toISOString().split('T')[0]}
                            className="bg-muted/50 border-border text-white"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          className="bg-primary text-white font-black w-full"
                          onClick={() => {
                            const dateInput = document.getElementById('date') as HTMLInputElement;
                            handleUpdateDisbursement(prestamo.id, dateInput.value);
                          }}
                          disabled={updatingId === prestamo.id}
                        >
                          {updatingId === prestamo.id ? <Loader2 className="animate-spin mr-2" /> : null}
                          GUARDAR FECHA
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

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
                                <DataBox label="Fecha Desembolso" value={prestamo.disbursed_at ? new Date(prestamo.disbursed_at).toLocaleDateString() : 'No registrada'} />
                              </div>
                            </div>
                            <div>
                              <SectionTitle icon={CheckCircle2} title="Info Bancaria" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                <DataBox label="Banco" value={prestamo.bank_name || 'No especificado'} />
                                <DataBox label="Número de Cuenta" value={prestamo.account_number || 'Pendiente'} />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-8 lg:col-span-1">
                            <div>
                              <SectionTitle icon={User} title="Perfil" />
                              <div className="grid grid-cols-1 gap-4 mt-4">
                                <DataBox label="Género" value={prestamo.gender} />
                                <DataBox label="Correo" value={prestamo.email} />
                                <DataBox label="Documento ID" value={prestamo.doc_number} />
                                <DataBox label="Dirección" value={prestamo.address} />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-8 lg:col-span-1">
                            <div>
                              <SectionTitle icon={ImageIcon} title="Multimedia" />
                              <div className="grid grid-cols-1 gap-6 mt-4">
                                {prestamo.face_photo_url && (
                                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-border">
                                    <img src={prestamo.face_photo_url} alt="Rostro" className="object-cover w-full h-full" />
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
