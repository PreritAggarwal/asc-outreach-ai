import { useNavigate } from "react-router-dom";
import { BarChart2, Plus, ArrowRight } from "lucide-react";
import { useCampaigns } from "@/hooks/useApi";
import { Link } from "react-router-dom";
import type { Campaign } from "@/lib/types";

const statusPill = (status: Campaign["status"]) => {
  if (status === "ACTIVE") return <span className="status-active">Active</span>;
  if (status === "COMPLETE") return <span className="status-complete">Complete</span>;
  if (status === "FAILED") return <span className="text-xs font-medium text-destructive px-2 py-1 rounded-full bg-destructive/10">Failed</span>;
  return <span className="status-processing">Processing</span>;
};

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-secondary/40 rounded-lg ${className}`} />
);

export default function Campaigns() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useCampaigns();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" /> Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {campaigns ? `${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}` : ''}
          </p>
        </div>
        <Link
          to="/upload"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> New Campaign
        </Link>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : !campaigns || campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <BarChart2 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-foreground font-semibold mb-1">No campaigns yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Upload a CSV to start your first outreach campaign.</p>
            <Link to="/upload"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all">
              <Plus className="w-4 h-4" /> Upload Leads
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <th className="px-5 py-3.5 font-medium">Campaign</th>
                  <th className="px-4 py-3.5 font-medium">Created</th>
                  <th className="px-4 py-3.5 font-medium">Total</th>
                  <th className="px-4 py-3.5 font-medium">Qualified</th>
                  <th className="px-4 py-3.5 font-medium">Approved</th>
                  <th className="px-4 py-3.5 font-medium">Sent</th>
                  <th className="px-4 py-3.5 font-medium">Open %</th>
                  <th className="px-4 py-3.5 font-medium">Reply %</th>
                  <th className="px-4 py-3.5 font-medium">Status</th>
                  <th className="px-4 py-3.5 font-medium" />
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/research?campaignId=${c.id}`)}
                    className="border-t cursor-pointer transition-colors hover:bg-secondary/30 group"
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{c.totalLeads.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {c.stats?.qualified != null ? c.stats.qualified.toLocaleString() : <span className="text-warning text-xs">processing…</span>}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {c.stats?.approved != null ? c.stats.approved.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {c.stats?.sent != null ? c.stats.sent.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {c.stats?.openRate != null ? `${c.stats.openRate}%` : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {c.stats?.replyRate != null ? `${c.stats.replyRate}%` : "—"}
                    </td>
                    <td className="px-4 py-3.5">{statusPill(c.status)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/review?campaignId=${c.id}`); }}
                          className="text-xs text-primary hover:underline flex items-center gap-1">
                          Review <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
