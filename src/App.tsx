import React from 'react';
import { KlockitProvider, useKlockit } from './context/KlockitContext';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { TodayAttendanceView } from './components/dashboard/TodayAttendanceView';
import { WorkPlanningView } from './components/planning/WorkPlanningView';
import { WorkersView } from './components/workers/WorkersView';
import { SitesView } from './components/sites/SitesView';
import { ExceptionsView } from './components/exceptions/ExceptionsView';
import { AttendanceHistoryView } from './components/history/AttendanceHistoryView';
import { OrganisationSettingsView } from './components/settings/OrganisationSettingsView';
import { WorkerWorkspace } from './components/worker-portal/WorkerWorkspace';
import { OperatorExperience } from './components/operator/OperatorExperience';
import { OperatorProvider } from './context/OperatorContext';
import { PrototypeControls } from './components/prototype/PrototypeControls';
import { SiteQrModal } from './components/modals/SiteQrModal';
import { WorkerProfileModal } from './components/modals/WorkerProfileModal';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    currentRole,
    activeManagerTab,
    toasts,
    dismissToast,
  } = useKlockit();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <Header />

      {/* Main Content Area */}
      {currentRole === 'manager' ? (
        <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
          {/* Navigation Sidebar on Desktop / Top Bar */}
          <Navigation />

          {/* Main Dashboard Canvas */}
          <main className="flex-1 min-w-0">
            {activeManagerTab === 'today' && <TodayAttendanceView />}
            {activeManagerTab === 'planning' && <WorkPlanningView />}
            {activeManagerTab === 'workers' && <WorkersView />}
            {activeManagerTab === 'sites' && <SitesView />}
            {activeManagerTab === 'exceptions' && <ExceptionsView />}
            {activeManagerTab === 'history' && <AttendanceHistoryView />}
            {activeManagerTab === 'settings' && <OrganisationSettingsView />}
          </main>
        </div>
      ) : currentRole === 'operator' ? (
        /* Klockit Operator control plane — internal platform administration */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <OperatorProvider>
            <OperatorExperience />
          </OperatorProvider>
        </main>
      ) : (
        /* Worker Dedicated Attendance Space */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <WorkerWorkspace />
        </main>
      )}

      {/* Global Modals (Manager / Worker product surfaces) */}
      <SiteQrModal />

      <WorkerProfileModal />

      {/* Prototype-only controls — clearly separated from the product UI */}
      <PrototypeControls />

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {(toasts || []).map((toastItem) => (
          <div
            key={toastItem.id}
            className="pointer-events-auto p-4 rounded-2xl shadow-xl border border-slate-200/80 bg-white flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200"
          >
            {toastItem.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
            {toastItem.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />}
            {toastItem.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
            {toastItem.type === 'info' && <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />}
            <div className="space-y-0.5 flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900">{toastItem.title}</h4>
              <p className="text-xs text-slate-600 break-words">{toastItem.message}</p>
            </div>
            <button
              onClick={() => dismissToast?.(toastItem.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <KlockitProvider>
      <MainLayout />
    </KlockitProvider>
  );
}
