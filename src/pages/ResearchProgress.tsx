import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Linkedin, Building2, Newspaper } from "lucide-react";
import { useCampaign } from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { WSLeadStatusEvent, WSProgressEvent } from "@/lib/types";

export default function ResearchProgress() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaignId') || '';
  const { data: campaign, isLoading } = useCampaign(campaignId);
  const { events, lastEvent, isConnected } = useWebSocket(campaignId || null);

  // Compute progress from WebSocket events or campaign stats
  const progress = useMemo(() => {
    // Find latest progress event
    const progressEvents = events.filter((e): e is WSProgressEvent => e.type === 'progress');
    if (progressEvents.length > 0) {
      const latest = progressEvents[progressEvents.length - 1];
      return {
        completed: latest.completedLeads,
        total: latest.totalLeads,
        percentage: latest.percentage,
      };
    }
    // Fallback to campaign data
    if (campaign?.stats) {
      const total = campaign.totalLeads || 1;
      const completed = campaign.stats.qualified + (campaign.stats.sent || 0);
      return { completed, total, percentage: Math.round((completed / total) * 100) };
    }
    return { completed: 0, total: 0, percentage: 0 };
  }, [events, campaign]);

  // Collect lead status events for the log
  const logEntries = useMemo(() => {
    return events
      .filter((e): e is WSLeadStatusEvent => e.type === 'lead_status')
      .slice(-20)
      .reverse();
  }, [events]);

  // Source statistics from lead events
  const sourceStats = useMemo(() => {
    const leadEvents = events.filter((e): e is WSLeadStatusEvent => e.type === 'lead_status');
    let proxycurl = 0, apollo = 0, exa = 0;
    for (const e of leadEvents) {
      if (e.sources?.proxycurl === 'ok') proxycurl++;
      if (e.sources?.apollo === 'ok') apollo++;
      if (e.sources?.exa === 'ok') exa++;
    }
    return { proxycurl, apollo, exa };
  }, [events]);

  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (progress.percentage / 100) * circumference;

  if (!campaignId) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <p className="text-muted-foreground">No campaign selected. <Link to="/upload" className="text-primary hover:underline">Upload a CSV first</Link>.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse bg-secondary/40 rounded-lg h-8 w-64 mb-2" />
        <div className="animate-pulse bg-secondary/40 rounded-lg h-4 w-32 mb-8" />
        <div className="flex justify-center mb-10">
          <div className="animate-pulse bg-secondary/40 rounded-full w-[220px] h-[220px]" />
        </div>
      </div>
    );
  }

  const sources = [
    { name: "Proxycurl", count: `${sourceStats.proxycurl} profiles fetched`, icon: Linkedin, color: "#0A66C2" },
    { name: "Apollo.io", count: `${sourceStats.apollo} companies enriched`, icon: Building2, color: "#7C3AED" },
    { name: "Exa.ai", count: `${sourceStats.exa} news items found`, icon: Newspaper, color: "#22c55e" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-foreground">
          Processing: {campaign?.name || 'Campaign'}
        </h1>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`} />
          <span className="text-xs text-muted-foreground">{isConnected ? 'Live' : 'Reconnecting...'}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        {campaign ? new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
      </p>

      {/* Circular progress */}
      <div className="flex justify-center mb-10">
        <div className="relative">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle cx="110" cy="110" r="90" fill="none" stroke="#7C3AED" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 110 110)" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">{progress.percentage}%</span>
            <span className="text-sm text-muted-foreground mt-1">{progress.completed.toLocaleString()} / {progress.total.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">leads researched</span>
          </div>
        </div>
      </div>

      {/* Source cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {sources.map((s) => (
          <div key={s.name} className="glass-card-hover p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-foreground font-semibold text-sm">{s.name}</p>
              <p className="text-muted-foreground text-xs">{s.count}</p>
            </div>
            <span className="ml-auto status-active text-xs">🟢 Running</span>
          </div>
        ))}
      </div>

      {/* Live log */}
      <div className="glass-card overflow-hidden mb-6">
        <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h3 className="text-foreground font-semibold text-sm">Processing Log</h3>
        </div>
        <div className="p-4 space-y-2 font-mono text-xs max-h-64 overflow-y-auto">
          {logEntries.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              {isConnected ? 'Waiting for events...' : 'Connecting...'}
            </div>
          ) : (
            logEntries.map((e, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-secondary/30 transition-colors">
                {e.status === 'RESEARCHING' ? (
                  <>
                    <span className="text-warning">⏳</span>
                    <span className="text-muted-foreground">
                      Lead {e.leadId.slice(0, 8)} — <span className="text-warning">processing...</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-success">✅</span>
                    <span className="text-muted-foreground">
                      Lead {e.leadId.slice(0, 8)} — LinkedIn {e.sources?.proxycurl === 'ok' ? '✅' : '❌'} Apollo {e.sources?.apollo === 'ok' ? '✅' : '❌'} Exa {e.sources?.exa === 'ok' ? '✅' : '⚠️'}
                    </span>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 justify-center text-sm text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        {progress.percentage >= 100 ? (
          <Link to={`/review?campaignId=${campaignId}`} className="text-primary hover:underline font-medium">
            Processing complete — Review leads →
          </Link>
        ) : (
          `Processing in progress...`
        )}
      </div>
    </div>
  );
}
