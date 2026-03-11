
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LogOut,
  Menu,
  ClipboardList,
  CheckCircle2,
  Clock,
  CalendarCheck,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Sesión cerrada",
        description: "Has salido del sistema correctamente.",
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: error.message,
      });
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  if (!user) return null;

  const navItems = [
    { name: 'Solicitudes', href: '/panel/solicitudes', icon: ClipboardList },
    { name: 'Aceptados', href: '/panel/aceptados', icon: CheckCircle2 },
    { name: 'D-1', href: '/panel/d-1', icon: Clock },
    { name: 'D0', href: '/panel/d0', icon: CalendarCheck },
    { name: 'S1', href: '/panel/s1', icon: AlertTriangle },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Desktop */}
      <aside className="hidden w-72 flex-col border-r border-border bg-card/50 backdrop-blur-xl md:flex">
        <div className="flex h-24 items-center justify-center border-b border-border px-8">
          <Image
            src="https://i.postimg.cc/Jzd6XVzQ/MONEYBIC-LOGO.png"
            alt="MONEYBIC Logo"
            width={160}
            height={45}
            priority
          />
        </div>
        <nav className="flex-1 space-y-2 px-6 py-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 rounded-2xl px-4 py-4 text-sm font-bold transition-all transform active:scale-95 ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-primary'}`} />
                <span className={isActive ? 'text-white' : ''}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start rounded-2xl h-12 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all font-bold"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 items-center justify-between border-b border-border bg-card/30 backdrop-blur-md px-6 md:px-10">
          <div className="flex items-center space-x-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-card p-0 border-r-primary/20">
                <div className="flex h-24 items-center justify-center border-b border-border">
                  <Image src="https://i.postimg.cc/Jzd6XVzQ/MONEYBIC-LOGO.png" alt="Logo" width={140} height={40} />
                </div>
                <nav className="space-y-2 p-6">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 rounded-2xl px-4 py-4 text-sm font-bold transition-all ${
                          isActive 
                            ? 'bg-primary text-white' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-primary'}`} />
                        <span className={isActive ? 'text-white' : ''}>{item.name}</span>
                      </Link>
                    );
                  })}
                  <div className="pt-4 mt-4 border-t border-border">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive font-bold" onClick={handleLogout}>
                      <LogOut className="mr-3 h-5 w-5" /> Cerrar Sesión
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            
            <h2 className="text-xl font-bold text-white tracking-tight hidden sm:block">
              {navItems.find(i => i.href === pathname)?.name || 'Panel'}
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none uppercase tracking-widest">
                  {profile?.role || 'USUARIO'}
                </p>
                <p className="text-[10px] text-primary font-bold uppercase mt-1 tracking-tighter">ACCESO</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 ring-2 ring-primary/20">
                {profile?.role?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
