import React, { useState, useRef, useEffect } from 'react';
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
  Search,
  X,
  User,
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
    setInspectedWorkerId,
    setInspectedSiteId,
  } = useKlockit();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const matchingWorkers = q
    ? workers.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.workerRef.toLowerCase().includes(q) ||
          w.role.toLowerCase().includes(q)
      )
    : [];

  const matchingSites = q
    ? sites.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
      )
    : [];

  const hasMatches = matchingWorkers.length > 0 || matchingSites.length > 0;

  const handleSelectWorker = (workerId: string) => {
    setInspectedWorkerId(workerId);
    setActiveManagerTab('workers');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleSelectSite = (siteId: string) => {
    setSelectedSiteFilter(siteId);
    setInspectedSiteId(siteId);
    setActiveManagerTab('sites');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

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

        {/* Center: Global Search Bar + Global Date & Site Filter (when in manager view) */}
        {currentRole === 'manager' && (
          <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md mx-2 sm:mx-4 flex items-center gap-3">
            {/* Global Search Bar */}
            <div ref={searchRef} className="relative flex-1">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  id="global-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search workers or sites..."
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-8.5 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-700/50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim() && (
                <div
                  id="global-search-results"
                  className="absolute left-0 right-0 top-full mt-2 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-100 max-h-96 overflow-y-auto"
                >
                  {hasMatches ? (
                    <div className="divide-y divide-slate-100">
                      {/* Workers section */}
                      {matchingWorkers.length > 0 && (
                        <div className="p-2">
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Workers ({matchingWorkers.length})
                          </div>
                          {matchingWorkers.slice(0, 5).map((w) => (
                            <button
                              key={w.id}
                              onClick={() => handleSelectWorker(w.id)}
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50/80 text-left transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-lg ${w.avatarBg} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}
                                >
                                  {w.initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                                    {w.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate">
                                    {w.role} · <span className="font-mono text-[10px] text-slate-400">{w.workerRef}</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">
                                View Profile →
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Sites section */}
                      {matchingSites.length > 0 && (
                        <div className="p-2">
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Sites ({matchingSites.length})
                          </div>
                          {matchingSites.slice(0, 5).map((s) => (
                            <button
                              key={s.id}
                              onClick={() => handleSelectSite(s.id)}
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50/80 text-left transition-colors group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate">
                                    {s.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate">
                                    Code: <span className="font-mono font-bold text-slate-700">{s.code}</span> · {s.address}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2">
                                View Site →
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No workers or sites match <span className="font-semibold text-slate-800">"{searchQuery}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date Picker on desktop */}
            <div className="hidden xl:flex items-center bg-slate-800/80 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 gap-2 flex-shrink-0">
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
