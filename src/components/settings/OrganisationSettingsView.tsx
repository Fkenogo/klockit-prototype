import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import {
  Building2,
  Shield,
  Clock,
  RotateCcw,
  CheckCircle2,
  Sliders,
  HelpCircle,
  MapPin,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const OrganisationSettingsView: React.FC = () => {
  const {
    organisation,
    updateOrganisation,
    resetToSampleData,
    sites,
    workers,
    patterns,
  } = useKlockit();

  const [name, setName] = useState(organisation.name);
  const [industry, setIndustry] = useState(organisation.industry);
  const [timezone, setTimezone] = useState(organisation.timezone);
  const [gracePeriod, setGracePeriod] = useState(organisation.defaultGracePeriodMinutes);
  const [allowManual, setAllowManual] = useState(organisation.allowManualCodeFallback);
  const [requireReview, setRequireReview] = useState(organisation.requireManagerReviewForManualCode);
  const [showSetupTour, setShowSetupTour] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganisation({
      name,
      industry,
      timezone,
      defaultGracePeriodMinutes: Number(gracePeriod),
      allowManualCodeFallback: allowManual,
      requireManagerReviewForManualCode: requireReview,
    });
  };

  return (
    <div id="settings-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Organisation & Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
              Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organisation profile, attendance policies, physical presence protocols, and onboarding sequence.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowSetupTour(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Onboarding Walkthrough</span>
          </button>
          <button
            onClick={resetToSampleData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample Data</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Organisation Profile</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organisation Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sector / Operating Domain</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Primary Operating Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 pt-3">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Presence Verification Policies</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900">Allow 6-Digit Manual Site Code Fallback</span>
                  <p className="text-[11px] text-slate-500">
                    Permits workers to type the site code if their camera lens is unreadable or broken.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowManual}
                  onChange={(e) => setAllowManual(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900">Require Manager Review for Manual Code Arrivals</span>
                  <p className="text-[11px] text-slate-500">
                    Treats typed codes as weaker presence evidence and routes them to "Needs Attention".
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireReview}
                  onChange={(e) => setRequireReview(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expected Arrival Grace Window (Minutes)
                </label>
                <input
                  type="number"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(Number(e.target.value))}
                  className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Minutes before/after scheduled shift start considered normal on-time arrival.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
              >
                Save Organisation Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Right Info: Organisation Health & Hierarchy */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Operating Infrastructure
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Work Sites</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{sites.length} Active</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Workers Enrolled</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{workers.length} Personnel</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Recurring Patterns</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{patterns.length} Templates</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Product Boundary Promise
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Klockit is strictly dedicated to workforce attendance and presence. It deliberately does not track keystrokes, monitor productivity, or perform employee surveillance.
            </p>
          </div>
        </div>
      </div>

      {/* Onboarding Sequence Walkthrough Modal (Brief Section 25) */}
      {showSetupTour && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">How Klockit Establishes an Organisation</h3>
              </div>
              <button
                onClick={() => setShowSetupTour(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Create Work Sites</h4>
                  <p className="text-slate-500 mt-0.5">
                    Establish physical workplaces (e.g. Main Workshop, Harbor Warehouse). Each site receives a unique QR placard and 6-digit fallback code.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Add Workers</h4>
                  <p className="text-slate-500 mt-0.5">
                    Add personnel with unique worker reference IDs, assigned primary base sites, and contact credentials.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Define Recurring Work Patterns</h4>
                  <p className="text-slate-500 mt-0.5">
                    Define expected working days (e.g. Mon–Fri 08:00–17:00). Klockit automatically generates expected Work Sessions.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  ✓
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Normal Operational State</h4>
                  <p className="text-slate-500 mt-0.5">
                    Klockit enters daily operations. Workers scan QR on arrival, record departure at shift end, and Managers triage any presence exceptions.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSetupTour(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
