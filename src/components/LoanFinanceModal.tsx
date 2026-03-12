'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2,
  PiggyBank
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

      // La función RETURNS JSON devuelve el objeto directamente
      setData(rpcData || null);
    } catch (err: any) {
      console.error("Error al obtener detalles financieros:", err.message || err);
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
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
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
      <DialogContent className="bg-[#212529] border-none text-white max-w-md p-0 rounded-[32px] overflow-hidden shadow-2xl">
        <DialogTitle className="sr-only">Detalles Financieros del Préstamo</DialogTitle>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calculando intereses...</p>
          </div>
        ) : data ? (
          <div className="flex flex-col">
            {/* Header / Card Superior */}
            <div className="p-8 pb-10 bg-[#2b2f33] rounded-[32px] m-4 shadow-lg border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#71AF57]/20 flex items-center justify-center">
                    <PiggyBank className="h-6 w-6 text-[#71AF57]" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tighter">Préstamo</h2>
                </div>
                {data.is_overdue && (
                  <Badge className="bg-orange-500/20 text-orange-500 border-none font-bold px-3 py-1 rounded-lg uppercase text-[10px] tracking-widest">
                    VENCIDO
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[#71AF57] font-black text-lg">{formatCurrency(data.requested_amount)}</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1 leading-tight uppercase tracking-tight">Monto de<br/>préstamo</p>
                </div>
                <div className="text-center">
                  <p className="text-[#71AF57] font-black text-lg">{formatDate(data.disbursement_date)}</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1 leading-tight uppercase tracking-tight">Fecha de<br/>desembolso</p>
                </div>
                <div className="text-center">
                  <p className="text-orange-500 font-black text-lg">{formatDate(data.expiration_date)}</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1 leading-tight uppercase tracking-tight">Fecha de<br/>vencimiento</p>
                </div>
              </div>
            </div>

            {/* Detalles Section */}
            <div className="px-8 pb-10 pt-4 space-y-6">
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Detalles</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Plazo del préstamo</span>
                  <span className="text-sm font-bold text-white">{data.payment_term} días</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Forma de pago</span>
                  <span className="text-sm font-bold text-white capitalize">{data.payment_method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Monto recibido</span>
                  <span className="text-sm font-bold text-white">{formatCurrency(data.amount_received)}</span>
                </div>

                <div className="py-2">
                  <Separator className="bg-white/5" />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Interés total</span>
                  <span className="text-sm font-bold text-white">{formatCurrency(data.total_interest)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Mora ({data.delay_days} días · 5%/día)
                  </span>
                  <span className={`text-sm font-bold ${data.late_interest > 0 ? 'text-red-400' : 'text-white'}`}>
                    {data.late_interest > 0 ? '+' : ''}{formatCurrency(data.late_interest)}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-medium text-muted-foreground">Monto a pagar</span>
                  <span className="text-lg font-black text-white">{formatCurrency(data.total_to_pay)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground font-bold">No se pudieron cargar los datos.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}