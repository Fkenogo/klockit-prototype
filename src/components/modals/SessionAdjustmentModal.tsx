import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { WorkSession } from '../../types';
import { X, Calendar, Clock, MapPin, AlertCircle, Save, Ban, RotateCcw } from 'lucide-react';

interface SessionAdjustmentModalProps {
  session: WorkSession | null;
  onClose: () => void;
}

export const SessionAdjustmentModal: React.FC<SessionAdjustmentModalProps> = ({ session, onClose }) => {
  const { workers, sites, adjustWorkSession, cancelWorkSession } = useKlockit();

  if (!session) return null;

  const worker = workers.find((w) => w.id === session.workerId);
  const [startTime, setStartTime] = useState(session.startTime);
  const [endTime, setEndTime] = useState(session.endTime);
  const [siteId, setSiteId] = useState(session.siteId);
  const [notes, setNotes] = useState(session.notes || '');

  const handleSave = () => {
    adjustWorkSession(session.id, {
      startTime,
      endTime,
      siteId,
      notes,
      status: 'scheduled',
    });
    onClose();
  };

  const handleCancelSession = () => {
    cancelWorkSession(session.id);
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
              <h2 className="text-sm font-bold">Adjust Individual Work Session</h2>
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
              <strong>Individual Session Override:</strong> Modifying this specific date will adjust today's expected work without changing {worker?.name}'s recurring weekly pattern.
            </p>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Site Location For This Session</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Session Notes</label>
            <input
              type="text"
              placeholder="e.g. Temporary transfer to help with warehouse surge"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Current Status: <strong className="uppercase text-slate-800">{session.status}</strong></span>
            {session.status === 'scheduled' ? (
              <button
                type="button"
                onClick={handleCancelSession}
                className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel This Session</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => adjustWorkSession(session.id, { status: 'scheduled' })}
                className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
