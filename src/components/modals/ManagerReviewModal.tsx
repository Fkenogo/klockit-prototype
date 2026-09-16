import React, { useState, useEffect } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { X, ClipboardCheck, Clock, Building2, ShieldCheck, Info, AlertTriangle } from 'lucide-react';
import { effectiveArrival, effectiveDeparture } from '../../utils/attendance';

interface ManagerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkerId?: string;
}

/**
 * Manager Attendance Review
 * -------------------------
 * This is a review and correction screen, not a way to create attendance.
 *
 * It always shows what the Worker's own record says first, so the Manager is
 * deciding *about* existing evidence rather than quietly replacing it. The
 * Manager may then:
 *   - confirm the record as recorded (no change), or
 *   - state a different effective arrival / departure time.
 * Either way a reason is mandatory and the action is appended to the record's
 * correction history rather than overwriting the original evidence.
 */
export const ManagerReviewModal: React.FC<ManagerReviewModalProps> = ({
  isOpen,
  onClose,
  defaultWorkerId,
}) => {
  const {
    workers,
    sites,
    workSessions,
    attendance,
    selectedDate,
    recordManagerArrivalCorrection,
    recordManagerDepartureCorrection,
  } = useKlockit();

  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [date, setDate] = useState(selectedDate || '2026-09-14');
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recorded = attendance.find((a) => a.workerId === selectedWorkerId && a.date === date);
  const currentWorker = workers.find((w) => w.id === selectedWorkerId);
  const currentScheduledSession = workSessions.find(
    (s) => s.workerId === selectedWorkerId && s.date === date && s.status !== 'cancelled'
  );
  const currentSite = sites.find(
    (s) => s.id === (recorded?.siteId || currentScheduledSession?.siteId || currentWorker?.normalSiteId)
  );

  // Reset the form whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setSelectedWorkerId(defaultWorkerId || workers[0]?.id || '');
    setReason('');
    setError(null);
  }, [isOpen, defaultWorkerId, workers]);

  // Reflect the record currently selected
  useEffect(() => {
    if (!isOpen) return;
    const rec = attendance.find((a) => a.workerId === selectedWorkerId && a.date === date);
    setArrivalTime(effectiveArrival(rec) || '');
    setDepartureTime(effectiveDeparture(rec) || '');
    setError(null);
  }, [isOpen, selectedWorkerId, date, attendance]);

  if (!isOpen) return null;

  const hasRecordedArrival = effectiveArrival(recorded) !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkerId) {
      setError('Choose the Worker whose record you are reviewing.');
      return;
    }
    if (!reason.trim()) {
      setError('A reason is required — it becomes part of the record audit history.');
      return;
    }
    if (!arrivalTime && !departureTime) {
      setError('Enter the effective arrival or departure time you are confirming.');
      return;
    }

    if (arrivalTime) {
      const result = recordManagerArrivalCorrection(
        selectedWorkerId,
        recorded?.siteId || currentScheduledSession?.siteId || currentWorker?.normalSiteId || '',
        arrivalTime,
        reason,
        date
      );
      if (!result.success) {
        setError(result.message);
        return;
      }
    }

    if (departureTime) {
      const result = recordManagerDepartureCorrection(selectedWorkerId, departureTime, reason, date);
      if (!result.success) {
        setError(result.message);
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Review attendance record</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Confirm or correct what is on the record. The Worker entry itself is always kept.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Worker + date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="review-worker-select" className="block font-semibold text-slate-700 mb-1">
                Worker <span className="text-rose-500">*</span>
              </label>
              <select
                id="review-worker-select"
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                required
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} · {w.workerRef}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="review-date-input" className="block font-semibold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="review-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Evidence panel — read only */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Recorded by the Worker</span>
            </div>

            {recorded ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-slate-500">Arrival</div>
                  <div className="font-mono font-bold text-slate-900">{recorded.arrivalTime || '—'}</div>
                  <div className="text-[10px] text-slate-500">
                    {recorded.arrivalMethod === 'qr'
                      ? 'Site QR scan'
                      : recorded.arrivalMethod === 'manual_code'
                      ? '6-digit site code'
                      : recorded.arrivalMethod === 'manager_entry'
                      ? 'Recorded by Manager'
                      : 'No arrival recorded'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Departure</div>
                  <div className="font-mono font-bold text-slate-900">{recorded.departureTime || '—'}</div>
                  <div className="text-[10px] text-slate-500">
                    {recorded.departureTime ? 'Recorded by Worker' : 'Still open'}
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Current status</span>
                  <span className="font-semibold text-slate-800">{recorded.status.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-slate-600">
                <Info className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
                <span>
                  Nothing has been recorded for this Worker on this date. Recording an effective arrival here
                  creates an attendance record marked as Manager-entered.
                </span>
              </div>
            )}
            {currentSite && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>
                  {currentSite.name} ({currentSite.code})
                </span>
              </div>
            )}
            {currentScheduledSession && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>
                  Expected session {currentScheduledSession.startTime}–{currentScheduledSession.endTime}
                </span>
              </div>
            )}
          </div>

          {/* Effective times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="review-arrival-time" className="block font-semibold text-slate-700 mb-1">
                Effective arrival time
              </label>
              <input
                id="review-arrival-time"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1">Leave as-is to keep the recorded arrival.</p>
            </div>
            <div>
              <label htmlFor="review-departure-time" className="block font-semibold text-slate-700 mb-1">
                Effective departure time
              </label>
              <input
                id="review-departure-time"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                disabled={!hasRecordedArrival && !arrivalTime}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {hasRecordedArrival || arrivalTime ? 'Clearing this leaves the day open.' : 'Requires an arrival first.'}
              </p>
            </div>
          </div>

          {/* Reason — mandatory for every Manager action */}
          <div>
            <label htmlFor="review-reason-input" className="block font-semibold text-slate-700 mb-1">
              Reason for this review <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="review-reason-input"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Phone camera was cracked; presence confirmed in person at the site."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Stored permanently against this record with your name and the time of the action.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-manager-review-btn"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Save review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
