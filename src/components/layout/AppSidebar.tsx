import { LayoutDashboard, Upload, Inbox, BarChart2, Settings, LogOut, Activity } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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

  const queueCount = metrics?.leadsInQueue ?? 0;
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col border-r"
      style={{ background: "hsl(240 8% 6%)", borderColor: "rgba(255,255,255,0.06)" }}>
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          OP
        </div>
        <span className="text-foreground font-semibold text-lg tracking-tight">Outpilot</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} transition-colors`} />
              <span className="flex-1">{item.title}</span>
              {item.badge && queueCount > 0 && (
                <span className="badge-count">{queueCount}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
          <button onClick={logout} className="text-muted-foreground hover:text-foreground transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
