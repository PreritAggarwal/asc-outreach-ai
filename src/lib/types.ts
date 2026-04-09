// ============================================
// Shared Types — mirrors backend src/utils/types.ts
// ============================================

// Lead Status
export const LEAD_STATUSES = [
  'PENDING', 'RESEARCHING', 'RESEARCHED', 'QUALIFYING',
  'QUALIFIED', 'FILTERED', 'STRATEGIZING', 'DRAFTING',
  'CRITIC_REVIEW', 'APPROVED', 'HUMAN_REVIEW', 'SENDING',
  'SENT', 'BOUNCED', 'SKIPPED', 'DISCARDED', 'FAILED',
] as const;
export type LeadStatus = typeof LEAD_STATUSES[number];

// Campaign Status
export type CampaignStatus = 'PROCESSING' | 'ACTIVE' | 'COMPLETE' | 'FAILED';

// Tone
export type Tone = 'professional' | 'casual' | 'bold';

// ---- API Response Types ----

export interface Org {
  id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
}

export interface OrgSettings {
  id: string;
  name: string;
  email: string;
  valueProposition: string | null;
  icpIndustries: string[];
  icpCompanySize: { min: number; max: number } | null;
  icpTargetRoles: string[];
  icpGeography: string[];
  tone: Tone | null;
  onboardingComplete: boolean;
  apiKeys: {
    proxycurl: boolean;
    apollo: boolean;
    exa: boolean;
    gemini: boolean;
    mailer: boolean;
    hubspot: boolean;
  };
}

export interface CampaignStats {
  totalLeads: number;
  qualified: number;
  filtered: number;
  approved: number;
  humanReview: number;
  completed: number;
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
  inQueue: number;
  openRate: number;
  replyRate: number;
}

export interface Campaign {
  id: string;
  orgId: string;
  name: string;
  status: CampaignStatus;
  totalLeads: number;
  validLeads: number;
  skippedLeads: number;
  duplicateLeads: number;
  createdAt: string;
  updatedAt: string;
  stats?: CampaignStats;
}

export interface LeadResearch {
  id: string;
  leadId: string;
  proxycurlData: Record<string, unknown> | null;
  proxycurlStatus: string | null;
  apolloData: Record<string, unknown> | null;
  apolloStatus: string | null;
  exaData: Record<string, unknown> | null;
  exaStatus: string | null;
}

export interface EmailDraft {
  id: string;
  leadId: string;
  subject: string;
  body: string;
  version: number;
  manuallyEdited: boolean;
  criticScore: number | null;
  criticFeedback: string | null;
  fixInstructions: string | null;
  createdAt: string;
}

export interface Lead {
  id: string;
  campaignId: string;
  orgId: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string | null;
  linkedinUrl: string | null;
  status: LeadStatus;
  qualityScore: number | null;
  spamScore: number | null;
  qualifyReason: string | null;
  hookReasoning: string | null;
  hookAngle: string | null;
  retryCount: number;
  failReason: string | null;
  sentAt: string | null;
  openCount: number;
  replied: boolean;
  bouncedReason: string | null;
  hubspotContactId: string | null;
  hubspotDealId: string | null;
  hubspotSyncStatus: string | null;
  createdAt: string;
  updatedAt: string;
  // Included from associations
  research?: LeadResearch;
  drafts?: EmailDraft[];
  agentLogs?: AgentLog[];
}

export interface AgentLog {
  id: string;
  leadId: string;
  orgId: string;
  agent: string;
  stage: string;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  model: string | null;
  tokensUsed: number | null;
  durationMs: number | null;
  error: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardMetrics {
  emailsSentThisMonth: number;
  openRate: number;
  replyRate: number;
  leadsInQueue: number;
  sparklines: {
    sent: number[];
  };
}

export interface ActivityEvent {
  leadId: string;
  name: string;
  company: string;
  email: string;
  timestamp: string;
  type: 'reply' | 'bounce' | 'open' | 'sent';
  openCount?: number;
}

export interface UploadResult {
  campaignId: string;
  name: string;
  validLeads: number;
  skipped: number;
  duplicates: number;
  totalInCSV: number;
}

export interface OnboardingData {
  valueProposition: string;
  icpIndustries: string[];
  icpCompanySize: { min: number; max: number };
  icpTargetRoles: string[];
  icpGeography: string[];
  tone: Tone;
}

// WebSocket Events
export interface WSProgressEvent {
  type: 'progress';
  campaignId: string;
  completedLeads: number;
  totalLeads: number;
  percentage: number;
}

export interface WSLeadStatusEvent {
  type: 'lead_status';
  leadId: string;
  status: LeadStatus;
  sources?: { proxycurl: string; apollo: string; exa: string };
  failReason?: string;
}

export interface WSStageTransitionEvent {
  type: 'stage_transition';
  campaignId: string;
  stage: string;
}

export interface WSAIStreamEvent {
  type: 'ai_stream';
  leadId: string;
  agent: 'strategist' | 'drafter' | 'critic';
  token: string;
  done: boolean;
}

export type WSEvent = WSProgressEvent | WSLeadStatusEvent | WSStageTransitionEvent | WSAIStreamEvent;
