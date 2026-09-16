/**
 * Operator Usage & Health intelligence — synthetic platform aggregates.
 *
 * Privacy boundary: platform-level and organisation-level aggregates only.
 * No individual Worker attendance browsing. Routine customer attendance
 * remains Manager business; these signals are prompts for Operator support,
 * never judgements about a customer.
 */

export interface OperatorUsageWeek {
  week: string;
  sessionsExpected: number;
  sessionsCompleted: number;
  sessionsUnresolved: number;
  qrArrivals: number;
  manualArrivals: number;
  managerCorrections: number;
  invitesSent: number;
  invitesAccepted: number;
  supportCases: number;
  processFailures: number;
}

/** Six synthetic weeks, oldest → newest. Last entry is the current week. */
export const OPERATOR_USAGE_WEEKS: OperatorUsageWeek[] = [
  { week: '04–10 Aug', sessionsExpected: 980, sessionsCompleted: 861, sessionsUnresolved: 119, qrArrivals: 790, manualArrivals: 210, managerCorrections: 64, invitesSent: 22, invitesAccepted: 17, supportCases: 9, processFailures: 3 },
  { week: '11–17 Aug', sessionsExpected: 1015, sessionsCompleted: 902, sessionsUnresolved: 113, qrArrivals: 831, manualArrivals: 208, managerCorrections: 61, invitesSent: 19, invitesAccepted: 15, supportCases: 8, processFailures: 2 },
  { week: '18–24 Aug', sessionsExpected: 1040, sessionsCompleted: 936, sessionsUnresolved: 104, qrArrivals: 868, manualArrivals: 196, managerCorrections: 58, invitesSent: 24, invitesAccepted: 19, supportCases: 7, processFailures: 2 },
  { week: '25–31 Aug', sessionsExpected: 990, sessionsCompleted: 871, sessionsUnresolved: 119, qrArrivals: 812, manualArrivals: 199, managerCorrections: 66, invitesSent: 16, invitesAccepted: 11, supportCases: 11, processFailures: 4 },
  { week: '01–07 Sep', sessionsExpected: 1085, sessionsCompleted: 974, sessionsUnresolved: 111, qrArrivals: 918, manualArrivals: 186, managerCorrections: 55, invitesSent: 21, invitesAccepted: 17, supportCases: 8, processFailures: 1 },
  { week: '08–14 Sep', sessionsExpected: 1120, sessionsCompleted: 1008, sessionsUnresolved: 112, qrArrivals: 952, manualArrivals: 168, managerCorrections: 52, invitesSent: 18, invitesAccepted: 14, supportCases: 9, processFailures: 1 },
];

export interface OperatorOrgUsage {
  orgId: string;
  sessionsSupportedMonth: number;
  completedMonth: number;
  unresolvedPct: number;
  qrSharePct: number;
  manualSharePct: number;
  activeWorkers: number;
  activeSites: number;
  lastMeaningfulUsage: string;
  correctionRatePct: number;
  onboardingCompletionPct: number;
  trialToActive: string;
  trend: 'up' | 'flat' | 'down';
  trendNote: string;
}

export const OPERATOR_ORG_USAGE: OperatorOrgUsage[] = [
  {
    orgId: 'org-mugisha', sessionsSupportedMonth: 320, completedMonth: 304, unresolvedPct: 5,
    qrSharePct: 88, manualSharePct: 12, activeWorkers: 24, activeSites: 3,
    lastMeaningfulUsage: 'Today 07:52', correctionRatePct: 4, onboardingCompletionPct: 100,
    trialToActive: 'Converted 28 Aug', trend: 'up', trendNote: 'Completed sessions up 3 weeks running.',
  },
  {
    orgId: 'org-kigali-fresh', sessionsSupportedMonth: 45, completedMonth: 30, unresolvedPct: 33,
    qrSharePct: 60, manualSharePct: 40, activeWorkers: 11, activeSites: 2,
    lastMeaningfulUsage: '12 Sep 15:20', correctionRatePct: 9, onboardingCompletionPct: 71,
    trialToActive: 'Trial review 28 Sep', trend: 'flat', trendNote: 'First completed attendance reached; review due.',
  },
  {
    orgId: 'org-gitega-agro', sessionsSupportedMonth: 0, completedMonth: 0, unresolvedPct: 0,
    qrSharePct: 0, manualSharePct: 0, activeWorkers: 0, activeSites: 0,
    lastMeaningfulUsage: 'No attendance activity yet', correctionRatePct: 0, onboardingCompletionPct: 43,
    trialToActive: 'Not started', trend: 'flat', trendNote: 'Workers drafted but no planned sessions.',
  },
  {
    orgId: 'org-virunga', sessionsSupportedMonth: 210, completedMonth: 150, unresolvedPct: 29,
    qrSharePct: 55, manualSharePct: 45, activeWorkers: 18, activeSites: 2,
    lastMeaningfulUsage: 'Today 07:40', correctionRatePct: 11, onboardingCompletionPct: 100,
    trialToActive: 'Converted earlier; now past due', trend: 'down', trendNote: 'Unresolved share rising with manual-code reliance.',
  },
  {
    orgId: 'org-ngozi-coffee', sessionsSupportedMonth: 0, completedMonth: 0, unresolvedPct: 0,
    qrSharePct: 0, manualSharePct: 0, activeWorkers: 0, activeSites: 0,
    lastMeaningfulUsage: '30 Aug (before suspension)', correctionRatePct: 0, onboardingCompletionPct: 86,
    trialToActive: 'Suspended', trend: 'down', trendNote: 'No attendance activity for 17 days (suspended — expected).',
  },
  {
    orgId: 'org-rusizi', sessionsSupportedMonth: 120, completedMonth: 95, unresolvedPct: 21,
    qrSharePct: 64, manualSharePct: 36, activeWorkers: 15, activeSites: 2,
    lastMeaningfulUsage: 'Today 06:58', correctionRatePct: 8, onboardingCompletionPct: 86,
    trialToActive: 'Manual review 24 Sep', trend: 'flat', trendNote: 'Kamembe scan failures push sessions to manual codes.',
  },
];

export type PlatformHealthStatus = 'healthy' | 'degraded' | 'incident';

export interface OperatorPlatformHealth {
  id: string;
  area: string;
  status: PlatformHealthStatus;
  detail: string;
  updated: string;
  affectedOrgs?: string[];
  recovery?: string;
}

export const OPERATOR_PLATFORM_HEALTH: OperatorPlatformHealth[] = [
  { id: 'ph-auth', area: 'Authentication', status: 'healthy', detail: 'Owner/Manager sign-in success 99.6% this week.', updated: 'Today 08:00' },
  { id: 'ph-invite', area: 'Invitation delivery', status: 'degraded', detail: 'One mailbox provider delays delivery (spam-folder routing). Re-send links work.', updated: 'Today 07:55', affectedOrgs: ['Gitega Agro Cooperative'], recovery: 'Monitoring; provider ticket open.' },
  { id: 'ph-ingest', area: 'Attendance-event processing', status: 'healthy', detail: 'QR arrivals and departures flowing; ingest lag normal.', updated: 'Today 08:00' },
  { id: 'ph-qr', area: 'QR processing', status: 'degraded', detail: 'Kamembe placard fails in low light; suspected low-contrast reprint.', updated: 'Today 06:58', affectedOrgs: ['Rusizi Transport Cooperative'], recovery: 'Provisioning check open; photo requested.' },
  { id: 'ph-jobs', area: 'Background jobs', status: 'healthy', detail: 'Nightly reconciliation and reminders ran clean.', updated: 'Today 05:30' },
  { id: 'ph-api', area: 'API / service availability', status: 'healthy', detail: '99.9% availability (30d). One 4-minute degraded window 30 Aug.', updated: 'Yesterday 18:00' },
];

export interface AdoptionSignal {
  id: string;
  orgId: string;
  orgName: string;
  kind: 'onboarding' | 'qr_education' | 'session_closing' | 'manager_training' | 'scheduling' | 'invitation';
  prompt: string;
  evidence: string;
}

/** Support prompts, computed from the same aggregates an Operator sees. Never a judgement. */
export function buildAdoptionSignals(
  orgs: { id: string; name: string; commercialState: string; supportOpen: boolean }[],
  usage: OperatorOrgUsage[],
  pendingInvites: { organisationId: string }[],
): AdoptionSignal[] {
  const signals: AdoptionSignal[] = [];
  const byId = new Map(usage.map((u) => [u.orgId, u]));
  orgs.forEach((o) => {
    const u = byId.get(o.id);
    if (!u) return;
    if (o.commercialState === 'trial' && u.completedMonth === 0) {
      signals.push({ id: `sg-${o.id}-first`, orgId: o.id, orgName: o.name, kind: 'onboarding', prompt: 'Trial organisation has not reached first completed attendance — onboarding support may help.', evidence: `${u.sessionsSupportedMonth} sessions supported · ${u.onboardingCompletionPct}% onboarding` });
    }
    if (u.sessionsSupportedMonth > 0 && u.unresolvedPct >= 25) {
      signals.push({ id: `sg-${o.id}-closing`, orgId: o.id, orgName: o.name, kind: 'session_closing', prompt: 'High unresolved share — session-closing education may help Managers finish the day cleanly.', evidence: `${u.unresolvedPct}% unresolved across ${u.sessionsSupportedMonth} sessions` });
    }
    if (u.sessionsSupportedMonth > 0 && u.manualSharePct >= 40) {
      signals.push({ id: `sg-${o.id}-qr`, orgId: o.id, orgName: o.name, kind: 'qr_education', prompt: 'High manual-code reliance — QR-first coaching and placard check may help.', evidence: `${u.manualSharePct}% manual-code arrivals` });
    }
    if (u.sessionsSupportedMonth === 0 && o.commercialState !== 'suspended') {
      signals.push({ id: `sg-${o.id}-sched`, orgId: o.id, orgName: o.name, kind: 'scheduling', prompt: 'Workers added but no planned sessions — scheduling help may unblock first attendance.', evidence: u.trendNote });
    }
    if (pendingInvites.some((p) => p.organisationId === o.id)) {
      signals.push({ id: `sg-${o.id}-invite`, orgId: o.id, orgName: o.name, kind: 'invitation', prompt: 'Owner/Manager invitation still pending — access and invitation help may unblock onboarding.', evidence: 'Invitation unaccepted for several days' });
    }
  });
  return signals;
}
