import { LayoutDashboard, Upload, Inbox, BarChart2, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Upload Leads", path: "/upload", icon: Upload },
  { title: "Review Queue", path: "/review", icon: Inbox, badge: 47 },
  { title: "Campaigns", path: "/campaigns", icon: BarChart2 },
  { title: "Settings", path: "/settings", icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col border-r"
      style={{ background: "hsl(240 8% 6%)", borderColor: "rgba(255,255,255,0.06)" }}>
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          ASC
        </div>
        <span className="text-foreground font-semibold text-lg tracking-tight">ASC Outreach</span>
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
              {item.badge && (
                <span className="badge-count">{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
            JC
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">James Carter</p>
            <p className="text-xs text-muted-foreground">CEO</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
