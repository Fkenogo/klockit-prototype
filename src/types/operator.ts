export type OperatorOrgStatus = 'active' | 'trial' | 'onboarding' | 'suspended' | 'needs_support';
export type OperatorCommercialState = 'trial' | 'active' | 'past_due' | 'suspended' | 'manual_review';
export type OperatorOnboardingStepId =
  | 'registration'
  | 'organisation_created'
  | 'administrator_setup'
  | 'first_site'
  | 'workers_added'
  | 'expected_work_defined'
  | 'first_attendance';
export type OperatorUserAccess = 'owner' | 'manager' | 'viewer';
export type OperatorInviteState = 'active' | 'invited' | 'suspended';
export type OperatorIncidentSeverity = 'critical' | 'warning' | 'notice';
export type OperatorAuditKind =
  | 'organisation'
  | 'access'
  | 'commercial'
  | 'content'
  | 'platform'
  | 'support';

export interface OperatorOnboardingStep {
  id: OperatorOnboardingStepId;
  label: string;
  detail: string;
  state: 'complete' | 'in_progress' | 'blocked' | 'not_started';
}

export interface OperatorSiteRef {
  id: string;
  name: string;
  code: string;
}

export interface OperatorSupportNote {
  id: string;
  at: string;
  author: string;
  text: string;
}

export interface OperatorCommercialHistoryEntry {
  id: string;
  at: string;
  from: string;
  to: string;
  actor: string;
  reason: string;
}

export interface OperatorOrganisation {
  id: string;
  name: string;
  status: OperatorOrgStatus;
  country: string;
  timezone: string;
  language: string;
  activeUsers: number;
  sites: number;
  workers: number;
  onboardingState: string;
  onboardingProgress: number;
  onboardingSteps: OperatorOnboardingStep[];
  blocker?: string;
  nextStep: string;
  commercialState: OperatorCommercialState;
  planSummary: string;
  renewalDate: string;
  capacity: string;
  commercialNote: string;
  commercialHistory: OperatorCommercialHistoryEntry[];
  supportOpen: boolean;
  supportStatus: 'open' | 'monitoring' | 'closed';
  supportSummary: string;
  supportNotes: OperatorSupportNote[];
  supportContactMade?: string;
  sitesSummary: string;
  sitesList: OperatorSiteRef[];
  sessionsSummary: string;
  lastActivity: string;
  attention?: string;
  attentionKind?: 'stalled_onboarding' | 'trial_ending' | 'past_due' | 'invite_pending' | 'support_followup' | 'suspended' | 'provisioning' | 'operational_failure' | 'platform_warning' | 'operator_task';
  lifecycleState: OperatorOrgStatus;
  auditTrail: string[];
}

export interface OperatorPlatformUser {
  id: string;
  name: string;
  email: string;
  organisationId: string;
  organisationName: string;
  access: OperatorUserAccess;
  inviteState: OperatorInviteState;
  lastActivity: string;
  note: string;
}

export interface OperatorAuditEvent {
  id: string;
  at: string;
  actor: string;
  kind: OperatorAuditKind;
  organisationId?: string;
  organisationName: string;
  summary: string;
  reason?: string;
  before?: string;
  after?: string;
}

export type OperatorIncidentStatus = 'open' | 'acknowledged' | 'resolved';

export interface OperatorIncidentNote {
  id: string;
  at: string;
  author: string;
  text: string;
}

export interface OperatorIncident {
  id: string;
  title: string;
  detail: string;
  severity: OperatorIncidentSeverity;
  scope: string;
  updated: string;
  needsAction: boolean;
  status: OperatorIncidentStatus;
  assignee?: string;
  relatedOrgId?: string;
  kind: 'platform_issue' | 'customer_config' | 'support_issue';
  notes: OperatorIncidentNote[];
}

export type OperatorContentStatus = 'Draft' | 'Published' | 'Draft — pending review' | 'Archived';
export type OperatorContentType =
  | 'onboarding_copy'
  | 'help'
  | 'qr_template'
  | 'support_link'
  | 'legal'
  | 'translation'
  | 'platform_notice';

export interface OperatorContentRevision {
  at: string;
  actor: string;
  summary: string;
}

export interface OperatorNotice {
  id: string;
  title: string;
  contentType: OperatorContentType;
  language: string;
  audience: string;
  updated: string;
  status: OperatorContentStatus;
  body: string;
  revision: number;
  history: OperatorContentRevision[];
}

export interface OperatorSettings {
  supportedLanguages: string[];
  supportEmail: string;
  supportPhone: string;
  helpCentreUrl: string;
  statusPageUrl: string;
  qrTemplateDefault: string;
  onboardingChecklistDefault: string;
  platformNotice: string;
  platformNoticeActive: boolean;
}
