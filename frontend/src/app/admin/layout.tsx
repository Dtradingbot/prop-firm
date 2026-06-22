'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Building2, Star, Tag, MessageSquare, FileText, BarChart3,
  Settings, BookOpen, Menu, LogOut, Sun, Moon, Users, ChevronRight
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/firms', label: 'Prop Firms', icon: Building2 },
  { href: '/admin/brokers', label: 'Brokers', icon: Building2 },
  { href: '/admin/offers', label: 'Offers', icon: Tag },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    authApi.me().then(r => setUser(r.data)).catch(() => router.push('/admin/login'));
  }, [router]);

  if (pathname === '/admin/login') return <>{children}</>;

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0',
        sidebarOpen ? 'w-64' : 'w-16'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          {sidebarOpen && <span className="font-bold text-gradient">PropFirmHub</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded hover:bg-accent ml-auto">
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {sidebarOpen && user && (
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs text-muted-foreground">Logged in as</div>
            <div className="font-semibold text-sm truncate">{user.username}</div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{user.role}</span>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-2">
          {adminNav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Sun className="h-4 w-4 dark:hidden shrink-0" />
            <Moon className="h-4 w-4 hidden dark:block shrink-0" />
            {sidebarOpen && <span>Toggle Theme</span>}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
