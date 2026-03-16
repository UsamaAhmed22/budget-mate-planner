import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Home, Receipt, BarChart3, Target, FolderOpen, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { currentUser, isRealtimeConnected } = useApp();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Budgets', path: '/budgets', icon: Target },
    ...(currentUser?.role === 'admin' ? [{ name: 'Categories', path: '/categories', icon: FolderOpen }] : []),
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-card border-r border-border">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-foreground">BudgetMate</h1>
          <p className="text-sm text-muted-foreground mt-1">Personal Finance</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${isRealtimeConnected ? 'bg-success' : 'bg-destructive'}`} />
            <span className="text-foreground">{isRealtimeConnected ? 'Live synced' : 'Sync offline'}</span>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="md:hidden px-4 pt-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${isRealtimeConnected ? 'bg-success' : 'bg-destructive'}`} />
            <span className="text-foreground">{isRealtimeConnected ? 'Live synced' : 'Sync offline'}</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
