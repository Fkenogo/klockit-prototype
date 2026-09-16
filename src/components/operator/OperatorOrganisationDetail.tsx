import React from 'react';
import type { OperatorOrganisation } from '../../types/operator';

export const OperatorOrganisationDetail: React.FC<{
  org: OperatorOrganisation;
  onBack: () => void;
}> = ({ org, onBack }) => {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
        Back to organisation register
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="text-lg font-black text-slate-900">{org.name}</h2>
        <p className="text-xs text-slate-500 mt-1">{org.country} · {org.language} · {org.onboardingState}</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 text-xs text-slate-600">
        <p><strong className="text-slate-900">Sites:</strong> {org.sitesSummary}</p>
        <p><strong className="text-slate-900">Expected work:</strong> {org.sessionsSummary}</p>
        <p><strong className="text-slate-900">Commercial:</strong> {org.planSummary} · {org.commercialState} · review {org.renewalDate}</p>
        <p><strong className="text-slate-900">Capacity:</strong> {org.capacity}</p>
        <p><strong className="text-slate-900">Support:</strong> {org.supportSummary}</p>
        <p><strong className="text-slate-900">Recommended next step:</strong> {org.nextStep}</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Onboarding progress</h3>
        <div className="space-y-2">
          {org.onboardingSteps.map((step) => (
            <div key={step.id} className="flex items-center justify-between text-xs border border-slate-100 rounded-xl px-3 py-2">
              <div>
                <p className="font-semibold text-slate-800">{step.label}</p>
                <p className="text-slate-500">{step.detail}</p>
              </div>
              <span className="font-bold text-slate-600">{step.state.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Recorded changes</h3>
        <ul className="text-xs text-slate-600 space-y-1">
          {org.auditTrail.map((entry) => (
            <li key={entry}>· {entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
