'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CheckSquare, Store, Package, Wrench, AlertTriangle, BarChart3, Settings, LogOut } from 'lucide-react';
import { clearToken } from '@/lib/auth';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Verifications', href: '/dashboard/verifications', icon: CheckSquare },
  { name: 'Dhabas', href: '/dashboard/dhabas', icon: Store },
  { name: 'Orders', href: '/dashboard/orders', icon: Package },
  { name: 'Mechanics', href: '/dashboard/mechanics', icon: Wrench },
  { name: 'SOS Alerts', href: '/dashboard/sos', icon: AlertTriangle },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-white border-r h-full flex flex-col shrink-0">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="text-2xl">🛣️</span>
          Highway Setu
        </h1>
        <span className="text-xs bg-orange-100 text-primary px-2 py-1 rounded mt-2 inline-block">Admin Panel</span>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/dashboard');
          return (
            <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-slate-600 hover:bg-slate-100'}`}>
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md w-full transition-colors">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
