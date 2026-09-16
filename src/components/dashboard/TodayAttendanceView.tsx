import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import {
  effectiveArrival,
  effectiveDeparture,
  isCorrected,
  describeCorrection,
} from '../../utils/attendance';
import { ManagerReviewModal } from '../modals/ManagerReviewModal';
import {
  Users,
  UserCheck,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  QrCode,
  KeyRound,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building2,
  Sparkles,
  Check,
} from 'lucide-react';

export const TodayAttendanceView: React.FC = () => {
  const {
    workers,
    sites,
    workSessions,
    attendance,
    exceptions,
    selectedDate,
    setSelectedDate,
    selectedSiteFilter,
    setSelectedSiteFilter,
    setInspectedWorkerId,
    setInspectedExceptionId,
    setActiveManagerTab,
    recordWorkerDeparture,
  } = useKlockit();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'completed' | 'not_arrived' | 'attention'>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Filter work sessions for selected date
  const todaySessions = workSessions.filter((ws) => ws.date === selectedDate && ws.status !== 'cancelled');

  // Build unified attendance rows for all workers expected or with attendance today
  const rows = workers.map((worker) => {
    const session = todaySessions.find((s) => s.workerId === worker.id);
    const attRecord = attendance.find((a) => a.workerId === worker.id && a.date === selectedDate);
    const site = sites.find((s) => s.id === (attRecord?.siteId || session?.siteId || worker.normalSiteId));

    // Determine status
    let status: 'present' | 'completed' | 'not_arrived' | 'pending_review' | 'missing_departure' | 'unmatched' | 'unscheduled' = 'unscheduled';
    let needsAttention = false;
    let exceptionId: string | undefined = undefined;

    if (attRecord) {
      status = attRecord.status as any;
      needsAttention = attRecord.needsAttention;
      exceptionId = attRecord.exceptionId;
    } else if (session) {
      status = 'not_arrived';
    }

    // Check if worker has an open exception (e.g. Elena's missing departure from yesterday)
    const openWorkerException = exceptions.find((e) => e.workerId === worker.id && e.status === 'unresolved');
    if (openWorkerException && !needsAttention) {
      needsAttention = true;
      exceptionId = openWorkerException.id;
    }

    return {
      worker,
      session,
      attRecord,
      site,
      status,
      needsAttention,
      exceptionId,
    };
  });

  // Filter rows
  const filteredRows = rows.filter((row) => {
    // Only show workers who either have a session today or logged attendance today
    const hasActivityToday = !!row.session || !!row.attRecord;
    if (!hasActivityToday) return false;

    // Site filter
    if (selectedSiteFilter !== 'all') {
      const matchSite = (row.attRecord?.siteId === selectedSiteFilter) || (row.session?.siteId === selectedSiteFilter);
      if (!matchSite) return false;
    }

    // Status filter
    if (statusFilter === 'present' && row.status !== 'present' && row.status !== 'pending_review') return false;
    if (statusFilter === 'completed' && row.status !== 'completed') return false;
    if (statusFilter === 'not_arrived' && row.status !== 'not_arrived') return false;
    if (statusFilter === 'attention' && !row.needsAttention) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = row.worker.name.toLowerCase().includes(q);
      const matchRef = row.worker.workerRef.toLowerCase().includes(q);
      const matchRole = row.worker.role.toLowerCase().includes(q);
      if (!matchName && !matchRef && !matchRole) return false;
    }

    return true;
  });

  // Metrics
  const totalExpected = todaySessions.length;
  const presentNow = rows.filter((r) => r.status === 'present' || r.status === 'pending_review').length;
  const completedToday = rows.filter((r) => r.status === 'completed').length;
  const notArrivedYet = rows.filter((r) => r.status === 'not_arrived').length;
  const attentionCount = rows.filter((r) => r.needsAttention).length;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div id="today-attendance-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Date Navigator */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Who is at work today?
            </h1>
            {selectedDate === '2026-09-14' && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                Live Attendance
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time presence tracking across all facility sites. Verified via Site QR & fallback codes.
          </p>
        </div>

        {/* Actions & Date Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            id="review-attendance-btn"
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Review attendance</span>
          </button>

          {/* Date Controls */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
            <button
              onClick={handlePrevDay}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-800 font-mono">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{selectedDate}</span>
            </div>
            <button
              onClick={handleNextDay}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {selectedDate !== '2026-09-14' && (
              <button
                onClick={() => setSelectedDate('2026-09-14')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded-md cursor-pointer"
              >
                Back to Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Operational Overview Cards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Operational Overview
            </h2>
            <span className="text-[11px] text-slate-400">
              · Live headcount snapshot for {selectedDate}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Expected Today */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`p-4.5 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-2 opacity-80">
              <span>Expected Today</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black font-mono tracking-tight">{totalExpected}</div>
            <p className="text-[11px] opacity-70 mt-1">Total rostered for this date</p>
          </button>

          {/* At Work Now */}
          <button
            onClick={() => setStatusFilter('present')}
            className={`p-4.5 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'present'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-600/30'
                : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-2 text-emerald-600">
              <span className={statusFilter === 'present' ? 'text-emerald-100' : 'text-emerald-700 font-bold'}>
                At Work Now
              </span>
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-white">
              {presentNow}
            </div>
            <p className="text-[11px] text-slate-500 opacity-80 mt-1">Checked in on-site</p>
          </button>

          {/* Not Yet Arrived */}
          <button
            onClick={() => setStatusFilter('not_arrived')}
            className={`p-4.5 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === 'not_arrived'
                ? 'bg-slate-700 text-white border-slate-700 shadow-md ring-2 ring-slate-600/30'
                : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-2 text-slate-500">
              <span className={statusFilter === 'not_arrived' ? 'text-slate-200' : 'text-slate-600 font-bold'}>
                Not Yet Arrived
              </span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-3xl font-black font-mono tracking-tight text-slate-700 dark:text-white">
              {notArrivedYet}
            </div>
            <p className="text-[11px] text-slate-500 opacity-80 mt-1">Pending arrival</p>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({totalExpected})
          </button>
          <button
            onClick={() => setStatusFilter('present')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'present'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            At Work Now ({presentNow})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Completed ({completedToday})
          </button>
          <button
            onClick={() => setStatusFilter('not_arrived')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'not_arrived'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Not Yet Arrived ({notArrivedYet})
          </button>
          <button
            onClick={() => setStatusFilter('attention')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'attention'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Needs Attention ({attentionCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="today-search-input"
              type="text"
              placeholder="Search worker name, ref, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Site:</span>
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="today-attendance-table" className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Worker</th>
                <th className="px-4 py-3.5">Site Location</th>
                <th className="px-4 py-3.5">Expected Work</th>
                <th className="px-4 py-3.5">Arrival Time</th>
                <th className="px-4 py-3.5">Departure Time</th>
                <th className="px-4 py-3.5">Presence State</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <p className="text-sm font-medium text-slate-600">No attendance records matching your criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or date selection.</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ worker, session, attRecord, site, status, needsAttention, exceptionId }) => {
                  return (
                    <tr
                      key={worker.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        needsAttention ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Worker Name & Role */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setInspectedWorkerId(worker.id)}
                          className="flex items-center gap-3 text-left group"
                        >
                          <div className={`w-8 h-8 rounded-lg ${worker.avatarBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all`}>
                            {worker.initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {worker.name}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <span className="font-mono text-slate-400">{worker.workerRef}</span>
                              <span>·</span>
                              <span>{worker.role}</span>
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Site Location */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-medium">{site?.name || 'Unassigned'}</span>
                        </div>
                      </td>

                      {/* Expected Hours */}
                      <td className="px-4 py-3.5">
                        {session ? (
                          <div className="font-mono font-medium text-slate-800">
                            {session.startTime} - {session.endTime}
                            {session.isExceptional && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-sans font-semibold">
                                Adjusted
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unscheduled</span>
                        )}
                      </td>

                      {/* Arrival Time */}
                      <td className="px-4 py-3.5">
                        {effectiveArrival(attRecord) ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900">
                              {effectiveArrival(attRecord)}
                            </span>
                            {attRecord?.arrivalMethod === 'qr' ? (
                              <span title="Verified via Site QR code" className="p-0.5 rounded bg-emerald-50 text-emerald-700">
                                <QrCode className="w-3 h-3" />
                              </span>
                            ) : attRecord?.arrivalMethod === 'manual_code' ? (
                              <span title="Entered 6-digit site code manually" className="p-0.5 rounded bg-amber-50 text-amber-700">
                                <KeyRound className="w-3 h-3" />
                              </span>
                            ) : attRecord?.arrivalMethod === 'manager_entry' ? (
                              <span title="Verified on site by a Manager" className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[9px] border border-indigo-200">
                                Manager
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        {isCorrected(attRecord) && (
                          <div
                            className="text-[10px] text-slate-500 mt-0.5"
                            title={describeCorrection(attRecord)}
                          >
                            {attRecord?.arrivalTime && attRecord.arrivalTime !== effectiveArrival(attRecord)
                              ? `recorded ${attRecord.arrivalTime} · corrected`
                              : 'Manager reviewed'}
                          </div>
                        )}
                      </td>

                      {/* Departure Time */}
                      <td className="px-4 py-3.5">
                        {effectiveDeparture(attRecord) ? (
                          <>
                            <span className="font-mono font-bold text-slate-900">
                              {effectiveDeparture(attRecord)}
                            </span>
                            {isCorrected(attRecord) &&
                              attRecord?.departureTime &&
                              attRecord.departureTime !== effectiveDeparture(attRecord) && (
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  recorded {attRecord.departureTime} · corrected
                                </div>
                              )}
                          </>
                        ) : status === 'present' ? (
                          <span className="text-emerald-600 font-medium italic">At work now</span>
                        ) : status === 'missing_departure' ? (
                          <span className="text-rose-600 font-bold italic">Missing</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Presence State Badge */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {status === 'present' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              At Work Now
                            </span>
                          )}

                          {status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              Completed
                            </span>
                          )}

                          {status === 'pending_review' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Review Needed
                            </span>
                          )}

                          {status === 'not_arrived' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Not Arrived
                            </span>
                          )}

                          {status === 'missing_departure' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[11px]">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              Missing Departure
                            </span>
                          )}

                          {status === 'unmatched' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-purple-600" />
                              Site Mismatch
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {needsAttention && exceptionId ? (
                            <button
                              id={`investigate-row-btn-${worker.id}`}
                              onClick={() => setInspectedExceptionId(exceptionId)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-[11px] shadow-xs flex items-center gap-1 transition-colors"
                            >
                              <span>Investigate</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : status === 'present' ? (
                            <button
                              onClick={() => recordWorkerDeparture(worker.id)}
                              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-[11px] font-semibold border border-slate-200 transition-colors"
                              title="Record departure on worker's behalf"
                            >
                              Log Out
                            </button>
                          ) : (
                            <button
                              onClick={() => setInspectedWorkerId(worker.id)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View Worker Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ManagerReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
};
