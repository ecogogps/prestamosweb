
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Eye, 
  DollarSign, 
  RefreshCw,
  User,
  CalendarCheck,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function DZeroPage() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const formatAmount = (amount: number | string) => {
    return new Intl.NumberFormat('en-US').format(Number(amount));
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Pendiente';
    const parts = dateStr.split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  useEffect(() => {
    fetchPrestamos();
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const filtered = (data || []).filter(loan => {
        const disbursement = new Date(loan.disbursed_at);
        disbursement.setHours(0, 0, 0, 0);
        const dueDate = new Date(disbursement);
        dueDate.setDate(dueDate.getDate() + (loan.payment_term || 0));
        
        return dueDate.getTime() === today.getTime();
      });

      setPrestamos(filtered);
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

  if (loading) return (
    <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Cargando Cobros de Hoy...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Módulo D0</h1>
          <p className="text-muted-foreground mt-1">Día de cobro / Fecha de vencimiento actual.</p>
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
        {prestamos.length === 0 ? (
          <Card className="bg-card/30 border-dashed border-border p-16 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <CalendarCheck className="h-10 w-10 text-muted-foreground/50" />
              <h3 className="text-xl font-bold text-white">Sin cobros programados para hoy</h3>
              <p className="text-muted-foreground">La agenda de hoy está libre de vencimientos.</p>
            </div>
          </Card>
        ) : (
          prestamos.map((prestamo) => (
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
                        Vence: Hoy
                      </span>
                      <Badge className="bg-primary/20 text-primary border-none font-bold uppercase">Cobro Hoy</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary">
                  <Eye className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
