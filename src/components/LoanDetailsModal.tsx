'use client';

import React from 'react';
import { 
  User, 
  DollarSign, 
  MapPin, 
  Image as ImageIcon,
  Users,
  CreditCard,
  Phone,
  Clock,
  Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LoanDetailsModalProps {
  loan: any;
  trigger?: React.ReactNode;
}

export function LoanDetailsModal({ loan, trigger }: LoanDetailsModalProps) {
  const formatAmount = (amount: number | string) => {
    return new Intl.NumberFormat('en-US').format(Number(amount));
  };

  const statusMap: Record<string, string> = {
    'pending': 'PENDIENTE',
    'accepted': 'ACEPTADO',
    'rejected': 'RECHAZADO',
    'paid': 'PAGADO',
    'overdue': 'MORA'
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary transition-colors">
            <Clock className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-card border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-muted/10 border-b border-border">
          <DialogTitle className="text-2xl font-black text-white flex items-center uppercase tracking-tighter">
            {loan.first_name} {loan.last_name}
          </DialogTitle>
        </DialogHeader>
        <div className="p-8 pt-6 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Columna 1: Finanzas */}
            <div className="space-y-8 lg:col-span-1">
              <div>
                <SectionTitle icon={DollarSign} title="Detalles del Préstamo" />
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <DataBox label="Monto Solicitado" value={`$${formatAmount(loan.amount)}`} bold highlight />
                  <DataBox label="Plazo (Días)" value={`${loan.payment_term} Días`} />
                  <DataBox label="Celular" value={loan.phone} highlight />
                  <DataBox label="Estado" value={statusMap[loan.status]} />
                </div>
              </div>

              <div>
                <SectionTitle icon={CreditCard} title="Información Bancaria" />
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <DataBox label="Banco" value={loan.bank_name} />
                  <DataBox label="Número de Cuenta" value={loan.account_number} />
                </div>
              </div>
            </div>

            {/* Columna 2: Perfil */}
            <div className="space-y-8 lg:col-span-1">
              <div>
                <SectionTitle icon={User} title="Perfil del Cliente" />
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <DataBox label="Documento ID" value={loan.doc_number} />
                  <DataBox label="Correo" value={loan.email} />
                  <DataBox label="Género" value={loan.gender} />
                  <DataBox label="Fecha Nacimiento" value={loan.dob} />
                </div>
              </div>

              <div>
                <SectionTitle icon={MapPin} title="Ubicación" />
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <DataBox label="Dirección" value={loan.address} />
                  <DataBox label="Ciudad" value={loan.city} />
                </div>
              </div>
            </div>

            {/* Columna 3: Referencias y Multimedia */}
            <div className="space-y-8 lg:col-span-1">
              <div>
                <SectionTitle icon={Users} title="Referencias" />
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] text-primary font-black uppercase mb-1">Ref 1: {loan.ref1_name}</p>
                    <p className="text-xs text-muted-foreground"><Phone className="h-3 w-3 inline mr-1" /> {loan.ref1_phone}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] text-primary font-black uppercase mb-1">Ref 2: {loan.ref2_name}</p>
                    <p className="text-xs text-muted-foreground"><Phone className="h-3 w-3 inline mr-1" /> {loan.ref2_phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle icon={ImageIcon} title="Multimedia" />
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {loan.face_photo_url && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-muted-foreground font-black uppercase">Foto Rostro</p>
                      <img src={loan.face_photo_url} alt="Selfie" className="rounded-xl border border-border aspect-square object-cover" />
                    </div>
                  )}
                  {loan.disbursement_receipt_url && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-primary font-black uppercase">Comprobante Desembolso</p>
                      <img 
                        src={loan.disbursement_receipt_url} 
                        alt="Comprobante" 
                        className="rounded-xl border border-primary/30 aspect-video object-cover cursor-zoom-in" 
                        onClick={() => window.open(loan.disbursement_receipt_url, '_blank')}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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