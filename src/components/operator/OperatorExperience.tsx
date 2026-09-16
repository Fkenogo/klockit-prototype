import React, { useMemo, useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { OPERATOR_ORGANISATIONS } from '../../data/operatorData';
import { OPERATOR_USERS, OPERATOR_AUDIT } from '../../data/operatorUsers';
import { OPERATOR_INCIDENTS, OPERATOR_NOTICES } from '../../data/operatorOps';
import { OperatorOrgStatus } from '../../types/operator';
import { OperatorOrganisationDetail } from './OperatorOrganisationDetail';
import {
  Building2,
  Users,
  MapPin,
  Globe2,
  AlertTriangle,
  FileText,
  Search,
  ShieldCheck,
} from 'lucide-react';

const STATUS_LABEL: Record<OperatorOrgStatus, string> = {
  active: 'Active',
  trial: 'Trial',
  onboarding: 'Onboarding',
  suspended: 'Suspended',
  needs_support: 'Needs support',
};

export const OperatorExperience: React.FC = () => {
  const { activeOperatorTab, setActiveOperatorTab, showToast } = useKlockit();
  const [orgQuery, setOrgQuery] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [auditQuery, setAuditQuery] = useState('');
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

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

  const selectedOrg = OPERATOR_ORGANISATIONS.find((o) => o.id === selectedOrgId) || null;

  const filteredOrgs = useMemo(() => {
    const q = orgQuery.trim().toLowerCase();
    if (!q) return OPERATOR_ORGANISATIONS;
    return OPERATOR_ORGANISATIONS.filter((o) =>
      o.name.toLowerCase().includes(q) ||
      o.country.toLowerCase().includes(q) ||
      o.status.replace('_', ' ').includes(q) ||
      o.commercialState.replace('_', ' ').includes(q)
    );
  }, [orgQuery]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return OPERATOR_USERS;
    return OPERATOR_USERS.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.organisationName.toLowerCase().includes(q) ||
      u.access.includes(q) ||
      u.inviteState.includes(q)
    );
  }, [userQuery]);

  const filteredAudit = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    if (!q) return OPERATOR_AUDIT;
    return OPERATOR_AUDIT.filter((a) =>
      a.summary.toLowerCase().includes(q) ||
      a.organisationName.toLowerCase().includes(q) ||
      a.actor.toLowerCase().includes(q) ||
      a.kind.includes(q)
    );
  }, [auditQuery]);

  const totalOrgs = OPERATOR_ORGANISATIONS.length;
  const supportOrgs = OPERATOR_ORGANISATIONS.filter((o) => o.supportOpen).length;
  const attentionOrgs = OPERATOR_ORGANISATIONS.filter((o) => o.attention);

  const requestAction = (label: string) => {
    setConfirmAction(label);
    setActionReason('');
    setActionError(null);
  };

  const confirmHighImpact = () => {
    if (!actionReason.trim()) {
      setActionError('A reason is required — it is recorded in the audit history.');
      return;
    }
    showToast('Recorded for review', `${confirmAction} noted with reason. No customer records were changed.`, 'info');
    setConfirmAction(null);
  };

  const statusBadge = (status: OperatorOrgStatus) => {
    if (status === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'trial') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (status === 'onboarding') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (status === 'suspended') return 'bg-slate-100 text-slate-600 border-slate-300';
    return 'bg-amber-50 text-amber-800 border-amber-200';
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
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><Building2 className="w-3.5 h-3.5 text-indigo-500" />Organisations</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalOrgs}</div>
              <p className="text-[11px] text-slate-500 mt-1">Across 4 countries and 5 lifecycle states</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><Users className="w-3.5 h-3.5 text-indigo-500" />Customer users</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{OPERATOR_USERS.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">Owners, Managers and viewers</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><MapPin className="w-3.5 h-3.5 text-indigo-500" />Countries</div>
              <div className="text-2xl font-black text-slate-900 mt-1">4</div>
              <p className="text-[11px] text-slate-500 mt-1">UK, Germany, Lithuania, Portugal</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" />Support open</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{supportOrgs}</div>
              <p className="text-[11px] text-slate-500 mt-1">Organisations with an open item</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-900">Needs Operator attention</h2>
              <div className="mt-3 space-y-2">
                {attentionOrgs.map((o) => (
                  <button key={o.id} onClick={() => { setSelectedOrgId(o.id); setActiveOperatorTab('organisations'); }} className="w-full text-left border border-slate-200 rounded-xl px-3 py-2.5 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors">
                    <p className="text-xs font-bold text-slate-900">{o.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{o.attention}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-900">Recent significant changes</h2>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                {OPERATOR_AUDIT.slice(0, 5).map((a) => (
                  <li key={a.id} className="border border-slate-100 rounded-xl px-3 py-2">
                    <p className="font-semibold text-slate-800">{a.summary}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{a.at} · {a.organisationName}</p>
                  </li>
                ))}
              </ul>
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
                <input value={orgQuery} onChange={(e) => setOrgQuery(e.target.value)} placeholder="Search organisations…" className="w-full text-xs text-slate-900 focus:outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredOrgs.map((o) => (
                  <button key={o.id} onClick={() => setSelectedOrgId(o.id)} className="text-left bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">{o.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(o.status)}`}>{STATUS_LABEL[o.status]}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{o.country} · {o.workers} Workers · {o.sites} Sites</p>
                    <p className="text-[11px] text-slate-500 mt-1">Last activity: {o.lastActivity}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <OperatorOrganisationDetail org={selectedOrg} onBack={() => setSelectedOrgId(null)} />
          )}
        </div>
      )}
      {activeOperatorTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Search users…" className="w-full text-xs text-slate-900 focus:outline-none" />
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
                    <td className="px-4 py-2.5"><p className="font-bold text-slate-900">{u.name}</p><p className="text-[11px] text-slate-500">{u.note}</p></td>
                    <td className="px-4 py-2.5 text-slate-600">{u.organisationName}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{u.access} · {u.inviteState}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => requestAction(`Access change for ${u.name}`)} className="text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5">Review access</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500">No silent sign-in as a customer. Access changes need a reason.</p>
        </div>
      )}

      {activeOperatorTab === 'subscriptions' && (
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
              {OPERATOR_ORGANISATIONS.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{o.name}</td>
                  <td className="px-4 py-2.5 text-slate-700">{o.commercialState.replace('_', ' ')}</td>
                  <td className="px-4 py-2.5 text-slate-600">{o.capacity}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => requestAction(`Commercial review for ${o.name}`)} className="text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-2.5 py-1.5">Record review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeOperatorTab === 'onboarding' && (
        <div className="space-y-3">
          {OPERATOR_ORGANISATIONS.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-bold text-slate-900">{o.name}</p>
              <p className="text-[11px] text-slate-500">{o.onboardingState} · {o.onboardingProgress}% complete</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${o.onboardingProgress}%` }} />
              </div>
              {o.blocker && <p className="mt-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">Blocker: {o.blocker}</p>}
              <p className="mt-2 text-[11px] text-slate-600">Next step: {o.nextStep}</p>
            </div>
          ))}
        </div>
      )}
      {activeOperatorTab === 'content' && (
        <div className="space-y-3">
          {OPERATOR_NOTICES.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-bold text-slate-900">{n.title}</p>
              <p className="text-[11px] text-slate-500 mt-1">{n.audience} · {n.status}</p>
              <p className="text-xs text-slate-600 mt-2">{n.body}</p>
            </div>
          ))}
        </div>
      )}

      {activeOperatorTab === 'operations' && (
        <div className="space-y-3">
          {OPERATOR_INCIDENTS.map((i) => (
            <div key={i.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-bold text-slate-900">{i.title}</p>
              <p className="text-xs text-slate-600 mt-1">{i.detail}</p>
              <p className="text-[11px] text-slate-500 mt-1">{i.scope} · updated {i.updated}</p>
            </div>
          ))}
        </div>
      )}
      {activeOperatorTab === 'audit' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input value={auditQuery} onChange={(e) => setAuditQuery(e.target.value)} placeholder="Search audit…" className="w-full text-xs text-slate-900 focus:outline-none" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
            {filteredAudit.map((a) => (
              <div key={a.id} className="p-4 text-xs">
                <p className="font-bold text-slate-900">{a.summary}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{a.at} · {a.actor}</p>
                {a.reason && <p className="text-[11px] text-slate-600 mt-1">Reason: {a.reason}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeOperatorTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900">Supported languages</h2>
            <p className="text-slate-600 mt-1">English, German, Portuguese.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900">Platform notice</h2>
            <p className="text-slate-600 mt-1">No customer attendance data is editable from this console.</p>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Confirm high-impact action</h2>
            <p className="text-xs text-slate-600">{confirmAction}. This records intent and reason only.</p>
            <label className="block text-xs font-semibold text-slate-700">Reason (required)</label>
            <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} rows={3} placeholder="Why is this action needed?" className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {actionError && <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">{actionError}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmAction(null)} className="text-xs font-semibold text-slate-600 px-3 py-2">Cancel</button>
              <button id="operator-confirm-action" onClick={confirmHighImpact} className="text-xs font-bold text-white bg-slate-900 rounded-xl px-4 py-2">Record with reason</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
