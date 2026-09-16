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

export interface OperatorOrganisation {
  id: string;
  name: string;
  status: OperatorOrgStatus;
  country: string;
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
  supportOpen: boolean;
  supportSummary: string;
  sitesSummary: string;
  sessionsSummary: string;
  lastActivity: string;
  attention?: string;
  auditTrail: string[];
}

export interface OperatorPlatformUser {
  id: string;
  name: string;
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
  organisationName: string;
  summary: string;
  reason?: string;
}

export interface OperatorIncident {
  id: string;
  title: string;
  detail: string;
  severity: OperatorIncidentSeverity;
  scope: string;
  updated: string;
  needsAction: boolean;
}

export interface OperatorNotice {
  id: string;
  title: string;
  audience: string;
  updated: string;
  status: string;
  body: string;
}
