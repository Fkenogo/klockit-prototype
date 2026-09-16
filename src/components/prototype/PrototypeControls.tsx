import React, { useState } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import {
  FlaskConical,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Smartphone,
  Server,
  RotateCcw,
  Info,
} from 'lucide-react';

/**
 * Prototype Controls
 * ------------------
 * These controls exist only to make the prototype explorable. They are NOT part
 * of the Klockit product experience, so they are deliberately kept out of the
 * product header, navigation and settings screens, and are grouped into a single
 * clearly-labelled dock instead.
 *
 * Everything here would disappear in a real deployment:
 *  - switching between the Manager, Worker and Operator experiences
 *  - choosing which Worker identity the Worker app is being viewed as
 *  - restoring the sample organisation data
 */
export const PrototypeControls: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    workers,
    selectedWorkerId,
    setSelectedWorkerId,
    resetToSampleData,
  } = useKlockit();

  const [isOpen, setIsOpen] = useState(true);

  const contexts: Array<{
    id: 'manager' | 'worker' | 'operator';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'manager', label: 'Manager', icon: UserCheck },
    { id: 'worker', label: 'Worker', icon: Smartphone },
    { id: 'operator', label: 'Operator', icon: Server },
  ];

  return (
    <div
      id="prototype-controls"
      className="fixed bottom-4 left-4 z-40 w-72 bg-slate-900/95 backdrop-blur text-white rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 border-b border-slate-700/80 hover:bg-slate-800/60 transition-colors"
      >
        <span className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold tracking-tight">Prototype controls</span>
        </span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-3.5 space-y-3.5">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Not part of the product. Used to move between the three Klockit experiences while reviewing this
            prototype.
          </p>

          {/* Experience switcher */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Experience
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-800 rounded-xl p-1">
              {contexts.map((ctx) => {
                const Icon = ctx.icon;
                const isActive = currentRole === ctx.id;
                return (
                  <button
                    key={ctx.id}
                    id={`prototype-context-${ctx.id}`}
                    onClick={() => setCurrentRole(ctx.id)}
                    className={`flex flex-col items-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{ctx.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Worker identity, only relevant to the Worker experience */}
          <div className={currentRole === 'worker' ? '' : 'opacity-40 pointer-events-none'}>
            <label
              htmlFor="prototype-worker-select"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Worker identity
            </label>
            <select
              id="prototype-worker-select"
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.workerRef})
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <div className="pt-2 border-t border-slate-700/80">
            <button
              id="prototype-reset-btn"
              onClick={resetToSampleData}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset sample data</span>
            </button>
            <p className="mt-1.5 flex items-start gap-1 text-[10px] text-slate-500 leading-relaxed">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Restores the original sample organisation and discards any changes made here.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};