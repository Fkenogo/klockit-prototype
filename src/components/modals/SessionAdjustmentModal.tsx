import React, { useState, useEffect } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { WorkSession } from '../../types';
import { X, Calendar, Clock, MapPin, AlertCircle, Save, Ban, PauseCircle, PlayCircle, RotateCcw } from 'lucide-react';

interface SessionAdjustmentModalProps {
  session: WorkSession | null;
  onClose: () => void;
}

export const SessionAdjustmentModal: React.FC<SessionAdjustmentModalProps> = ({ session, onClose }) => {
  const { workers, sites, adjustWorkSession, cancelWorkSession } = useKlockit();

  if (!session) return null;

  const worker = workers.find((w) => w.id === session.workerId);
  const [date, setDate] = useState(session.date);
  const [startTime, setStartTime] = useState(session.startTime);
  const [endTime, setEndTime] = useState(session.endTime);
  const [siteId, setSiteId] = useState(session.siteId);
  const [notes, setNotes] = useState(session.notes || '');

  useEffect(() => {
    if (session) {
      setDate(session.date);
      setStartTime(session.startTime);
      setEndTime(session.endTime);
      setSiteId(session.siteId);
      setNotes(session.notes || '');
    }
  }, [session]);

  const handleSave = () => {
    adjustWorkSession(session.id, {
      date,
      startTime,
      endTime,
      siteId,
      notes,
      isExceptional: true,
    });
    onClose();
  };

  const handleCancelSession = () => {
    cancelWorkSession(session.id);
    onClose();
  };

  const handleSuspendSession = () => {
    adjustWorkSession(session.id, {
      status: 'suspended',
      notes: notes || 'Session suspended / on hold',
    });
    onClose();
  };

  const handleReactivateSession = () => {
    adjustWorkSession(session.id, {
      status: 'scheduled',
      notes: notes || 'Session reactivated',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold">Manage Work Session</h2>
              <p className="text-xs text-slate-400">{worker?.name} · {session.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Individual Session Management:</strong> Updating this work session overrides this specific date/time without altering {worker?.name}'s normal recurring pattern.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Session Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Facility Site</label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Operational Context</label>
            <input
              type="text"
              placeholder="e.g. Temporary coverage or schedule adjustment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Contextual Status Actions */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    session.status === 'scheduled'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : session.status === 'suspended'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {session.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {session.status === 'scheduled' && (
                  <>
                    <button
                      type="button"
                      onClick={handleSuspendSession}
                      className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold flex items-center gap-1 transition-colors text-[11px]"
                    >
                      <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Suspend</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSession}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold flex items-center gap-1 transition-colors text-[11px]"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}

                {session.status === 'suspended' && (
                  <>
                    <button
                      type="button"
                      onClick={handleReactivateSession}
                      className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold flex items-center gap-1 transition-colors text-[11px]"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reactivate</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSession}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold flex items-center gap-1 transition-colors text-[11px]"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                      <span>Cancel</span>
                    </button>
                  </>
                )}

                {session.status === 'cancelled' && (
                  <button
                    type="button"
                    onClick={handleReactivateSession}
                    className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold flex items-center gap-1 transition-colors text-[11px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Reactivate</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
