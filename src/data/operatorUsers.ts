import type { OperatorPlatformUser, OperatorAuditEvent } from '../types/operator';

export const OPERATOR_USERS: OperatorPlatformUser[] = [
  { id: 'op-u-1', name: 'Amelia Hart', organisationId: 'org-apex', organisationName: 'Apex Manufacturing & Logistics Ltd', access: 'owner', inviteState: 'active', lastActivity: 'Today 08:40', note: 'Primary contact. Reviews Site-code arrivals.' },
  { id: 'op-u-2', name: 'Jonas Weber', organisationId: 'org-apex', organisationName: 'Apex Manufacturing & Logistics Ltd', access: 'manager', inviteState: 'active', lastActivity: 'Yesterday 17:20', note: 'Confirms departure corrections.' },
  { id: 'op-u-3', name: 'Sofia Almeida', organisationId: 'org-apex', organisationName: 'Apex Manufacturing & Logistics Ltd', access: 'viewer', inviteState: 'active', lastActivity: '11 Sep 09:10', note: 'Read-only cover.' },
  { id: 'op-u-4', name: 'Tomas Petrauskas', organisationId: 'org-balti', organisationName: 'Baltic Print & Pack UAB', access: 'owner', inviteState: 'active', lastActivity: 'Today 07:15', note: 'Asked for QR reprint and coaching.' },
  { id: 'op-u-5', name: 'Ruta Jankauskiene', organisationId: 'org-balti', organisationName: 'Baltic Print & Pack UAB', access: 'manager', inviteState: 'suspended', lastActivity: '02 Sep 14:00', note: 'Suspended after role change — review before restore.' },
  { id: 'op-u-6', name: 'Marta Silva', organisationId: 'org-harbour', organisationName: 'Harbourline Foods Ltd', access: 'owner', inviteState: 'invited', lastActivity: 'Invitation sent 12 Sep', note: 'Trial owner — invitation pending.' },
  { id: 'op-u-7', name: 'Daniel Berger', organisationId: 'org-nordwind', organisationName: 'Nordwind Assembly GmbH', access: 'owner', inviteState: 'invited', lastActivity: 'Invitation sent 09 Sep', note: 'Onboarding blocked until accepted.' },
  { id: 'op-u-8', name: 'Rui Costa', organisationId: 'org-douro', organisationName: 'Douro Valley Logistics Lda', access: 'owner', inviteState: 'suspended', lastActivity: '30 Aug 17:05', note: 'Suspended with organisation.' },
];

export const OPERATOR_AUDIT: OperatorAuditEvent[] = [
  { id: 'op-a-1', at: '14 Sep 08:12', actor: 'Priya Patel (Worker)', kind: 'organisation', organisationName: 'Apex Manufacturing & Logistics Ltd', summary: 'Site-code arrival recorded — awaiting Manager review', reason: 'Camera lens blurred; fallback code used' },
  { id: 'op-a-2', at: '14 Sep 07:40', actor: 'Klockit Operator', kind: 'support', organisationName: 'Baltic Print & Pack UAB', summary: 'Replied with QR reprint steps', reason: 'Placard water damage' },
  { id: 'op-a-3', at: '13 Sep 17:40', actor: 'Operations Manager', kind: 'organisation', organisationName: 'Apex Manufacturing & Logistics Ltd', summary: 'Confirmed departure correction', reason: 'Left at 17:05, confirmed with team lead' },
  { id: 'op-a-4', at: '12 Sep 15:20', actor: 'Harbourline administrator', kind: 'organisation', organisationName: 'Harbourline Foods Ltd', summary: 'Created second trial Site' },
  { id: 'op-a-5', at: '09 Sep 11:40', actor: 'Klockit Operator', kind: 'access', organisationName: 'Nordwind Assembly GmbH', summary: 'Re-sent owner invitation', reason: 'Original invitation unopened for 6 days' },
  { id: 'op-a-6', at: '05 Sep 09:00', actor: 'Klockit Operator', kind: 'commercial', organisationName: 'Baltic Print & Pack UAB', summary: 'Commercial state moved to past due', reason: 'Supportive review booked — no auto-suspension' },
  { id: 'op-a-7', at: '30 Aug 17:05', actor: 'Klockit Operator', kind: 'organisation', organisationName: 'Douro Valley Logistics Lda', summary: 'Organisation suspended', reason: 'Undeliverable administrator contact' },
];