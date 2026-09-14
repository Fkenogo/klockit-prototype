import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { ExceptionInvestigationModal } from '../modals/ExceptionInvestigationModal';
import {
  AlertTriangle,
  AlertOctagon,
  Clock,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Filter,
  Check,
  Building2,
  Calendar,
  Layers,
  History,
  FileCheck2,
  ArrowLeftRight,
  UserCheck,
  XCircle,
  MessageSquare,
} from 'lucide-react';

export const ExceptionsView: React.FC = () => {
  const {
    exceptions,
    workers,
    sites,
    workSessions,
    shiftSwapRequests,
    reviewShiftSwap,
    setInspectedExceptionId,
    inspectedExceptionId,
  } = useKlockit();

  const [activeSection, setActiveSection] = useState<'exceptions' | 'shift_swaps'>('exceptions');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [filterType, setFilterType] = useState<string>('all');
  const [swapFilter, setSwapFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const filteredExceptions = exceptions.filter((exc) => {
    if (filterStatus !== 'all' && exc.status !== filterStatus) return false;
    if (filterType !== 'all' && exc.type !== filterType) return false;
    return true;
  });

  const unresolvedCount = exceptions.filter((e) => e.status === 'unresolved').length;
  const resolvedCount = exceptions.filter((e) => e.status === 'resolved').length;
  const pendingSwapsCount = shiftSwapRequests.filter((s) => s.status === 'pending').length;

  const filteredSwaps = shiftSwapRequests.filter((s) => {
    if (swapFilter !== 'all' && s.status !== swapFilter) return false;
    return true;
  });

  const handleReview = (swapId: string, action: 'approve' | 'deny') => {
    const note = reviewNotes[swapId] || (action === 'approve' ? 'Approved by Operations Manager' : 'Declined by Operations Manager');
    reviewShiftSwap(swapId, action, note);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'missing_departure':
        return {
          label: 'Missing Departure',
          icon: Clock,
          color: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'manual_site_code':
        return {
          label: 'Manual Site Code Review',
          icon: KeyRound,
          color: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'multiple_possible_sessions':
        return {
          label: 'Multiple Matching Shifts',
          icon: Layers,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'unmatched_arrival':
        return {
          label: 'Site / Time Mismatch',
          icon: ShieldAlert,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'open_session_conflict':
        return {
          label: 'Unclosed Session Conflict',
          icon: AlertOctagon,
          color: 'bg-red-50 text-red-800 border-red-200',
        };
      default:
        return {
          label: 'Attention Needed',
          icon: AlertTriangle,
          color: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div id="exceptions-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Section Switcher: Attendance Exceptions vs Shift Swap Proposals */}
      <div className="flex bg-slate-200/80 p-1.5 rounded-2xl text-xs font-bold text-slate-700 max-w-md">
        <button
          id="exceptions-tab-btn"
          onClick={() => setActiveSection('exceptions')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSection === 'exceptions'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'hover:text-slate-900 text-slate-600'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Attendance Exceptions</span>
          {unresolvedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
              {unresolvedCount}
            </span>
          )}
        </button>

        <button
          id="shift-swaps-tab-btn"
          onClick={() => setActiveSection('shift_swaps')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSection === 'shift_swaps'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'hover:text-slate-900 text-slate-600'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 text-indigo-500" />
          <span>Shift Swap Requests</span>
          {pendingSwapsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-black">
              {pendingSwapsCount}
            </span>
          )}
        </button>
      </div>

      {/* SHIFT SWAPS MANAGER SECTION */}
      {activeSection === 'shift_swaps' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Banner */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Employee Shift Swap Requests
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-xs border font-mono ${
                    pendingSwapsCount > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {pendingSwapsCount} Pending Decision
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Review and approve peer-to-peer shift exchanges proposed by workers. Approving a swap automatically updates the planned work roster.
              </p>
            </div>

            {/* Filter Toggle for Swaps */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start md:self-auto">
              <button
                onClick={() => setSwapFilter('pending')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  swapFilter === 'pending'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Pending ({pendingSwapsCount})</span>
              </button>
              <button
                onClick={() => setSwapFilter('approved')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  swapFilter === 'approved'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Approved ({shiftSwapRequests.filter((s) => s.status === 'approved').length})</span>
              </button>
              <button
                onClick={() => setSwapFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  swapFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({shiftSwapRequests.length})
              </button>
            </div>
          </div>

          {/* Swap Requests List */}
          <div className="space-y-3">
            {filteredSwaps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No shift swap requests found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {swapFilter === 'pending'
                    ? 'All employee shift swap proposals have been reviewed and processed.'
                    : 'No shift swap proposals currently match this filter.'}
                </p>
              </div>
            ) : (
              filteredSwaps.map((swap) => {
                const requester = workers.find((w) => w.id === swap.requesterWorkerId);
                const target = workers.find((w) => w.id === swap.targetWorkerId);
                const originalSession = workSessions.find((s) => s.id === swap.originalSessionId);
                const site = sites.find((s) => s.id === originalSession?.siteId);
                const isPending = swap.status === 'pending';

                return (
                  <div
                    key={swap.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                      isPending ? 'border-amber-200 ring-1 ring-amber-400/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            swap.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : swap.status === 'denied'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {swap.status === 'pending' ? 'ACTION REQUIRED: PENDING REVIEW' : swap.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Ref: #{swap.id} · Submitted {swap.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Target Shift Date: <strong className="text-slate-900">{originalSession?.date || 'Scheduled'}</strong></span>
                      </div>
                    </div>

                    {/* Workers Exchange Visual */}
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 text-xs">
                      {/* Requester */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${requester?.avatarBg || 'bg-slate-400'} text-white font-bold text-sm flex items-center justify-center shadow-xs`}>
                          {requester?.initials || '??'}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Proposing Worker
                          </span>
                          <span className="font-bold text-sm text-slate-900">{requester?.name}</span>
                          <p className="text-slate-500 text-[11px]">{requester?.role} ({requester?.workerRef})</p>
                        </div>
                      </div>

                      {/* Direction & Shift Details */}
                      <div className="text-center py-2 px-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-indigo-600 font-bold text-[11px]">
                          <span>Wants to trade shift to</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                        <div className="font-mono text-slate-800 font-bold text-xs">
                          {originalSession?.startTime} – {originalSession?.endTime}
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center justify-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{site?.name}</span>
                        </div>
                      </div>

                      {/* Target Worker */}
                      <div className="flex items-center gap-3 md:justify-end">
                        <div className="text-left md:text-right order-2 md:order-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Nominated Colleague
                          </span>
                          <span className="font-bold text-sm text-slate-900">{target?.name}</span>
                          <p className="text-slate-500 text-[11px]">{target?.role} ({target?.workerRef})</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl ${target?.avatarBg || 'bg-slate-400'} text-white font-bold text-sm flex items-center justify-center shadow-xs order-1 md:order-2`}>
                          {target?.initials || '??'}
                        </div>
                      </div>
                    </div>

                    {/* Stated Reason */}
                    <div className="text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-start gap-2 text-slate-700">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-800 mr-1">Employee Reason:</span>
                        <span className="italic text-slate-600">"{swap.reason}"</span>
                      </div>
                    </div>

                    {/* Manager Decision Controls */}
                    {isPending ? (
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Optional manager note (e.g., Coverage verified with site supervisor)..."
                            value={reviewNotes[swap.id] || ''}
                            onChange={(e) => setReviewNotes({ ...reviewNotes, [swap.id]: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            id={`deny-swap-btn-${swap.id}`}
                            onClick={() => handleReview(swap.id, 'deny')}
                            className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Deny Swap</span>
                          </button>

                          <button
                            id={`approve-swap-btn-${swap.id}`}
                            onClick={() => handleReview(swap.id, 'approve')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Reassign Shift</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-100 text-xs text-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            Decision: <strong>{swap.status.toUpperCase()}</strong> · {swap.reviewNote}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Reviewed: {swap.reviewedAt}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ATTENDANCE EXCEPTIONS SECTION */}
      {activeSection === 'exceptions' && (
        <div className="space-y-6">
          {/* Pending Swaps Notification Banner */}
          {pendingSwapsCount > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-indigo-950 block">
                    {pendingSwapsCount} Employee Shift Swap Proposal{pendingSwapsCount > 1 ? 's' : ''} Awaiting Review
                  </span>
                  <span className="text-indigo-800 text-[11px]">
                    Workers have proposed shift trades that require Operations Manager authorization.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('shift_swaps')}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1"
              >
                <span>Review Proposals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Top Banner */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Needs Attention & Exceptions
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-xs border font-mono ${
                    unresolvedCount > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {unresolvedCount} Pending Review
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Situations where Klockit cannot confidently reconcile expected work with recorded presence.
              </p>
            </div>

            {/* Filter Toggle: Unresolved vs Resolved */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start md:self-auto">
              <button
                onClick={() => setFilterStatus('unresolved')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'unresolved'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Unresolved ({unresolvedCount})</span>
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'resolved'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Resolved History ({resolvedCount})</span>
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </div>
          </div>

      {/* Filter by Exception Type */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Type:</span>
        </span>
        {[
          { id: 'all', label: 'All Types' },
          { id: 'missing_departure', label: 'Missing Departures' },
          { id: 'manual_site_code', label: 'Manual Site Codes' },
          { id: 'multiple_possible_sessions', label: 'Split Session Ambiguity' },
          { id: 'unmatched_arrival', label: 'Unexpected Site Check-Ins' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === t.id
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Exception Cards List */}
      <div className="space-y-3">
        {filteredExceptions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">All Attendance Items Reconciled</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No unresolved attendance exceptions require Manager attention in this category.
            </p>
          </div>
        ) : (
          filteredExceptions.map((exc) => {
            const worker = workers.find((w) => w.id === exc.workerId);
            const site = sites.find((s) => s.id === exc.siteId);
            const typeBadge = getTypeBadge(exc.type);
            const Icon = typeBadge.icon;

            return (
              <div
                key={exc.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  exc.status === 'unresolved'
                    ? 'border-amber-200/90 hover:border-amber-300'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${typeBadge.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${typeBadge.color}`}>
                        {typeBadge.label}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {exc.date}
                      </span>
                      {exc.status === 'resolved' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          RESOLVED
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                      {exc.title}
                    </h2>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {exc.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <span className="font-bold">{worker?.name}</span>
                        <span className="font-mono text-slate-400">({worker?.workerRef})</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{site?.name}</span>
                      </span>
                      {exc.evidence.expectedStart && (
                        <>
                          <span>·</span>
                          <span className="text-slate-600">
                            Expected: <strong className="font-mono">{exc.evidence.expectedStart} - {exc.evidence.expectedEnd}</strong>
                          </span>
                        </>
                      )}
                    </div>

                    {exc.resolutionDecision && (
                      <div className="mt-2 text-xs text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60">
                        <strong>Resolution Decision:</strong> {exc.resolutionDecision}
                        {exc.resolvedBy && <span className="text-slate-500"> (by {exc.resolvedBy})</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
                  {exc.status === 'unresolved' ? (
                    <button
                      id={`investigate-btn-${exc.id}`}
                      onClick={() => setInspectedExceptionId(exc.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Investigate & Decide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setInspectedExceptionId(exc.id)}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl"
                    >
                      View Audit Details
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  )}

      {/* Modal Inspector */}
      <ExceptionInvestigationModal />
    </div>
  );
};
