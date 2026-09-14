import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { WorkSession } from '../../types';
import { SessionAdjustmentModal } from '../modals/SessionAdjustmentModal';
import { SmartShiftSuggestionModal } from './SmartShiftSuggestionModal';
import {
  CalendarRange,
  Calendar,
  Clock,
  Building2,
  Users,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  CalendarDays,
  Repeat,
  Check,
} from 'lucide-react';

export const WorkPlanningView: React.FC = () => {
  const {
    workers,
    sites,
    patterns,
    workSessions,
    addWorkSession,
    updateWorkPattern,
    selectedDate,
    setSelectedDate,
  } = useKlockit();

  const [activeTab, setActiveTab] = useState<'sessions' | 'patterns'>('sessions');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState<WorkSession | null>(null);
  const [isAddAdHocOpen, setIsAddAdHocOpen] = useState(false);
  const [isSmartShiftModalOpen, setIsSmartShiftModalOpen] = useState(false);

  // New Ad-Hoc Session Form State
  const [adHocWorkerId, setAdHocWorkerId] = useState(workers[0]?.id || 'worker-1');
  const [adHocSiteId, setAdHocSiteId] = useState(sites[0]?.id || 'site-1');
  const [adHocDate, setAdHocDate] = useState(selectedDate);
  const [adHocStart, setAdHocStart] = useState('08:00');
  const [adHocEnd, setAdHocEnd] = useState('17:00');
  const [adHocNote, setAdHocNote] = useState('Exceptional coverage session');

  // Multi-day week period for planning (showing current week Mon-Fri)
  // Let's generate dates for 2026-09-14 to 2026-09-18
  const weekDays = [
    { date: '2026-09-14', label: 'Mon 14 Sep' },
    { date: '2026-09-15', label: 'Tue 15 Sep' },
    { date: '2026-09-16', label: 'Wed 16 Sep' },
    { date: '2026-09-17', label: 'Thu 17 Sep' },
    { date: '2026-09-18', label: 'Fri 18 Sep' },
  ];

  const handleCreateAdHocSession = (e: React.FormEvent) => {
    e.preventDefault();
    addWorkSession({
      workerId: adHocWorkerId,
      siteId: adHocSiteId,
      date: adHocDate,
      startTime: adHocStart,
      endTime: adHocEnd,
      status: 'scheduled',
      isExceptional: true,
      notes: adHocNote,
    });
    setIsAddAdHocOpen(false);
  };

  return (
    <div id="work-planning-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Work Planning & Sessions</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
              Coherent Planning
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage recurring attendance patterns and individual daily work sessions when circumstances change.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Tab Switcher: Sessions vs Patterns */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="plan-tab-sessions"
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'sessions'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Individual Sessions</span>
            </button>
            <button
              id="plan-tab-patterns"
              onClick={() => setActiveTab('patterns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'patterns'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Recurring Patterns</span>
            </button>
          </div>

          <button
            id="smart-shift-ai-btn"
            onClick={() => setIsSmartShiftModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Shift AI</span>
          </button>

          {activeTab === 'sessions' && (
            <button
              id="add-exceptional-session-btn"
              onClick={() => setIsAddAdHocOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ad-Hoc Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Distinction Explanatory Banner (Brief Section 8 & 9 mandate) */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-950 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-indigo-900">
            Klockit Planning Architecture: Recurring Patterns vs. Individual Sessions
          </p>
          <p className="text-indigo-800 text-[11px] leading-relaxed">
            A Worker’s normal work pattern (e.g. Monday to Friday 08:00–17:00 at Main Workshop) automatically generates expected Work Sessions.
            When real life changes (e.g. temporary shift override, adjusted hours, or site transfer), 
            <strong> edit the specific Work Session</strong> directly. The worker's underlying recurring pattern remains completely intact.
          </p>
        </div>
      </div>

      {/* Tab 1: Individual Work Sessions by Period / Grid */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Planning Period:</span>
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                Week 38 (14 Sep – 18 Sep 2026)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Site:</span>
              <select
                value={selectedSiteFilter}
                onChange={(e) => setSelectedSiteFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Sites</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Weekly Work Sessions Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="px-4 py-3 min-w-[200px] border-r border-slate-200">Worker</th>
                    {weekDays.map((day) => (
                      <th
                        key={day.date}
                        className={`px-3 py-3 min-w-[170px] text-center border-r last:border-r-0 border-slate-200 ${
                          day.date === selectedDate ? 'bg-indigo-50/70 text-indigo-950 font-bold' : ''
                        }`}
                      >
                        <div>{day.label}</div>
                        {day.date === '2026-09-14' && (
                          <span className="text-[9px] text-indigo-600 lowercase font-mono">today</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers.map((worker) => {
                    const workerSite = sites.find((s) => s.id === worker.normalSiteId);
                    if (selectedSiteFilter !== 'all' && worker.normalSiteId !== selectedSiteFilter) {
                      return null;
                    }

                    return (
                      <tr key={worker.id} className="hover:bg-slate-50/50">
                        {/* Worker Identity */}
                        <td className="px-4 py-3 border-r border-slate-200 bg-white">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg ${worker.avatarBg} text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0`}>
                              {worker.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{worker.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{worker.role}</p>
                            </div>
                          </div>
                        </td>

                        {/* Session cells for each day */}
                        {weekDays.map((day) => {
                          const matchingSessions = workSessions.filter(
                            (ws) => ws.workerId === worker.id && ws.date === day.date
                          );

                          return (
                            <td
                              key={day.date}
                              className={`p-2 border-r last:border-r-0 border-slate-200 align-top ${
                                day.date === selectedDate ? 'bg-indigo-50/20' : ''
                              }`}
                            >
                              {matchingSessions.length === 0 ? (
                                <button
                                  onClick={() => {
                                    setAdHocWorkerId(worker.id);
                                    setAdHocDate(day.date);
                                    setAdHocSiteId(worker.normalSiteId);
                                    setIsAddAdHocOpen(true);
                                  }}
                                  className="w-full py-3 rounded-lg border border-dashed border-slate-200 text-[10px] text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Off</span>
                                </button>
                              ) : (
                                <div className="space-y-1.5">
                                  {matchingSessions.map((sess) => {
                                    const sessSite = sites.find((s) => s.id === sess.siteId);
                                    return (
                                      <button
                                        key={sess.id}
                                        onClick={() => setSelectedSessionForEdit(sess)}
                                        className={`w-full text-left p-2 rounded-xl border transition-all ${
                                          sess.status === 'cancelled'
                                            ? 'bg-slate-100 border-slate-200 opacity-60 text-slate-400'
                                            : sess.isExceptional
                                            ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-2xs hover:border-amber-400'
                                            : 'bg-white border-slate-200 text-slate-800 shadow-2xs hover:border-indigo-400 hover:shadow-xs'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-mono font-bold text-[11px] text-slate-900">
                                            {sess.startTime} - {sess.endTime}
                                          </span>
                                          {sess.isExceptional && (
                                            <span className="text-[9px] px-1 rounded bg-amber-200 text-amber-900 font-semibold">
                                              Custom
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                          <Building2 className="w-3 h-3 text-slate-400" />
                                          <span>{sessSite?.name}</span>
                                        </div>
                                        {sess.notes && (
                                          <p className="text-[9px] text-indigo-600 italic truncate mt-0.5">
                                            {sess.notes}
                                          </p>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Recurring Work Patterns */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map((pat) => {
              const assignedCount = workers.filter((w) => w.workPatternId === pat.id).length;
              return (
                <div
                  key={pat.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{pat.name}</h3>
                      <p className="text-xs text-slate-400">Effective from {pat.effectiveFrom}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {assignedCount} Workers Assigned
                    </span>
                  </div>

                  {/* Day schedule chips */}
                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                    {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map(
                      (day) => {
                        const sched = pat.schedule[day];
                        return (
                          <div
                            key={day}
                            className={`p-2 rounded-xl border ${
                              sched.isWorking
                                ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold block">
                              {day.substring(0, 3)}
                            </span>
                            <span className="text-[9px] font-mono block mt-1">
                              {sched.isWorking ? sched.startTime : 'Off'}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Normal working hours: Mon–Fri 08:00 – 17:00</span>
                    <button
                      onClick={() => alert(`Pattern "${pat.name}" is locked as organizational template.`)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Pattern</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Session Adjustment Modal */}
      <SessionAdjustmentModal
        session={selectedSessionForEdit}
        onClose={() => setSelectedSessionForEdit(null)}
      />

      {/* Ad-Hoc Session Modal */}
      {isAddAdHocOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Exceptional / Ad-Hoc Session</h3>
            <p className="text-xs text-slate-500">
              Schedule an individual session on a specific date without modifying the worker's recurring pattern.
            </p>

            <form onSubmit={handleCreateAdHocSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Worker</label>
                <select
                  value={adHocWorkerId}
                  onChange={(e) => setAdHocWorkerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Date</label>
                  <input
                    type="date"
                    value={adHocDate}
                    onChange={(e) => setAdHocDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site Location</label>
                  <select
                    value={adHocSiteId}
                    onChange={(e) => setAdHocSiteId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={adHocStart}
                    onChange={(e) => setAdHocStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={adHocEnd}
                    onChange={(e) => setAdHocEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={adHocNote}
                  onChange={(e) => setAdHocNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddAdHocOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-xs hover:bg-indigo-700"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Smart Shift AI Suggestion Modal */}
      <SmartShiftSuggestionModal
        isOpen={isSmartShiftModalOpen}
        onClose={() => setIsSmartShiftModalOpen(false)}
      />
    </div>
  );
};
