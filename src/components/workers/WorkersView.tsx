import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { AddWorkerModal } from '../modals/AddWorkerModal';
import { Worker } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Building2,
  Calendar,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
} from 'lucide-react';

export const WorkersView: React.FC = () => {
  const {
    workers,
    sites,
    patterns,
    attendance,
    exceptions,
    setInspectedWorkerId,
    setInspectedExceptionId,
    showToast,
  } = useKlockit();

  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Worker['status']>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter workers
  const filteredWorkers = workers.filter((worker) => {
    if (siteFilter !== 'all' && worker.normalSiteId !== siteFilter) return false;
    if (statusFilter !== 'all' && worker.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = worker.name.toLowerCase().includes(q);
      const matchRef = worker.workerRef.toLowerCase().includes(q);
      const matchRole = worker.role.toLowerCase().includes(q);
      if (!matchName && !matchRef && !matchRole) return false;
    }

    return true;
  });

  return (
    <div id="workers-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Workers</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 font-mono">
              {workers.length} Workers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            People who belong to this organisation, their usual Site, and their expected work.
          </p>
        </div>

        <button
          id="add-worker-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Worker</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="workers-search-input"
              type="text"
              placeholder="Search by name, role or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building2 className="w-3.5 h-3.5" />
            <span>Site:</span>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating / Sticky Bulk Action Toolbar */}
      {/* Workers Content (Table or Grid with helpful Empty States) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table id="workers-table" className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Worker</th>
                  <th className="px-4 py-3.5">ID / Reference</th>
                  <th className="px-4 py-3.5">Primary Site</th>
                  <th className="px-4 py-3.5">Schedule Pattern</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Presence</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                          <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {workers.length === 0 ? 'No Workers yet' : 'No Workers match these filters'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                          {workers.length === 0
                            ? 'Add your first Worker with their usual Site and expected work.'
                            : 'No Workers match this search or filter. Try clearing the filters or adding a Worker.'}
                        </p>
                        <div className="mt-4 flex items-center gap-2.5">
                          {workers.length === 0 ? (
                            <button
                              id="empty-state-add-first-worker-btn"
                              onClick={() => setIsAddModalOpen(true)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>Add First Worker</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSearchQuery('');
                                  setSiteFilter('all');
                                  setStatusFilter('all');
                                }}
                                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                              >
                                Reset Filters
                              </button>
                              <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                              >
                                <UserPlus className="w-4 h-4" />
                                <span>Add Worker</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((worker) => {
                    const site = sites.find((s) => s.id === worker.normalSiteId);
                    const pattern = patterns.find((p) => p.id === worker.workPatternId);
                    const activeException = exceptions.find((e) => e.workerId === worker.id && e.status === 'unresolved');
                    const recentAtt = attendance.find((a) => a.workerId === worker.id);

                    return (
                      <tr
                        key={worker.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setInspectedWorkerId(worker.id)}
                            className="flex items-center gap-2.5 text-left group"
                          >
                            <div className={`w-8 h-8 rounded-lg ${worker.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-500 transition-all`}>
                              {worker.initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {worker.name}
                              </div>
                              <div className="text-[11px] text-slate-500">{worker.role}</div>
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-700 font-semibold">
                          {worker.workerRef}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{site?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">
                          <span className="truncate max-w-[150px] block" title={pattern?.name}>
                            {pattern?.name?.split('(')[0] || 'Standard 40h'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              worker.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : worker.status === 'suspended'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-300'
                            }`}
                          >
                            {worker.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {activeException ? (
                            <button
                              onClick={() => setInspectedExceptionId(activeException.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Needs Attention</span>
                            </button>
                          ) : recentAtt?.status === 'present' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              At work
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Off-duty</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setInspectedWorkerId(worker.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="View Worker Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {workers.length === 0 ? 'No Workers yet' : 'No Workers match these filters'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {workers.length === 0
              ? 'Add your first Worker with their usual Site and expected work.'
              : 'No Workers match this search or filter. Try clearing the filters or adding a Worker.'}
          </p>
          <div className="mt-4 flex items-center gap-2.5">
            {workers.length === 0 ? (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add First Worker</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSiteFilter('all');
                    setStatusFilter('all');
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Worker</span>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Workers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map((worker) => {
          const site = sites.find((s) => s.id === worker.normalSiteId);
          const pattern = patterns.find((p) => p.id === worker.workPatternId);
          const activeException = exceptions.find((e) => e.workerId === worker.id && e.status === 'unresolved');
          const recentAtt = attendance.find((a) => a.workerId === worker.id);

          return (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top card row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${worker.avatarBg} text-white font-bold text-sm flex items-center justify-center shadow-xs`}>
                      {worker.initials}
                    </div>
                    <div>
                      <button
                        onClick={() => setInspectedWorkerId(worker.id)}
                        className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors text-left"
                      >
                        {worker.name}
                      </button>
                      <p className="text-xs text-slate-500">{worker.role}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      worker.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : worker.status === 'suspended'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {worker.status.toUpperCase()}
                  </span>
                </div>

                {/* Worker Details List */}
                <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="font-mono text-[11px] font-bold text-slate-500">ID:</span>
                    </span>
                    <span className="font-mono font-semibold text-slate-800">{worker.workerRef}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Normal Site:</span>
                    </span>
                    <span className="font-medium text-slate-800">{site?.name || 'Unassigned'}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pattern:</span>
                    </span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]" title={pattern?.name}>
                      {pattern?.name?.split('(')[0] || 'Standard 40h'}
                    </span>
                  </div>
                </div>

                {/* Exception Warning if any */}
                {activeException && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span className="font-medium truncate text-[11px]">{activeException.title}</span>
                    </div>
                    <button
                      onClick={() => setInspectedExceptionId(activeException.id)}
                      className="text-[10px] font-bold text-amber-800 underline hover:text-amber-950"
                    >
                      Review
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {recentAtt?.status === 'present' ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      At work today
                    </span>
                  ) : (
                    <span>Last active: {recentAtt?.date || 'None'}</span>
                  )}
                </span>

                <button
                  id={`view-worker-profile-btn-${worker.id}`}
                  onClick={() => setInspectedWorkerId(worker.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Profile</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      <AddWorkerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
