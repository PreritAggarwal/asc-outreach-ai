import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Linkedin, Building2, Newspaper, Brain, PenLine, Star, ArrowRight, ArrowLeft, BarChart2, Plus, AlertTriangle } from "lucide-react";
import { useCampaign, useCampaigns } from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { WSLeadStatusEvent, Campaign } from "@/lib/types";

const AGENT_LABELS: Record<string, { label: string; icon: typeof Brain; color: string }> = {
  strategist: { label: 'Strategist', icon: Brain, color: '#7C3AED' },
  drafter:    { label: 'Drafter',    icon: PenLine, color: '#2563eb' },
  critic:     { label: 'Critic',     icon: Star,    color: '#d97706' },
};

const statusPill = (status: Campaign["status"]) => {
  if (status === "ACTIVE") return <span className="status-active">🟢 Active</span>;
  if (status === "COMPLETE") return <span className="status-complete">✅ Complete</span>;
  if (status === "FAILED") return <span className="text-xs font-medium text-destructive px-2 py-1 rounded-full bg-destructive/10">Failed</span>;
  return <span className="status-processing">🟡 Processing</span>;
};

function CampaignSelector() {
  const [, setSearchParams] = useSearchParams();
  const { data: campaigns, isLoading } = useCampaigns();

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse bg-secondary/40 rounded-lg h-8 w-64 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-secondary/40 rounded-lg h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
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
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2 mb-1">
        <Brain className="w-5 h-5 text-primary" /> Pipeline
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Select a campaign to view its processing pipeline.</p>

      <div className="space-y-3">
        {campaigns.map((c) => (
          <button
            key={c.id}
            onClick={() => setSearchParams({ campaignId: c.id })}
            className="w-full glass-card-hover p-5 flex items-center gap-4 text-left transition-all hover:ring-1 hover:ring-primary/30"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {c.totalLeads} leads · {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="shrink-0">{statusPill(c.status)}</div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ResearchProgress() {
  const [searchParams, setSearchParams] = useSearchParams();
  const campaignId = searchParams.get('campaignId') || '';
  const { data: campaign, isLoading } = useCampaign(campaignId);
  const { events, isConnected, aiStreams } = useWebSocket(campaignId || null);

  // Count terminal lead statuses from WebSocket events (live progress)
  const terminalLeadIds = useMemo(() => {
    const terminal = new Set<string>();
    for (const e of events) {
      if (e.type === 'lead_status') {
        const s = (e as WSLeadStatusEvent).status;
        if (s === 'APPROVED' || s === 'HUMAN_REVIEW' || s === 'FILTERED' || s === 'FAILED' || s === 'SENT' || s === 'SKIPPED' || s === 'DISCARDED') {
          terminal.add((e as WSLeadStatusEvent).leadId);
        }
      }
    }
    return terminal;
  }, [events]);

  const progress = useMemo(() => {
    const total = campaign?.totalLeads || 0;
    if (!total) return { completed: 0, total: 0, percentage: 0 };
    // Prefer live WS count; fall back to campaign stats from API
    const wsCompleted = terminalLeadIds.size;
    const completed = wsCompleted > 0
      ? wsCompleted
      : (campaign?.stats?.completed ?? 0);
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  }, [terminalLeadIds, campaign]);

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
      if (e.sources?.proxycurl === 'success') proxycurl++;
      if (e.sources?.apollo === 'success') apollo++;
      if (e.sources?.exa === 'success') exa++;
    }
    return { proxycurl, apollo, exa };
  }, [events]);

  // Active AI streams (not done, or done but content is present)
  const activeStreams = useMemo(() => {
    return Array.from(aiStreams.entries())
      .filter(([, s]) => s.content.length > 0);
  }, [aiStreams]);

  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (progress.percentage / 100) * circumference;

  if (!campaignId) {
    return <CampaignSelector />;
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

  // Campaign exists but has no valid leads (all duplicates)
  if (campaign && campaign.validLeads === 0) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-1">{campaign.name}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="glass-card p-6 border border-warning/30 bg-warning/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-foreground font-semibold mb-1">All leads were duplicates</p>
              <p className="text-muted-foreground text-sm mb-4">
                All {campaign.duplicateLeads} lead{campaign.duplicateLeads !== 1 ? 's' : ''} in this upload already exist in your account. No new leads were queued for processing.
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                  {campaign.totalLeads} in CSV
                </span>
                <span className="px-2.5 py-1 rounded-full bg-warning/10 text-warning">
                  {campaign.duplicateLeads} duplicates
                </span>
                <span className="px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                  {campaign.skippedLeads} skipped
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Link to="/upload"
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all">
            Upload New Leads
          </Link>
          <Link to="/campaigns"
            className="px-5 py-2.5 bg-secondary/50 text-foreground text-sm font-semibold rounded-lg hover:bg-secondary/80 border border-input transition-all">
            View Campaigns
          </Link>
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchParams({})}
            className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-input"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-foreground">
            Processing: {campaign?.name || 'Campaign'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`} />
          <span className="text-xs text-muted-foreground">{isConnected ? 'Live' : 'Reconnecting...'}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-8 ml-11">
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
            <span className="text-xs text-muted-foreground">leads processed</span>
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
            <span className={`ml-auto text-xs ${progress.percentage >= 100 ? 'status-complete' : 'status-active'}`}>
              {progress.percentage >= 100 ? '✅ Done' : '🟢 Running'}
            </span>
          </div>
        ))}
      </div>

      {/* AI Streaming Panel */}
      {activeStreams.length > 0 && (
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-foreground font-semibold text-sm">AI Working</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {activeStreams.map(([leadId, stream]) => {
              const meta = AGENT_LABELS[stream.agent] || AGENT_LABELS.strategist;
              const Icon = meta.icon;
              return (
                <div key={leadId} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${meta.color}20` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: meta.color }}>{meta.label}</span>
                    <span className="text-xs text-muted-foreground">— lead {leadId.slice(0, 8)}</span>
                    {!stream.done && (
                      <span className="ml-auto flex gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                  <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words max-h-32 overflow-y-auto leading-relaxed">
                    {stream.content.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()}
                    {!stream.done && <span className="inline-block w-1.5 h-3 bg-primary ml-0.5 animate-pulse align-middle" />}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live log */}
      <div className="glass-card overflow-hidden mb-6">
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h3 className="text-foreground font-semibold text-sm">Processing Log</h3>
          <span className="text-xs text-muted-foreground">{logEntries.length} events</span>
        </div>
        <div className="p-4 space-y-1 text-sm max-h-72 overflow-y-auto">
          {logEntries.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              {isConnected ? 'Waiting for events...' : 'Connecting...'}
            </div>
          ) : (
            logEntries.map((e, i) => {
              let icon = '⏳';
              let message = `Lead ${e.leadId.slice(0, 8)}`;
              let color = 'text-muted-foreground';

              switch (e.status) {
                case 'RESEARCHING':
                  icon = '🔍'; message = 'Researching lead...'; color = 'text-blue-400'; break;
                case 'RESEARCHED': {
                  const p = e.sources?.proxycurl === 'success' ? '✓' : '✗';
                  const a = e.sources?.apollo === 'success' ? '✓' : '✗';
                  const x = e.sources?.exa === 'success' ? '✓' : '✗';
                  icon = '📋'; message = `Research done — LinkedIn ${p}  Apollo ${a}  Exa ${x}`; color = 'text-muted-foreground'; break;
                }
                case 'QUALIFYING':
                  icon = '🧠'; message = 'Evaluating lead fit...'; color = 'text-purple-400'; break;
                case 'QUALIFIED':
                  icon = '✅'; message = 'Lead qualified'; color = 'text-success'; break;
                case 'FILTERED':
                  icon = '🚫'; message = 'Filtered — doesn\'t match ICP'; color = 'text-warning'; break;
                case 'STRATEGIZING':
                  icon = '🎯'; message = 'Planning outreach strategy...'; color = 'text-purple-400'; break;
                case 'DRAFTING':
                  icon = '✍️'; message = 'Drafting email...'; color = 'text-blue-400'; break;
                case 'CRITIC_REVIEW':
                  icon = '🔎'; message = 'AI reviewing draft...'; color = 'text-purple-400'; break;
                case 'HUMAN_REVIEW':
                  icon = '👤'; message = 'Ready for review'; color = 'text-primary'; break;
                case 'APPROVED':
                  icon = '✅'; message = 'Approved'; color = 'text-success'; break;
                case 'SENT':
                  icon = '📨'; message = 'Email sent'; color = 'text-success'; break;
                case 'FAILED':
                  icon = '❌'; message = `Failed: ${e.failReason || 'unknown error'}`; color = 'text-destructive'; break;
                case 'SKIPPED':
                  icon = '⏭️'; message = 'Skipped'; color = 'text-muted-foreground'; break;
                case 'DISCARDED':
                  icon = '🗑️'; message = 'Discarded'; color = 'text-muted-foreground'; break;
                default:
                  message = e.status; break;
              }

              // Terminal statuses get a distinct badge
              const isTerminal = ['HUMAN_REVIEW', 'APPROVED', 'FILTERED', 'FAILED', 'SENT', 'SKIPPED', 'DISCARDED'].includes(e.status);

              return (
                <div key={i} className="flex items-center gap-2.5 py-1.5 px-3 rounded-md hover:bg-secondary/30 transition-colors">
                  <span className="shrink-0 w-5 text-center">{icon}</span>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">{e.leadId.slice(0, 8)}</span>
                  <span className={`text-xs ${color} flex-1`}>{message}</span>
                  {isTerminal && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                      e.status === 'FAILED' || e.status === 'DISCARDED' ? 'bg-destructive/10 text-destructive'
                      : e.status === 'FILTERED' || e.status === 'SKIPPED' ? 'bg-warning/10 text-warning'
                      : 'bg-success/10 text-success'
                    }`}>
                      {e.status === 'HUMAN_REVIEW' ? 'COMPLETED' 
                       : e.status === 'APPROVED' || e.status === 'SENT' ? 'COMPLETED'
                       : e.status === 'FILTERED' ? 'REJECTED'
                       : e.status === 'FAILED' ? 'FAILED'
                       : e.status === 'SKIPPED' || e.status === 'DISCARDED' ? 'REJECTED'
                       : 'DONE'}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 justify-center text-sm text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        {progress.percentage >= 100 ? (
          <Link to={`/review?campaignId=${campaignId}`} className="text-primary hover:underline font-medium">
            Processing complete - Review leads
          </Link>
        ) : (
          `Processing in progress...`
        )}
      </div>
    </div>
  );
}
