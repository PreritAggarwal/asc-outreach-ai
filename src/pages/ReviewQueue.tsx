import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Edit3, RefreshCw, SkipForward, Trash2, ChevronDown, ChevronUp, Linkedin, Loader2, X, Clock } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useLeads, useLead, useApproveLead, useSkipLead, useDiscardLead,
  useRegenerateLead, useEditLead, useBulkApprove, useSendApproved, useCampaigns, useBulkRetryFailed,
} from "@/hooks/useApi";
import type { LeadStatus } from "@/lib/types";

type FilterStatus = "All" | "PENDING" | "APPROVED" | "SKIPPED" | "HUMAN_REVIEW" | "FAILED" | "FILTERED";

// ============================================
// Toast System
// ============================================
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" style={{ pointerEvents: "none" }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg animate-in slide-in-from-right"
          style={{
            pointerEvents: "auto",
            background: t.type === "success" ? "rgba(34,197,94,0.15)" : t.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
            color: t.type === "success" ? "#4ade80" : t.type === "error" ? "#f87171" : "#60a5fa",
            border: `1px solid ${t.type === "success" ? "rgba(34,197,94,0.3)" : t.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(59,130,246,0.3)"}`,
            backdropFilter: "blur(12px)",
          }}
        >
          {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"} {t.message}
          <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function ReviewQueue() {
  const [searchParams] = useSearchParams();
  const urlCampaignId = searchParams.get('campaignId') || '';
  const [campaignId, setCampaignId] = useState(urlCampaignId);
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [selectedId, setSelectedId] = useState<string>('');
  const [researchOpen, setResearchOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [page, setPage] = useState(1);
  const [draftVersion, setDraftVersion] = useState(0); // 0 = latest
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);

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
  const bulkRetryMut = useBulkRetryFailed();

  const leads = leadsResult?.data || [];
  const totalLeads = leadsResult?.total || 0;
  const totalPages = leadsResult?.totalPages || 1;

  // Toast helpers
  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto-advance to next lead after action
  const advanceToNext = useCallback(() => {
    const idx = leads.findIndex(l => l.id === selectedId);
    if (idx < leads.length - 1) {
      setSelectedId(leads[idx + 1].id);
    } else if (idx > 0) {
      setSelectedId(leads[idx - 1].id);
    }
  }, [leads, selectedId]);

  // Action handlers with toast + auto-advance
  const handleApprove = useCallback(() => {
    if (!selectedId) return;
    approveMut.mutate(selectedId, {
      onSuccess: () => { addToast("Lead approved"); advanceToNext(); },
      onError: (e) => addToast(e.message || "Failed to approve", "error"),
    });
  }, [selectedId, approveMut, addToast, advanceToNext]);

  const handleSkip = useCallback(() => {
    if (!selectedId) return;
    skipMut.mutate(selectedId, {
      onSuccess: () => { addToast("Lead skipped"); advanceToNext(); },
      onError: (e) => addToast(e.message || "Failed to skip", "error"),
    });
  }, [selectedId, skipMut, addToast, advanceToNext]);

  const handleDiscard = useCallback(() => {
    if (!selectedId) return;
    setDiscardConfirmOpen(true);
  }, [selectedId]);

  const confirmDiscard = useCallback(() => {
    if (!selectedId) return;
    discardMut.mutate(selectedId, {
      onSuccess: () => { addToast("Lead discarded"); advanceToNext(); },
      onError: (e) => addToast(e.message || "Failed to discard", "error"),
    });
  }, [selectedId, discardMut, addToast, advanceToNext]);

  const handleRegenerate = useCallback(() => {
    if (!selectedId) return;
    regenerateMut.mutate(selectedId, {
      onSuccess: () => addToast("Regeneration queued", "info"),
      onError: (e) => addToast(e.message || "Failed to regenerate", "error"),
    });
  }, [selectedId, regenerateMut, addToast]);

  // Auto-select first lead
  useEffect(() => {
    if (leads.length > 0 && !selectedId) {
      setSelectedId(leads[0].id);
    }
  }, [leads, selectedId]);

  // Clear stale data when switching leads
  useEffect(() => {
    setEditSubject('');
    setEditBody('');
    setEditMode(false);
    setDraftVersion(0);
  }, [selectedId]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    const key = e.key.toLowerCase();

    if (key === 'arrowdown' || key === 'j') {
      e.preventDefault();
      const idx = leads.findIndex(l => l.id === selectedId);
      if (idx < leads.length - 1) setSelectedId(leads[idx + 1].id);
      return;
    }
    if (key === 'arrowup' || key === 'k') {
      e.preventDefault();
      const idx = leads.findIndex(l => l.id === selectedId);
      if (idx > 0) setSelectedId(leads[idx - 1].id);
      return;
    }

    if (!selectedId) return;
    if (key === 'a') handleApprove();
    if (key === 'e') setEditMode(true);

    if (key === 's') handleSkip();
    if (key === 'd') handleDiscard();
  }, [selectedId, leads, handleApprove, handleSkip, handleDiscard, handleRegenerate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const approvedCount = useMemo(() =>
    leads.filter((l) => l.status === 'APPROVED').length,
    [leads]
  );

  const pendingCount = useMemo(() =>
    leads.filter((l) => l.status === 'HUMAN_REVIEW').length,
    [leads]
  );

  const failedCount = useMemo(() =>
    leads.filter((l) => l.status === 'FAILED').length,
    [leads]
  );

  // Draft from selected lead — support version switching
  const allDrafts = selectedLead?.drafts || [];
  const currentDraft = draftVersion === 0 ? allDrafts[0] : allDrafts.find(d => d.version === draftVersion) || allDrafts[0];
  const research = selectedLead?.research;

  useEffect(() => {
    if (currentDraft && !editMode) {
      setEditSubject(currentDraft.subject);
      setEditBody(currentDraft.body);
    }
  }, [currentDraft, editMode]);

  const handleEdit = async () => {
    if (!selectedId) return;
    try {
      await editMut.mutateAsync({ id: selectedId, subject: editSubject, body: editBody });
      setEditMode(false);
      addToast("Draft saved & approved");
    } catch (e: any) {
      addToast(e.message || "Failed to save edit", "error");
    }
  };

  const handleBulkApprove = async () => {
    const reviewIds = leads.filter((l) => l.status === 'HUMAN_REVIEW').map((l) => l.id);
    if (reviewIds.length > 0) {
      try {
        await bulkApproveMut.mutateAsync(reviewIds);
        addToast(`${reviewIds.length} leads approved`);
      } catch (e: any) {
        addToast(e.message || "Bulk approve failed", "error");
      }
    }
  };

  const handleSendApproved = () => {
    if (!campaignId || approvedCount === 0) return;
    setSendConfirmOpen(true);
  };

  const confirmSendApproved = async () => {
    if (!campaignId) return;
    try {
      await sendApprovedMut.mutateAsync(campaignId);
      addToast(`${approvedCount} emails queued for sending`);
    } catch (e: any) {
      addToast(e.message || "Failed to send", "error");
    }
  };

  // Normalize overallScore: supports both 0-10 and 0-100 scales
  const normScore = (s: number | null): number | null => {
    if (s == null) return null;
    if (s <= 10) return Math.round(s * 10) / 10;
    return Math.round(s) / 10;
  };

  const scoreClass = (s: number | null) => {
    const n = normScore(s);
    return n && n >= 8 ? "quality-high" : "quality-mid";
  };

  const scoreBadge = (score: number | null) => {
    const n = normScore(score);
    if (n == null) return null;
    if (n >= 8) return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
        ✦ {n}/10
      </span>
    );
    if (n >= 6) return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">
        {n}/10
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
        {n}/10
      </span>
    );
  };

  const statusPill = (s: LeadStatus) => {
    if (s === "APPROVED") return <span className="status-approved"><Check className="w-3 h-3 inline mr-0.5" />Approved</span>;
    if (s === "SKIPPED") return <span className="status-skipped">Skipped</span>;
    if (s === "SENT") return <span className="status-complete">Sent</span>;
    if (s === "HUMAN_REVIEW") return <span className="status-processing"><Clock className="w-3 h-3 inline mr-0.5" />Review</span>;
    if (s === "FAILED") return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400"><X className="w-3 h-3" />Failed</span>;
    if (s === "FILTERED") return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">Rejected</span>;
    const processing = ['QUALIFYING', 'QUALIFIED', 'STRATEGIZING', 'DRAFTING', 'CRITIC_REVIEW', 'RESEARCHING', 'RESEARCHED'];
    if (processing.includes(s)) return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400"><Loader2 className="w-3 h-3 animate-spin" /> Processing</span>;
    return <span className="status-pending">Pending</span>;
  };

  const statusColor = (s: LeadStatus) => {
    if (s === "APPROVED" || s === "SENT") return "#22c55e";
    if (s === "SKIPPED" || s === "DISCARDED") return "#6B7280";
    if (s === "HUMAN_REVIEW") return "#F59E0B";
    if (s === "FAILED") return "#ef4444";
    if (s === "FILTERED") return "#f97316";
    const processing = ['QUALIFYING', 'QUALIFIED', 'STRATEGIZING', 'DRAFTING', 'CRITIC_REVIEW', 'RESEARCHING', 'RESEARCHED'];
    if (processing.includes(s)) return "#3b82f6";
    return "#7C3AED";
  };

  const filters: FilterStatus[] = ["All", "HUMAN_REVIEW", "APPROVED", "FILTERED", "FAILED", "SKIPPED", "PENDING"];
  const filterLabels: Record<FilterStatus, string> = { All: "All", PENDING: "Pending", APPROVED: "Approved", SKIPPED: "Skipped", HUMAN_REVIEW: "Review", FAILED: "Failed", FILTERED: "Rejected" };

  return (
    <div className="flex" style={{ height: '100%', minHeight: '100vh' }}>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* LEFT PANEL — sticky, does not scroll with page */}
      <div className="w-[380px] shrink-0 border-r flex flex-col sticky top-0 h-screen" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
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
            {pendingCount > 0 && (
              <span className="badge-count">{pendingCount} need review</span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleBulkApprove} disabled={bulkApproveMut.isPending || pendingCount === 0}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:bg-secondary/50 disabled:opacity-50"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "hsl(0 0% 95%)" }}>
              {bulkApproveMut.isPending ? 'Approving...' : `Approve Review (${pendingCount})`}
            </button>
            <button onClick={handleSendApproved} disabled={sendApprovedMut.isPending || !campaignId}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 disabled:opacity-50">
              {sendApprovedMut.isPending ? 'Sending...' : `Send Approved (${approvedCount})`}
            </button>
          </div>
          {failedCount > 0 && campaignId && (
            <button
              onClick={async () => {
                try {
                  await bulkRetryMut.mutateAsync(campaignId);
                  addToast(`${failedCount} failed leads re-queued`);
                } catch (e: any) {
                  addToast(e.message || 'Bulk retry failed', 'error');
                }
              }}
              disabled={bulkRetryMut.isPending}
              className="w-full mt-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:bg-red-500/10 disabled:opacity-50"
              style={{ borderColor: "rgba(239,68,68,0.2)", color: "#f87171" }}>
              {bulkRetryMut.isPending ? 'Retrying...' : `Retry Failed (${failedCount})`}
            </button>
          )}
          <div className="flex flex-wrap gap-1 mt-3">
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
                    <div className="flex flex-col items-end gap-1.5">
                      {statusPill(l.status)}
                      {scoreBadge(l.qualityScore)}
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

      {/* RIGHT PANEL — scrolls independently */}
      <div className="flex-1 flex flex-col overflow-y-auto sticky top-0 h-screen">
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

              {/* Failure Reason */}
              {selectedLead.status === 'FAILED' && (
                <div className="glass-card mb-4 p-4" style={{ borderLeft: "3px solid #ef4444" }}>
                  <p className="text-sm font-semibold text-red-400 mb-1">Pipeline Error</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedLead.failReason || 'An unknown error occurred during processing.'}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    You can regenerate this lead to retry, or discard it.
                  </p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedLead.status === 'FILTERED' && selectedLead.qualifyReason && (
                <div className="glass-card mb-4 p-4" style={{ borderLeft: "3px solid #f97316" }}>
                  <p className="text-sm font-semibold text-orange-400 mb-1">⊘ Rejected by Gatekeeper</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedLead.qualifyReason}
                  </p>
                </div>
              )}

              {/* Hook Angle */}
              {selectedLead.hookAngle && (
                <div className="glass-card mb-4 px-5 py-3 flex items-start gap-2" style={{ borderLeft: "3px solid #7C3AED" }}>
                  <p className="text-sm text-muted-foreground leading-snug">{selectedLead.hookAngle}</p>
                </div>
              )}

              {/* Email Preview / Edit */}
              <div className="glass-card mb-4 p-5" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
                {/* Draft version switcher */}
                {allDrafts.length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">Draft:</span>
                    {allDrafts.map((d) => (
                      <button
                        key={d.version}
                        onClick={() => setDraftVersion(d.version)}
                        className={`px-2 py-0.5 text-xs rounded-md transition-all ${
                          (draftVersion === 0 && d === allDrafts[0]) || draftVersion === d.version
                            ? "bg-primary/20 text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        v{d.version}
                      </button>
                    ))}
                  </div>
                )}

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
                    <span className={scoreClass(selectedLead.qualityScore)}>Quality: {normScore(selectedLead.qualityScore)}/10 {normScore(selectedLead.qualityScore)! >= 8 ? '🟢' : '🟡'}</span>
                  )}
                  {selectedLead.spamScore != null && (
                    <span className={selectedLead.spamScore <= 3 ? "quality-high" : "quality-mid"}>
                      Spam Risk: {selectedLead.spamScore <= 3 ? 'Low 🟢' : 'Medium 🟡'}
                    </span>
                  )}
                </div>

                {/* Critic Feedback */}
                {currentDraft?.criticFeedback && (
                  <div className="mt-3 px-3 py-2 rounded-md text-xs text-muted-foreground leading-relaxed"
                    style={{ background: "rgba(124,58,237,0.08)", borderLeft: "2px solid rgba(124,58,237,0.3)" }}>
                    <span className="font-semibold text-purple-400">AI Critic: </span>
                    {currentDraft.criticFeedback}
                    {currentDraft.fixInstructions && (
                      <p className="mt-1 text-yellow-400/80">Fix: {currentDraft.fixInstructions}</p>
                    )}
                  </div>
                )}

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
                    <span>Research Context</span>
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
                  { label: "Approve", icon: Check, key: "A", action: handleApprove, primary: true, loading: approveMut.isPending },
                  { label: "Edit", icon: Edit3, key: "E", action: () => setEditMode(true), primary: false, loading: false },
                  { label: "Skip", icon: SkipForward, key: "S", action: handleSkip, primary: false, loading: skipMut.isPending },
                  { label: "Discard", icon: Trash2, key: "D", action: handleDiscard, primary: false, loading: discardMut.isPending },
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

      {/* Discard confirmation */}
      <AlertDialog open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This lead will be permanently discarded and removed from your queue. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send approved confirmation */}
      <AlertDialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send {approvedCount} approved email{approvedCount !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send emails to all {approvedCount} approved contact{approvedCount !== 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendApproved} disabled={sendApprovedMut.isPending}>
              {sendApprovedMut.isPending ? 'Sending...' : 'Send Emails'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
