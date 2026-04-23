import { LayoutDashboard, Upload, Inbox, BarChart2, Settings, LogOut, Activity, Sun, Moon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth";
import { useDashboardMetrics } from "@/hooks/useApi";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Upload Leads", path: "/upload", icon: Upload },
  { title: "Review Queue", path: "/review", icon: Inbox, badge: true },
  { title: "Pipeline", path: "/research", icon: Activity },
  { title: "Campaigns", path: "/campaigns", icon: BarChart2 },
  { title: "Settings", path: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data: metrics } = useDashboardMetrics();
  const { theme, setTheme } = useTheme();

  const queueCount = metrics?.leadsInQueue ?? 0;
  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col border-r bg-sidebar border-sidebar-border">
      {/* Logo */}
      <div className="px-5 py-[18px] flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs tracking-wide">
          OP
        </div>
        <span className="text-sidebar-foreground font-semibold text-[15px] tracking-tight">Outpilot</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 group ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  active ? "text-primary" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground"
                }`}
              />
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && queueCount > 0 && (
                <span className="badge-count">{queueCount}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-sidebar-border space-y-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 shrink-0" />
            : <Moon className="w-4 h-4 shrink-0" />
          }
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Divider */}
        <div className="border-t border-sidebar-border my-1" />

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[11px] font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-sidebar-foreground truncate leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] text-sidebar-foreground/45 truncate leading-tight">
              {user?.email || ''}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sidebar-foreground/35 hover:text-sidebar-foreground transition-colors p-1 rounded"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
