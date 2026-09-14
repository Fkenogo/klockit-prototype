import React from 'react';
import { useKlockit } from '../../context/KlockitContext';
import {
  Clock,
  Building2,
  AlertTriangle,
  UserCheck,
  Smartphone,
  RotateCcw,
  Calendar,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    organisation,
    currentRole,
    setCurrentRole,
    workers,
    selectedWorkerId,
    setSelectedWorkerId,
    exceptions,
    setActiveManagerTab,
    selectedDate,
    setSelectedDate,
    resetToSampleData,
    sites,
    selectedSiteFilter,
    setSelectedSiteFilter,
  } = useKlockit();

  const unresolvedCount = exceptions.filter((e) => e.status === 'unresolved').length;
  const activeWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];

  return (
    <header id="klockit-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Product Promise */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-950/50 flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Klockit</span>
              <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
                Work Presence
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate hidden md:block">
              {organisation.name} · <span className="text-slate-300 italic">“Know who was at work each day”</span>
            </p>
          </div>
        </div>

        {/* Center: Global Date & Site Filter (when in manager view) */}
        {currentRole === 'manager' && (
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center bg-slate-800/80 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <input
                id="header-date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-0 text-slate-200 text-xs focus:ring-0 focus:outline-none cursor-pointer"
              />
              {selectedDate === '2026-09-14' && (
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Today
                </span>
              )}
            </div>

            <div className="flex items-center bg-slate-800/80 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="header-site-select"
                value={selectedSiteFilter}
                onChange={(e) => setSelectedSiteFilter(e.target.value)}
                aria-label="Filter attendance by site"
                className="bg-transparent border-0 text-slate-200 text-xs focus:ring-0 focus:outline-none cursor-pointer pr-4"
              >
                <option value="all" className="bg-slate-900 text-white">All Sites ({sites.length})</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Right: Needs Attention pill, Reset data, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Needs Attention Badge (when in Manager view) */}
          {currentRole === 'manager' && (
            <button
              id="header-exceptions-pill"
              onClick={() => setActiveManagerTab('exceptions')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                unresolvedCount > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${unresolvedCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Needs Attention</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                unresolvedCount > 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}>
                {unresolvedCount}
              </span>
            </button>
          )}

          {/* Reset Demo Data */}
          <button
            id="header-reset-btn"
            onClick={resetToSampleData}
            title="Reset to initial realistic sample data"
            aria-label="Reset to sample data"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Role Switcher Toggle: Manager vs Worker */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            <button
              id="role-manager-btn"
              onClick={() => setCurrentRole('manager')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                currentRole === 'manager'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Manager</span>
            </button>
            <button
              id="role-worker-btn"
              onClick={() => setCurrentRole('worker')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                currentRole === 'worker'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Worker App</span>
            </button>
          </div>

          {/* If in Worker view, worker switcher dropdown */}
          {currentRole === 'worker' && (
            <div className="relative flex items-center">
              <label htmlFor="header-worker-select" className="sr-only">Switch active worker</label>
              <select
                id="header-worker-select"
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="bg-slate-800 border border-emerald-500/50 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
