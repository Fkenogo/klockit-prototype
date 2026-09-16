import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  OperatorAuditEvent,
  OperatorAuditKind,
  OperatorCommercialState,
  OperatorIncident,
  OperatorNotice,
  OperatorOrganisation,
  OperatorOrgStatus,
  OperatorPlatformUser,
  OperatorSettings,
} from '../types/operator';
import {
  OPERATOR_SEED_AUDIT,
  OPERATOR_SEED_INCIDENTS,
  OPERATOR_SEED_NOTICES,
  OPERATOR_SEED_ORGANISATIONS,
  OPERATOR_SEED_SETTINGS,
  OPERATOR_SEED_USERS,
} from '../data/operatorSeed';
import { useKlockit } from './KlockitContext';

const STORAGE_KEY = 'klockit_operator_v3_ea';

export interface OperatorState {
  organisations: OperatorOrganisation[];
  users: OperatorPlatformUser[];
  incidents: OperatorIncident[];
  notices: OperatorNotice[];
  audit: OperatorAuditEvent[];
  settings: OperatorSettings;
}

function loadState(): OperatorState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as OperatorState;
      if (parsed.organisations && parsed.users && parsed.audit) return parsed;
    }
  } catch {
    // fall through to seed
  }
  return {
    organisations: OPERATOR_SEED_ORGANISATIONS,
    users: OPERATOR_SEED_USERS,
    incidents: OPERATOR_SEED_INCIDENTS,
    notices: OPERATOR_SEED_NOTICES,
    audit: OPERATOR_SEED_AUDIT,
    settings: OPERATOR_SEED_SETTINGS,
  };
}

const stamp = () => {
  const d = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

interface OperatorContextType extends OperatorState {
  resetOperatorData: () => void;
  addSupportNote: (orgId: string, text: string) => void;
  setSupportStatus: (orgId: string, status: 'open' | 'monitoring' | 'closed', summary: string, reason: string) => void;
  markSupportContactMade: (orgId: string, note: string) => void;
  orgLifecycle: (orgId: string, to: OperatorOrgStatus, reason: string) => void;
  resendInvite: (userId: string, reason: string) => void;
  revokeInvite: (userId: string, reason: string) => void;
  suspendAccess: (userId: string, reason: string) => void;
  reactivateAccess: (userId: string, reason: string) => void;
  updateCommercial: (orgId: string, to: OperatorCommercialState, reason: string, note?: string) => void;
  acknowledgeIncident: (id: string, assignee: string) => void;
  addIncidentNote: (id: string, text: string) => void;
  resolveIncident: (id: string, reason: string) => void;
  saveNotice: (id: string, patch: { title: string; body: string; language: string }, publish: boolean, reason: string) => void;
  updateSettings: (patch: Partial<OperatorSettings>, reason: string) => void;
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined);

export const OperatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useKlockit();
  const [state, setState] = useState<OperatorState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // prototype-local persistence is best-effort
    }
  }, [state]);

  const appendAudit = (
    prev: OperatorState,
    kind: OperatorAuditKind,
    orgId: string | undefined,
    orgName: string,
    summary: string,
    reason?: string,
    before?: string,
    after?: string,
  ): OperatorAuditEvent[] => {
    const entry: OperatorAuditEvent = {
      id: `op-a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: stamp(),
      actor: 'Klockit Operator',
      kind,
      organisationId: orgId,
      organisationName: orgName,
      summary,
      reason,
      before,
      after,
    };
    return [entry, ...prev.audit];
  };

  const value = useMemo<OperatorContextType>(() => {
    const orgById = (id: string) => state.organisations.find((o) => o.id === id);
    const userById = (id: string) => state.users.find((u) => u.id === id);

    return {
      ...state,
      resetOperatorData: () => {
        setState({
          organisations: OPERATOR_SEED_ORGANISATIONS,
          users: OPERATOR_SEED_USERS,
          incidents: OPERATOR_SEED_INCIDENTS,
          notices: OPERATOR_SEED_NOTICES,
          audit: OPERATOR_SEED_AUDIT,
          settings: OPERATOR_SEED_SETTINGS,
        });
        showToast('Operator data reset', 'Restored East-African demo-market sample data.', 'info');
      },
      addSupportNote: (orgId, text) => {
        setState((prev) => {
          const org = prev.organisations.find((o) => o.id === orgId);
          if (!org) return prev;
          const note = { id: `sn-${Date.now()}`, at: stamp(), author: 'Klockit Operator', text: text.trim() };
          return {
            ...prev,
            organisations: prev.organisations.map((o) =>
              o.id === orgId
                ? {
                    ...o,
                    supportNotes: [...o.supportNotes, note],
                    supportSummary: o.supportOpen ? o.supportSummary : o.supportSummary,
                    supportOpen: true,
                    supportStatus: o.supportStatus === 'closed' ? 'open' : o.supportStatus,
                    lastActivity: `${stamp()} — support note added`,
                    auditTrail: [`${stamp()} — Support note added`, ...o.auditTrail],
                  }
                : o,
            ),
            audit: appendAudit(prev, 'support', orgId, org.name, 'Added support note', text.trim()),
          };
        });
        showToast('Support note added', 'Note saved and recorded in audit history.', 'success');
      },
      setSupportStatus: (orgId, status, summary, reason) => {
        setState((prev) => {
          const org = prev.organisations.find((o) => o.id === orgId);
          if (!org) return prev;
          return {
            ...prev,
            organisations: prev.organisations.map((o) =>
              o.id === orgId
                ? {
                    ...o,
                    supportStatus: status,
                    supportOpen: status === 'open',
                    supportSummary: summary,
                    lastActivity: `${stamp()} — support ${status}`,
                    auditTrail: [`${stamp()} — Support marked ${status}`, ...o.auditTrail],
                  }
                : o,
            ),
            audit: appendAudit(prev, 'support', orgId, org.name, `Support status → ${status}`, reason, `support: ${org.supportStatus}`, `support: ${status}`),
          };
        });
        showToast('Support updated', `Support status set to ${status}.`, 'success');
      },
      markSupportContactMade: (orgId, note) => {
        setState((prev) => {
          const org = prev.organisations.find((o) => o.id === orgId);
          if (!org) return prev;
          const entry = { id: `sn-${Date.now()}`, at: stamp(), author: 'Klockit Operator', text: note.trim() || 'Support contact made.' };
          return {
            ...prev,
            organisations: prev.organisations.map((o) =>
              o.id === orgId
                ? {
                    ...o,
                    supportNotes: [...o.supportNotes, entry],
                    supportContactMade: stamp(),
                    supportOpen: false,
                    supportStatus: 'monitoring',
                    supportSummary: 'Support contact made — monitoring response.',
                    lastActivity: `${stamp()} — support contact made`,
                    auditTrail: [`${stamp()} — Support contact made`, ...o.auditTrail],
                  }
                : o,
            ),
            audit: appendAudit(prev, 'support', orgId, org.name, 'Marked support contact made', note.trim() || undefined, 'support: open', 'support: monitoring'),
          };
        });
        showToast('Contact recorded', 'Marked as contacted. Organisation moved to monitoring.', 'success');
      },
      orgLifecycle: (orgId, to, reason) => {
        setState((prev) => {
          const org = prev.organisations.find((o) => o.id === orgId);
          if (!org) return prev;
          const commercialMap: Partial<Record<OperatorOrgStatus, OperatorCommercialState>> = {
            suspended: 'suspended',
            active: 'active',
          };
          const nextCommercial = commercialMap[to] ?? org.commercialState;
          const commercialChanged = nextCommercial !== org.commercialState;
          return {
            ...prev,
            organisations: prev.organisations.map((o) =>
              o.id === orgId
                ? {
                    ...o,
                    status: to,
                    lifecycleState: to,
                    commercialState: nextCommercial,
                    commercialHistory: commercialChanged
                      ? [...o.commercialHistory, { id: `ch-${Date.now()}`, at: stamp(), from: o.commercialState, to: nextCommercial, actor: 'Klockit Operator', reason }]
                      : o.commercialHistory,
                    lastActivity: `${stamp()} — ${to} (${reason.slice(0, 60)})`,
                    attention: to === 'suspended' ? 'Suspended — keep history intact; do not delete records.' : to === 'active' ? undefined : o.attention,
                    auditTrail: [`${stamp()} — Lifecycle → ${to}: ${reason}`, ...o.auditTrail],
                  }
                : o,
            ),
            audit: appendAudit(prev, 'organisation', orgId, org.name, `Organisation lifecycle → ${to}`, reason, `status: ${org.status} / commercial: ${org.commercialState}`, `status: ${to} / commercial: ${nextCommercial}`),
          };
        });
        showToast('Organisation updated', `Lifecycle state set to ${to}. Audit entry recorded.`, 'success');
      },
      resendInvite: (userId, reason) => {
        setState((prev) => {
          const u = prev.users.find((x) => x.id === userId);
          if (!u) return prev;
          return {
            ...prev,
            users: prev.users.map((x) => (x.id === userId ? { ...x, inviteState: 'invited' as const, lastActivity: `Invitation re-sent ${stamp()}` } : x)),
            audit: appendAudit(prev, 'access', u.organisationId, u.organisationName, `Re-sent invitation to ${u.name}`, reason || undefined, `invite: ${u.inviteState}`, 'invite: invited (re-sent)'),
          };
        });
        const u = userById(userId);
        showToast('Invitation re-sent', `${u?.name ?? 'User'} will receive a fresh invitation link.`, 'success');
      },
      revokeInvite: (userId, reason) => {
        setState((prev) => {
          const u = prev.users.find((x) => x.id === userId);
          if (!u) return prev;
          return {
            ...prev,
            users: prev.users.filter((x) => x.id !== userId),
            audit: appendAudit(prev, 'access', u.organisationId, u.organisationName, `Revoked pending invitation for ${u.name}`, reason, 'invite: invited', 'invite: revoked'),
          };
        });
        showToast('Invitation revoked', 'Pending invitation removed. Audit entry recorded.', 'success');
      },
      suspendAccess: (userId, reason) => {
        setState((prev) => {
          const u = prev.users.find((x) => x.id === userId);
          if (!u) return prev;
          return {
            ...prev,
            users: prev.users.map((x) => (x.id === userId ? { ...x, inviteState: 'suspended' as const, lastActivity: `Suspended ${stamp()}` } : x)),
            audit: appendAudit(prev, 'access', u.organisationId, u.organisationName, `Suspended access for ${u.name} (${u.access})`, reason, `invite: ${u.inviteState}`, 'invite: suspended'),
          };
        });
        showToast('Access suspended', 'User access suspended with reason recorded.', 'success');
      },
      reactivateAccess: (userId, reason) => {
        setState((prev) => {
          const u = prev.users.find((x) => x.id === userId);
          if (!u) return prev;
          return {
            ...prev,
            users: prev.users.map((x) => (x.id === userId ? { ...x, inviteState: 'active' as const, lastActivity: `Reactivated ${stamp()}` } : x)),
            audit: appendAudit(prev, 'access', u.organisationId, u.organisationName, `Reactivated access for ${u.name} (${u.access})`, reason, 'invite: suspended', 'invite: active'),
          };
        });
        showToast('Access reactivated', 'User access restored with reason recorded.', 'success');
      },
      updateCommercial: (orgId, to, reason, note) => {
        setState((prev) => {
          const org = orgById(orgId);
          if (!org) return prev;
          return {
            ...prev,
            organisations: prev.organisations.map((o) =>
              o.id === orgId
                ? {
                    ...o,
                    commercialState: to,
                    commercialNote: note?.trim() ? note.trim() : o.commercialNote,
                    commercialHistory: [...o.commercialHistory, { id: `ch-${Date.now()}`, at: stamp(), from: o.commercialState, to, actor: 'Klockit Operator', reason }],
                    status: to === 'suspended' ? 'suspended' : to === 'past_due' || to === 'manual_review' ? 'needs_support' : to === 'trial' ? 'trial' : o.status === 'suspended' && to === 'active' ? 'active' : o.status,
                    lastActivity: `${stamp()} — commercial → ${to}`,
                    auditTrail: [`${stamp()} — Commercial → ${to}: ${reason}`, ...o.auditTrail],
                  }
                : o,
            ),
            audit: appendAudit(prev, 'commercial', orgId, org.name, `Commercial state → ${to}`, reason, `commercial: ${org.commercialState}`, `commercial: ${to}`),
          };
        });
        showToast('Commercial state updated', `Moved to ${to}. History and audit updated.`, 'success');
      },
      acknowledgeIncident: (id, assignee) => {
        setState((prev) => {
          const inc = prev.incidents.find((i) => i.id === id);
          if (!inc) return prev;
          return {
            ...prev,
            incidents: prev.incidents.map((i) => (i.id === id ? { ...i, status: 'acknowledged' as const, assignee, updated: stamp(), needsAction: true } : i)),
            audit: appendAudit(prev, 'platform', inc.relatedOrgId, inc.relatedOrgId ? prev.organisations.find((o) => o.id === inc.relatedOrgId)?.name ?? inc.scope : 'Platform', `Acknowledged: ${inc.title}`, `Owner: ${assignee}`, `status: ${inc.status}`, 'status: acknowledged'),
          };
        });
        showToast('Acknowledged', `Claimed by ${assignee}.`, 'success');
      },
      addIncidentNote: (id, text) => {
        setState((prev) => ({
          ...prev,
          incidents: prev.incidents.map((i) => (i.id === id ? { ...i, notes: [...i.notes, { id: `n-${Date.now()}`, at: stamp(), author: 'Klockit Operator', text: text.trim() }], updated: stamp() } : i)),
        }));
        showToast('Note added', 'Operational note saved on the item.', 'success');
      },
      resolveIncident: (id, reason) => {
        setState((prev) => {
          const inc = prev.incidents.find((i) => i.id === id);
          if (!inc) return prev;
          return {
            ...prev,
            incidents: prev.incidents.map((i) => (i.id === id ? { ...i, status: 'resolved' as const, updated: stamp(), needsAction: false, notes: [...i.notes, { id: `n-${Date.now()}`, at: stamp(), author: 'Klockit Operator', text: `Resolved: ${reason}` }] } : i)),
            audit: appendAudit(prev, 'platform', inc.relatedOrgId, inc.relatedOrgId ? prev.organisations.find((o) => o.id === inc.relatedOrgId)?.name ?? inc.scope : 'Platform', `Resolved: ${inc.title}`, reason, `status: ${inc.status}`, 'status: resolved'),
          };
        });
        showToast('Resolved', 'Item closed and recorded in audit history.', 'success');
      },
      saveNotice: (id, patch, publish, reason) => {
        setState((prev) => {
          const n = prev.notices.find((x) => x.id === id);
          if (!n) return prev;
          const nextStatus = publish ? ('Published' as const) : n.status.startsWith('Draft') ? n.status : ('Draft — pending review' as const);
          return {
            ...prev,
            notices: prev.notices.map((x) =>
              x.id === id
                ? {
                    ...x,
                    title: patch.title,
                    body: patch.body,
                    language: patch.language,
                    updated: 'Today',
                    status: nextStatus,
                    revision: x.revision + 1,
                    history: [...x.history, { at: stamp(), actor: 'Klockit Operator', summary: `${publish ? 'Published' : 'Saved draft'} v${x.revision + 1}${reason ? ` — ${reason}` : ''}` }],
                  }
                : x,
            ),
            audit: appendAudit(prev, 'content', undefined, 'Platform content', `${publish ? 'Published' : 'Saved draft'}: ${patch.title}`, reason || undefined, `${n.status} v${n.revision}`, `${nextStatus} v${n.revision + 1}`),
          };
        });
        showToast(publish ? 'Published' : 'Draft saved', 'Content revision recorded in audit history.', 'success');
      },
      updateSettings: (patch, reason) => {
        setState((prev) => ({
          ...prev,
          settings: { ...prev.settings, ...patch },
          audit: appendAudit(prev, 'platform', undefined, 'Platform', 'Updated platform settings', reason, undefined, Object.keys(patch).join(', ')),
        }));
        showToast('Settings saved', 'Platform settings updated with reason recorded.', 'success');
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return <OperatorContext.Provider value={value}>{children}</OperatorContext.Provider>;
};

export const useOperator = () => {
  const ctx = useContext(OperatorContext);
  if (!ctx) throw new Error('useOperator must be used within OperatorProvider');
  return ctx;
};
