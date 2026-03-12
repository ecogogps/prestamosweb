'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Eye, 
  DollarSign, 
  RefreshCw,
  User,
  CalendarCheck,
  Search
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { LoanDetailsModal } from '@/components/LoanDetailsModal';
import { LoanFinanceModal } from '@/components/LoanFinanceModal';

export default function DMinusOnePage() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const formatAmount = (amount: number | string) => {
    return new Intl.NumberFormat('en-US').format(Number(amount));
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Pendiente';
    try {
      const parts = dateStr.split('T')[0].split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
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
  }, []);

  async function fetchPrestamos() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('loans').select('*').eq('status', 'accepted').not('disbursed_at', 'is', null);
      if (error) throw error;

      const todayStr = getMexicoTodayStr();
      const tomorrow = new Date(todayStr + 'T12:00:00');
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const filtered = (data || []).filter(loan => {
        const disbursement = new Date(loan.disbursed_at.split('T')[0] + 'T12:00:00');
        const dueDate = new Date(disbursement);
        dueDate.setDate(dueDate.getDate() + (loan.payment_term || 0));
        return dueDate.toISOString().split('T')[0] === tomorrowStr;
      });

      setPrestamos(filtered);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  }

  const filteredPrestamos = prestamos.filter(p => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary uppercase">Módulo D-1</h1>
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-9 bg-card border-border rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" onClick={fetchPrestamos} className="rounded-xl border-primary/20"><RefreshCw className="h-4 w-4 mr-2" /> Actualizar</Button>
          <Badge variant="outline" className="px-4 py-2 text-primary border-primary/20 bg-primary/5 font-bold">{filteredPrestamos.length} PRÓXIMOS</Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPrestamos.length === 0 && !loading ? (
          <Card className="bg-card/30 border-dashed border-border p-16 text-center">
            <CalendarCheck className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">Sin vencimientos para mañana</h3>
          </Card>
        ) : filteredPrestamos.map((prestamo) => {
          const disbursement = new Date(prestamo.disbursed_at.split('T')[0] + 'T12:00:00');
          const dueDate = new Date(disbursement);
          dueDate.setDate(dueDate.getDate() + (prestamo.payment_term || 0));

          return (
            <Card key={prestamo.id} className="bg-card border-none shadow-xl border-l-4 border-l-yellow-500 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                <div className="flex items-center space-x-5">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                    {prestamo.face_photo_url ? <img src={prestamo.face_photo_url} alt="Rostro" className="h-full w-full object-cover" /> : <User className="h-8 w-8" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{prestamo.first_name} {prestamo.last_name}</h3>
                      <span className="text-primary font-bold text-lg bg-primary/10 px-3 py-0.5 rounded-lg border border-primary/20">{prestamo.phone || 'S/N'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center font-bold text-primary"><DollarSign className="h-4 w-4 mr-0.5" />{formatAmount(prestamo.amount)}</span>
                      <span className="flex items-center text-yellow-500 font-bold"><CalendarCheck className="h-4 w-4 mr-1.5" />Vence: {formatDateDisplay(dueDate.toISOString())}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <LoanFinanceModal loanId={prestamo.id} />
                  <LoanDetailsModal loan={prestamo} trigger={
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary"><Eye className="h-5 w-5" /></Button>
                  }/>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
