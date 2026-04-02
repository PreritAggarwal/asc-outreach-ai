import { useState } from "react";
import { Check, Edit3, RefreshCw, SkipForward, Trash2, ChevronDown, ChevronUp, Linkedin } from "lucide-react";

type LeadStatus = "Pending" | "Approved" | "Skipped";

interface Lead {
  id: number; name: string; company: string; title: string; status: LeadStatus;
  score: number; initials: string; color: string;
}

const leadsData: Lead[] = [
  { id: 1, name: "Sarah Chen", company: "MediCorp", title: "HR Director", status: "Pending", score: 9, initials: "SC", color: "#7C3AED" },
  { id: 2, name: "John Mills", company: "TechLogix", title: "Compliance Officer", status: "Pending", score: 8, initials: "JM", color: "#3B82F6" },
  { id: 3, name: "David Park", company: "RetailPro", title: "VP Operations", status: "Approved", score: 10, initials: "DP", color: "#22c55e" },
  { id: 4, name: "Emma Torres", company: "SafeWork", title: "HR Manager", status: "Pending", score: 7, initials: "ET", color: "#F59E0B" },
  { id: 5, name: "Carlos Reyes", company: "BuildRight", title: "Safety Director", status: "Skipped", score: 8, initials: "CR", color: "#6B7280" },
  { id: 6, name: "Priya Sharma", company: "HealthFirst", title: "CHRO", status: "Pending", score: 9, initials: "PS", color: "#EC4899" },
  { id: 7, name: "Mike Johnson", company: "LogiCorp", title: "Compliance Lead", status: "Pending", score: 6, initials: "MJ", color: "#14B8A6" },
  { id: 8, name: "Anna Lee", company: "MediPlus", title: "HR Director", status: "Approved", score: 9, initials: "AL", color: "#8B5CF6" },
];

const emailSubject = "Scaling your HR team at MediCorp — background checks keeping up?";
const emailBody = `Hi Sarah,

Noticed MediCorp has 3 open HR roles this week — impressive growth. Scaling fast usually means background checks become a bottleneck.

At American Screening Corporation, we help HR teams like yours run compliant, rapid screening across any volume — without the manual back-and-forth.

Worth a 10-min call this week?

Best,
James`;

export default function ReviewQueue() {
  const [leads, setLeads] = useState(leadsData);
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState<"All" | LeadStatus>("All");
  const [hookOpen, setHookOpen] = useState(true);
  const [researchOpen, setResearchOpen] = useState(false);

  const filtered = filter === "All" ? leads : leads.filter((l) => l.status === filter);
  const selected = leads.find((l) => l.id === selectedId) ?? leads[0];
  const approvedCount = leads.filter((l) => l.status === "Approved").length;

  const updateStatus = (id: number, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const scoreClass = (s: number) => (s >= 8 ? "quality-high" : "quality-mid");

  const statusPill = (s: LeadStatus) => {
    if (s === "Approved") return <span className="status-approved">✅ Approved</span>;
    if (s === "Skipped") return <span className="status-skipped">Skipped</span>;
    return <span className="status-pending">Pending</span>;
  };

  const filters: ("All" | LeadStatus)[] = ["All", "Pending", "Approved", "Skipped"];

  return (
    <div className="flex h-screen">
      {/* LEFT PANEL */}
      <div className="w-[380px] shrink-0 border-r flex flex-col" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-foreground font-bold text-lg">Review Queue</h2>
            <span className="badge-count">47 pending</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 hover:bg-secondary/50"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "hsl(0 0% 95%)" }}>
              Approve All
            </button>
            <button className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
              Send Approved ({approvedCount})
            </button>
          </div>
          <div className="flex gap-1 mt-3">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${filter === f ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((l) => (
            <div key={l.id} onClick={() => setSelectedId(l.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedId === l.id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/30 border border-transparent"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: `${l.color}20`, color: l.color }}>
                  {l.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.company}</p>
                  <p className="text-xs text-muted-foreground/60">{l.title}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {statusPill(l.status)}
                  <span className={scoreClass(l.score)}>{l.score}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-6 flex-1">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: `${selected.color}20`, color: selected.color }}>
              {selected.initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
              <p className="text-muted-foreground">{selected.title} at {selected.company}</p>
            </div>
            <div className="flex gap-2 ml-auto">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: "rgba(10,102,194,0.15)", color: "#60a5fa" }}>
                <Linkedin className="w-3 h-3" /> LinkedIn
              </span>
              <span className="status-approved">Synced to HubSpot ✅</span>
            </div>
          </div>

          {/* Hook Reasoning */}
          <div className="glass-card mb-4 overflow-hidden" style={{ borderLeft: "3px solid #7C3AED" }}>
            <button onClick={() => setHookOpen(!hookOpen)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary/20 transition-colors">
              <span>🎯 Why This Angle</span>
              {hookOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {hookOpen && (
              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                MediCorp posted 3 HR job listings this week, signaling rapid team expansion.
                Growing HR teams in healthcare = immediate need for scalable background screening.
                Hook: team scaling → compliance risk at volume.
              </div>
            )}
          </div>

          {/* Email Preview */}
          <div className="glass-card mb-4 p-5" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject</label>
            <input defaultValue={emailSubject} className="w-full bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Body</label>
            <textarea defaultValue={emailBody} rows={12}
              className="w-full bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
            <div className="flex gap-3 mt-3">
              <span className="quality-high">Quality: {selected.score}/10 🟢</span>
              <span className="quality-high">Spam Risk: Low 🟢</span>
            </div>
          </div>

          {/* Research Context */}
          <div className="glass-card overflow-hidden">
            <button onClick={() => setResearchOpen(!researchOpen)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary/20 transition-colors">
              <span>📊 Research Context</span>
              {researchOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {researchOpen && (
              <div className="px-5 pb-4 text-sm text-muted-foreground space-y-2">
                <p>• LinkedIn: HR Director at MediCorp since 2021, 500+ connections</p>
                <p>• Apollo: MediCorp — 450 employees, Healthcare, Series C</p>
                <p>• Exa: "MediCorp expands HR team amid rapid growth" — HealthTech Today, Mar 30</p>
              </div>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="border-t p-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex gap-3">
            {[
              { label: "Approve", icon: Check, key: "A", action: () => updateStatus(selected.id, "Approved"), primary: true },
              { label: "Edit", icon: Edit3, key: "E", action: () => {}, primary: false },
              { label: "Regenerate", icon: RefreshCw, key: "R", action: () => {}, primary: false },
              { label: "Skip", icon: SkipForward, key: "S", action: () => updateStatus(selected.id, "Skipped"), primary: false },
              { label: "Discard", icon: Trash2, key: "D", action: () => {}, primary: false },
            ].map((btn) => (
              <button key={btn.label} onClick={btn.action}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  btn.primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary/50 text-foreground hover:bg-secondary/80 border border-input"
                }`}>
                <span className="flex items-center gap-1.5">
                  <btn.icon className="w-4 h-4" />{btn.label}
                </span>
                <span className="text-[10px] text-muted-foreground">{btn.key}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
