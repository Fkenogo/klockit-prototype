import React, { useState, useEffect } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { X, UserCheck, Clock, Building2, AlertCircle, FileText } from 'lucide-react';

interface ManualArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkerId?: string;
}

export const ManualArrivalModal: React.FC<ManualArrivalModalProps> = ({
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
    recordManualArrivalByManager,
  } = useKlockit();

  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [arrivalTime, setArrivalTime] = useState('08:30');
  const [date, setDate] = useState(selectedDate || '2026-09-14');
  const [note, setNote] = useState('Worker forgot mobile device — arrival verified in person by manager.');

  // Set initial default worker and current time when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setArrivalTime(`${hh}:${mm}`);
      setDate(selectedDate || '2026-09-14');

      const initialWorkerId = defaultWorkerId || workers[0]?.id || '';
      setSelectedWorkerId(initialWorkerId);

      const targetWorker = workers.find((w) => w.id === initialWorkerId);
      const scheduledSession = workSessions.find(
        (s) => s.workerId === initialWorkerId && s.date === (selectedDate || '2026-09-14') && s.status !== 'cancelled'
      );
      setSelectedSiteId(scheduledSession?.siteId || targetWorker?.normalSiteId || sites[0]?.id || '');
    }
  }, [isOpen, defaultWorkerId, selectedDate, workers, sites, workSessions]);

  // When worker selection changes, auto-fill their scheduled or normal site
  const handleWorkerChange = (workerId: string) => {
    setSelectedWorkerId(workerId);
    const targetWorker = workers.find((w) => w.id === workerId);
    const scheduledSession = workSessions.find(
      (s) => s.workerId === workerId && s.date === date && s.status !== 'cancelled'
    );
    if (scheduledSession) {
      setSelectedSiteId(scheduledSession.siteId);
      if (scheduledSession.startTime) {
        setArrivalTime(scheduledSession.startTime);
      }
    } else if (targetWorker?.normalSiteId) {
      setSelectedSiteId(targetWorker.normalSiteId);
    }
  };

  if (!isOpen) return null;

  const currentWorker = workers.find((w) => w.id === selectedWorkerId);
  const currentSite = sites.find((s) => s.id === selectedSiteId);
  const currentScheduledSession = workSessions.find(
    (s) => s.workerId === selectedWorkerId && s.date === date && s.status !== 'cancelled'
  );
  const existingAttendance = attendance.find(
    (a) => a.workerId === selectedWorkerId && a.date === date
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId || !selectedSiteId || !arrivalTime) return;

    recordManualArrivalByManager(selectedWorkerId, selectedSiteId, arrivalTime, note, date);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Manually Log Arrival</h2>
              <p className="text-xs text-slate-400">Record attendance for a worker without a mobile device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Worker Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Worker <span className="text-rose-500">*</span>
            </label>
            <select
              id="manual-arrival-worker-select"
              value={selectedWorkerId}
              onChange={(e) => handleWorkerChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
              required
            >
              {workers.map((w) => {
                const isPresent = attendance.some(
                  (a) => a.workerId === w.id && a.date === date && a.status === 'present'
                );
                return (
                  <option key={w.id} value={w.id}>
                    {w.name} — {w.role} ({w.workerRef}) {isPresent ? '· (Already Checked In)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Context Info Box */}
          {currentWorker && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Scheduled Session:</span>
                {currentScheduledSession ? (
                  <span className="font-mono font-bold text-slate-800">
                    {currentScheduledSession.startTime} - {currentScheduledSession.endTime}
                  </span>
                ) : (
                  <span className="italic text-slate-400">No scheduled shift for this date</span>
                )}
              </div>
              {existingAttendance && (
                <div className="flex items-center gap-1.5 text-amber-700 font-medium text-[11px] pt-1 border-t border-slate-200">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    Existing record found ({existingAttendance.status.replace('_', ' ')}). Submitting will update their arrival.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Site and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Facility / Site <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="manual-arrival-site-select"
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  required
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="manual-arrival-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Arrival Time */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Effective Arrival Time <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="manual-arrival-time-input"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enter the exact time the worker physically arrived on-site.
            </p>
          </div>

          {/* Manager Verification Note */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Verification Note / Reason
            </label>
            <textarea
              id="manual-arrival-note-input"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Worker left phone at home; verified arrival on-site in person."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-manual-arrival-btn"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Confirm Arrival</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
