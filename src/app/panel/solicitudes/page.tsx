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
  RefreshCw,
  ClipboardList,
  AlertCircle,
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { LoanDetailsModal } from '@/components/LoanDetailsModal';

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

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
        () => fetchSolicitudes()
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
      toast({ variant: "destructive", title: "Error", description: err.message });
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
          <Button variant="outline" size="sm" onClick={fetchSolicitudes} className="rounded-xl border-primary/20">
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {filteredSolicitudes.length === 0 ? (
          <Card className="bg-card/30 border-dashed border-border p-16 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">No hay resultados</h3>
          </Card>
        ) : (
          filteredSolicitudes.map((solicitud) => (
            <Card key={solicitud.id} className="bg-card border-none shadow-xl border-l-4 border-l-transparent hover:border-l-primary group">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                <div className="flex items-center space-x-5">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                    {solicitud.face_photo_url ? (
                      <img src={solicitud.face_photo_url} alt="Rostro" className="h-full w-full object-cover" />
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
                      <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
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
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-muted/10 p-1 rounded-2xl border border-border/50">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:bg-red-400/10 font-black px-4 h-10 rounded-xl"
                      onClick={() => handleUpdateStatus(solicitud.id, 'rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-2" /> RECHAZAR
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90 text-white font-black px-4 h-10 rounded-xl ml-1"
                      onClick={() => handleUpdateStatus(solicitud.id, 'accepted')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> ACEPTAR
                    </Button>
                  </div>
                  <LoanDetailsModal 
                    loan={solicitud} 
                    trigger={
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary">
                        <Eye className="h-5 w-5" />
                      </Button>
                    }
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
