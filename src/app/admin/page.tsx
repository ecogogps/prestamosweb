'use client';

import React from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Lun', prestamos: 4000, cobros: 2400 },
  { name: 'Mar', prestamos: 3000, cobros: 1398 },
  { name: 'Mie', prestamos: 2000, cobros: 9800 },
  { name: 'Jue', prestamos: 2780, cobros: 3908 },
  { name: 'Vie', prestamos: 1890, cobros: 4800 },
  { name: 'Sab', prestamos: 2390, cobros: 3800 },
  { name: 'Dom', prestamos: 3490, cobros: 4300 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard Financiero</h1>
        <p className="text-muted-foreground mt-2">Bienvenido al control centralizado de MONEYBIC.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Préstamos" 
          value="$124,500" 
          change="+12.5%" 
          trend="up" 
          icon={DollarSign} 
        />
        <StatsCard 
          title="Cobros Hoy" 
          value="$8,240" 
          change="+18%" 
          trend="up" 
          icon={TrendingUp} 
        />
        <StatsCard 
          title="Cobradores Activos" 
          value="24" 
          change="-2" 
          trend="down" 
          icon={Users} 
        />
        <StatsCard 
          title="Tasa de Mora" 
          value="4.2%" 
          change="-0.5%" 
          trend="up" 
          icon={ArrowDownRight} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card border-none shadow-xl">
          <CardHeader>
            <CardTitle>Flujo de Caja Semanal</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#212529', border: 'none' }}
                  itemStyle={{ color: '#71AF57' }}
                />
                <Bar dataKey="prestamos" fill="#71AF57" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cobros" fill="#ffffff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-card border-none shadow-xl">
          <CardHeader>
            <CardTitle>Crecimiento Mensual</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71AF57" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#71AF57" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip />
                <Area type="monotone" dataKey="prestamos" stroke="#71AF57" fillOpacity={1} fill="url(#colorPv)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, trend, icon: Icon }: any) {
  return (
    <Card className="bg-card border-none shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="flex items-center mt-4 space-x-2 text-sm">
          {trend === 'up' ? (
            <span className="flex items-center text-primary">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              {change}
            </span>
          ) : (
            <span className="flex items-center text-red-400">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              {change}
            </span>
          )}
          <span className="text-muted-foreground">vs mes pasado</span>
        </div>
      </CardContent>
    </Card>
  );
}