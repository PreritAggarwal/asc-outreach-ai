import { useState } from "react";
import { Wand2, X } from "lucide-react";

const tabs = ["Value Proposition", "ICP Definition", "Email Tone", "Connected Accounts", "API Usage"];

const industries = ["Healthcare", "Logistics", "Retail", "Manufacturing"];
const roles = ["HR Director", "Compliance Officer", "VP Operations", "Safety Manager"];
const geo = ["United States", "Canada"];

const valueProp = `American Screening Corporation provides fast, compliant, and scalable background screening solutions for businesses of all sizes. We streamline the hiring process with instant criminal background checks, drug testing, employment verification, and more — helping HR teams onboard confidently and compliantly at any volume.`;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Value Proposition");

  return (
    <div className="p-6 flex gap-6 max-w-6xl">
      {/* Sub nav */}
      <div className="w-52 shrink-0 space-y-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === t ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {activeTab === "Value Proposition" && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Value Proposition</h2>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-muted-foreground">Your Value Proposition</label>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all duration-200">
                  <Wand2 className="w-4 h-4" /> AI Refine
                </button>
              </div>
              <textarea defaultValue={valueProp} rows={6}
                className="w-full bg-secondary/30 border border-input rounded-md px-4 py-3 text-foreground text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
            </div>
          </div>
        )}

        {activeTab === "ICP Definition" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">ICP Definition</h2>
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-muted-foreground block mb-3">Target Industries</label>
              <div className="flex flex-wrap gap-2">
                {industries.map((i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary">
                    {i} <X className="w-3 h-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" />
                  </span>
                ))}
              </div>
            </div>
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-muted-foreground block mb-3">Company Size</label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">50</span>
                <input type="range" min={50} max={10000} defaultValue={5000}
                  className="flex-1 accent-primary" />
                <span className="text-sm text-muted-foreground">10,000</span>
              </div>
              <p className="text-center text-sm text-foreground mt-2 font-medium">~5,000 employees</p>
            </div>
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-muted-foreground block mb-3">Target Roles</label>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary">
                    {r} <X className="w-3 h-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" />
                  </span>
                ))}
              </div>
            </div>
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-muted-foreground block mb-3">Geography</label>
              <div className="flex flex-wrap gap-2">
                {geo.map((g) => (
                  <span key={g} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary">
                    {g} <X className="w-3 h-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Connected Accounts" && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Connected Accounts</h2>
            <div className="space-y-3">
              {[
                { name: "Smartlead", detail: "3 inboxes active", connected: true },
                { name: "HubSpot", detail: "Last sync: 2 min ago", connected: true },
                { name: "Google OAuth", detail: "Connected", connected: true },
              ].map((a) => (
                <div key={a.name} className="glass-card-hover p-5 flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-semibold">{a.name}</p>
                    <p className="text-sm text-muted-foreground">{a.detail}</p>
                  </div>
                  <span className="status-active">Connected 🟢</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === "Email Tone" || activeTab === "API Usage") && (
          <div className="glass-card p-10 flex flex-col items-center justify-center">
            <p className="text-muted-foreground text-sm">Coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
