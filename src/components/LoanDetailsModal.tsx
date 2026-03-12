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
  Calendar,
  Briefcase,
  Mail,
  Hash,
  Home,
  BookOpen,
  Heart
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

  const hasVisualData = !!(
    loan.face_photo_url || 
    loan.id_front_url || 
    loan.id_back_url || 
    loan.disbursement_receipt_url
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border hover:bg-primary/10 hover:text-primary transition-colors">
            <Clock className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] bg-card border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-muted/10 border-b border-border">
          <DialogTitle className="text-2xl font-black text-white flex items-center uppercase tracking-tighter">
            {loan.first_name} {loan.last_name}
          </DialogTitle>
        </DialogHeader>
        <div className="p-8 pt-6 overflow-y-auto max-h-[calc(95vh-100px)] custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna 1: Finanzas y Banco */}
            <div className="space-y-8">
              <div>
                <SectionTitle icon={DollarSign} title="Detalles del Préstamo" />
                <div className="grid grid-cols-1 gap-3 mt-4">
                  <DataBox label="Monto Solicitado" value={`$${formatAmount(loan.amount)}`} bold highlight />
                  <DataBox label="Plazo (Días)" value={`${loan.payment_term} Días`} />
                  <DataBox label="Forma de Pago" value={loan.payment_method} />
                  <DataBox label="Estado" value={statusMap[loan.status]} />
                </div>
              </div>

              <div>
                <SectionTitle icon={CreditCard} title="Información Bancaria" />
                <div className="grid grid-cols-1 gap-3 mt-4">
                  <DataBox label="Banco" value={loan.bank_name} />
                  <DataBox label="Número de Cuenta" value={loan.account_number} />
                </div>
              </div>
            </div>

            {/* Columna 2: Perfil y Dirección */}
            <div className="space-y-8">
              <div>
                <SectionTitle icon={User} title="Perfil Personal" />
                <div className="grid grid-cols-1 gap-3 mt-4">
                  <DataBox label="Celular" value={loan.phone} highlight />
                  <DataBox label="Documento ID" value={loan.doc_number} />
                  <DataBox label="Correo" value={loan.email} />
                  <DataBox label="Género" value={loan.gender} />
                  <DataBox label="Fecha Nacimiento" value={loan.dob} />
                  <DataBox label="Estado Civil" value={loan.marital_status} />
                  <DataBox label="Nivel Académico" value={loan.education_level} />
                </div>
              </div>

              <div>
                <SectionTitle icon={MapPin} title="Dirección" />
                <div className="grid grid-cols-1 gap-3 mt-4">
                  <DataBox label="Dirección Exacta" value={loan.address} />
                  <DataBox label="Ciudad" value={loan.city} />
                  <DataBox label="Provincia/Estado" value={loan.province} />
                  <DataBox label="Tipo de Vivienda" value={loan.housing_type} />
                </div>
              </div>
            </div>

            {/* Columna 3: Referencias y Multimedia */}
            <div className="space-y-8">
              <div>
                <SectionTitle icon={Users} title="Referencias" />
                <div className="space-y-3 mt-4">
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] text-primary font-black uppercase mb-1">Referencia 1: {loan.ref1_name}</p>
                    <p className="text-xs text-white font-bold">{loan.ref1_relation}</p>
                    <p className="text-xs text-muted-foreground mt-1"><Phone className="h-3 w-3 inline mr-1" /> {loan.ref1_phone}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[10px] text-primary font-black uppercase mb-1">Referencia 2: {loan.ref2_name}</p>
                    <p className="text-xs text-white font-bold">{loan.ref2_relation}</p>
                    <p className="text-xs text-muted-foreground mt-1"><Phone className="h-3 w-3 inline mr-1" /> {loan.ref2_phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <SectionTitle icon={ImageIcon} title="Verificación Visual" />
                {hasVisualData ? (
                  <div className="grid grid-cols-1 gap-6 mt-4">
                    {loan.face_photo_url && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-muted-foreground font-black uppercase">Foto Rostro / Selfie</p>
                        <img 
                          src={loan.face_photo_url} 
                          alt="Selfie" 
                          className="rounded-xl border border-border aspect-square object-cover cursor-pointer hover:opacity-80 transition-opacity w-full h-auto"
                          onClick={() => window.open(loan.face_photo_url, '_blank')}
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-4">
                      {loan.id_front_url && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-muted-foreground font-black uppercase">ID - Frontal</p>
                          <img 
                            src={loan.id_front_url} 
                            alt="ID Frontal" 
                            className="rounded-xl border border-border aspect-video object-cover cursor-pointer hover:opacity-80 transition-opacity w-full h-auto"
                            onClick={() => window.open(loan.id_front_url, '_blank')}
                          />
                        </div>
                      )}
                      
                      {loan.id_back_url && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-muted-foreground font-black uppercase">ID - Reverso</p>
                          <img 
                            src={loan.id_back_url} 
                            alt="ID Reverso" 
                            className="rounded-xl border border-border aspect-video object-cover cursor-pointer hover:opacity-80 transition-opacity w-full h-auto"
                            onClick={() => window.open(loan.id_back_url, '_blank')}
                          />
                        </div>
                      )}
                    </div>

                    {loan.disbursement_receipt_url && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-primary font-black uppercase">Comprobante de Desembolso</p>
                        <img 
                          src={loan.disbursement_receipt_url} 
                          alt="Comprobante" 
                          className="rounded-xl border border-primary/30 aspect-video object-cover cursor-pointer hover:opacity-80 transition-opacity w-full h-auto" 
                          onClick={() => window.open(loan.disbursement_receipt_url, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 p-10 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center bg-muted/5 text-muted-foreground text-center">
                    <ImageIcon className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sin archivos adjuntos</p>
                    <p className="text-[9px] mt-1 opacity-50 uppercase">El cliente no ha cargado imágenes aún</p>
                  </div>
                )}
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
