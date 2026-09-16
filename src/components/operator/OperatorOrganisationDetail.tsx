import React, { useState } from 'react';
import type { OperatorTab } from '../../context/KlockitContext';
import { useOperator } from '../../context/OperatorContext';
import type { OperatorOrgStatus } from '../../types/operator';
import { OPERATOR_ORG_USAGE, OPERATOR_PLATFORM_HEALTH, buildAdoptionSignals } from '../../data/operatorUsage';

export const OperatorOrganisationDetail: React.FC<{
  orgId: string;
  onBack: () => void;
  onJump: (tab: OperatorTab, opts?: { orgId?: string; userSearch?: string; auditSearch?: string }) => void;
}> = ({ orgId, onBack, onJump }) => {
  const {
    organisations,
    users,
    incidents,
    audit,
    addSupportNote,
    setSupportStatus,
    markSupportContactMade,
    orgLifecycle,
  } = useOperator();
  const org = organisations.find((o) => o.id === orgId);
  const [noteText, setNoteText] = useState('');
  const [supportSummary, setSupportSummary] = useState('');
  const [confirm, setConfirm] = useState<{ title: string; consequence: string; action: () => void; requireReason: boolean } | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  if (!org) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 text-xs text-slate-600">
        Organisation not found. <button onClick={onBack} className="text-indigo-600 font-bold">Back</button>
      </div>
    );
  }

  const orgUsers = users.filter((u) => u.organisationId === org.id);
  const orgIncidents = incidents.filter((i) => i.relatedOrgId === org.id && i.status !== 'resolved');
  const orgAudit = audit.filter((a) => a.organisationId === org.id || a.organisationName === org.name).slice(0, 6);
  const orgUsage = OPERATOR_ORG_USAGE.find((u) => u.orgId === org.id);
  const orgSignals = buildAdoptionSignals(
    [{ id: org.id, name: org.name, commercialState: org.commercialState, supportOpen: org.supportOpen }],
    OPERATOR_ORG_USAGE,
    users.filter((u) => u.organisationId === org.id && u.inviteState === 'invited').map((u) => ({ organisationId: u.organisationId })),
  );
  const orgHealthNotes = OPERATOR_PLATFORM_HEALTH.filter((h) => h.affectedOrgs?.includes(org.name));

  const askConfirm = (title: string, consequence: string, action: () => void, requireReason = true) => {
    setConfirm({ title, consequence, action, requireReason });
    setReason('');
    setReasonError(null);
  };

  const doConfirm = () => {
    if (!confirm) return;
    if (confirm.requireReason && !reason.trim()) {
      setReasonError('A reason is required — it is recorded in the audit history.');
      return;
    }
    const r = reason.trim();
    const act = confirm.action;
    setConfirm(null);
    // lifecycle + support-status actions read reason from closure where needed;
    // for generic ones we already bound reason via wrapper below
    if ((act as unknown as { __needsReason?: boolean }) && r) {
      void r;
    }
    act();
  };

  const lifecycleTo = (to: OperatorOrgStatus) => {
    const r = reason.trim();
    orgLifecycle(org.id, to, r);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button onClick={onBack} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
          ← Back to organisation register
        </button>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <button onClick={() => onJump('users', { userSearch: org.name })} className="font-semibold text-indigo-700 border border-indigo-200 rounded-lg px-2 py-1 hover:bg-indigo-50">Users</button>
          <button onClick={() => onJump('subscriptions', { orgId: org.id })} className="font-semibold text-indigo-700 border border-indigo-200 rounded-lg px-2 py-1 hover:bg-indigo-50">Subscription</button>
          <button onClick={() => onJump('onboarding', { orgId: org.id })} className="font-semibold text-indigo-700 border border-indigo-200 rounded-lg px-2 py-1 hover:bg-indigo-50">Onboarding</button>
          <button onClick={() => onJump('operations', { orgId: org.id })} className="font-semibold text-indigo-700 border border-indigo-200 rounded-lg px-2 py-1 hover:bg-indigo-50">Operations</button>
          <button onClick={() => onJump('usage')} className="font-semibold text-indigo-700 border border-indigo-200 rounded-lg px-2 py-1 hover:bg-indigo-50">Usage</button>
          <button onClick={() => onJump('audit', { auditSearch: org.name })} className="font-semibold text-indigo-700 border border-indigo-200 rounded-lg px-2 py-1 hover:bg-indigo-50">Audit</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">{org.name}</h2>
            <p className="text-xs text-slate-500 mt-1">{org.country} · {org.timezone} · {org.language} · {org.onboardingState}</p>
          </div>
          <div className="flex gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">{org.status.replace('_', ' ')}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">{org.commercialState.replace('_', ' ')}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${org.supportStatus === 'open' ? 'bg-amber-50 text-amber-800 border-amber-200' : org.supportStatus === 'monitoring' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>support: {org.supportStatus}</span>
          </div>
        </div>
        {org.attention && (
          <p className="mt-3 text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">Attention: {org.attention}</p>
        )}
        {org.blocker && (
          <p className="mt-2 text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">Blocker: {org.blocker}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 text-xs text-slate-600">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sites & work-session infrastructure</h3>
          <p><strong className="text-slate-900">Sites:</strong> {org.sitesSummary}</p>
          <ul className="space-y-1">
            {org.sitesList.map((s) => (
              <li key={s.id} className="border border-slate-100 rounded-lg px-2.5 py-1.5 flex justify-between gap-2">
                <span className="font-semibold text-slate-800">{s.name}</span>
                <span className="text-slate-500 font-mono">{s.code}</span>
              </li>
            ))}
          </ul>
          <p><strong className="text-slate-900">Expected work:</strong> {org.sessionsSummary}</p>
          <p><strong className="text-slate-900">Workforce & planning:</strong> {org.workers} Workers · {org.sites} Sites · {org.onboardingProgress}% onboarding complete</p>
          <p><strong className="text-slate-900">Capacity:</strong> {org.capacity}</p>
          <p><strong className="text-slate-900">Commercial:</strong> {org.planSummary} · {org.commercialState.replace('_', ' ')} · review {org.renewalDate}</p>
          <p className="text-[11px] text-slate-500">{org.commercialNote}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Users & access ({orgUsers.length})</h3>
          <div className="space-y-1.5">
            {orgUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-2 border border-slate-100 rounded-xl px-3 py-2 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{u.name} <span className="font-normal text-slate-500">· {u.access}</span></p>
                  <p className="text-[11px] text-slate-500">{u.inviteState} · {u.lastActivity}</p>
                </div>
                <button onClick={() => onJump('users', { userSearch: u.name })} className="text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-2 py-1">Inspect</button>
              </div>
            ))}
          </div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-4 mb-2">Onboarding progress</h3>
          <div className="space-y-1.5">
            {org.onboardingSteps.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs border border-slate-100 rounded-xl px-3 py-1.5">
                <div>
                  <p className="font-semibold text-slate-800">{s.label}</p>
                  <p className="text-[11px] text-slate-500">{s.detail}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.state === 'complete' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : s.state === 'blocked' ? 'bg-rose-50 text-rose-700 border-rose-200' : s.state === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{s.state.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-600"><strong className="text-slate-900">Recommended next step:</strong> {org.nextStep}</p>
        </div>
      </div>

      {/* Complete customer view: usage, integrity, signals */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Usage & attendance integrity</h3>
          <button onClick={() => onJump('usage')} className="text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-2 py-1">Usage & health →</button>
        </div>
        {!orgUsage ? (
          <p className="text-xs text-slate-500">No usage aggregates for this organisation yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">Sessions (mo)</p><p className="font-bold text-slate-900">{orgUsage.sessionsSupportedMonth} supported · {orgUsage.completedMonth} done</p></div>
            <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">Unresolved</p><p className="font-bold text-slate-900">{orgUsage.unresolvedPct}%</p></div>
            <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">QR / manual</p><p className="font-bold text-slate-900">{orgUsage.qrSharePct}% / {orgUsage.manualSharePct}%</p></div>
            <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">Correction rate</p><p className="font-bold text-slate-900">{orgUsage.correctionRatePct}%</p></div>
            <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">Active W / S</p><p className="font-bold text-slate-900">{orgUsage.activeWorkers} Workers · {orgUsage.activeSites} Sites</p></div>
            <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">Last meaningful usage</p><p className="font-bold text-slate-900">{orgUsage.lastMeaningfulUsage}</p></div>
            <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">Onboarding</p><p className="font-bold text-slate-900">{orgUsage.onboardingCompletionPct}% · {orgUsage.trialToActive}</p></div>
            <div className="border border-slate-100 rounded-xl px-3 py-2"><p className="text-[10px] uppercase text-slate-500 font-bold">Trend</p><p className="font-bold text-slate-900">{orgUsage.trend} — {orgUsage.trendNote}</p></div>
          </div>
        )}
        {orgSignals.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {orgSignals.map((s) => (
              <p key={s.id} className="text-[11px] text-slate-600 bg-indigo-50/60 border border-indigo-100 rounded-lg px-2.5 py-1.5">
                <strong className="text-indigo-900">{s.kind.replace('_', ' ')} prompt:</strong> {s.prompt} <span className="text-slate-400">({s.evidence})</span>
              </p>
            ))}
          </div>
        )}
        {orgHealthNotes.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {orgHealthNotes.map((h) => (
              <p key={h.id} className="text-[11px] text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                <strong className="text-amber-900">Platform health — {h.area} ({h.status}):</strong> {h.detail} {h.recovery ? `Recovery: ${h.recovery}` : ''}
              </p>
            ))}
          </div>
        )}
      </div>

      {orgIncidents.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Open operational items</h3>
          <div className="space-y-1.5">
            {orgIncidents.map((i) => (
              <div key={i.id} className="text-xs border border-slate-100 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{i.title}</p>
                  <p className="text-[11px] text-slate-500">{i.status} · {i.updated}</p>
                </div>
                <button onClick={() => onJump('operations', { orgId: org.id })} className="text-[11px] font-bold text-indigo-600 border border-indigo-200 rounded-lg px-2 py-1">Open</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Support</h3>
        <p className="text-xs text-slate-600">{org.supportSummary}</p>
        {org.supportContactMade && <p className="text-[11px] text-slate-500 mt-1">Last contact made: {org.supportContactMade}</p>}
        <div className="mt-3 space-y-1.5">
          {org.supportNotes.map((n) => (
            <div key={n.id} className="text-xs border border-slate-100 rounded-xl px-3 py-2">
              <p className="text-slate-800">{n.text}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{n.at} · {n.author}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a support note…"
            className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => { if (noteText.trim()) { addSupportNote(org.id, noteText.trim()); setNoteText(''); } }}
            className="text-xs font-bold text-white bg-slate-900 rounded-xl px-4 py-2"
          >
            Add note
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => { if (noteText.trim()) { markSupportContactMade(org.id, noteText.trim()); setNoteText(''); } else { markSupportContactMade(org.id, 'Support contact made — awaiting customer response.'); } }}
            className="text-[11px] font-bold text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1.5 hover:bg-emerald-50"
          >
            Mark support contact made
          </button>
          <input
            value={supportSummary}
            onChange={(e) => setSupportSummary(e.target.value)}
            placeholder="New support summary…"
            className="flex-1 min-w-[180px] text-[11px] border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => askConfirm('Close support watch?', 'Support will be marked closed for this organisation. Recorded in audit.', () => setSupportStatus(org.id, 'closed', supportSummary.trim() || 'No open support items.', reason.trim() || 'Support matter resolved'))}
            className="text-[11px] font-bold text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5"
          >
            Mark closed
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Controlled lifecycle</h3>
        <p className="text-[11px] text-slate-500 mb-3">Lifecycle changes update status, commercial state where linked, and write an audit entry. History is preserved — records are never deleted.</p>
        <div className="flex flex-wrap gap-2">
          {org.status !== 'suspended' && (
            <button
              onClick={() => askConfirm('Suspend organisation?', 'Workers cannot record attendance while suspended. Sites, sessions and history are retained. Requires a reason.', () => lifecycleTo('suspended'))}
              className="text-[11px] font-bold text-rose-700 border border-rose-200 rounded-lg px-2.5 py-1.5 hover:bg-rose-50"
            >
              Suspend
            </button>
          )}
          {org.status === 'suspended' && (
            <button
              onClick={() => askConfirm('Reactivate organisation?', 'Attendance recording resumes. The suspension reason stays in history. Requires confirmation + reason.', () => lifecycleTo('active'))}
              className="text-[11px] font-bold text-emerald-700 border border-emerald-200 rounded-lg px-2.5 py-1.5 hover:bg-emerald-50"
            >
              Reactivate
            </button>
          )}
          <button
            onClick={() => askConfirm('Flag for manual review?', 'Organisation moves to needs-support / manual review for an Operator owner. Requires a reason.', () => lifecycleTo('needs_support'))}
            className="text-[11px] font-bold text-amber-800 border border-amber-200 rounded-lg px-2.5 py-1.5 hover:bg-amber-50"
          >
            Manual review
          </button>
          {org.status !== 'active' && org.status !== 'suspended' && (
            <button
              onClick={() => askConfirm('Mark active?', 'Marks the organisation as operating normally. Commercial state is set to active. Requires a reason.', () => lifecycleTo('active'))}
              className="text-[11px] font-bold text-indigo-700 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50"
            >
              Mark active
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Recorded changes</h3>
        <ul className="text-xs text-slate-600 space-y-1">
          {org.auditTrail.map((entry, idx) => (
            <li key={idx}>· {entry}</li>
          ))}
        </ul>
        {orgAudit.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            {orgAudit.map((a) => (
              <div key={a.id} className="text-[11px] text-slate-600 border border-slate-100 rounded-lg px-2.5 py-1.5">
                <p className="font-semibold text-slate-800">{a.summary}</p>
                <p className="text-slate-500">{a.at} · {a.actor}{a.reason ? ` · ${a.reason}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirm && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">{confirm.title}</h2>
            <p className="text-xs text-slate-600">{confirm.consequence}</p>
            <label className="block text-xs font-semibold text-slate-700">Reason (required)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why is this needed?" className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {reasonError && <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">{reasonError}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="text-xs font-semibold text-slate-600 px-3 py-2">Cancel</button>
              <button onClick={doConfirm} className="text-xs font-bold text-white bg-slate-900 rounded-xl px-4 py-2">Confirm with reason</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
