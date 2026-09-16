import React, { useMemo, useState } from 'react';
import { useKlockit, type OperatorTab } from '../../context/KlockitContext';
import { useOperator } from '../../context/OperatorContext';
import type { OperatorCommercialState } from '../../types/operator';
import { OperatorOrganisationDetail } from './OperatorOrganisationDetail';
import {
  Building2,
  Users,
  MapPin,
  AlertTriangle,
  Search,
  ShieldCheck,
} from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  trial: 'Trial',
  onboarding: 'Onboarding',
  suspended: 'Suspended',
  needs_support: 'Needs support',
};

interface ConfirmSpec {
  title: string;
  consequence: string;
  confirmLabel: string;
  requireReason: boolean;
  onConfirm: (reason: string) => void;
}

const ConfirmModal: React.FC<{ spec: ConfirmSpec; onClose: () => void }> = ({ spec, onClose }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900">{spec.title}</h2>
        <p className="text-xs text-slate-600">{spec.consequence}</p>
        <label className="block text-xs font-semibold text-slate-700">Reason (required)</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why is this needed? Recorded in audit." className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        {error && <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-xs font-semibold text-slate-600 px-3 py-2">Cancel</button>
          <button
            id="operator-confirm-action"
            onClick={() => {
              if (spec.requireReason && !reason.trim()) {
                setError('A reason is required — it is recorded in the audit history.');
                return;
              }
              spec.onConfirm(reason.trim());
              onClose();
            }}
            className="text-xs font-bold text-white bg-slate-900 rounded-xl px-4 py-2"
          >
            {spec.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const OperatorExperience: React.FC = () => {
  const { activeOperatorTab, setActiveOperatorTab } = useKlockit();
  const op = useOperator();
  const { organisations, users, incidents, notices, audit, settings } = op;

  const [orgQuery, setOrgQuery] = useState('');
  const [orgStatusFilter, setOrgStatusFilter] = useState<string>('all');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [subFocusOrgId, setSubFocusOrgId] = useState<string | null>(null);
  const [onbFocusOrgId, setOnbFocusOrgId] = useState<string | null>(null);
  const [auditQuery, setAuditQuery] = useState('');
  const [auditKind, setAuditKind] = useState<string>('all');
  const [confirmSpec, setConfirmSpec] = useState<ConfirmSpec | null>(null);
  const [globalQuery, setGlobalQuery] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [incidentNote, setIncidentNote] = useState('');
  const [assignee, setAssignee] = useState('Klockit Operator');
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [noticeDraft, setNoticeDraft] = useState({ title: '', body: '', language: '' });
  const [noticePreview, setNoticePreview] = useState(false);
  const [settingsReason, setSettingsReason] = useState('');
  const [settingsForm, setSettingsForm] = useState({
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    helpCentreUrl: settings.helpCentreUrl,
    statusPageUrl: settings.statusPageUrl,
    qrTemplateDefault: settings.qrTemplateDefault,
    onboardingChecklistDefault: settings.onboardingChecklistDefault,
    platformNotice: settings.platformNotice,
    platformNoticeActive: settings.platformNoticeActive,
  });
  const [opsOrgFilter, setOpsOrgFilter] = useState<string | null>(null);

  const onJump = (tab: OperatorTab, opts?: { orgId?: string; userSearch?: string; auditSearch?: string }) => {
    if (opts?.orgId) {
      if (tab === 'organisations') setSelectedOrgId(opts.orgId);
      if (tab === 'subscriptions') setSubFocusOrgId(opts.orgId);
      if (tab === 'onboarding') setOnbFocusOrgId(opts.orgId);
      if (tab === 'operations') setOpsOrgFilter(opts.orgId);
    }
    if (opts?.userSearch) {
      setUserQuery(opts.userSearch);
      const found = users.find((u) => u.name === opts.userSearch);
      if (found) setSelectedUserId(found.id);
    }
    if (opts?.auditSearch) {
      setAuditQuery(opts.auditSearch);
      setAuditKind('all');
    }
    setActiveOperatorTab(tab);
  };

  const tabs = [
    { id: 'overview', label: 'Platform overview' },
    { id: 'organisations', label: 'Organisations' },
    { id: 'users', label: 'Users and access' },
    { id: 'subscriptions', label: 'Subscriptions' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'content', label: 'Content' },
    { id: 'operations', label: 'Operations' },
    { id: 'audit', label: 'Audit history' },
    { id: 'settings', label: 'Platform settings' },
  ] as const;

  const selectedOrg = organisations.find((o) => o.id === selectedOrgId) || null;
  const selectedUser = users.find((u) => u.id === selectedUserId) || null;
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || null;
  const selectedNotice = notices.find((n) => n.id === selectedNoticeId) || null;

  const filteredOrgs = useMemo(() => {
    const q = orgQuery.trim().toLowerCase();
    return organisations.filter((o) => {
      if (orgStatusFilter !== 'all' && o.status !== orgStatusFilter) return false;
      if (!q) return true;
      return (
        o.name.toLowerCase().includes(q) ||
        o.country.toLowerCase().includes(q) ||
        o.status.replace('_', ' ').includes(q) ||
        o.commercialState.replace('_', ' ').includes(q) ||
        o.sitesList.some((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
      );
    });
  }, [orgQuery, organisations, orgStatusFilter]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.organisationName.toLowerCase().includes(q) ||
        u.access.includes(q) ||
        u.inviteState.includes(q),
    );
  }, [userQuery, users]);

  const filteredAudit = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    return audit.filter((a) => {
      if (auditKind !== 'all' && a.kind !== auditKind) return false;
      if (!q) return true;
      return (
        a.summary.toLowerCase().includes(q) ||
        a.organisationName.toLowerCase().includes(q) ||
        a.actor.toLowerCase().includes(q) ||
        a.kind.includes(q) ||
        (a.reason ?? '').toLowerCase().includes(q)
      );
    });
  }, [auditQuery, audit, auditKind]);

  const globalResults = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    if (q.length < 2) return null;
    const orgs = organisations
      .filter((o) => o.name.toLowerCase().includes(q) || o.country.toLowerCase().includes(q) || o.id.includes(q))
      .slice(0, 4)
      .map((o) => ({ kind: 'Organisation', label: o.name, sub: `${o.country} · ${o.status.replace('_', ' ')}`, orgId: o.id as string | undefined, userName: undefined as string | undefined, siteOrgId: undefined as string | undefined }));
    const us = users
      .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice(0, 4)
      .map((u) => ({ kind: 'User', label: u.name, sub: `${u.organisationName} · ${u.access}`, orgId: undefined, userName: u.name, siteOrgId: undefined }));
    const sites: { kind: string; label: string; sub: string; orgId: string | undefined; userName: string | undefined; siteOrgId: string | undefined }[] = [];
    organisations.forEach((o) => {
      o.sitesList.forEach((s) => {
        if (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) {
          sites.push({ kind: 'Site', label: `${s.name} (${s.code})`, sub: o.name, orgId: undefined, userName: undefined, siteOrgId: o.id });
        }
      });
    });
    return [...orgs, ...us, ...sites.slice(0, 4)];
  }, [globalQuery, organisations, users]);

  const totalOrgs = organisations.length;
  const supportOpenCount = organisations.filter((o) => o.supportOpen).length;
  const trialCount = organisations.filter((o) => o.commercialState === 'trial').length;
  const attentionOrgs = organisations.filter((o) => o.attention);
  const openIncidents = incidents.filter((i) => i.status !== 'resolved');
  const countries = [...new Set(organisations.map((o) => o.country))];

  const statusBadge = (status: string) => {
    if (status === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'trial') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (status === 'onboarding') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (status === 'suspended') return 'bg-slate-100 text-slate-600 border-slate-300';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  const commercialBadge = (s: string) => {
    if (s === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'trial') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'past_due') return 'bg-amber-50 text-amber-800 border-amber-200';
    if (s === 'suspended') return 'bg-slate-100 text-slate-600 border-slate-300';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const openNoticeEditor = (id: string) => {
    const n = notices.find((x) => x.id === id);
    if (!n) return;
    setSelectedNoticeId(id);
    setNoticeDraft({ title: n.title, body: n.body, language: n.language });
    setNoticePreview(false);
  };

  return (
    <div id="operator-experience" className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-300" />
            <h1 className="text-xl font-black tracking-tight">Klockit Operator</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">Internal control plane</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">Platform administration across customer organisations. Read-only over customer attendance.</p>
          <div className="mt-3 relative max-w-xl">
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                id="operator-global-search"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder="Global search: organisations, users, Sites, references…"
                className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            {globalResults && (
              <div className="absolute z-30 mt-1 w-full bg-white text-slate-900 rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                {globalResults.length === 0 && <p className="text-xs text-slate-500 px-3 py-2">No matches.</p>}
                {globalResults.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (r.kind === 'Organisation' && r.orgId) {
                        setSelectedOrgId(r.orgId);
                        setActiveOperatorTab('organisations');
                      } else if (r.kind === 'User' && r.userName) {
                        onJump('users', { userSearch: r.userName });
                      } else if (r.kind === 'Site' && r.siteOrgId) {
                        setSelectedOrgId(r.siteOrgId);
                        setActiveOperatorTab('organisations');
                      }
                      setGlobalQuery('');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 border-b border-slate-100 last:border-0"
                  >
                    <p className="text-xs font-bold">{r.label} <span className="ml-1 text-[10px] font-semibold text-indigo-600 uppercase">{r.kind}</span></p>
                    <p className="text-[11px] text-slate-500">{r.sub}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`operator-tab-${t.id}`}
              onClick={() => { setActiveOperatorTab(t.id); setSelectedOrgId(null); }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${activeOperatorTab === t.id ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeOperatorTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button onClick={() => setActiveOperatorTab('organisations')} className="text-left bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><Building2 className="w-3.5 h-3.5 text-indigo-500" />Organisations</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalOrgs}</div>
              <p className="text-[11px] text-slate-500 mt-1">{countries.join(' · ')} · {trialCount} in trial</p>
            </button>
            <button onClick={() => setActiveOperatorTab('users')} className="text-left bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><Users className="w-3.5 h-3.5 text-indigo-500" />Customer users</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">Owners, Managers and viewers</p>
            </button>
            <button onClick={() => setActiveOperatorTab('organisations')} className="text-left bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><MapPin className="w-3.5 h-3.5 text-indigo-500" />Countries</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{countries.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">{countries.join(', ')}</p>
            </button>
            <button onClick={() => setActiveOperatorTab('operations')} className="text-left bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" />Support open</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{supportOpenCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">{openIncidents.length} operational items open</p>
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-900">Needs Operator attention</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Platform/support matters only — routine attendance stays with the customer Manager.</p>
              <div className="mt-3 space-y-2">
                {attentionOrgs.map((o) => (
                  <button key={o.id} onClick={() => { setSelectedOrgId(o.id); setActiveOperatorTab('organisations'); }} className="w-full text-left border border-slate-200 rounded-xl px-3 py-2.5 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors">
                    <p className="text-xs font-bold text-slate-900">{o.name} <span className="ml-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">{(o.attentionKind ?? 'operator_task').replace(/_/g, ' ')}</span></p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{o.attention}</p>
                  </button>
                ))}
                {openIncidents.filter((i) => i.needsAction).slice(0, 3).map((i) => (
                  <button key={i.id} onClick={() => { setSelectedIncidentId(i.id); setActiveOperatorTab('operations'); }} className="w-full text-left border border-amber-200 bg-amber-50/40 rounded-xl px-3 py-2.5 hover:border-amber-300 transition-colors">
                    <p className="text-xs font-bold text-slate-900">{i.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{i.scope} · {i.status} · updated {i.updated}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-900">Recent significant changes</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Platform and customer-administration events.</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                {audit.slice(0, 6).map((a) => (
                  <li key={a.id} className="border border-slate-100 rounded-xl px-3 py-2">
                    <p className="font-semibold text-slate-800">{a.summary} <span className="ml-1 text-[10px] uppercase text-slate-500">{a.kind}</span></p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{a.at} · {a.organisationName} · {a.actor}</p>
                  </li>
                ))}
              </ul>
              <button onClick={() => setActiveOperatorTab('audit')} className="mt-3 text-[11px] font-bold text-indigo-600">Open full audit history →</button>
            </div>
          </div>
        </div>
      )}

      {activeOperatorTab === 'organisations' && (
        <div className="space-y-4">
          {!selectedOrg ? (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input value={orgQuery} onChange={(e) => setOrgQuery(e.target.value)} placeholder="Search organisations, Sites, codes…" className="w-full text-xs text-slate-900 focus:outline-none" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'active', 'trial', 'onboarding', 'needs_support', 'suspended'].map((s) => (
                  <button key={s} onClick={() => setOrgStatusFilter(s)} className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${orgStatusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{s === 'all' ? 'All' : STATUS_LABEL[s]}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredOrgs.map((o) => (
                  <button key={o.id} onClick={() => setSelectedOrgId(o.id)} className="text-left bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">{o.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(o.status)}`}>{STATUS_LABEL[o.status]}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{o.country} · {o.workers} Workers · {o.sites} Sites · {o.commercialState.replace('_', ' ')}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Last activity: {o.lastActivity}</p>
                    {o.attention && <p className="text-[11px] text-amber-800 mt-1">{o.attention}</p>}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <OperatorOrganisationDetail orgId={selectedOrg.id} onBack={() => setSelectedOrgId(null)} onJump={onJump} />
          )}
        </div>
      )}

      {activeOperatorTab === 'users' && (
        <div className="space-y-4">
          {!selectedUser ? (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Search users, emails, organisations…" className="w-full text-xs text-slate-900 focus:outline-none" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="text-left px-4 py-2.5">User</th>
                      <th className="text-left px-4 py-2.5">Organisation</th>
                      <th className="text-left px-4 py-2.5">Access</th>
                      <th className="text-right px-4 py-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2.5"><p className="font-bold text-slate-900">{u.name}</p><p className="text-[11px] text-slate-500">{u.email} · {u.note}</p></td>
                        <td className="px-4 py-2.5 text-slate-600">{u.organisationName}</td>
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{u.access} · {u.inviteState}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => setSelectedUserId(u.id)} className="text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5">Inspect</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500">No silent sign-in as a customer. Access changes need a reason and write an audit entry.</p>
            </>
          ) : (
            <div className="space-y-4">
              <button onClick={() => setSelectedUserId(null)} className="text-xs font-semibold text-indigo-600">← Back to users</button>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="text-lg font-black text-slate-900">{selectedUser.name}</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedUser.email} · {selectedUser.organisationName}</p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">Access</p><p className="font-bold text-slate-900">{selectedUser.access}</p></div>
                  <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">Invitation</p><p className="font-bold text-slate-900">{selectedUser.inviteState}</p></div>
                  <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">Last activity</p><p className="font-bold text-slate-900">{selectedUser.lastActivity}</p></div>
                </div>
                <p className="text-xs text-slate-600 mt-3">{selectedUser.note}</p>
                <p className="text-[11px] text-slate-500 mt-1">Membership: {selectedUser.organisationName} ({selectedUser.access}). Invitation state and access are managed here; attendance is never edited from this console.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Permitted actions</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.inviteState === 'invited' && (
                    <>
                      <button onClick={() => setConfirmSpec({ title: `Resend invitation to ${selectedUser.name}?`, consequence: 'A fresh invitation link is issued. The previous link is superseded. Recorded in audit.', confirmLabel: 'Resend invitation', requireReason: true, onConfirm: (r) => op.resendInvite(selectedUser.id, r) })} className="text-[11px] font-bold text-indigo-700 border border-indigo-200 rounded-lg px-2.5 py-1.5">Resend invitation</button>
                      <button onClick={() => setConfirmSpec({ title: `Revoke invitation for ${selectedUser.name}?`, consequence: 'The pending invitation is removed and cannot be used. The user record leaves this register. Recorded in audit.', confirmLabel: 'Revoke invitation', requireReason: true, onConfirm: (r) => { op.revokeInvite(selectedUser.id, r); setSelectedUserId(null); } })} className="text-[11px] font-bold text-rose-700 border border-rose-200 rounded-lg px-2.5 py-1.5">Revoke pending invitation</button>
                    </>
                  )}
                  {selectedUser.inviteState === 'active' && (
                    <button onClick={() => setConfirmSpec({ title: `Suspend access for ${selectedUser.name}?`, consequence: `${selectedUser.access} access is suspended. They cannot act for ${selectedUser.organisationName} until reactivated. Recorded in audit.`, confirmLabel: 'Suspend access', requireReason: true, onConfirm: (r) => op.suspendAccess(selectedUser.id, r) })} className="text-[11px] font-bold text-rose-700 border border-rose-200 rounded-lg px-2.5 py-1.5">Suspend access</button>
                  )}
                  {selectedUser.inviteState === 'suspended' && (
                    <button onClick={() => setConfirmSpec({ title: `Reactivate access for ${selectedUser.name}?`, consequence: `${selectedUser.access} access is restored for ${selectedUser.organisationName}. The suspension stays in history. Recorded in audit.`, confirmLabel: 'Reactivate access', requireReason: true, onConfirm: (r) => op.reactivateAccess(selectedUser.id, r) })} className="text-[11px] font-bold text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1.5">Reactivate access</button>
                  )}
                  <button onClick={() => onJump('organisations', { orgId: selectedUser.organisationId })} className="text-[11px] font-bold text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5">Open organisation</button>
                  <button onClick={() => onJump('audit', { auditSearch: selectedUser.name })} className="text-[11px] font-bold text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5">View audit</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeOperatorTab === 'subscriptions' && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-500">Neutral commercial states only — no prices, packages or tier names. Every transition needs a reason and is kept in history + audit.</p>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="text-left px-4 py-2.5">Organisation</th>
                  <th className="text-left px-4 py-2.5">Commercial state</th>
                  <th className="text-left px-4 py-2.5">Capacity</th>
                  <th className="text-right px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organisations.map((o) => (
                  <React.Fragment key={o.id}>
                    <tr className={`hover:bg-slate-50/60 ${subFocusOrgId === o.id ? 'bg-indigo-50/50' : ''}`}>
                      <td className="px-4 py-2.5"><p className="font-bold text-slate-900">{o.name}</p><p className="text-[11px] text-slate-500">Review: {o.renewalDate}</p></td>
                      <td className="px-4 py-2.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${commercialBadge(o.commercialState)}`}>{o.commercialState.replace('_', ' ')}</span><p className="text-[11px] text-slate-500 mt-1">{o.commercialNote}</p></td>
                      <td className="px-4 py-2.5 text-slate-600">{o.capacity}<p className="text-[11px] text-slate-500">{o.planSummary}</p></td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => setSubFocusOrgId(subFocusOrgId === o.id ? null : o.id)} className="text-[11px] font-bold text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5">{subFocusOrgId === o.id ? 'Hide' : 'Inspect'}</button>
                          <button onClick={() => { setSelectedOrgId(o.id); setActiveOperatorTab('organisations'); }} className="text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5">Open org</button>
                        </div>
                      </td>
                    </tr>
                    {subFocusOrgId === o.id && (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 bg-slate-50/60">
                          <div className="space-y-2">
                            <p className="text-[11px] font-bold text-slate-700 uppercase">Commercial history</p>
                            {o.commercialHistory.map((h) => (
                              <div key={h.id} className="text-[11px] text-slate-600 border border-slate-200 bg-white rounded-lg px-2.5 py-1.5">
                                {h.at} · {h.from} → {h.to} · {h.actor}{h.reason ? ` · ${h.reason}` : ''}
                              </div>
                            ))}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(['trial', 'active', 'past_due', 'suspended', 'manual_review'] as OperatorCommercialState[]).filter((s) => s !== o.commercialState).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setConfirmSpec({
                                    title: `Move ${o.name} to ${s.replace('_', ' ')}?`,
                                    consequence: `Commercial state changes from ${o.commercialState.replace('_', ' ')} to ${s.replace('_', ' ')}. ${s === 'suspended' ? 'Attendance recording pauses; history is retained.' : 'Entitlement placeholders stay unchanged.'} Recorded in history + audit.`,
                                    confirmLabel: `Move to ${s.replace('_', ' ')}`,
                                    requireReason: true,
                                    onConfirm: (r) => op.updateCommercial(o.id, s, r),
                                  })}
                                  className="text-[11px] font-bold text-indigo-700 border border-indigo-200 bg-white rounded-lg px-2.5 py-1.5"
                                >
                                  → {s.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeOperatorTab === 'onboarding' && (
        <div className="space-y-3">
          {onbFocusOrgId && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 text-xs flex justify-between items-center">
              <span>Focused: {organisations.find((o) => o.id === onbFocusOrgId)?.name}</span>
              <button onClick={() => setOnbFocusOrgId(null)} className="font-bold text-indigo-700">Clear</button>
            </div>
          )}
          {(onbFocusOrgId ? organisations.filter((o) => o.id === onbFocusOrgId) : organisations).map((o) => {
            const current = o.onboardingSteps.find((s) => s.state === 'in_progress' || s.state === 'blocked') ?? o.onboardingSteps.find((s) => s.state !== 'complete');
            const ownerInvite = users.find((u) => u.organisationId === o.id && u.access === 'owner' && u.inviteState === 'invited');
            return (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{o.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${o.supportStatus === 'open' ? 'bg-amber-50 text-amber-800 border-amber-200' : o.supportStatus === 'monitoring' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>support: {o.supportStatus}</span>
                </div>
                <p className="text-[11px] text-slate-500">{o.onboardingState} · {o.onboardingProgress}% complete{current ? ` · current: ${current.label}` : ''}</p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${o.onboardingProgress}%` }} />
                </div>
                {o.blocker && <p className="mt-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">Blocker: {o.blocker}</p>}
                <p className="mt-2 text-[11px] text-slate-600">Next step: {o.nextStep}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ownerInvite && (
                    <button onClick={() => setConfirmSpec({ title: `Resend owner invitation to ${ownerInvite.name}?`, consequence: 'Fresh invitation link supersedes the previous one. Recorded in audit.', confirmLabel: 'Resend invitation', requireReason: true, onConfirm: (r) => op.resendInvite(ownerInvite.id, r) })} className="text-[11px] font-bold text-indigo-700 border border-indigo-200 rounded-lg px-2.5 py-1.5">Resend owner invitation</button>
                  )}
                  <button onClick={() => { setSelectedOrgId(o.id); setActiveOperatorTab('organisations'); }} className="text-[11px] font-bold text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5">Inspect Site / Worker setup</button>
                  <button onClick={() => setConfirmSpec({ title: `Mark support contact made for ${o.name}?`, consequence: 'Organisation moves to monitoring. The note is saved to support history + audit.', confirmLabel: 'Mark contact made', requireReason: false, onConfirm: () => op.markSupportContactMade(o.id, 'Support contact made from onboarding queue.') })} className="text-[11px] font-bold text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1.5">Mark support contact made</button>
                  <button onClick={() => { setSelectedOrgId(o.id); setActiveOperatorTab('organisations'); }} className="text-[11px] font-bold text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5">Add support note</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeOperatorTab === 'content' && (
        <div className="space-y-3">
          {!selectedNotice ? (
            <>
              <p className="text-[11px] text-slate-500">Onboarding copy, help, QR templates, links, translations and notices are editable. Product rules and attendance semantics are never edited here.</p>
              {notices.map((n) => (
                <div key={n.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{n.title}</p>
                    <button onClick={() => openNoticeEditor(n.id)} className="text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5">Open & edit</button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{n.contentType.replace('_', ' ')} · {n.language} · {n.audience} · {n.status} · v{n.revision}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{n.body}</p>
                </div>
              ))}
            </>
          ) : (
            <div className="space-y-3">
              <button onClick={() => setSelectedNoticeId(null)} className="text-xs font-semibold text-indigo-600">← Back to content list</button>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-500">{selectedNotice.contentType.replace('_', ' ')} · {selectedNotice.status} · v{selectedNotice.revision}</p>
                  <button onClick={() => setNoticePreview((v) => !v)} className="text-[11px] font-bold text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5">{noticePreview ? 'Edit' : 'Preview'}</button>
                </div>
                {!noticePreview ? (
                  <>
                    <label className="block text-xs font-semibold text-slate-700">Title</label>
                    <input value={noticeDraft.title} onChange={(e) => setNoticeDraft({ ...noticeDraft, title: e.target.value })} className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <label className="block text-xs font-semibold text-slate-700">Language</label>
                    <input value={noticeDraft.language} onChange={(e) => setNoticeDraft({ ...noticeDraft, language: e.target.value })} className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <label className="block text-xs font-semibold text-slate-700">Body</label>
                    <textarea value={noticeDraft.body} onChange={(e) => setNoticeDraft({ ...noticeDraft, body: e.target.value })} rows={6} className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmSpec({ title: `Save draft for “${noticeDraft.title}”?`, consequence: 'A new draft revision is saved. It is not visible to customers until published. Recorded in audit.', confirmLabel: 'Save draft', requireReason: false, onConfirm: (r) => op.saveNotice(selectedNotice.id, noticeDraft, false, r) })} className="text-xs font-bold text-slate-800 border border-slate-300 rounded-xl px-4 py-2">Save draft</button>
                      <button onClick={() => setConfirmSpec({ title: `Publish “${noticeDraft.title}”?`, consequence: 'The new revision becomes the current published version for the stated audience. Recorded in audit.', confirmLabel: 'Publish', requireReason: true, onConfirm: (r) => op.saveNotice(selectedNotice.id, noticeDraft, true, r) })} className="text-xs font-bold text-white bg-slate-900 rounded-xl px-4 py-2">Publish / update</button>
                    </div>
                  </>
                ) : (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <p className="text-sm font-bold text-slate-900">{noticeDraft.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{selectedNotice.audience} · {noticeDraft.language}</p>
                    <p className="text-xs text-slate-700 mt-2 whitespace-pre-wrap">{noticeDraft.body}</p>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-700 uppercase">Revision history</p>
                  {selectedNotice.history.map((h, idx) => (
                    <p key={idx} className="text-[11px] text-slate-500 mt-1">{h.at} · {h.actor} · {h.summary}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeOperatorTab === 'operations' && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-500">Platform issues, customer-configuration issues and support issues. Routine organisation attendance business never becomes Operator workload.</p>
          {opsOrgFilter && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 text-xs flex justify-between items-center">
              <span>Filtered: {organisations.find((o) => o.id === opsOrgFilter)?.name}</span>
              <button onClick={() => setOpsOrgFilter(null)} className="font-bold text-indigo-700">Clear</button>
            </div>
          )}
          {!selectedIncident ? (
            <>
              {(opsOrgFilter ? incidents.filter((i) => i.relatedOrgId === opsOrgFilter) : incidents).map((i) => (
                <div key={i.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{i.title}</p>
                    <button onClick={() => { setSelectedIncidentId(i.id); setIncidentNote(''); }} className="text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5">Open</button>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{i.detail}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{i.kind.replace('_', ' ')} · {i.scope} · {i.status}{i.assignee ? ` · ${i.assignee}` : ''} · updated {i.updated}</p>
                </div>
              ))}
            </>
          ) : (
            <div className="space-y-3">
              <button onClick={() => setSelectedIncidentId(null)} className="text-xs font-semibold text-indigo-600">← Back to operations</button>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="text-sm font-bold text-slate-900">{selectedIncident.title}</h2>
                <p className="text-xs text-slate-600 mt-1">{selectedIncident.detail}</p>
                <p className="text-[11px] text-slate-500 mt-1">{selectedIncident.kind.replace('_', ' ')} · {selectedIncident.scope} · {selectedIncident.status} · updated {selectedIncident.updated}</p>
                {selectedIncident.relatedOrgId && (
                  <button onClick={() => { setSelectedOrgId(selectedIncident.relatedOrgId!); setActiveOperatorTab('organisations'); }} className="mt-2 text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5">Open related organisation</button>
                )}
                <div className="mt-3 space-y-1.5">
                  {selectedIncident.notes.map((n) => (
                    <div key={n.id} className="text-xs border border-slate-100 rounded-xl px-3 py-2"><p className="text-slate-800">{n.text}</p><p className="text-[11px] text-slate-500">{n.at} · {n.author}</p></div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={incidentNote} onChange={(e) => setIncidentNote(e.target.value)} placeholder="Add an operational note…" className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button onClick={() => { if (incidentNote.trim()) { op.addIncidentNote(selectedIncident.id, incidentNote.trim()); setIncidentNote(''); } }} className="text-xs font-bold text-white bg-slate-900 rounded-xl px-4 py-2">Add note</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Assignee" className="text-[11px] border border-slate-300 rounded-lg px-2.5 py-1.5" />
                  <button onClick={() => op.acknowledgeIncident(selectedIncident.id, assignee.trim() || 'Klockit Operator')} className="text-[11px] font-bold text-amber-800 border border-amber-200 rounded-lg px-2.5 py-1.5">Acknowledge / claim</button>
                  <button onClick={() => setConfirmSpec({ title: `Resolve “${selectedIncident.title}”?`, consequence: 'The item closes and a resolution note is recorded in audit. Reopening creates a new item.', confirmLabel: 'Resolve', requireReason: true, onConfirm: (r) => { op.resolveIncident(selectedIncident.id, r); setSelectedIncidentId(null); } })} className="text-[11px] font-bold text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1.5">Resolve / close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeOperatorTab === 'audit' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={auditQuery} onChange={(e) => setAuditQuery(e.target.value)} placeholder="Search audit…" className="w-full text-xs text-slate-900 focus:outline-none" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['all', 'organisation', 'access', 'commercial', 'support', 'content', 'platform'].map((k) => (
              <button key={k} onClick={() => setAuditKind(k)} className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${auditKind === k ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{k}</button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">Read-only. Every Operator action above appends here with actor, timestamp, reason and before/after.</p>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {filteredAudit.map((a) => (
              <div key={a.id} className="p-4 text-xs">
                <p className="font-bold text-slate-900">{a.summary} <span className="ml-1 text-[10px] uppercase text-slate-500">{a.kind}</span></p>
                <p className="text-[11px] text-slate-500 mt-0.5">{a.at} · {a.actor} · {a.organisationName}</p>
                {a.reason && <p className="text-[11px] text-slate-600 mt-1">Reason: {a.reason}</p>}
                {(a.before || a.after) && <p className="text-[11px] text-slate-500 mt-0.5">{a.before ? `Before: ${a.before} ` : ''}{a.after ? `→ After: ${a.after}` : ''}</p>}
              </div>
            ))}
            {filteredAudit.length === 0 && <p className="p-4 text-xs text-slate-500">No audit entries match.</p>}
          </div>
        </div>
      )}

      {activeOperatorTab === 'settings' && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-500">Platform-level defaults only. Saving requires a reason and writes an audit entry. No security/integrity toggles are exposed.</p>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700">Supported languages (comma-separated)</label>
              <input value={settingsForm.supportEmail ? settings.supportEmail : ''} readOnly className="hidden" />
              <div className="text-[11px] text-slate-500 mt-1">Current: {settings.supportedLanguages.join(', ')}</div>
              <p className="text-[11px] text-slate-400">Language list is curated — contact platform engineering to add a new locale. Displayed for reference.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700">Support email</label>
                <input value={settingsForm.supportEmail} onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">Support phone</label>
                <input value={settingsForm.supportPhone} onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">Help centre URL</label>
                <input value={settingsForm.helpCentreUrl} onChange={(e) => setSettingsForm({ ...settingsForm, helpCentreUrl: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">Status page URL</label>
                <input value={settingsForm.statusPageUrl} onChange={(e) => setSettingsForm({ ...settingsForm, statusPageUrl: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">QR template default</label>
                <input value={settingsForm.qrTemplateDefault} onChange={(e) => setSettingsForm({ ...settingsForm, qrTemplateDefault: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700">Onboarding checklist default</label>
                <input value={settingsForm.onboardingChecklistDefault} onChange={(e) => setSettingsForm({ ...settingsForm, onboardingChecklistDefault: e.target.value })} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700">Platform notice</label>
              <textarea value={settingsForm.platformNotice} onChange={(e) => setSettingsForm({ ...settingsForm, platformNotice: e.target.value })} rows={2} className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <label className="mt-2 flex items-center gap-2 text-slate-700"><input type="checkbox" checked={settingsForm.platformNoticeActive} onChange={(e) => setSettingsForm({ ...settingsForm, platformNoticeActive: e.target.checked })} /> Show notice in Operator header</label>
            </div>
            <div>
              <label className="block font-semibold text-slate-700">Reason for change (required)</label>
              <input value={settingsReason} onChange={(e) => setSettingsReason(e.target.value)} placeholder="Why are these defaults changing?" className="mt-1 w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!settingsReason.trim()) {
                    setConfirmSpec({ title: 'Reason required', consequence: 'Platform setting changes always need a reason for the audit trail. Please provide one, then save again.', confirmLabel: 'Understood', requireReason: false, onConfirm: () => undefined });
                    return;
                  }
                  const { ...patch } = settingsForm;
                  op.updateSettings(patch, settingsReason.trim());
                  setSettingsReason('');
                }}
                className="text-xs font-bold text-white bg-slate-900 rounded-xl px-4 py-2"
              >
                Save settings with reason
              </button>
              <button onClick={() => op.resetOperatorData()} className="text-xs font-semibold text-slate-600 border border-slate-300 rounded-xl px-4 py-2">Reset demo-market data</button>
            </div>
          </div>
        </div>
      )}

      {confirmSpec && <ConfirmModal spec={confirmSpec} onClose={() => setConfirmSpec(null)} />}
    </div>
  );
};
