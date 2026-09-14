import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { generateDailyAttendancePdf } from '../../utils/pdfGenerator';
import {
  History,
  Calendar,
  Filter,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';

export const AttendanceHistoryView: React.FC = () => {
  const {
    organisation,
    attendance,
    workers,
    sites,
    workSessions,
    setInspectedWorkerId,
    showToast,
  } = useKlockit();

  const [datePreset, setDatePreset] = useState<'today' | 'this_week' | 'last_week' | 'month' | 'all'>('this_week');
  const [siteFilter, setSiteFilter] = useState('all');
  const [workerFilter, setWorkerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'missing' | 'corrected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // PDF Report State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPdfDate, setSelectedPdfDate] = useState('2026-09-14');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filter attendance records
  const filteredAttendance = attendance.filter((rec) => {
    // Preset filtering
    if (datePreset === 'today' && rec.date !== '2026-09-14') return false;
    if (datePreset === 'this_week') {
      // 2026-09-14 to 2026-09-20
      if (rec.date < '2026-09-14' || rec.date > '2026-09-20') {
        // Also allow yesterday for demo context
        if (rec.date !== '2026-09-13') return false;
      }
    }
    if (datePreset === 'last_week') {
      if (rec.date < '2026-09-07' || rec.date > '2026-09-13') return false;
    }

    // Site filter
    if (siteFilter !== 'all' && rec.siteId !== siteFilter) return false;

    // Worker filter
    if (workerFilter !== 'all' && rec.workerId !== workerFilter) return false;

    // Status filter
    if (statusFilter === 'completed' && rec.status !== 'completed') return false;
    if (statusFilter === 'missing' && rec.status !== 'missing_departure') return false;
    if (statusFilter === 'corrected' && !rec.managerCorrection) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const worker = workers.find((w) => w.id === rec.workerId);
      const site = sites.find((s) => s.id === rec.siteId);
      const matchName = worker?.name.toLowerCase().includes(q);
      const matchRef = worker?.workerRef.toLowerCase().includes(q);
      const matchSite = site?.name.toLowerCase().includes(q);
      if (!matchName && !matchRef && !matchSite) return false;
    }

    return true;
  });

  // Summary Metrics for the filtered slice
  const totalRecords = filteredAttendance.length;
  const completedCount = filteredAttendance.filter((r) => r.status === 'completed').length;
  const missingDepartures = filteredAttendance.filter((r) => r.status === 'missing_departure').length;
  const correctedByManager = filteredAttendance.filter((r) => !!r.managerCorrection).length;

  const handleExportCsv = () => {
    const csvRows = [
      ['Date', 'Worker Name', 'Worker Ref', 'Site', 'Arrival Time', 'Arrival Method', 'Departure Time', 'Status', 'Manager Correction Reason'],
      ...filteredAttendance.map((rec) => {
        const worker = workers.find((w) => w.id === rec.workerId);
        const site = sites.find((s) => s.id === rec.siteId);
        return [
          rec.date,
          `"${worker?.name || ''}"`,
          worker?.workerRef || '',
          `"${site?.name || ''}"`,
          rec.arrivalTime || '',
          rec.arrivalMethod || '',
          rec.departureTime || '',
          rec.status,
          `"${rec.managerCorrection?.reason || ''}"`,
        ];
      }),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `klockit_attendance_report_${datePreset}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Complete', 'CSV attendance record downloaded successfully.', 'success');
  };

  const handleGeneratePdf = (dateToGenerate = selectedPdfDate) => {
    setIsGeneratingPdf(true);
    try {
      generateDailyAttendancePdf({
        date: dateToGenerate,
        organisation,
        attendanceRecords: attendance,
        workers,
        sites,
        workSessions,
      });
      showToast('PDF Downloaded', `Daily summary report for ${dateToGenerate} downloaded.`, 'success');
      setIsPdfModalOpen(false);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      showToast('Export Error', 'Failed to generate PDF document.', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div id="attendance-history-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Attendance & Presence History
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 font-mono">
              Audit-Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historic presence logs, verified arrival/departure timestamps, and administrative corrections.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            id="download-daily-pdf-btn"
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Daily Summary PDF</span>
          </button>
          <button
            id="export-csv-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Preset Period Buttons */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Period:</span>
          </span>
          {[
            { id: 'today', label: 'Today (14 Sep)' },
            { id: 'this_week', label: 'This Week' },
            { id: 'last_week', label: 'Last Week' },
            { id: 'all', label: 'All Records' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setDatePreset(preset.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                datePreset === preset.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Record Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5"
          >
            <option value="all">All Records</option>
            <option value="completed">Completed Shifts Only</option>
            <option value="missing">Missing Departures</option>
            <option value="corrected">Manager Corrected Records</option>
          </select>
        </div>
      </div>

      {/* Operational Summary Strip (Brief Section 21: Useful attendance summary without surveillance) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Total Records in Period</div>
          <div className="text-2xl font-black font-mono text-slate-900">{totalRecords}</div>
          <p className="text-[10px] text-slate-400 mt-1">Logged presence entries</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-blue-700 font-semibold mb-1">Completed Shifts</div>
          <div className="text-2xl font-black font-mono text-blue-700">{completedCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Both arrival & departure logged</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-rose-700 font-semibold mb-1">Missing Departures</div>
          <div className="text-2xl font-black font-mono text-rose-700">{missingDepartures}</div>
          <p className="text-[10px] text-slate-400 mt-1">Unclosed attendance sessions</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-indigo-700 font-semibold mb-1">Manager Corrected</div>
          <div className="text-2xl font-black font-mono text-indigo-700">{correctedByManager}</div>
          <p className="text-[10px] text-slate-400 mt-1">Adjusted with separate audit time</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-4 py-3.5">Worker</th>
                <th className="px-4 py-3.5">Site Location</th>
                <th className="px-4 py-3.5">Arrival</th>
                <th className="px-4 py-3.5">Departure</th>
                <th className="px-4 py-3.5">Record State</th>
                <th className="px-4 py-3.5 text-right">Audit Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No historic attendance records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec) => {
                  const worker = workers.find((w) => w.id === rec.workerId);
                  const site = sites.find((s) => s.id === rec.siteId);
                  const isExpanded = expandedRecordId === rec.id;

                  return (
                    <React.Fragment key={rec.id}>
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                          {rec.date}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => worker && setInspectedWorkerId(worker.id)}
                            className="flex items-center gap-2 hover:text-indigo-600 font-semibold text-slate-800"
                          >
                            <div className={`w-6 h-6 rounded ${worker?.avatarBg} text-white text-[10px] flex items-center justify-center font-bold`}>
                              {worker?.initials}
                            </div>
                            <span>{worker?.name}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{site?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          {rec.arrivalTime ? (
                            <span className="font-bold text-slate-900">
                              {rec.arrivalTime}
                              <span className="text-[10px] text-slate-400 ml-1 font-sans">
                                ({rec.arrivalMethod?.toUpperCase() || 'SCAN'})
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono">
                          {rec.departureTime ? (
                            <span className="font-bold text-slate-900">
                              {rec.departureTime}
                            </span>
                          ) : rec.status === 'missing_departure' ? (
                            <span className="text-rose-600 font-semibold italic">Missing</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              rec.status === 'completed'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : rec.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rec.status === 'missing_departure'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {rec.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-semibold px-2 py-1 rounded hover:bg-slate-100"
                          >
                            <span>{rec.managerCorrection ? 'Correction Log' : 'Details'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Audit Log Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">
                                  Record ID: <span className="font-mono font-normal text-slate-500">{rec.id}</span>
                                </span>
                                {rec.managerCorrection && (
                                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                                    Administrative Correction Applied
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-slate-600">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Effective Arrival</span>
                                  <span className="font-mono font-bold text-slate-800">{rec.arrivalTime || 'None'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Effective Departure</span>
                                  <span className="font-mono font-bold text-slate-800">{rec.departureTime || 'None'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Arrival Verification</span>
                                  <span className="font-medium text-slate-800">
                                    {rec.arrivalMethod === 'qr' ? 'Physical Site QR Scan' : '6-Digit Manual Site Code'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Departure Verification</span>
                                  <span className="font-medium text-slate-800">
                                    {rec.departureMethod === 'manager_entry' ? 'Manager Resolution Entry' : 'Worker Self-Checkout'}
                                  </span>
                                </div>
                              </div>

                              {rec.managerCorrection && (
                                <div className="mt-3 p-3 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-950 space-y-1">
                                  <p className="font-bold text-[11px] text-indigo-900">
                                    Manager Audit Trail:
                                  </p>
                                  <p className="text-[11px] text-indigo-800">
                                    Reason: <strong>{rec.managerCorrection.reason}</strong>
                                  </p>
                                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                                    <span>Corrected by: {rec.managerCorrection.correctedBy}</span>
                                    <span>Resolution Time: {new Date(rec.managerCorrection.correctedAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Summary PDF Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Daily Attendance PDF Report</h3>
                  <p className="text-xs text-slate-300">Official audit-ready workforce presence summary</p>
                </div>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Report Date
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { label: 'Today (14 Sep)', val: '2026-09-14' },
                    { label: 'Yesterday (13 Sep)', val: '2026-09-13' },
                    { label: 'Friday (11 Sep)', val: '2026-09-11' },
                    { label: 'Thursday (10 Sep)', val: '2026-09-10' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setSelectedPdfDate(preset.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedPdfDate === preset.val
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    id="pdf-custom-date"
                    type="date"
                    value={selectedPdfDate}
                    onChange={(e) => setSelectedPdfDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Day Preview Stats */}
              {(() => {
                const daySessions = workSessions.filter((s) => s.date === selectedPdfDate && s.status !== 'cancelled');
                const dayRecords = attendance.filter((r) => r.date === selectedPdfDate);
                const presentCount = dayRecords.filter(
                  (r) => r.status === 'present' || r.status === 'completed' || r.status === 'pending_review'
                ).length;
                const scheduledCount = daySessions.length;
                const compliance = scheduledCount > 0 ? Math.round((presentCount / scheduledCount) * 100) : 100;

                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Summary Preview for {selectedPdfDate}
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 block">Scheduled</span>
                        <span className="text-base font-black text-slate-800">{scheduledCount}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 block">Present</span>
                        <span className="text-base font-black text-emerald-600">{presentCount}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 block">Compliance</span>
                        <span className="text-base font-black text-indigo-600">{compliance}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="text-xs text-slate-500 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  The generated PDF includes tabular attendance entries, clock-in/out timestamps, physical QR verification flags, supervisor adjustments, and an authorized sign-off signature block.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="confirm-generate-pdf-btn"
                  type="button"
                  onClick={() => handleGeneratePdf(selectedPdfDate)}
                  disabled={isGeneratingPdf}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Daily PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
