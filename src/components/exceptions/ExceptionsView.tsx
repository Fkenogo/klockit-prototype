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
  Building2,
  Calendar,
  Layers,
  FileCheck2,
} from 'lucide-react';

export const ExceptionsView: React.FC = () => {
  const {
    exceptions,
    workers,
    sites,
    setInspectedExceptionId,
  } = useKlockit();

  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredExceptions = exceptions.filter((exc) => {
    if (filterStatus !== 'all' && exc.status !== filterStatus) return false;
    if (filterType !== 'all' && exc.type !== filterType) return false;
    return true;
  });

  const unresolvedCount = exceptions.filter((e) => e.status === 'unresolved').length;
  const resolvedCount = exceptions.filter((e) => e.status === 'resolved').length;

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
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Needs Attention & Exceptions
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-xs border ${
                unresolvedCount > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {unresolvedCount} Pending Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile attendance anomalies, missing departures, manual code entries, and site mismatches.
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
            <span>Resolved ({resolvedCount})</span>
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
          <span>Filter by Type:</span>
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
                      View Details
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Inspector */}
      <ExceptionInvestigationModal />
    </div>
  );
};
