import React from 'react';
import { useKlockit, ManagerTab } from '../../context/KlockitContext';
import {
  CalendarDays,
  Users,
  MapPin,
  CalendarRange,
  AlertOctagon,
  History,
  Settings,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface NavItem {
  id: ManagerTab;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Navigation: React.FC = () => {
  const { activeManagerTab, setActiveManagerTab, exceptions, organisation, sites } = useKlockit();

  const unresolvedExceptionsCount = exceptions.filter((e) => e.status === 'unresolved').length;
  const activeSiteCount = sites.filter((s) => s.status === 'active').length;

  const navItems: NavItem[] = [
    {
      id: 'today',
      label: 'Today / Attendance',
      sublabel: 'Who was at work',
      icon: CalendarDays,
    },
    {
      id: 'workers',
      label: 'Workers',
      sublabel: 'Team directory & profiles',
      icon: Users,
    },
    {
      id: 'sites',
      label: 'Sites',
      sublabel: 'Locations & QR placards',
      icon: MapPin,
    },
    {
      id: 'planning',
      label: 'Work Planning',
      sublabel: 'Patterns & sessions',
      icon: CalendarRange,
    },
    {
      id: 'exceptions',
      label: 'Needs Attention',
      sublabel: 'Unresolved presence items',
      icon: AlertOctagon,
      badge: unresolvedExceptionsCount,
    },
    {
      id: 'history',
      label: 'History',
      sublabel: 'Audit & presence records',
      icon: History,
    },
    {
      id: 'settings',
      label: 'Organisation',
      sublabel: 'Settings & setup tour',
      icon: Settings,
    },
  ];

  return (
    <nav
      id="klockit-sidebar-nav"
      aria-label="Main manager navigation"
      className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 min-h-[calc(100vh-4rem)]"
    >
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Work Presence Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeManagerTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveManagerTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-900 font-semibold shadow-xs border border-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs leading-tight truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">{item.sublabel}</div>
                </div>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  id={`nav-badge-${item.id}`}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer info card */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-800">Record integrity</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            What a Worker records at arrival and departure is kept as evidence. Manager corrections are appended
            separately with a reason and are never substituted for the original record.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>
              {activeSiteCount} Active Site{activeSiteCount === 1 ? '' : 's'}
            </span>
            <span>Saved on this device</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
