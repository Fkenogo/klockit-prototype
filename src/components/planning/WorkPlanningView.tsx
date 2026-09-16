import React, { useMemo, useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { WorkPattern, DayOfWeek, sessionWorkerIds } from '../../types';
import {
  Calendar,
  Clock,
  Building2,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Info,
  CalendarDays,
  Repeat,
  Search,
} from 'lucide-react';

const DAY_ORDER: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_SHORT: Record<DayOfWeek, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};
const JS_DAY_TO_NAME: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const toISODate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseISODate = (iso: string) => new Date(`${iso}T12:00:00`);
const addDays = (d: Date, n: number) => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const prettyDay = (iso: string) => {
  const d = parseISODate(iso);
  return `${DAY_SHORT[JS_DAY_TO_NAME[d.getDay()]]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

const BASE_MONDAY = '2026-09-14';

const PatternEditor: React.FC<{ pattern: WorkPattern; onClose: () => void }> = ({ pattern, onClose }) => {
  const { updateWorkPatternFull } = useKlockit();
  const [name, setName] = useState(pattern.name);
  const [schedule, setSchedule] = useState(pattern.schedule);

  const toggleDay = (day: DayOfWeek) =>
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], isWorking: !prev[day].isWorking } }));
  const setDayTime = (day: DayOfWeek, key: 'startTime' | 'endTime', value: string) =>
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [key]: value } }));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <h3 className="text-base font-bold text-slate-900">Edit planning rule</h3>
        <p className="text-xs text-slate-500">
          Each day is configured independently — weekends can be working days with their own hours,
          including overnight spans. Existing sessions keep their own times.
        </p>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Rule name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" />
        </div>
        <div className="space-y-2">
          {DAY_ORDER.map((day) => {
            const s = schedule[day];
            return (
              <div key={day} className={`flex flex-wrap items-center gap-2 p-2.5 rounded-xl border text-xs ${s.isWorking ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-center gap-2 w-24 font-bold text-slate-800 cursor-pointer">
                  <input type="checkbox" checked={s.isWorking} onChange={() => toggleDay(day)} className="text-indigo-600" />
                  {DAY_SHORT[day]}
                </label>
                {s.isWorking ? (
                  <>
                    <input type="time" value={s.startTime} onChange={(e) => setDayTime(day, 'startTime', e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded-lg font-mono" />
                    <span className="text-slate-400">–</span>
                    <input type="time" value={s.endTime} onChange={(e) => setDayTime(day, 'endTime', e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded-lg font-mono" />
                    <span className="text-[11px] text-slate-400">overnight allowed</span>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-400">Off</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">Cancel</button>
          <button
            onClick={() => { updateWorkPatternFull(pattern.id, { name, schedule }); onClose(); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
          >
            Save planning rule
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateSessionWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { sites, workers, patterns, createPlannedSessions, setInspectedSessionId } = useKlockit();
  const [step, setStep] = useState<1 | 2>(1);
  const [label, setLabel] = useState('Morning café session');
  const [siteId, setSiteId] = useState(sites.find((s) => s.status === 'active')?.id ?? sites[0]?.id ?? '');
  const [mode, setMode] = useState<'single' | 'repeat'>('single');
  const [singleDate, setSingleDate] = useState(BASE_MONDAY);
  const [repeatStart, setRepeatStart] = useState(BASE_MONDAY);
  const [repeatWeeks, setRepeatWeeks] = useState(2);
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [patternId, setPatternId] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const [workerSearch, setWorkerSearch] = useState('');

  const dates = useMemo(() => {
    if (mode === 'single') return singleDate ? [singleDate] : [];
    const out: string[] = [];
    const start = parseISODate(repeatStart);
    // Align back to the Monday of the start week so weekday selection is predictable
    const dow = start.getDay(); // 0 Sun
    const monday = addDays(start, dow === 0 ? -6 : 1 - dow);
    for (let w = 0; w < Math.max(1, Math.min(8, repeatWeeks)); w++) {
      DAY_ORDER.forEach((day) => {
        if (!repeatDays.includes(day)) return;
        const idx = DAY_ORDER.indexOf(day);
        out.push(toISODate(addDays(monday, w * 7 + idx)));
      });
    }
    return [...new Set(out)].sort();
  }, [mode, singleDate, repeatStart, repeatWeeks, repeatDays]);

  const visibleWorkers = workers.filter((w) => {
    if (w.status !== 'active') return false;
    const q = workerSearch.trim().toLowerCase();
    if (!q) return true;
    return w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q);
  });

  const toggleDay = (d: DayOfWeek) =>
    setRepeatDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  const toggleWorker = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canContinue = siteId !== '' && startTime !== '' && endTime !== '' && dates.length > 0 && (mode === 'single' || repeatDays.length > 0);

  const handleCreate = () => {
    const ids = createPlannedSessions({
      label: label.trim() || 'Planned session',
      siteId,
      dates,
      startTime,
      endTime,
      notes: notes.trim() || undefined,
      workerIds: checked,
      patternId: patternId || undefined,
    });
    onClose();
    if (ids.length === 1) setInspectedSessionId(ids[0]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {step === 1 ? 'Define the session' : 'Assign Workers'}
          </h3>
          <span className="text-[11px] font-bold text-slate-500">Step {step} of 2</span>
        </div>

        {step === 1 && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-500">First the schedule and Site — Workers come next, and are never required up front.</p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Session label</label>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Morning café session" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site</label>
                <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                  {sites.filter((s) => s.status === 'active').map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">From planning rule (optional)</label>
                <select value={patternId} onChange={(e) => setPatternId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                  <option value="">No rule — one-off definition</option>
                  {patterns.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMode('single')} className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold ${mode === 'single' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'}`}>Single date</button>
              <button onClick={() => setMode('repeat')} className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold ${mode === 'repeat' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'}`}>Repeat weekly</button>
            </div>
            {mode === 'single' ? (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date (any day — Sat/Sun included)</label>
                <input type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Start week of</label>
                    <input type="date" value={repeatStart} onChange={(e) => setRepeatStart(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Weeks (1–8)</label>
                    <input type="number" min={1} max={8} value={repeatWeeks} onChange={(e) => setRepeatWeeks(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Weekdays</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAY_ORDER.map((d) => (
                      <button key={d} onClick={() => toggleDay(d)} className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold ${repeatDays.includes(d) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300'}`}>
                        {DAY_SHORT[d]}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Will create <strong className="text-slate-800">{dates.length}</strong> dated session{dates.length === 1 ? '' : 's'}{dates.length > 0 ? `: ${dates.slice(0, 3).join(', ')}${dates.length > 3 ? '…' : ''}` : ''}.</p>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">End time (overnight allowed)</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono" />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notes / context</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Weekend counter rotation" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-500">
              “{label.trim() || 'Planned session'}” · {dates.length} date{dates.length === 1 ? '' : 's'} · {sites.find((s) => s.id === siteId)?.name} · {startTime}–{endTime}.
              Select Workers now, or create the session unassigned and configure it later.
            </p>
            <input value={workerSearch} onChange={(e) => setWorkerSearch(e.target.value)} placeholder="Search Workers…" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
              {visibleWorkers.map((w) => (
                <label key={w.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" checked={checked.includes(w.id)} onChange={() => toggleWorker(w.id)} className="text-indigo-600" />
                  <span className="font-semibold text-slate-800">{w.name}</span>
                  <span className="text-[11px] text-slate-500">{w.role}</span>
                </label>
              ))}
              {visibleWorkers.length === 0 && <p className="text-[11px] text-slate-400 p-2">No active Workers match.</p>}
            </div>
            <p className="text-[11px] text-slate-500">{checked.length} selected.</p>
          </div>
        )}

        <div className="pt-3 flex items-center justify-between border-t border-slate-200">
          <div>
            {step === 2 && (
              <button onClick={() => setStep(1)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">← Back to definition</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">Cancel</button>
            {step === 1 ? (
              <button disabled={!canContinue} onClick={() => setStep(2)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40">
                Continue to Workers →
              </button>
            ) : (
              <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">
                {checked.length > 0 ? `Create with ${checked.length} Worker${checked.length === 1 ? '' : 's'}` : 'Create without Workers'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const WorkPlanningView: React.FC = () => {
  const {
    workers,
    sites,
    patterns,
    workSessions,
    setInspectedSessionId,
  } = useKlockit();

  const [activeTab, setActiveTab] = useState<'sessions' | 'patterns'>('sessions');
  const [weekOffset, setWeekOffset] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);

  // Session register filters
  const [query, setQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workerFilter, setWorkerFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'recurring' | 'one_off' | 'adjusted'>('all');

  const weekDays = useMemo(() => {
    const monday = addDays(parseISODate(BASE_MONDAY), weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => toISODate(addDays(monday, i)));
  }, [weekOffset]);
  const weekLabel = `${prettyDay(weekDays[0])} – ${prettyDay(weekDays[6])} 2026`;

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, typeof workSessions>();
    workSessions.forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    });
    map.forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [workSessions]);

  const registerRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workSessions
      .filter((s) => {
        if (siteFilter !== 'all' && s.siteId !== siteFilter) return false;
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (workerFilter !== 'all' && !sessionWorkerIds(s).includes(workerFilter)) return false;
        if (sourceFilter === 'recurring' && !s.recurrenceId && !s.patternId) return false;
        if (sourceFilter === 'one_off' && (s.recurrenceId || s.patternId)) return false;
        if (sourceFilter === 'adjusted' && !s.isExceptional) return false;
        if (q) {
          const siteName = sites.find((x) => x.id === s.siteId)?.name.toLowerCase() ?? '';
          const names = sessionWorkerIds(s).map((id) => workers.find((w) => w.id === id)?.name.toLowerCase() ?? '').join(' ');
          if (!(s.label ?? '').toLowerCase().includes(q) && !siteName.includes(q) && !names.includes(q) && !s.date.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  }, [workSessions, query, siteFilter, statusFilter, workerFilter, sourceFilter, sites, workers]);

  const editingPattern = patterns.find((p) => p.id === editingPatternId) ?? null;
  const weekendSessions = workSessions.filter((s) => {
    const d = parseISODate(s.date).getDay();
    return d === 0 || d === 6;
  });

  return (
    <div id="work-planning-view" className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Work Planning</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
              Sessions first · 7 days
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Define the session — schedule and Site — then assign Workers and manage it over time.
            Recurrence creates sessions; individual sessions stay adjustable on their own.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="plan-tab-sessions"
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${activeTab === 'sessions' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Sessions</span>
            </button>
            <button
              id="plan-tab-patterns"
              onClick={() => setActiveTab('patterns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${activeTab === 'patterns' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Planning rules</span>
            </button>
          </div>
          <button
            id="add-work-session-btn"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Define session</span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-950 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-indigo-900">Sessions carry the schedule — Workers are assigned to sessions</p>
          <p className="text-indigo-800 text-[11px] leading-relaxed">
            A planned session (e.g. “Morning café session · Main Site · Mon–Sun · 06:00–14:00”) holds the date, time
            and Site. Workers join it afterwards — none, one, or several. Click any session to manage assignments,
            times, Site, lifecycle and history. Attendance evidence always stays intact.
          </p>
        </div>
      </div>

      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekOffset((o) => o - 1)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg" title="Previous week">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">{weekLabel}</span>
              <button onClick={() => setWeekOffset((o) => o + 1)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg" title="Next week">
                <ChevronRight className="w-4 h-4" />
              </button>
              {weekOffset !== 0 && (
                <button onClick={() => setWeekOffset(0)} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded-md">Back to current week</button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sessions, Workers…" className="pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </span>
              <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                <option value="all">All Sites</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                <option value="all">All statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <select value={workerFilter} onChange={(e) => setWorkerFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                <option value="all">All Workers</option>
                {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                <option value="all">All sources</option>
                <option value="recurring">From series / rule</option>
                <option value="one_off">One-off</option>
                <option value="adjusted">Adjusted</option>
              </select>
            </div>
          </div>

          {/* 7-day session week view */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 divide-y sm:divide-x divide-slate-100">
              {weekDays.map((day) => {
                const list = (sessionsByDate.get(day) ?? []).filter((s) => registerRows.includes(s));
                return (
                  <div key={day} className="p-2.5 min-h-[140px] bg-white">
                    <p className="text-[11px] font-bold text-slate-700">{prettyDay(day)}</p>
                    <p className="text-[10px] text-slate-400 font-mono mb-2">{day}</p>
                    <div className="space-y-1.5">
                      {list.length === 0 && <p className="text-[10px] text-slate-300 italic">No sessions</p>}
                      {list.map((s) => {
                        const ids = sessionWorkerIds(s);
                        return (
                          <button
                            key={s.id}
                            onClick={() => setInspectedSessionId(s.id)}
                            title="Open session detail"
                            className={`w-full text-left p-2 rounded-xl border text-[11px] transition-all ${
                              s.status === 'cancelled'
                                ? 'bg-rose-50/60 border-rose-200 opacity-75'
                                : s.status === 'suspended'
                                ? 'bg-amber-50/80 border-amber-300'
                                : ids.length === 0
                                ? 'bg-slate-50 border-dashed border-slate-300'
                                : 'bg-indigo-50/60 border-indigo-200 hover:border-indigo-400'
                            }`}
                          >
                            <p className="font-bold text-slate-900 truncate">{s.label || 'Planned session'}</p>
                            <p className="font-mono text-slate-700">{s.startTime}–{s.endTime}</p>
                            <p className="text-slate-500 truncate flex items-center gap-1"><Building2 className="w-3 h-3" />{sites.find((x) => x.id === s.siteId)?.name}</p>
                            <p className="text-slate-500 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {ids.length === 0 ? 'Unassigned — needs Workers' : `${ids.length} Worker${ids.length === 1 ? '' : 's'}`}
                              {s.status !== 'scheduled' ? ` · ${s.status}` : ''}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {weekendSessions.length} weekend session{weekendSessions.length === 1 ? '' : 's'} planned overall — Saturday and Sunday are ordinary planning days here.
          </p>

          {/* Session register */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Session register ({registerRows.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Session</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-4 py-2.5">Site</th>
                    <th className="px-4 py-2.5">Workers</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registerRows.map((s) => {
                    const ids = sessionWorkerIds(s);
                    return (
                      <tr key={s.id} className="hover:bg-indigo-50/40 cursor-pointer" onClick={() => setInspectedSessionId(s.id)}>
                        <td className="px-4 py-2.5 font-bold text-slate-900">
                          {s.label || 'Planned session'}
                          {s.recurrenceId && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">series</span>}
                          {s.isExceptional && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">adjusted</span>}
                        </td>
                        <td className="px-4 py-2.5 font-mono">{s.date} <span className="text-slate-400">({prettyDay(s.date).split(' ')[0]})</span></td>
                        <td className="px-4 py-2.5 font-mono">{s.startTime}–{s.endTime}</td>
                        <td className="px-4 py-2.5">{sites.find((x) => x.id === s.siteId)?.name}</td>
                        <td className="px-4 py-2.5">{ids.length === 0 ? <span className="text-slate-400 italic">Unassigned</span> : ids.map((id) => workers.find((w) => w.id === id)?.name ?? id).join(', ')}</td>
                        <td className="px-4 py-2.5"><span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{s.status}</span></td>
                      </tr>
                    );
                  })}
                  {registerRows.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No sessions match these filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <p className="text-[11px] text-slate-500">
            Planning rules generate sessions — they never replace them. Edit any day independently, including weekends and overnight spans.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map((pat) => {
              const assignedCount = workers.filter((w) => w.workPatternId === pat.id).length;
              return (
                <div key={pat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{pat.name}</h3>
                      <p className="text-xs text-slate-400">Effective from {pat.effectiveFrom}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {assignedCount} Workers Assigned
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                    {DAY_ORDER.map((day) => {
                      const sched = pat.schedule[day];
                      return (
                        <div key={day} className={`p-2 rounded-xl border ${sched.isWorking ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                          <span className="text-[10px] uppercase font-bold block">{DAY_SHORT[day]}</span>
                          <span className="text-[9px] font-mono block mt-1">{sched.isWorking ? `${sched.startTime.slice(0, 5)}` : 'Off'}</span>
                          {sched.isWorking && <span className="text-[9px] font-mono block">–{sched.endTime.slice(0, 5)}</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Rule — sessions keep their own times</span>
                    <button
                      id={`edit-pattern-btn-${pat.id}`}
                      onClick={() => setEditingPatternId(pat.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Edit rule
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCreateOpen && <CreateSessionWizard onClose={() => setIsCreateOpen(false)} />}
      {editingPattern && <PatternEditor pattern={editingPattern} onClose={() => setEditingPatternId(null)} />}
    </div>
  );
};
