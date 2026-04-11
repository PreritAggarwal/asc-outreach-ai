import { TrendingUp, TrendingDown, Eye, Mail, Clock } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useDashboardMetrics, useDashboardActivity, useCampaigns } from "@/hooks/useApi";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: activities, isLoading: activityLoading } = useDashboardActivity();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();

  // Build metric cards from API data
  const metricCards = metrics ? [
    {
      label: "Emails Sent",
      value: metrics.emailsSentThisMonth.toLocaleString(),
      change: "", positive: true,
      data: (metrics.sparklines?.sent || []).map((v) => ({ v })),
      color: "#22c55e",
    },
    {
      label: "Open Rate",
      value: `${metrics.openRate.toFixed(1)}%`,
      change: "", positive: true,
      data: [],
      color: "#22c55e",
    },
    {
      label: "Reply Rate",
      value: `${metrics.replyRate.toFixed(1)}%`,
      change: "", positive: true,
      data: [],
      color: "#ef4444",
    },
    {
      label: "Queue Pending",
      value: String(metrics.leadsInQueue),
      change: "", positive: true,
      data: [],
      color: "#7C3AED",
    },
  ] : [];

  const iconForType = (type: string) => {
    if (type === 'open') return Eye;
    return Mail;
  };

  const colorForType = (type: string) => {
    if (type === 'reply') return "#22c55e";
    if (type === 'bounce') return "#ef4444";
    if (type === 'open') return "#7C3AED";
    return "#3B82F6";
  };

  const statusLabel = (campaign: any) => {
    const s = campaign.status?.toLowerCase() || 'processing';
    if (s === 'active') return <span className="status-active">Active</span>;
    if (s === 'complete') return <span className="status-complete">Complete</span>;
    return <span className="status-processing">Processing</span>;
  };

  // Loading skeleton
  const Skeleton = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-secondary/40 rounded-lg ${className}`} />
  );

  return (
    <div className="p-6 flex gap-6">
      <div className="flex-1 min-w-0">
        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {metricsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          ) : (
            metricCards.map((m) => (
              <div key={m.label} className="glass-card-hover p-5">
                <p className="text-sm text-muted-foreground mb-1">{m.label}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{m.value}</p>
                    {m.change && (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${m.positive ? "text-success" : "text-destructive"}`}>
                        {m.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {m.change} vs last month
                      </span>
                    )}
                    {!m.change && <span className="text-xs text-primary font-medium mt-1 inline-block">Current</span>}
                  </div>
                  {m.data.length > 0 && (
                    <div className="w-20 h-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={m.data}>
                          <defs>
                            <linearGradient id={`grad-${m.label}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={m.color} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="v" stroke={m.color} strokeWidth={2} fill={`url(#grad-${m.label})`} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Campaign Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <h2 className="text-foreground font-semibold">Campaigns</h2>
            <Link to="/upload" className="text-sm text-primary hover:underline">+ New Campaign</Link>
          </div>
          <div className="overflow-x-auto">
            {campaignsLoading ? (
              <div className="p-8"><Skeleton className="h-40 w-full" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-left">
                    <th className="px-5 py-3 font-medium">Campaign Name</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Leads</th>
                    <th className="px-3 py-3 font-medium">Qualified</th>
                    <th className="px-3 py-3 font-medium">Sent</th>
                    <th className="px-3 py-3 font-medium">Open Rate</th>
                    <th className="px-3 py-3 font-medium">Reply Rate</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(campaigns || []).map((c) => (
                    <tr key={c.id} className="border-t transition-colors hover:bg-secondary/30 cursor-pointer" style={{ borderColor: "rgba(255,255,255,0.04)" }}
                      onClick={() => window.location.href = `/research?campaignId=${c.id}`}>
                      <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.totalLeads.toLocaleString()}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.stats?.qualified?.toLocaleString() ?? <span className="text-warning">processing...</span>}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.stats?.sent?.toLocaleString() ?? "—"}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.stats?.openRate != null ? `${c.stats.openRate.toFixed(0)}%` : "—"}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.stats?.replyRate != null ? `${c.stats.replyRate.toFixed(0)}%` : "—"}</td>
                      <td className="px-3 py-3">{statusLabel(c)}</td>
                    </tr>
                  ))}
                  {(!campaigns || campaigns.length === 0) && (
                    <tr><td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">No campaigns yet. <Link to="/upload" className="text-primary hover:underline">Upload your first CSV</Link>.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="w-[300px] shrink-0">
        <div className="glass-card h-fit">
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="text-foreground font-semibold text-sm">Live Activity</h3>
          </div>
          <div className="p-2 space-y-1 max-h-[500px] overflow-y-auto">
            {activityLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3"><div className="animate-pulse bg-secondary/40 rounded-lg h-12" /></div>
              ))
            ) : (activities || []).length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">No recent activity</div>
            ) : (
              (activities || []).map((a, i) => {
                const Icon = iconForType(a.type);
                const color = colorForType(a.type);
                const initials = a.company.slice(0, 2).toUpperCase();
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-secondary/30">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `${color}20`, color }}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{a.name}</span>
                        <span className="text-muted-foreground"> at {a.company}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.type === 'open' && `opened your email`}
                        {a.type === 'reply' && `replied — Positive`}
                        {a.type === 'bounce' && `bounced`}
                        {a.type === 'sent' && `email sent`}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
