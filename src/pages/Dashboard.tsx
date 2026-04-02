import { TrendingUp, TrendingDown, Eye, Mail, Clock } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const sparkData1 = [{ v: 30 }, { v: 45 }, { v: 35 }, { v: 60 }, { v: 55 }, { v: 70 }, { v: 80 }];
const sparkData2 = [{ v: 20 }, { v: 28 }, { v: 25 }, { v: 32 }, { v: 30 }, { v: 34 }, { v: 36 }];
const sparkData3 = [{ v: 12 }, { v: 10 }, { v: 11 }, { v: 9 }, { v: 10 }, { v: 8 }, { v: 9 }];
const sparkData4 = [{ v: 50 }, { v: 45 }, { v: 52 }, { v: 48 }, { v: 47 }, { v: 49 }, { v: 47 }];

const metrics = [
  { label: "Emails Sent", value: "1,847", change: "+12%", positive: true, data: sparkData1, color: "#22c55e" },
  { label: "Open Rate", value: "34.2%", change: "+4.1%", positive: true, data: sparkData2, color: "#22c55e" },
  { label: "Reply Rate", value: "8.7%", change: "-1.2%", positive: false, data: sparkData3, color: "#ef4444" },
  { label: "Queue Pending", value: "47", change: "", positive: true, data: sparkData4, color: "#7C3AED" },
];

const campaigns = [
  { name: "Healthcare HR Batch", date: "Apr 1", leads: 500, qual: 423, sent: 400, open: "31%", reply: "9.2%", status: "active" },
  { name: "Logistics Compliance", date: "Mar 28", leads: 300, qual: 267, sent: 267, open: "38%", reply: "11%", status: "complete" },
  { name: "Retail Operations", date: "Mar 22", leads: 800, qual: 701, sent: 690, open: "29%", reply: "7.1%", status: "complete" },
  { name: "Tech Startups Q1", date: "Mar 15", leads: 200, qual: 144, sent: 100, open: "42%", reply: "13%", status: "complete" },
  { name: "Manufacturing Batch", date: "Apr 2", leads: 700, qual: null, sent: null, open: null, reply: null, status: "processing" },
];

const activities = [
  { name: "Sarah Chen", company: "MediCorp", event: "opened your email", time: "2 min ago", icon: Eye, color: "#7C3AED", initials: "MC" },
  { name: "John Mills", company: "TechLogix", event: "replied — Positive 🟢", time: "5 min ago", icon: Mail, color: "#22c55e", initials: "TL" },
  { name: "David Park", company: "RetailPro", event: "opened", time: "12 min ago", icon: Eye, color: "#7C3AED", initials: "RP" },
  { name: "Emma Torres", company: "SafeWork", event: "bounced ❌", time: "18 min ago", icon: Mail, color: "#ef4444", initials: "SW" },
  { name: "Carlos Reyes", company: "BuildRight", event: "replied — Neutral 🟡", time: "24 min ago", icon: Mail, color: "#eab308", initials: "BR" },
];

export default function Dashboard() {
  return (
    <div className="p-6 flex gap-6">
      <div className="flex-1 min-w-0">
        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => (
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
              </div>
            </div>
          ))}
        </div>

        {/* Campaign Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <h2 className="text-foreground font-semibold">Campaigns</h2>
          </div>
          <div className="overflow-x-auto">
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
                {campaigns.map((c) => (
                  <tr key={c.name} className="border-t transition-colors hover:bg-secondary/30" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.date}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.leads.toLocaleString()}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.qual?.toLocaleString() ?? <span className="text-warning">processing...</span>}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.sent?.toLocaleString() ?? "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.open ?? "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.reply ?? "—"}</td>
                    <td className="px-3 py-3">
                      {c.status === "active" && <span className="status-active">🟢 Active</span>}
                      {c.status === "complete" && <span className="status-complete">✅ Complete</span>}
                      {c.status === "processing" && <span className="status-processing">🟡 Processing</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-secondary/30">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${a.color}20`, color: a.color }}>
                  {a.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{a.name}</span>
                    <span className="text-muted-foreground"> at {a.company}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.event}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
