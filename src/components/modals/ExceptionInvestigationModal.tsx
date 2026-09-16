import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { sessionWorkerIds } from '../../types';
import {
  X,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

export const ExceptionInvestigationModal: React.FC = () => {
  const {
    inspectedExceptionId,
    setInspectedExceptionId,
    exceptions,
    workers,
    sites,
    workSessions,
    attendance,
    resolveException,
  } = useKlockit();

  // All hooks run in stable order on every render — nothing conditional above them.
  const [effectiveTime, setEffectiveTime] = useState<string>('17:00');
  const [managerNote, setManagerNote] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  // Reset per-exception form state whenever a different case is opened.
  React.useEffect(() => {
    setEffectiveTime('17:00');
    setManagerNote('');
    setSelectedSessionId('');
    setIsRejecting(false);
  }, [inspectedExceptionId]);

  if (!inspectedExceptionId) return null;
  const exception = exceptions.find((e) => e.id === inspectedExceptionId);
  if (!exception) return null;

  const worker = workers.find((w) => w.id === exception.workerId);
  const site = sites.find((s) => s.id === exception.siteId);
  const scheduledSite = exception.evidence.scheduledSiteId
    ? sites.find((s) => s.id === exception.evidence.scheduledSiteId)
    : site;

  const attendanceRec = exception.attendanceId
    ? attendance.find((a) => a.id === exception.attendanceId)
    : attendance.find((a) => a.workerId === exception.workerId && a.date === exception.date);

  const matchingSession = workSessions.find(
    (ws) => sessionWorkerIds(ws).includes(exception.workerId) && ws.date === exception.date
  );

  const handleConfirmDeparture = () => {
    resolveException(exception.id, 'confirm_departure', {
      effectiveTime,
      note: managerNote || 'Manager confirmed actual departure with worker',
      correctedBy: 'Operations Manager',
    });
    setInspectedExceptionId(null);
  };

  const handleConfirmArrival = () => {
    resolveException(exception.id, 'confirm_arrival', {
      effectiveTime: effectiveTime || exception.evidence.recordedArrival,
      note: managerNote || 'Manager confirmed physical presence at site',
      correctedBy: 'Operations Manager',
    });
    setInspectedExceptionId(null);
  };

  const handleMatchSession = () => {
    resolveException(exception.id, 'match_session', {
      sessionId: selectedSessionId || exception.evidence.possibleSessionIds?.[0],
      note: managerNote || 'Reconciled attendance with work session',
      correctedBy: 'Operations Manager',
    });
    setInspectedExceptionId(null);
  };

  const handleReject = () => {
    resolveException(exception.id, 'reject', {
      note: managerNote || 'Attendance evidence rejected by manager',
      correctedBy: 'Operations Manager',
    });
    setInspectedExceptionId(null);
  };

  return (
    <div
      id="exception-modal-overlay"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">{exception.title}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-mono">
                  {exception.type}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Attendance Case Investigation · Case #{exception.id}
              </p>
            </div>
          </div>
          <button
            id="close-exception-modal"
            onClick={() => setInspectedExceptionId(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Situation Explanation */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>What happened:</span>
            </div>
            <p className="text-amber-900 leading-relaxed text-xs pl-6">
              {exception.description}
            </p>
          </div>

          {/* Evidence Grid: Worker, Site, Expected vs Recorded */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Worker & Site Context */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Worker Context
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${worker?.avatarBg || 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center flex-shrink-0`}>
                  {worker?.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{worker?.name}</p>
                  <p className="text-xs text-slate-500">{worker?.role} ({worker?.workerRef})</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Assigned Site:</span>
                  <span className="font-medium text-slate-900">{scheduledSite?.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Work Date:</span>
                  <span className="font-mono text-slate-900">{exception.date}</span>
                </div>
              </div>
            </div>

            {/* Attendance Evidence Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Evidence Record
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Method Used:</span>
                  <span className="font-semibold text-slate-800">
                    {exception.evidence.method === 'qr'
                      ? 'Site QR Code (Physical scan)'
                      : exception.evidence.method === 'manual_code'
                      ? `Manual 6-digit Code (${exception.evidence.siteCodeEntered})`
                      : 'System Record'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Expected Hours:</span>
                  <span className="font-mono font-medium text-slate-900">
                    {exception.evidence.expectedStart || matchingSession?.startTime || '08:00'} - {exception.evidence.expectedEnd || matchingSession?.endTime || '17:00'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Logged Arrival:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {exception.evidence.recordedArrival || attendanceRec?.arrivalTime || 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Logged Departure:</span>
                  <span className="font-mono font-medium text-slate-600">
                    {attendanceRec?.departureTime ? (
                      attendanceRec.departureTime
                    ) : (
                      <span className="text-rose-600 font-semibold italic">Not Recorded</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Audit & Principle Card (from Brief Section 18) */}
          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Clock className="w-4 h-4" />
              <span>Effective Presence Time vs. Resolution Timestamp</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              When resolving this exception, the time you enter will become the Worker's official
              <strong className="text-white"> effective attendance time</strong>. The system records your administrative resolution timestamp separately in the audit log.
            </p>
          </div>

          {/* Guided Action Form based on exception type */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>Manager Resolution</span>
            </h4>

            {exception.type === 'missing_departure' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Confirm Actual Departure Time:
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      id="effective-departure-input"
                      type="time"
                      value={effectiveTime}
                      onChange={(e) => setEffectiveTime(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    (Shift was scheduled until {exception.evidence.expectedEnd || '17:00'})
                  </span>
                </div>
              </div>
            )}

            {exception.type === 'manual_site_code' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  The worker entered code <strong className="text-slate-900">{exception.evidence.siteCodeEntered}</strong> for {site?.name} at {exception.evidence.recordedArrival}. Confirm whether they were physically present at work.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adjust Arrival Time (if different from logged):
                  </label>
                  <input
                    id="effective-arrival-input"
                    type="time"
                    value={effectiveTime || exception.evidence.recordedArrival}
                    onChange={(e) => setEffectiveTime(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {exception.type === 'multiple_possible_sessions' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Select which Work Session this arrival belongs to:
                </label>
                <div className="space-y-2">
                  {exception.evidence.possibleSessionIds?.map((sessId) => {
                    const s = workSessions.find((ws) => ws.id === sessId);
                    return (
                      <label
                        key={sessId}
                        className="flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50 cursor-pointer border-slate-200"
                      >
                        <input
                          type="radio"
                          name="session-choice"
                          value={sessId}
                          checked={selectedSessionId === sessId || (!selectedSessionId && exception.evidence.possibleSessionIds?.[0] === sessId)}
                          onChange={() => setSelectedSessionId(sessId)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">
                            {s?.startTime} - {s?.endTime} ({s?.notes || 'Scheduled Shift'})
                          </p>
                          <p className="text-slate-500">{sites.find((site) => site.id === s?.siteId)?.name}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {exception.type === 'unmatched_arrival' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  David scanned at <strong className="text-slate-900">{site?.name}</strong>, but was scheduled at <strong className="text-slate-900">{scheduledSite?.name}</strong>.
                </p>
                <p className="text-xs text-slate-500">
                  Choose whether to reassign his work session to {site?.name} for today or reject the check-in.
                </p>
              </div>
            )}

            {/* Manager Reason / Audit Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manager Verification Note (Recorded in Audit Log):
              </label>
              <input
                id="manager-resolution-note"
                type="text"
                placeholder="e.g. Verified with team leader; worker departure confirmed at 17:00"
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            id="reject-exception-btn"
            onClick={handleReject}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Attendance</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInspectedExceptionId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>

            {exception.type === 'missing_departure' && (
              <button
                id="confirm-departure-btn"
                onClick={handleConfirmDeparture}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Effective Departure ({effectiveTime})</span>
              </button>
            )}

            {exception.type === 'manual_site_code' && (
              <button
                id="confirm-arrival-btn"
                onClick={handleConfirmArrival}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Physical Presence</span>
              </button>
            )}

            {exception.type === 'multiple_possible_sessions' && (
              <button
                id="confirm-match-btn"
                onClick={handleMatchSession}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Selected Session</span>
              </button>
            )}

            {exception.type === 'unmatched_arrival' && (
              <button
                id="confirm-reassign-btn"
                onClick={handleConfirmArrival}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Presence at {site?.name}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
