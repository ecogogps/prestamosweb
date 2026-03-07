'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  History, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Cobradores', href: '/admin/cobradores', icon: Users },
    { name: 'Préstamos', href: '/admin/prestamos', icon: Wallet },
    { name: 'Historial', href: '/admin/historial', icon: History },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Image
            src="https://i.postimg.cc/Jzd6XVzQ/MONEYBIC-LOGO.png"
            alt="MONEYBIC Logo"
            width={140}
            height={40}
          />
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Panel General</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-primary">{user.email}</p>
              <p className="text-xs text-muted-foreground uppercase">Administrador</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}