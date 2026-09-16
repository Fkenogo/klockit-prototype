import React, { useState } from 'react';
import { effectiveArrival, effectiveDeparture } from '../../utils/attendance';
import { useKlockit } from '../../context/KlockitContext';
import {
  X,
  User,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  History,
  Edit2,
  Check,
  Ban,
  RotateCcw,
} from 'lucide-react';

export const WorkerProfileModal: React.FC = () => {
  const {
    inspectedWorkerId,
    setInspectedWorkerId,
    workers,
    sites,
    patterns,
    workSessions,
    attendance,
    exceptions,
    updateWorker,
    setInspectedExceptionId,
    showToast,
  } = useKlockit();

  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'history'>('overview');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  if (!inspectedWorkerId) return null;
  const worker = workers.find((w) => w.id === inspectedWorkerId);
  if (!worker) return null;

  const normalSite = sites.find((s) => s.id === worker.normalSiteId);
  const pattern = patterns.find((p) => p.id === worker.workPatternId);

  // Edit state — presence identity only (no HR contact fields in Klockit).
  const [name, setName] = useState(worker.name);
  const [role, setRole] = useState(worker.role);
  const [normalSiteId, setNormalSiteId] = useState(worker.normalSiteId);
  const [workPatternId, setWorkPatternId] = useState(worker.workPatternId);

  // Filtered sessions and attendance
  const upcomingSessions = workSessions
    .filter((ws) => ws.workerId === worker.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const workerAttendance = attendance
    .filter((a) => a.workerId === worker.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const unresolvedException = exceptions.find(
    (e) => e.workerId === worker.id && e.status === 'unresolved'
  );

  const handleSaveDetails = () => {
    updateWorker(worker.id, {
      name,
      role,
      normalSiteId,
      workPatternId,
    });
    setIsEditing(false);
  };

  const handleToggleSuspend = () => {
    const nextStatus = worker.status === 'active' ? 'suspended' : 'active';
    updateWorker(worker.id, { status: nextStatus });
    showToast(
      nextStatus === 'suspended' ? 'Worker Access Suspended' : 'Worker Access Reactivated',
      `${worker.name} status is now ${nextStatus}.`,
      nextStatus === 'suspended' ? 'warning' : 'success'
    );
  };

  return (
    <div
      id="worker-profile-modal-overlay"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${worker.avatarBg} text-white font-bold text-sm flex items-center justify-center shadow-md`}>
              {worker.initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">{worker.name}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {worker.workerRef}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    worker.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {worker.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">{worker.role} · Normal Site: {normalSite?.name}</p>
            </div>
          </div>
          <button
            id="close-worker-profile-modal"
            onClick={() => setInspectedWorkerId(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center gap-2 pt-2">
          <button
            id="worker-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Profile & Assignment
          </button>
          <button
            id="worker-tab-schedule"
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'schedule'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Work Pattern & Sessions ({upcomingSessions.length})
          </button>
          <button
            id="worker-tab-history"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Attendance History ({workerAttendance.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Unresolved attention banner if exists */}
          {unresolvedException && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">{unresolvedException.title}</p>
                  <p className="text-[11px] text-amber-800">{unresolvedException.description}</p>
                </div>
              </div>
              <button
                id="worker-resolve-exception-btn"
                onClick={() => {
                  setInspectedWorkerId(null);
                  setInspectedExceptionId(unresolvedException.id);
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors flex-shrink-0"
              >
                Resolve
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Worker Details
                </h4>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDetails}
                      className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2.5 py-1 rounded font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500">Full Name</span>
                    <p className="font-bold text-slate-900 text-sm">{worker.name}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500">Role at site</span>
                    <p className="font-bold text-slate-900 text-sm">{worker.role}</p>
                    <p className="text-[11px] text-slate-400">Used to recognise who is present — not an HR job title.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500">Worker reference</span>
                    <p className="font-mono font-bold text-slate-900 text-sm">{worker.workerRef}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500">Assigned Normal Site</span>
                    <p className="font-bold text-indigo-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      {normalSite?.name}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-slate-500">Current Work Pattern</span>
                    <p className="font-medium text-slate-900">
                      {pattern?.name || 'Standard Full-Time'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Role at site</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Assigned Normal Site</label>
                      <select
                        value={normalSiteId}
                        onChange={(e) => setNormalSiteId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      >
                        {sites.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Assigned Work Pattern</label>
                      <select
                        value={workPatternId}
                        onChange={(e) => setWorkPatternId(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      >
                        {patterns.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Account / Access status management */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Access Management</p>
                  <p className="text-[11px] text-slate-500">
                    Suspended workers cannot record attendance or authenticate. Historical records remain intact.
                  </p>
                </div>
                <button
                  id="toggle-worker-suspend-btn"
                  onClick={handleToggleSuspend}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    worker.status === 'active'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {worker.status === 'active' ? (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>Suspend Access</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reactivate Access</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs space-y-1">
                <span className="font-bold text-indigo-950">Current Recurring Pattern:</span>
                <p className="text-indigo-800 text-[11px]">
                  {pattern?.name || 'Standard Full-Time (Mon-Fri 08:00 - 17:00)'}.
                  Individual sessions below reflect actual scheduled dates and can be adjusted independently.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Upcoming & Current Work Sessions
                </span>
                {upcomingSessions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No upcoming sessions found.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {upcomingSessions.map((sess) => {
                      const sessSite = sites.find((s) => s.id === sess.siteId);
                      return (
                        <div key={sess.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{sess.date}</span>
                              {sess.isExceptional && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                  Adjusted
                                </span>
                              )}
                              <span className="font-mono text-slate-600">
                                {sess.startTime} - {sess.endTime}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Site: <strong className="text-slate-700">{sessSite?.name}</strong>
                              {sess.notes ? ` · Note: ${sess.notes}` : ''}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {sess.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Logged Attendance Records
              </span>
              {workerAttendance.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No attendance records logged.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {workerAttendance.map((rec) => {
                    const recSite = sites.find((s) => s.id === rec.siteId);
                    return (
                      <div key={rec.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{rec.date}</span>
                            <span className="font-medium text-slate-600">{recSite?.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Arrival: <strong className="text-indigo-700 font-mono">{effectiveArrival(rec) || rec.arrivalTime || 'None'}</strong>
                            {rec.arrivalMethod && ` (${rec.arrivalMethod.toUpperCase()})`}
                            {' · '}
                            Departure: <strong className="text-slate-800 font-mono">{effectiveDeparture(rec) || rec.departureTime || 'Not recorded'}</strong>
                          </div>
                          {rec.corrections && rec.corrections.length > 0 && (
                            <p className="text-[10px] text-indigo-600 mt-1">
                              Correction: {rec.corrections[rec.corrections.length - 1].reason}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : rec.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'missing_departure'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {rec.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={() => setInspectedWorkerId(null)}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
