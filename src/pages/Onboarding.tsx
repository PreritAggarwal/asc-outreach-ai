import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompleteOnboarding } from '@/hooks/useApi';
import { useAuth } from '@/lib/auth';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import type { Tone } from '@/lib/types';

const STEPS = ['Value Proposition', 'ICP Definition', 'Email Tone'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { markOnboardingComplete } = useAuth();
  const completeOnboarding = useCompleteOnboarding();
  const [step, setStep] = useState(0);

  // Form state
  const [valueProposition, setValueProposition] = useState('');
  const [icpIndustries, setIcpIndustries] = useState<string[]>([]);
  const [industryInput, setIndustryInput] = useState('');
  const [icpCompanySize, setIcpCompanySize] = useState({ min: 50, max: 5000 });
  const [icpTargetRoles, setIcpTargetRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [icpGeography, setIcpGeography] = useState<string[]>([]);
  const [geoInput, setGeoInput] = useState('');
  const [tone, setTone] = useState<Tone>('professional');

  const addTag = (list: string[], setter: (v: string[]) => void, input: string, inputSetter: (v: string) => void) => {
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) {
      setter([...list, trimmed]);
    }
    inputSetter('');
  };

  const removeTag = (list: string[], setter: (v: string[]) => void, value: string) => {
    setter(list.filter((v) => v !== value));
  };

  const handleSubmit = async () => {
    try {
      await completeOnboarding.mutateAsync({
        valueProposition,
        icpIndustries,
        icpCompanySize,
        icpTargetRoles,
        icpGeography,
        tone,
      });
      // Update auth state BEFORE navigating so ProtectedRoute sees onboardingComplete=true
      markOnboardingComplete();
      navigate('/');
    } catch (err) {
      console.error('Onboarding failed:', err);
    }
  };

  const canProceed = () => {
    if (step === 0) return valueProposition.trim().length > 20;
    if (step === 1) return icpIndustries.length > 0 && icpTargetRoles.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-blob" />
        <div className="absolute top-2/3 right-1/4 w-80 h-80 rounded-full bg-primary/3 blur-3xl animate-blob-delay" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          {/* Step 1: Value Proposition */}
          {step === 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">What does your company do?</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Describe your value proposition. The AI agents will use this to craft personalized emails.
              </p>
              <textarea
                value={valueProposition}
                onChange={(e) => setValueProposition(e.target.value)}
                rows={6}
                placeholder="e.g., We provide fast, compliant background screening solutions for businesses of all sizes..."
                className="w-full bg-secondary/30 border border-input rounded-lg px-4 py-3 text-foreground text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
            </div>
          )}

          {/* Step 2: ICP */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Define Your Ideal Customer</h2>
              <p className="text-muted-foreground text-sm -mt-4">Add at least one <strong>industry</strong> and one <strong>target role</strong> to continue.</p>

              {/* Industries */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Target Industries *</label>
                <div className="flex gap-2 mb-2">
                  <input value={industryInput} onChange={(e) => setIndustryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(icpIndustries, setIcpIndustries, industryInput, setIndustryInput))}
                    placeholder="e.g. Healthcare, Education, Manufacturing"
                    className="flex-1 bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button type="button"
                    onClick={() => addTag(icpIndustries, setIcpIndustries, industryInput, setIndustryInput)}
                    disabled={!industryInput.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-40">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {icpIndustries.map((i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-primary/15 text-primary cursor-pointer hover:bg-primary/25 transition-colors"
                      onClick={() => removeTag(icpIndustries, setIcpIndustries, i)}>
                      {i} ×
                    </span>
                  ))}
                </div>
              </div>

              {/* Company Size */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Company Size (employees)</label>
                <div className="flex items-center gap-4">
                  <input type="number" value={icpCompanySize.min} onChange={(e) => setIcpCompanySize({ ...icpCompanySize, min: +e.target.value })}
                    className="w-24 bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm" />
                  <span className="text-muted-foreground">to</span>
                  <input type="number" value={icpCompanySize.max} onChange={(e) => setIcpCompanySize({ ...icpCompanySize, max: +e.target.value })}
                    className="w-24 bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm" />
                </div>
              </div>

              {/* Target Roles */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Target Roles *</label>
                <div className="flex gap-2 mb-2">
                  <input value={roleInput} onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(icpTargetRoles, setIcpTargetRoles, roleInput, setRoleInput))}
                    placeholder="e.g. VP of Operations, Director of HR, COO"
                    className="flex-1 bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button type="button"
                    onClick={() => addTag(icpTargetRoles, setIcpTargetRoles, roleInput, setRoleInput)}
                    disabled={!roleInput.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-40">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {icpTargetRoles.map((r) => (
                    <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-primary/15 text-primary cursor-pointer hover:bg-primary/25 transition-colors"
                      onClick={() => removeTag(icpTargetRoles, setIcpTargetRoles, r)}>
                      {r} ×
                    </span>
                  ))}
                </div>
              </div>

              {/* Geography */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Geography</label>
                <div className="flex gap-2 mb-2">
                  <input value={geoInput} onChange={(e) => setGeoInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(icpGeography, setIcpGeography, geoInput, setGeoInput))}
                    placeholder="e.g. United States, Canada, Europe"
                    className="flex-1 bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  <button type="button"
                    onClick={() => addTag(icpGeography, setIcpGeography, geoInput, setGeoInput)}
                    disabled={!geoInput.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-40">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {icpGeography.map((g) => (
                    <span key={g} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-primary/15 text-primary cursor-pointer hover:bg-primary/25 transition-colors"
                      onClick={() => removeTag(icpGeography, setIcpGeography, g)}>
                      {g} ×
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Tone */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">Choose Your Email Tone</h2>
              <div className="grid grid-cols-3 gap-4">
                {([
                  { value: 'professional' as Tone, label: 'Professional', desc: 'Formal but warm. Proper grammar. No slang.' },
                  { value: 'casual' as Tone, label: 'Casual', desc: 'Friendly and conversational. Contractions. Brief.' },
                  { value: 'bold' as Tone, label: 'Bold', desc: 'Direct and confident. Strong insights. No hedging.' },
                ]).map((t) => (
                  <button key={t.value} onClick={() => setTone(t.value)}
                    className={`p-5 rounded-lg border-2 text-left transition-all duration-200 ${
                      tone === t.value ? 'border-primary bg-primary/10' : 'border-input hover:border-primary/40 bg-secondary/20'
                    }`}>
                    <p className="font-semibold text-foreground mb-1">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button onClick={() => setStep(step - 1)} disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={completeOnboarding.isPending}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
                {completeOnboarding.isPending ? 'Setting up...' : 'Complete Setup →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
