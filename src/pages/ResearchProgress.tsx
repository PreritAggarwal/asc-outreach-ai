import { Linkedin, Building2, Newspaper } from "lucide-react";

const logEntries = [
  { id: 1672, name: "Sarah Chen", company: "MediCorp", linkedin: true, apollo: true, exa: true, note: "" },
  { id: 1671, name: "John Park", company: "SafeHealth", linkedin: true, apollo: true, exa: false, note: "(thin data)" },
  { id: 1670, name: "Priya Sharma", company: "HealthFirst", linkedin: true, apollo: true, exa: true, note: "" },
  { id: 1669, name: "Mike Johnson", company: "LogiCorp", linkedin: true, apollo: true, exa: true, note: "" },
  { id: 1668, name: "Anna Lee", company: "MediPlus", linkedin: true, apollo: true, exa: true, note: "" },
  { id: 1673, name: "Emma Torres", company: "BuildCorp", linkedin: false, apollo: false, exa: false, note: "processing" },
];

const sources = [
  { name: "Proxycurl", count: "1,580 profiles fetched", icon: Linkedin, color: "#0A66C2" },
  { name: "Apollo.io", count: "1,672 companies enriched", icon: Building2, color: "#7C3AED" },
  { name: "Exa.ai", count: "1,431 news items found", icon: Newspaper, color: "#22c55e" },
];

export default function ResearchProgress() {
  const progress = 67;
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-1">Processing: Healthcare HR Batch</h1>
      <p className="text-sm text-muted-foreground mb-8">April 2, 2025</p>

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
            <span className="text-4xl font-bold text-foreground">{progress}%</span>
            <span className="text-sm text-muted-foreground mt-1">1,672 / 2,500</span>
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
          {logEntries.map((e) => (
            <div key={e.id} className="flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-secondary/30 transition-colors">
              {e.note === "processing" ? (
                <>
                  <span className="text-warning">⏳</span>
                  <span className="text-muted-foreground">
                    Lead #{e.id} — {e.name}, {e.company} — <span className="text-warning">processing...</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="text-success">✅</span>
                  <span className="text-muted-foreground">
                    Lead #{e.id} — {e.name}, {e.company} — LinkedIn {e.linkedin ? "✅" : "❌"} Apollo {e.apollo ? "✅" : "❌"} Exa {e.exa ? "✅" : `⚠️ ${e.note}`}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ETA */}
      <div className="flex items-center gap-3 justify-center text-sm text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
        ~18 minutes remaining
      </div>
    </div>
  );
}
