import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Edit3, RefreshCw, SkipForward, Trash2, ChevronDown, ChevronUp, Linkedin, Loader2 } from "lucide-react";
import {
  useLeads, useLead, useApproveLead, useSkipLead, useDiscardLead,
  useRegenerateLead, useEditLead, useBulkApprove, useSendApproved, useCampaigns,
} from "@/hooks/useApi";
import type { LeadStatus } from "@/lib/types";

type FilterStatus = "All" | "PENDING" | "APPROVED" | "SKIPPED" | "HUMAN_REVIEW";

export default function ReviewQueue() {
  const [searchParams] = useSearchParams();
  const urlCampaignId = searchParams.get('campaignId') || '';
  const [campaignId, setCampaignId] = useState(urlCampaignId);
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [selectedId, setSelectedId] = useState<string>('');
  const [hookOpen, setHookOpen] = useState(true);
  const [researchOpen, setResearchOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [page, setPage] = useState(1);

  const { data: campaigns } = useCampaigns();
  const { data: leadsResult, isLoading: leadsLoading } = useLeads({
    campaignId: campaignId || undefined,
    status: filter === 'All' ? undefined : filter,
    page,
    limit: 20,
  });
  const { data: selectedLead, isLoading: leadLoading } = useLead(selectedId);

  // Mutations
  const approveMut = useApproveLead();
  const skipMut = useSkipLead();
  const discardMut = useDiscardLead();
  const regenerateMut = useRegenerateLead();
  const editMut = useEditLead();
  const bulkApproveMut = useBulkApprove();
  const sendApprovedMut = useSendApproved();

  const leads = leadsResult?.data || [];
  const totalLeads = leadsResult?.total || 0;
  const totalPages = leadsResult?.totalPages || 1;

  // Auto-select first lead
  useEffect(() => {
    if (leads.length > 0 && !selectedId) {
      setSelectedId(leads[0].id);
    }
  }, [leads, selectedId]);

  const approvedCount = useMemo(() =>
    leads.filter((l) => l.status === 'APPROVED').length,
    [leads]
  );

  const pendingCount = useMemo(() =>
    leads.filter((l) => ['PENDING', 'HUMAN_REVIEW', 'QUALIFIED', 'CRITIC_REVIEW'].includes(l.status)).length,
    [leads]
  );

  // Draft from selected lead
  const currentDraft = selectedLead?.drafts?.[0];
  const research = selectedLead?.research;

  useEffect(() => {
    if (currentDraft && !editMode) {
      setEditSubject(currentDraft.subject);
      setEditBody(currentDraft.body);
    }
  }, [currentDraft, editMode]);

  const handleEdit = async () => {
    if (!selectedId) return;
    await editMut.mutateAsync({ id: selectedId, subject: editSubject, body: editBody });
    setEditMode(false);
  };

  const handleBulkApprove = async () => {
    const pendingIds = leads.filter((l) => ['QUALIFIED', 'HUMAN_REVIEW', 'CRITIC_REVIEW'].includes(l.status)).map((l) => l.id);
    if (pendingIds.length > 0) {
      await bulkApproveMut.mutateAsync(pendingIds);
    }
  };

  const handleSendApproved = async () => {
    if (campaignId) {
      await sendApprovedMut.mutateAsync(campaignId);
    }
  };

  const scoreClass = (s: number | null) => (s && s >= 8 ? "quality-high" : "quality-mid");

  const statusPill = (s: LeadStatus) => {
    if (s === "APPROVED") return <span className="status-approved">✅ Approved</span>;
    if (s === "SKIPPED") return <span className="status-skipped">Skipped</span>;
    if (s === "SENT") return <span className="status-complete">Sent</span>;
    if (s === "HUMAN_REVIEW") return <span className="status-processing">🟡 Review</span>;
    return <span className="status-pending">Pending</span>;
  };

  const statusColor = (s: LeadStatus) => {
    if (s === "APPROVED" || s === "SENT") return "#22c55e";
    if (s === "SKIPPED" || s === "DISCARDED") return "#6B7280";
    if (s === "HUMAN_REVIEW") return "#F59E0B";
    return "#7C3AED";
  };

  const filters: FilterStatus[] = ["All", "PENDING", "APPROVED", "SKIPPED", "HUMAN_REVIEW"];
  const filterLabels: Record<FilterStatus, string> = { All: "All", PENDING: "Pending", APPROVED: "Approved", SKIPPED: "Skipped", HUMAN_REVIEW: "Review" };

  return (
    <div className="flex h-screen">
      {/* LEFT PANEL */}
      <div className="w-[380px] shrink-0 border-r flex flex-col" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {/* Campaign selector */}
          <select value={campaignId} onChange={(e) => { setCampaignId(e.target.value); setPage(1); setSelectedId(''); }}
            className="w-full bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="">All Campaigns</option>
            {(campaigns || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-foreground font-bold text-lg">Review Queue</h2>
            <span className="badge-count">{pendingCount} pending</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleBulkApprove} disabled={bulkApproveMut.isPending}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:bg-secondary/50 disabled:opacity-50"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "hsl(0 0% 95%)" }}>
              {bulkApproveMut.isPending ? 'Approving...' : 'Approve All'}
            </button>
            <button onClick={handleSendApproved} disabled={sendApprovedMut.isPending || !campaignId}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50">
              {sendApprovedMut.isPending ? 'Sending...' : `Send Approved (${approvedCount})`}
            </button>
          </div>
          <div className="flex gap-1 mt-3">
            {filters.map((f) => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  filter === f ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}>
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {leadsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3"><div className="animate-pulse bg-secondary/40 rounded-lg h-16" /></div>
            ))
          ) : leads.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No leads found</div>
          ) : (
            leads.map((l) => {
              const color = statusColor(l.status);
              const initials = `${l.firstName?.[0] || ''}${l.lastName?.[0] || ''}`.toUpperCase();
              return (
                <div key={l.id} onClick={() => setSelectedId(l.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedId === l.id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/30 border border-transparent"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: `${color}20`, color }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{l.firstName} {l.lastName}</p>
                      <p className="text-xs text-muted-foreground">{l.company}</p>
                      <p className="text-xs text-muted-foreground/60">{l.title}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {statusPill(l.status)}
                      <span className={scoreClass(l.qualityScore)}>{l.qualityScore ? `${l.qualityScore}/10` : ''}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t flex items-center justify-between text-xs" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
              className="px-3 py-1 rounded bg-secondary/50 text-foreground disabled:opacity-30">Prev</button>
            <span className="text-muted-foreground">Page {page} of {totalPages} ({totalLeads} leads)</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
              className="px-3 py-1 rounded bg-secondary/50 text-foreground disabled:opacity-30">Next</button>
          </div>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {!selectedId || leadLoading ? (
          <div className="flex-1 flex items-center justify-center">
            {leadLoading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <p className="text-muted-foreground">Select a lead to review</p>
            )}
          </div>
        ) : selectedLead ? (
          <>
            <div className="p-6 flex-1">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ background: `${statusColor(selectedLead.status)}20`, color: statusColor(selectedLead.status) }}>
                  {`${selectedLead.firstName?.[0] || ''}${selectedLead.lastName?.[0] || ''}`.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedLead.firstName} {selectedLead.lastName}</h2>
                  <p className="text-muted-foreground">{selectedLead.title} at {selectedLead.company}</p>
                </div>
                <div className="flex gap-2 ml-auto">
                  {selectedLead.linkedinUrl && (
                    <a href={selectedLead.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(10,102,194,0.15)", color: "#60a5fa" }}>
                      <Linkedin className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                  {selectedLead.hubspotContactId && (
                    <span className="status-approved">Synced to HubSpot ✅</span>
                  )}
                </div>
              </div>

              {/* Hook Reasoning */}
              {selectedLead.hookReasoning && (
                <div className="glass-card mb-4 overflow-hidden" style={{ borderLeft: "3px solid #7C3AED" }}>
                  <button onClick={() => setHookOpen(!hookOpen)}
                    className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary/20 transition-colors">
                    <span>🎯 Why This Angle</span>
                    {hookOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {hookOpen && (
                    <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {selectedLead.hookReasoning}
                    </div>
                  )}
                </div>
              )}

              {/* Email Preview / Edit */}
              <div className="glass-card mb-4 p-5" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</label>
                <input value={editSubject} onChange={(e) => setEditSubject(e.target.value)}
                  readOnly={!editMode}
                  className={`w-full bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!editMode ? 'cursor-default' : ''}`} />
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Body</label>
                <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)}
                  readOnly={!editMode} rows={12}
                  className={`w-full bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none ${!editMode ? 'cursor-default' : ''}`} />
                <div className="flex gap-3 mt-3">
                  {selectedLead.qualityScore && (
                    <span className="quality-high">Quality: {selectedLead.qualityScore}/10 🟢</span>
                  )}
                  {selectedLead.spamScore != null && (
                    <span className={selectedLead.spamScore <= 3 ? "quality-high" : "quality-mid"}>
                      Spam Risk: {selectedLead.spamScore <= 3 ? 'Low 🟢' : 'Medium 🟡'}
                    </span>
                  )}
                </div>
                {editMode && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleEdit} disabled={editMut.isPending}
                      className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50">
                      {editMut.isPending ? 'Saving...' : 'Save Edit'}
                    </button>
                    <button onClick={() => setEditMode(false)}
                      className="px-4 py-2 bg-secondary/50 text-foreground text-sm rounded-lg border border-input hover:bg-secondary/80">
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Research Context */}
              {research && (
                <div className="glass-card overflow-hidden">
                  <button onClick={() => setResearchOpen(!researchOpen)}
                    className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary/20 transition-colors">
                    <span>📊 Research Context</span>
                    {researchOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {researchOpen && (
                    <div className="px-5 pb-4 text-sm text-muted-foreground space-y-2">
                      {research.proxycurlData && <p>• LinkedIn: {JSON.stringify(research.proxycurlData).slice(0, 120)}...</p>}
                      {research.apolloData && <p>• Apollo: {JSON.stringify(research.apolloData).slice(0, 120)}...</p>}
                      {research.exaData && <p>• Exa: {JSON.stringify(research.exaData).slice(0, 120)}...</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="border-t p-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex gap-3">
                {[
                  { label: "Approve", icon: Check, key: "A", action: () => approveMut.mutate(selectedId), primary: true, loading: approveMut.isPending },
                  { label: "Edit", icon: Edit3, key: "E", action: () => setEditMode(true), primary: false, loading: false },
                  { label: "Regenerate", icon: RefreshCw, key: "R", action: () => regenerateMut.mutate(selectedId), primary: false, loading: regenerateMut.isPending },
                  { label: "Skip", icon: SkipForward, key: "S", action: () => skipMut.mutate(selectedId), primary: false, loading: skipMut.isPending },
                  { label: "Discard", icon: Trash2, key: "D", action: () => discardMut.mutate(selectedId), primary: false, loading: discardMut.isPending },
                ].map((btn) => (
                  <button key={btn.label} onClick={btn.action} disabled={btn.loading}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                      btn.primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary/50 text-foreground hover:bg-secondary/80 border border-input"
                    }`}>
                    <span className="flex items-center gap-1.5">
                      {btn.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <btn.icon className="w-4 h-4" />}
                      {btn.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{btn.key}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
