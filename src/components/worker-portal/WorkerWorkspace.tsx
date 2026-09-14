import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import {
  Clock,
  MapPin,
  QrCode,
  KeyRound,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Building2,
  Camera,
  X,
  ChevronRight,
  User,
  ArrowRight,
  AlertOctagon,
} from 'lucide-react';

export const WorkerWorkspace: React.FC = () => {
  const {
    workers,
    sites,
    workSessions,
    attendance,
    exceptions,
    selectedWorkerId,
    setSelectedWorkerId,
    recordWorkerArrival,
    recordWorkerDeparture,
    setCurrentRole,
  } = useKlockit();

  const [activeWorkerTab, setActiveWorkerTab] = useState<'workspace' | 'schedule' | 'history'>('workspace');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showManualCodeModal, setShowManualCodeModal] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [selectedSiteForManual, setSelectedSiteForManual] = useState(sites[0]?.id || 'site-1');

  const worker = workers.find((w) => w.id === selectedWorkerId) || workers[0];
  const normalSite = sites.find((s) => s.id === worker.normalSiteId);

  // Today's scheduled session
  const todaySession = workSessions.find(
    (ws) => ws.workerId === worker.id && ws.date === '2026-09-14' && ws.status !== 'cancelled'
  );
  const sessionSite = sites.find((s) => s.id === (todaySession?.siteId || worker.normalSiteId));

  // Today's attendance record for this worker
  const todayAttendance = attendance.find(
    (a) => a.workerId === worker.id && a.date === '2026-09-14'
  );

  // Unclosed session from yesterday with missing departure
  const missingYesterday = attendance.find(
    (a) => a.workerId === worker.id && a.status === 'missing_departure'
  );

  // Filter upcoming shifts for this worker
  const workerUpcoming = workSessions
    .filter((ws) => ws.workerId === worker.id && ws.date >= '2026-09-14' && ws.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date));

  // Distinct presence states
  const isPresent = todayAttendance?.status === 'present';
  const isPendingReview = todayAttendance?.status === 'pending_review';
  const isCompleted = todayAttendance?.status === 'completed';

  // Worker's history
  const workerHistory = attendance
    .filter((a) => a.workerId === worker.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleSimulateQrScan = (targetSiteId: string) => {
    recordWorkerArrival(worker.id, targetSiteId, 'qr');
    setShowScannerModal(false);
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    recordWorkerArrival(worker.id, selectedSiteForManual, 'manual_code', manualCodeInput.trim());
    setShowManualCodeModal(false);
    setManualCodeInput('');
  };

  const handleDeparture = () => {
    recordWorkerDeparture(worker.id);
  };

  return (
    <div id="worker-workspace-container" className="max-w-xl mx-auto space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Worker Greeting & Persistent Context Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl ${worker.avatarBg} text-white font-black text-base flex items-center justify-center shadow-sm`}>
            {worker.initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-base">{worker.name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                {worker.workerRef}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>{worker.role}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <MapPin className="w-3 h-3 text-indigo-600" />
                {normalSite?.name}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            Prototype Demo
          </span>
          <button
            onClick={() => setCurrentRole('manager')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 transition-colors"
            title="Switch back to Manager Workspace in this interactive prototype"
          >
            Exit to Manager
          </button>
        </div>
      </div>

      {/* Navigation tabs for Worker: simple 3 tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold text-slate-600">
        <button
          id="worker-tab-action"
          onClick={() => setActiveWorkerTab('workspace')}
          className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
            activeWorkerTab === 'workspace'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          Work Presence
        </button>
        <button
          id="worker-tab-schedule"
          onClick={() => setActiveWorkerTab('schedule')}
          className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
            activeWorkerTab === 'schedule'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          My Schedule
        </button>
        <button
          id="worker-tab-history"
          onClick={() => setActiveWorkerTab('history')}
          className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
            activeWorkerTab === 'history'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'hover:text-slate-900'
          }`}
        >
          My History
        </button>
      </div>

      {/* Warning if unclosed departure from previous session */}
      {missingYesterday && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 text-xs text-amber-950 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>Departure Not Recorded for Previous Shift</span>
          </div>
          <p className="text-amber-900 leading-relaxed text-xs">
            You arrived on <strong>{missingYesterday.date}</strong> at {missingYesterday.arrivalTime}, but no departure was recorded when your shift ended. 
            Your Manager has been notified to verify your actual departure time.
          </p>
        </div>
      )}

      {/* TAB 1: WORKSPACE / ATTENDANCE ACTION */}
      {activeWorkerTab === 'workspace' && (
        <div className="space-y-4">
          {/* Today's Expected Work Status Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                  Today's Expected Work
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  Monday, 14 September 2026
                </h2>
              </div>

              {/* Precise presence badge - NEVER show Presence Confirmed if pending review */}
              {isPendingReview ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Arrival Recorded (Pending Review)
                </span>
              ) : isPresent ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  At Work Now
                </span>
              ) : isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Shift Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Expected Today
                </span>
              )}
            </div>

            {/* Session details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-slate-400 font-medium">Facility Site</span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  {sessionSite?.name || normalSite?.name}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-slate-400 font-medium">Scheduled Hours</span>
                <p className="font-bold text-slate-900 text-sm font-mono flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {todaySession ? `${todaySession.startTime} - ${todaySession.endTime}` : 'Unscheduled'}
                </p>
              </div>
            </div>

            {/* If arrival recorded via 6-digit code and awaiting Manager confirmation */}
            {isPendingReview && (
              <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs space-y-2.5">
                <div className="flex items-center justify-between text-amber-950 font-bold">
                  <span className="flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Arrival recorded — awaiting Manager review
                  </span>
                  <span className="font-mono text-amber-800 font-bold">{todayAttendance?.arrivalTime} Logged</span>
                </div>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  You recorded your arrival using the backup 6-digit site code. Your attendance is not yet confirmed until your Manager verifies physical presence on-site.
                </p>
                <div className="p-2.5 bg-white/80 border border-amber-200 rounded-xl text-amber-950 text-[11px] font-medium flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Manual code logged for {sessionSite?.name || normalSite?.name}. Needs Attention item created for Operations.</span>
                </div>
              </div>
            )}

            {/* If presence confirmed via trusted QR code */}
            {isPresent && (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-950 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Presence Confirmed
                  </span>
                  <span className="font-mono text-emerald-700">{todayAttendance?.arrivalTime} Logged</span>
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Physical presence verified via Site QR scan at {sessionSite?.name || normalSite?.name}.
                </p>
              </div>
            )}

            {/* If completed */}
            {isCompleted && (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between text-blue-950 font-bold">
                  <span>Work Session Concluded</span>
                  <span className="font-mono text-blue-800">
                    {todayAttendance?.arrivalTime} – {todayAttendance?.departureTime}
                  </span>
                </div>
                <p className="text-blue-800 text-[11px]">
                  Thank you! Your attendance record has been finalized.
                </p>
              </div>
            )}

            {/* PRIMARY ACTION BUTTONS */}
            <div className="pt-2">
              {!isPresent && !isPendingReview && !isCompleted && (
                <div className="space-y-3">
                  <button
                    id="worker-scan-qr-btn"
                    onClick={() => setShowScannerModal(true)}
                    className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-2xl font-black text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2.5 transition-all"
                  >
                    <QrCode className="w-5 h-5" />
                    <span>Scan Site QR to Record Arrival</span>
                  </button>

                  <button
                    id="worker-manual-code-btn"
                    onClick={() => setShowManualCodeModal(true)}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Camera unavailable? Enter 6-digit Site Code</span>
                  </button>
                </div>
              )}

              {(isPresent || isPendingReview) && (
                <button
                  id="worker-record-departure-btn"
                  onClick={handleDeparture}
                  className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2.5 transition-all"
                >
                  <LogOut className="w-5 h-5 text-rose-400" />
                  <span>Record Departure (Finish Work)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY SCHEDULE */}
      {activeWorkerTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Upcoming Planned Shifts</h3>
              <span className="text-xs text-slate-400">Next 14 Days</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {workerUpcoming.map((sess) => {
              const sessSite = sites.find((s) => s.id === sess.siteId);
              const isToday = sess.date === '2026-09-14';

              return (
                <div key={sess.id} className="py-3 flex items-center justify-between text-xs gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isToday ? 'text-indigo-600' : 'text-slate-900'}`}>
                        {sess.date}
                      </span>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                          TODAY
                        </span>
                      )}
                      {sess.isExceptional && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                          Adjusted
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {sessSite?.name}
                    </p>
                  </div>

                  <div className="text-right font-mono font-bold text-slate-800">
                    {sess.startTime} – {sess.endTime}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MY HISTORY */}
      {activeWorkerTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Recent Attendance History</h3>
            <span className="text-xs text-slate-400">Verified Presence Logs</span>
          </div>

          <div className="divide-y divide-slate-100">
            {workerHistory.map((rec) => {
              const site = sites.find((s) => s.id === rec.siteId);
              return (
                <div key={rec.id} className="py-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{rec.date}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rec.status === 'completed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : rec.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rec.status === 'pending_review'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : rec.status === 'missing_departure'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rec.status === 'pending_review'
                        ? 'PENDING REVIEW'
                        : rec.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="text-slate-500 flex items-center justify-between text-[11px]">
                    <span>Site: {site?.name}</span>
                    <span className="font-mono">
                      Arrival: <strong className="text-slate-800">{rec.arrivalTime || '—'}</strong>
                      {' · '}
                      Departure: <strong className="text-slate-800">{rec.departureTime || '—'}</strong>
                    </span>
                  </div>

                  {rec.managerCorrection && (
                    <p className="text-[10px] text-indigo-600 mt-1">
                      Manager Verified: {rec.managerCorrection.reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive QR Scanner Simulator Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden text-white p-6 text-center space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Camera QR Scanner
              </span>
              <button
                onClick={() => setShowScannerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scanner Viewport Simulation */}
            <div className="relative w-48 h-48 mx-auto bg-slate-950 border-2 border-indigo-500/80 rounded-2xl flex items-center justify-center overflow-hidden">
              <Camera className="w-12 h-12 text-slate-600 animate-pulse" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-bounce"></div>
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-400"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-400"></div>
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-400"></div>
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-400"></div>
            </div>

            <p className="text-xs text-slate-300">
              Point your camera at the physical Klockit placard mounted at your work location.
            </p>

            {/* Quick Simulate Buttons for All Sites */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Simulate Scanning Placard at:
              </span>
              {sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => handleSimulateQrScan(site.id)}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-indigo-600 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <span>{site.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Scan QR →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual 6-Digit Code Fallback Modal */}
      {showManualCodeModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden text-slate-900 p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Enter Site Code</h3>
              </div>
              <button
                onClick={() => setShowManualCodeModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
              <strong>Notice:</strong> When you enter the 6-digit site code manually, Klockit logs your arrival as <em>awaiting Manager review</em>. Your attendance requires manager verification before it is confirmed.
            </div>

            <form onSubmit={handleManualCodeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Facility Site</label>
                <select
                  value={selectedSiteForManual}
                  onChange={(e) => setSelectedSiteForManual(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Placard Code: {s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Site Code (Displayed on Placard)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 482-901"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-center font-mono font-bold text-lg tracking-widest text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualCodeModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Submit Arrival for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
