'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  DollarSign, 
  AlertCircle, 
  Calendar, 
  Loader2,
  Wallet
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LoanFinanceModalProps {
  loanId: string;
  trigger?: React.ReactNode;
}

export function LoanFinanceModal({ loanId, trigger }: LoanFinanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchDetails = async () => {
    if (!loanId) return;
    setLoading(true);
    try {
      const { data: rpcData, error } = await supabase.rpc('get_loan_details', { 
        p_loan_id: loanId 
      });

      if (error) {
        console.error("Error de RPC:", error.message, error.details, error.hint);
        throw error;
      }

      // Supabase RPC puede retornar un objeto o un arreglo de 1 elemento
      if (Array.isArray(rpcData)) {
        setData(rpcData[0] || null);
      } else {
        setData(rpcData || null);
      }
    } catch (err: any) {
      console.error("Error al obtener detalles financieros del préstamo:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      // Manejar tanto formato ISO como solo fecha
      const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const parts = datePart.split('-');
      if (parts.length !== 3) return dateStr;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchDetails()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary font-black rounded-xl h-10 px-6 uppercase tracking-tight">
            Préstamo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-none text-white max-w-sm p-8 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase text-center mb-6 tracking-tighter flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            DETALLES DE COBRO
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calculando intereses...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2">
                 <DollarSign className="h-12 w-12 text-primary/10 -mr-4 -mt-4" />
              </div>
              <p className="text-[10px] text-primary font-black uppercase mb-1 tracking-widest">Total a Pagar</p>
              <h2 className="text-4xl font-black text-white tracking-tighter">
                {formatCurrency(data.total_to_pay)}
              </h2>
              {(data.late_interest > 0 || data.status === 'overdue') && (
                 <Badge variant="destructive" className="mt-3 bg-red-500/20 text-red-400 border-red-500/20 font-black px-3 py-1 text-[10px] uppercase">
                    Mora Aplicada
                 </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 bg-muted/20 rounded-2xl border border-border/40 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-black uppercase mb-0.5 tracking-widest">Mora Acumulada</p>
                  <p className={`text-lg font-black ${data.late_interest > 0 ? 'text-red-400' : 'text-white'}`}>
                    {formatCurrency(data.late_interest)}
                  </p>
                </div>
                <AlertCircle className={`h-5 w-5 ${data.late_interest > 0 ? 'text-red-400/50' : 'text-muted-foreground/30'}`} />
              </div>

              <div className="p-4 bg-muted/20 rounded-2xl border border-border/40 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-black uppercase mb-0.5 tracking-widest">Fecha Vencimiento</p>
                  <p className="text-lg font-black text-white">
                    {formatDate(data.expiration_date)}
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-primary/50" />
              </div>
            </div>

            <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-50 px-4 leading-relaxed">
              Los cálculos de mora y totales son generados automáticamente según las políticas de MoneyBic.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground font-bold">No se pudieron cargar los datos financieros.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}