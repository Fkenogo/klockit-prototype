import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { sessionWorkerIds } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Save,
  Ban,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Users,
  UserPlus,
  ArrowRight,
  Eye,
  History,
} from 'lucide-react';

/**
 * Session Detail — the Manager's management view for one planned Work Session.
 * Sessions are the primary scheduling object: they carry the schedule/Site,
 * hold 0..n assigned Workers, and keep an append-only management history.
 * Nothing here deletes records; changes are recorded, never destructive.
 */
export const SessionDetailModal: React.FC = () => {
  const {
    inspectedSessionId,
    setInspectedSessionId,
    workSessions,
    workers,
    sites,
    patterns,
    adjustWorkSession,
    cancelWorkSession,
    assignWorkersToSession,
    removeWorkerFromSession,
    reassignWorkerBetweenSessions,
    setInspectedWorkerId,
  } = useKlockit();

  // Stable hook order — all state initialised unconditionally.
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [siteId, setSiteId] = useState('');
  const [notes, setNotes] = useState('');
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  const [checkedWorkerIds, setCheckedWorkerIds] = useState<string[]>([]);
  const [reassignTargets, setReassignTargets] = useState<Record<string, string>>({});

  const session = inspectedSessionId ? workSessions.find((s) => s.id === inspectedSessionId) : undefined;

  // Hydrate the edit form when a different session is opened.
  React.useEffect(() => {
    if (session && hydratedFor !== session.id) {
      setDate(session.date);
      setStartTime(session.startTime);
      setEndTime(session.endTime);
      setSiteId(session.siteId);
      setNotes(session.notes || '');
      setCheckedWorkerIds([]);
      setReassignTargets({});
      setHydratedFor(session.id);
    }
    if (!session && hydratedFor !== null) setHydratedFor(null);
  }, [session?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!inspectedSessionId) return null;
  if (!session) return null;

  const assignedIds = sessionWorkerIds(session);
  const assignedWorkers = assignedIds
    .map((id) => workers.find((w) => w.id === id))
    .filter((w): w is NonNullable<typeof w> => Boolean(w));
  const eligibleToAdd = workers.filter((w) => w.status === 'active' && !assignedIds.includes(w.id));
  const sessionSite = sites.find((s) => s.id === session.siteId);
  const sourcePattern = session.patternId ? patterns.find((p) => p.id === session.patternId) : undefined;

  const eligibleTargetsFor = (workerId: string) =>
    workSessions.filter(
      (s) =>
        s.id !== session.id &&
        s.status === 'scheduled' &&
        !sessionWorkerIds(s).includes(workerId)
    );

  const handleSave = () => {
    adjustWorkSession(session.id, { date, startTime, endTime, siteId, notes });
  };

  const toggleCheck = (id: string) =>
    setCheckedWorkerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div
      id="session-detail-modal-overlay"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold">{session.label || 'Planned Work Session'}</h2>
              <p className="text-xs text-slate-400">
                {session.date} · {session.startTime}–{session.endTime} · {sessionSite?.name} · {assignedIds.length} Worker{assignedIds.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <button
            id="close-session-detail-modal"
            onClick={() => setInspectedSessionId(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status + source */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                session.status === 'scheduled'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : session.status === 'suspended'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : session.status === 'completed'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {session.status}
            </span>
            {sourcePattern && (
              <span className="text-[11px] text-slate-500">from planning rule: {sourcePattern.name}</span>
            )}
            {session.recurrenceId && (
              <span className="text-[11px] text-slate-500">part of a {workSessions.filter((s) => s.recurrenceId === session.recurrenceId).length}-session series</span>
            )}
            {session.isExceptional && (
              <span className="text-[11px] text-indigo-600">individually adjusted</span>
            )}
          </div>

          {/* Schedule / Site editing */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Schedule & Site</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">End</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1"><span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> Site</span></label>
              <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                {sites.filter((s) => s.status === 'active').map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / context</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Weekend counter rotation" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                <Save className="w-3.5 h-3.5" /><span>Save session changes</span>
              </button>
            </div>
          </div>

          {/* Assigned Workers */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Assigned Workers ({assignedIds.length})</span>
            </h4>
            {assignedWorkers.length === 0 ? (
              <p className="text-xs text-slate-400">No Workers assigned yet — the session is being configured.</p>
            ) : (
              <div className="space-y-2">
                {assignedWorkers.map((w) => {
                  const targets = eligibleTargetsFor(w.id);
                  return (
                    <div key={w.id} className="p-3 border border-slate-200 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg ${w.avatarBg} text-white font-bold text-[10px] flex items-center justify-center`}>{w.initials}</div>
                          <div>
                            <p className="font-bold text-slate-900">{w.name}</p>
                            <p className="text-[11px] text-slate-500">{w.role} · {w.workerRef}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setInspectedWorkerId(w.id)} title="Inspect Worker" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => removeWorkerFromSession(session.id, w.id)} className="text-[11px] font-semibold text-rose-700 border border-rose-200 rounded-lg px-2 py-1 hover:bg-rose-50">
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Reassign to:</span>
                        <select
                          value={reassignTargets[w.id] ?? ''}
                          onChange={(e) => setReassignTargets((prev) => ({ ...prev, [w.id]: e.target.value }))}
                          className="flex-1 text-[11px] border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                        >
                          <option value="">Select session…</option>
                          {targets.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label || 'Session'} · {t.date} {t.startTime}–{t.endTime} · {sites.find((s) => s.id === t.siteId)?.name}
                            </option>
                          ))}
                        </select>
                        <button
                          disabled={!reassignTargets[w.id]}
                          onClick={() => {
                            const to = reassignTargets[w.id];
                            if (to) {
                              reassignWorkerBetweenSessions(session.id, to, w.id);
                              setReassignTargets((prev) => ({ ...prev, [w.id]: '' }));
                            }
                          }}
                          className="text-[11px] font-bold text-indigo-700 border border-indigo-200 rounded-lg px-2 py-1.5 disabled:opacity-40 flex items-center gap-1"
                        >
                          Move <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {eligibleToAdd.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Add Workers</p>
                <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-100 rounded-lg p-2">
                  {eligibleToAdd.map((w) => (
                    <label key={w.id} className="flex items-center gap-2 text-xs p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={checkedWorkerIds.includes(w.id)} onChange={() => toggleCheck(w.id)} className="text-indigo-600" />
                      <span className="font-semibold text-slate-800">{w.name}</span>
                      <span className="text-[11px] text-slate-500">{w.role}</span>
                    </label>
                  ))}
                </div>
                <button
                  disabled={checkedWorkerIds.length === 0}
                  onClick={() => { assignWorkersToSession(session.id, checkedWorkerIds); setCheckedWorkerIds([]); }}
                  className="mt-2 text-xs font-bold text-white bg-slate-900 rounded-xl px-4 py-2 disabled:opacity-40"
                >
                  Assign {checkedWorkerIds.length > 0 ? `(${checkedWorkerIds.length})` : ''} to this session
                </button>
              </div>
            )}
          </div>

          {/* Lifecycle */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Session lifecycle</h4>
            <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Suspend, reactivate or cancel. History is preserved — nothing is deleted.</p>
            <div className="flex flex-wrap gap-2">
              {session.status === 'scheduled' && (
                <>
                  <button onClick={() => adjustWorkSession(session.id, { status: 'suspended' })} className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-[11px] font-semibold flex items-center gap-1">
                    <PauseCircle className="w-3.5 h-3.5" /><span>Suspend</span>
                  </button>
                  <button onClick={() => cancelWorkSession(session.id)} className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 text-[11px] font-semibold flex items-center gap-1">
                    <Ban className="w-3.5 h-3.5" /><span>Cancel</span>
                  </button>
                </>
              )}
              {session.status === 'suspended' && (
                <>
                  <button onClick={() => adjustWorkSession(session.id, { status: 'scheduled' })} className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5" /><span>Reactivate</span>
                  </button>
                  <button onClick={() => cancelWorkSession(session.id)} className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 text-[11px] font-semibold flex items-center gap-1">
                    <Ban className="w-3.5 h-3.5" /><span>Cancel</span>
                  </button>
                </>
              )}
              {session.status === 'cancelled' && (
                <button onClick={() => adjustWorkSession(session.id, { status: 'scheduled' })} className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /><span>Reactivate</span>
                </button>
              )}
            </div>
          </div>

          {/* History */}
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" /><span>Session history</span>
            </h4>
            {(session.history ?? []).length === 0 ? (
              <p className="text-[11px] text-slate-400">No management changes recorded yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {(session.history ?? []).map((h, idx) => (
                  <li key={idx} className="text-[11px] text-slate-600 border border-slate-100 rounded-lg px-2.5 py-1.5">
                    {h.summary} <span className="text-slate-400">· {h.actor}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button onClick={() => setInspectedSessionId(null)} className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
