import { useState, useEffect } from "react";
import { Wand2, X, Loader2, Save } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useApi";
import type { Tone } from "@/lib/types";

const tabs = ["Value Proposition", "ICP Definition", "Email Tone", "Connected Accounts"];

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [activeTab, setActiveTab] = useState("Value Proposition");

  // Form state (mirrors settings)
  const [valueProp, setValueProp] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [industryInput, setIndustryInput] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [geo, setGeo] = useState<string[]>([]);
  const [geoInput, setGeoInput] = useState('');
  const [companySize, setCompanySize] = useState({ min: 50, max: 5000 });
  const [tone, setTone] = useState<Tone>('professional');

  // Hydrate form from server
  useEffect(() => {
    if (!settings) return;
    setValueProp(settings.valueProposition || '');
    setIndustries(settings.icpIndustries || []);
    setRoles(settings.icpTargetRoles || []);
    setGeo(settings.icpGeography || []);
    setCompanySize(settings.icpCompanySize || { min: 50, max: 5000 });
    setTone(settings.tone || 'professional');
  }, [settings]);

  const addTag = (list: string[], setter: (v: string[]) => void, input: string, inputSetter: (v: string) => void) => {
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) setter([...list, trimmed]);
    inputSetter('');
  };

  const saveAll = () => {
    updateSettings.mutate({
      valueProposition: valueProp,
      icpIndustries: industries,
      icpCompanySize: companySize,
      icpTargetRoles: roles,
      icpGeography: geo,
      tone,
    } as any);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

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

        {/* Save button */}
        <div className="pt-4">
          <button onClick={saveAll} disabled={updateSettings.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
            {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          {updateSettings.isSuccess && (
            <p className="text-xs text-success text-center mt-2 flex items-center justify-center gap-1"><Save className="w-3 h-3" /> Saved successfully</p>
          )}
        </div>
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
              <textarea value={valueProp} onChange={(e) => setValueProp(e.target.value)} rows={6}
                className="w-full bg-secondary/30 border border-input rounded-md px-4 py-3 text-foreground text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
            </div>
          </div>
        )}

        {activeTab === "ICP Definition" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">ICP Definition</h2>

            <div className="glass-card p-5">
              <label className="text-sm font-medium text-muted-foreground block mb-3">Target Industries</label>
              <div className="flex gap-2 mb-2">
                <input value={industryInput} onChange={(e) => setIndustryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(industries, setIndustries, industryInput, setIndustryInput))}
                  placeholder="Type and press Enter"
                  className="flex-1 bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex flex-wrap gap-2">
                {industries.map((i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary">
                    {i} <X className="w-3 h-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                      onClick={() => setIndustries(industries.filter((x) => x !== i))} />
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <label className="text-sm font-medium text-muted-foreground block mb-3">Company Size</label>
              <div className="flex items-center gap-4">
                <input type="number" value={companySize.min} onChange={(e) => setCompanySize({ ...companySize, min: +e.target.value })}
                  className="w-24 bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm" />
                <span className="text-muted-foreground">to</span>
                <input type="number" value={companySize.max} onChange={(e) => setCompanySize({ ...companySize, max: +e.target.value })}
                  className="w-24 bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm" />
                <span className="text-sm text-muted-foreground">employees</span>
              </div>
            </div>

            <div className="glass-card p-5">
              <label className="text-sm font-medium text-muted-foreground block mb-3">Target Roles</label>
              <div className="flex gap-2 mb-2">
                <input value={roleInput} onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(roles, setRoles, roleInput, setRoleInput))}
                  placeholder="Type and press Enter"
                  className="flex-1 bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary">
                    {r} <X className="w-3 h-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                      onClick={() => setRoles(roles.filter((x) => x !== r))} />
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <label className="text-sm font-medium text-muted-foreground block mb-3">Geography</label>
              <div className="flex gap-2 mb-2">
                <input value={geoInput} onChange={(e) => setGeoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(geo, setGeo, geoInput, setGeoInput))}
                  placeholder="Type and press Enter"
                  className="flex-1 bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex flex-wrap gap-2">
                {geo.map((g) => (
                  <span key={g} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/15 text-primary">
                    {g} <X className="w-3 h-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                      onClick={() => setGeo(geo.filter((x) => x !== g))} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Email Tone" && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Email Tone</h2>
            <div className="grid grid-cols-3 gap-4">
              {([
                { value: 'professional' as Tone, label: 'Professional', desc: 'Formal but warm. Proper grammar. No slang.' },
                { value: 'casual' as Tone, label: 'Casual', desc: 'Friendly and conversational. Contractions. Brief.' },
                { value: 'bold' as Tone, label: 'Bold', desc: 'Direct and confident. Strong insights. No hedging.' },
              ]).map((t) => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={`glass-card-hover p-5 text-left border-2 transition-all duration-200 ${
                    tone === t.value ? 'border-primary bg-primary/10' : 'border-transparent hover:border-primary/40'
                  }`}>
                  <p className="font-semibold text-foreground mb-1">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Connected Accounts" && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Connected Accounts</h2>
            <div className="space-y-3">
              {[
                { name: "Gmail / SMTP", connected: settings?.apiKeys?.mailer, detail: "Outbound email delivery" },
                { name: "Gemini", connected: settings?.apiKeys?.gemini, detail: "AI pipeline (qualification, drafting, critique)" },
                { name: "HubSpot", connected: settings?.apiKeys?.hubspot, detail: "CRM sync — contacts and deals" },
                { name: "Proxycurl", connected: settings?.apiKeys?.proxycurl, detail: "LinkedIn profile enrichment" },
                { name: "Apollo.io", connected: settings?.apiKeys?.apollo, detail: "Company and contact data" },
                { name: "Exa.ai", connected: settings?.apiKeys?.exa, detail: "News and web intelligence" },
              ].map((a) => (
                <div key={a.name} className="glass-card-hover p-5 flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-semibold">{a.name}</p>
                    <p className="text-sm text-muted-foreground">{a.detail}</p>
                  </div>
                  {a.connected ? (
                    <span className="status-active">Connected</span>
                  ) : (
                    <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-secondary/50">Not configured</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
