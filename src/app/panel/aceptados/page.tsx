'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Eye, 
  DollarSign, 
  RefreshCw,
  User,
  CheckCircle2,
  Calendar as CalendarIcon,
  Loader2,
  Search,
  Upload
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoanDetailsModal } from '@/components/LoanDetailsModal';

export default function AceptadosPage() {
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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

  useEffect(() => {
    fetchPrestamos();
    const channel = supabase.channel('loans-aceptados').on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, () => fetchPrestamos()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchPrestamos() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('loans').select('*').eq('status', 'accepted').order('updated_at', { ascending: false });
      if (error) throw error;
      setPrestamos(data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateDisbursement(id: string, date: string, file?: File) {
    setUpdatingId(id);
    try {
      let receiptUrl = null;
      if (file) {
        const fileName = `${id}_${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = `receipts/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('loan-files').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('loan-files').getPublicUrl(filePath);
        receiptUrl = publicUrl;
      }

      const { error } = await supabase.from('loans').update({ disbursed_at: date, disbursement_receipt_url: receiptUrl }).eq('id', id);
      if (error) throw error;

      toast({ title: "Desembolso Registrado", description: "Información guardada correctamente." });
      fetchPrestamos();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredPrestamos = prestamos.filter(p => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const phone = (p.phone || '').toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Cargando Aceptados...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Préstamos Aceptados</h1>
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
          <Button variant="outline" size="sm" onClick={fetchPrestamos} className="rounded-xl border-primary/20">
            <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
          </Button>
          <Badge variant="outline" className="px-4 py-2 text-primary border-primary/20 bg-primary/5 font-bold">
            {filteredPrestamos.length} ACTIVOS
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPrestamos.length === 0 ? (
          <Card className="bg-card/30 border-dashed border-border p-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">No hay resultados</h3>
          </Card>
        ) : (
          filteredPrestamos.map((prestamo) => (
            <Card key={prestamo.id} className="bg-card border-none shadow-xl border-l-4 border-l-primary group">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                <div className="flex items-center space-x-5">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                    {prestamo.face_photo_url ? (
                      <img src={prestamo.face_photo_url} alt="Rostro" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{prestamo.first_name} {prestamo.last_name}</h3>
                      <span className="text-primary font-bold text-lg bg-primary/10 px-3 py-0.5 rounded-lg border border-primary/20">{prestamo.phone || 'S/N'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center font-bold text-primary"><DollarSign className="h-4 w-4 mr-0.5" />{formatAmount(prestamo.amount)}</span>
                      <span className="flex items-center text-muted-foreground"><CalendarIcon className="h-4 w-4 mr-1.5 opacity-70" />Desembolso: {formatDateDisplay(prestamo.disbursed_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary font-black rounded-xl h-10 px-6">DESEMBOLSO</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-none text-white max-w-md">
                      <DialogHeader><h2 className="text-xl font-black uppercase">Registrar Desembolso</h2></DialogHeader>
                      <div className="space-y-6 py-4">
                        <div className="space-y-2">
                          <Label>Fecha de Transferencia</Label>
                          <Input id={`date-${prestamo.id}`} type="date" defaultValue={prestamo.disbursed_at || new Date().toISOString().split('T')[0]} className="bg-muted/50 border-border rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Comprobante</Label>
                          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-2xl bg-muted/20 relative">
                            <Upload className="h-8 w-8 text-primary mb-2" />
                            <input id={`file-${prestamo.id}`} type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button className="bg-primary text-white font-black w-full h-12 rounded-xl" onClick={() => {
                          const date = (document.getElementById(`date-${prestamo.id}`) as HTMLInputElement).value;
                          const file = (document.getElementById(`file-${prestamo.id}`) as HTMLInputElement).files?.[0];
                          handleUpdateDisbursement(prestamo.id, date, file);
                        }} disabled={updatingId === prestamo.id}>{updatingId === prestamo.id && <Loader2 className="animate-spin mr-2" />}GUARDAR</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <LoanDetailsModal loan={prestamo} trigger={
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary">
                      <Eye className="h-5 w-5" />
                    </Button>
                  }/>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}