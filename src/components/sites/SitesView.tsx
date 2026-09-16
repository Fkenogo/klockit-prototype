import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { AddSiteModal } from '../modals/AddSiteModal';
import { Site } from '../../types';
import {
  MapPin,
  Plus,
  QrCode,
  Users,
  Building2,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

/**
 * Site lifecycle wording and colours are defined once so that 'retired' is
 * never presented as if it were an error state — a retired site is simply no
 * longer in use, and is kept so historical attendance still resolves to a
 * known place of work.
 */
const SITE_STATUS_LABEL: Record<Site['status'], string> = {
  active: 'Active',
  suspended: 'Suspended',
  retired: 'Retired',
};

const SITE_STATUS_BADGE: Record<Site['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  suspended: 'bg-amber-50 text-amber-800 border-amber-200',
  retired: 'bg-slate-100 text-slate-600 border-slate-300',
};

export const SitesView: React.FC = () => {
  const {
    sites,
    workers,
    workSessions,
    attendance,
    setSiteQrModalSiteId,
    setInspectedWorkerId,
    inspectedSiteId,
    setInspectedSiteId,
    setActiveManagerTab,
    setSelectedSiteFilter,
    updateSite,
  } = useKlockit();

  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || 'site-1');
  const [lifecycleFilter, setLifecycleFilter] = useState<'all' | Site['status']>('all');

  // Global search deep-link: honour a requested Site, then release the request.
  React.useEffect(() => {
    if (inspectedSiteId && sites.some((s) => s.id === inspectedSiteId)) {
      setSelectedSiteId(inspectedSiteId);
      setLifecycleFilter('all');
      setInspectedSiteId(null);
    }
  }, [inspectedSiteId]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleSites = sites.filter(
    (s) => lifecycleFilter === 'all' || s.status === lifecycleFilter
  );
  const activeSiteCount = sites.filter((s) => s.status === 'active').length;

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Workers normally assigned to this site
  const assignedWorkers = workers.filter((w) => w.normalSiteId === selectedSite?.id);

  // Today's attendance at this site
  const siteTodayAttendance = attendance.filter(
    (a) => a.siteId === selectedSite?.id && a.date === '2026-09-14'
  );

  const currentlyPresentCount = siteTodayAttendance.filter((a) => a.status === 'present').length;

  return (
    <div id="sites-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Work Sites & Stations</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 font-mono">
              {activeSiteCount} Active · {sites.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Physical presence locations with designated QR check-in placards and 6-digit fallback codes.
          </p>
        </div>

        <button
          id="create-site-btn"
          onClick={() => setIsAddSiteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Site</span>
        </button>
      </div>

      {/* Lifecycle filter — a retired site stays visible so historical records resolve */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Site lifecycle</span>
        {(['all', 'active', 'suspended', 'retired'] as const).map((option) => {
          const isOn = lifecycleFilter === option;
          const count =
            option === 'all' ? sites.length : sites.filter((s) => s.status === option).length;
          return (
            <button
              key={option}
              id={`site-lifecycle-filter-${option}`}
              onClick={() => setLifecycleFilter(option)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                isOn
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {option === 'all' ? 'All Sites' : SITE_STATUS_LABEL[option]} · {count}
            </button>
          );
        })}
      </div>

      {/* Sites Card Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleSites.map((site) => {
          const isSelected = selectedSite?.id === site.id;
          const assignedCount = workers.filter((w) => w.normalSiteId === site.id).length;
          const presentAtSite = attendance.filter(
            (a) => a.siteId === site.id && a.date === '2026-09-14' && a.status === 'present'
          ).length;

          return (
            <div
              key={site.id}
              onClick={() => setSelectedSiteId(site.id)}
              className={`rounded-2xl p-5 border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg ring-2 ring-indigo-500'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm leading-tight">{site.name}</h2>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                      {site.city}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-slate-800 text-indigo-300 border border-slate-700' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {site.code}
                </span>
              </div>

              <div className="mb-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSelected
                      ? 'bg-slate-800/80 text-slate-200 border-slate-700'
                      : SITE_STATUS_BADGE[site.status]
                  }`}
                >
                  {SITE_STATUS_LABEL[site.status]}
                </span>
              </div>

              <div className="space-y-1.5 py-3 border-y border-slate-200/20 text-xs">
                <div className="flex justify-between">
                  <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>Assigned Workforce:</span>
                  <span className="font-semibold">{assignedCount} Workers</span>
                </div>
                <div className="flex justify-between">
                  <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>Present Right Now:</span>
                  <span className={`font-bold ${presentAtSite > 0 ? (isSelected ? 'text-emerald-400' : 'text-emerald-600') : ''}`}>
                    {presentAtSite} On-Site
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-1 flex items-center justify-between">
                <button
                  id={`open-site-qr-btn-${site.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSiteQrModalSiteId(site.id);
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Site QR Placard</span>
                </button>

                <span className={`text-[10px] ${isSelected ? 'text-indigo-300' : 'text-indigo-600'} font-semibold`}>
                  View Details →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Site Detail View */}
      {selectedSite && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Site Overview Header */}
          <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{selectedSite.name}</h2>
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-xs font-bold">
                  Code: {selectedSite.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${SITE_STATUS_BADGE[selectedSite.status]}`}>
                  {SITE_STATUS_LABEL[selectedSite.status]}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedSite.address}, {selectedSite.city}
                </span>
                {selectedSite.contactNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {selectedSite.contactNumber}
                  </span>
                )}
              </div>
              {selectedSite.notes && (
                <p className="text-xs text-slate-600 mt-2 max-w-2xl bg-white/80 p-2 rounded-lg border border-slate-200/60">
                  {selectedSite.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setSiteQrModalSiteId(selectedSite.id)}
                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Print / Display QR Placard</span>
              </button>

              <button
                onClick={() => {
                  setSelectedSiteFilter(selectedSite.id);
                  setActiveManagerTab('today');
                }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                <span>Today's Attendance</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              {/* Lifecycle action: retiring keeps the site for historical resolution */}
              <button
                id="site-lifecycle-toggle-btn"
                onClick={() =>
                  updateSite(selectedSite.id, {
                    status: selectedSite.status === 'retired' ? 'active' : 'retired',
                  })
                }
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                <span>
                  {selectedSite.status === 'retired' ? 'Reactivate Site' : 'Retire Site'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Left Column: Assigned Workforce Members */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Assigned Personnel ({assignedWorkers.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">Normal base location</span>
              </div>

              {assignedWorkers.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No workers currently assigned to this base site.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {assignedWorkers.map((w) => (
                    <div
                      key={w.id}
                      className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${w.avatarBg} text-white font-bold text-xs flex items-center justify-center`}>
                          {w.initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{w.name}</p>
                          <p className="text-[11px] text-slate-500">{w.role} · {w.workerRef}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setInspectedWorkerId(w.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Profile →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Physical Presence QR & Fallback Protocol */}
            <div className="p-6 space-y-4 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Site Presence Evidence Protocol</span>
              </h3>

              {/* Comparison table */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      Method A: Physical Site QR Scan
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Strong Evidence
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Worker physically scans the QR placard at {selectedSite.name}. Attendance aligns with expected work session and directly records active presence without requiring manager intervention.
                  </p>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      Method B: 6-Digit Code ({selectedSite.code})
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Requires Review
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Used if camera is cracked or unreadable. Because entering digits does not prove physical presence at the site, Klockit routes this record to <strong>Needs Attention</strong> for Manager confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddSiteModal
        isOpen={isAddSiteOpen}
        onClose={() => setIsAddSiteOpen(false)}
      />
    </div>
  );
};
