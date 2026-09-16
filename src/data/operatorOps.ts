import type { OperatorIncident, OperatorNotice } from '../types/operator';

export const OPERATOR_INCIDENTS: OperatorIncident[] = [
  { id: 'op-i-1', title: 'Invitation emails delayed for one mailbox provider', detail: 'Owner invitation to Nordwind is delayed. Re-send link works; no attendance impact.', severity: 'warning', scope: 'Access and invitations', updated: 'Today 07:55', needsAction: true },
  { id: 'op-i-2', title: 'QR reprint queue: 1 placard', detail: 'Baltic Print and Pack requested a reprint after water damage. Template is ready to send.', severity: 'notice', scope: 'Sites and QR templates', updated: 'Today 07:40', needsAction: true },
  { id: 'op-i-3', title: 'Attendance processing normal', detail: 'QR arrivals and departure records flowing for live organisations.', severity: 'notice', scope: 'Attendance processing', updated: 'Today 08:00', needsAction: false },
];

export const OPERATOR_NOTICES: OperatorNotice[] = [
  { id: 'op-n-1', title: 'Welcome to Klockit — first-day checklist', audience: 'New organisations · English', updated: '02 Sep', status: 'Published', body: 'Create your first Site, add Workers, define expected work, then record the first QR arrival. Each step links to the relevant Manager screen.' },
  { id: 'op-n-2', title: 'Why Site codes need Manager review', audience: 'Managers · all languages', updated: '05 Sep', status: 'Published', body: 'A typed Site code cannot prove presence on its own. Records stay awaiting review until a Manager confirms them with a reason.' },
  { id: 'op-n-3', title: 'Printing a replacement QR placard', audience: 'Managers · English', updated: 'Today', status: 'Draft — pending review', body: 'Draft steps for reprinting after damage. Confirm wording with support before publishing.' },
];