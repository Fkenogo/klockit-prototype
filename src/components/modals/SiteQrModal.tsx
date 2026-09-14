import React from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { X, Printer, Copy, Check, MapPin, QrCode, Shield } from 'lucide-react';

export const SiteQrModal: React.FC = () => {
  const { siteQrModalSiteId, setSiteQrModalSiteId, sites, showToast } = useKlockit();
  const [copied, setCopied] = React.useState(false);

  if (!siteQrModalSiteId) return null;
  const site = sites.find((s) => s.id === siteQrModalSiteId);
  if (!site) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(site.code);
    setCopied(true);
    showToast('Code Copied', `Site code ${site.code} copied to clipboard`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="site-qr-modal-overlay"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold">Site Presence QR & Placard</h2>
              <p className="text-xs text-slate-400">{site.name}</p>
            </div>
          </div>
          <button
            id="close-site-qr-modal"
            onClick={() => setSiteQrModalSiteId(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Placard Container */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div
            id="printable-site-placard"
            className="border-2 border-slate-900 rounded-2xl p-6 bg-gradient-to-b from-slate-50 to-white text-center shadow-xs flex flex-col items-center"
          >
            {/* Placard Header */}
            <div className="w-full flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Official Work-Presence Station
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{site.name}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{site.address}, {site.city}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs">
                  KLOCKIT
                </span>
              </div>
            </div>

            {/* Simulated High-Res Vector QR Code */}
            <div className="my-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-md inline-block relative group">
              <svg
                viewBox="0 0 200 200"
                className="w-48 h-48 sm:w-56 sm:h-56"
                aria-label="Site presence QR code"
              >
                {/* Background */}
                <rect width="200" height="200" fill="#ffffff" />
                
                {/* QR Finder patterns (Top-left, Top-right, Bottom-left) */}
                <rect x="15" y="15" width="45" height="45" fill="#0f172a" rx="4" />
                <rect x="22" y="22" width="31" height="31" fill="#ffffff" rx="2" />
                <rect x="27" y="27" width="21" height="21" fill="#0f172a" rx="2" />

                <rect x="140" y="15" width="45" height="45" fill="#0f172a" rx="4" />
                <rect x="147" y="22" width="31" height="31" fill="#ffffff" rx="2" />
                <rect x="152" y="27" width="21" height="21" fill="#0f172a" rx="2" />

                <rect x="15" y="140" width="45" height="45" fill="#0f172a" rx="4" />
                <rect x="22" y="147" width="31" height="31" fill="#ffffff" rx="2" />
                <rect x="27" y="152" width="21" height="21" fill="#0f172a" rx="2" />

                {/* Timing patterns */}
                <path d="M 65 37 H 135" stroke="#0f172a" strokeWidth="4" strokeDasharray="6,6" />
                <path d="M 37 65 V 135" stroke="#0f172a" strokeWidth="4" strokeDasharray="6,6" />

                {/* Simulated data matrix cells */}
                <rect x="70" y="20" width="8" height="8" fill="#0f172a" />
                <rect x="85" y="20" width="8" height="8" fill="#0f172a" />
                <rect x="100" y="20" width="8" height="8" fill="#0f172a" />
                <rect x="120" y="20" width="8" height="8" fill="#0f172a" />

                <rect x="70" y="45" width="12" height="8" fill="#0f172a" />
                <rect x="90" y="45" width="8" height="8" fill="#0f172a" />
                <rect x="110" y="45" width="16" height="8" fill="#0f172a" />

                <rect x="70" y="70" width="16" height="16" fill="#0f172a" />
                <rect x="115" y="70" width="16" height="8" fill="#0f172a" />
                <rect x="145" y="70" width="8" height="16" fill="#0f172a" />
                <rect x="170" y="70" width="15" height="8" fill="#0f172a" />

                {/* Center Badge with Klockit clock mark */}
                <circle cx="100" cy="100" r="22" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
                <circle cx="100" cy="100" r="17" fill="#4f46e5" />
                <path d="M 100 90 V 100 L 107 104" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

                <rect x="20" y="90" width="8" height="16" fill="#0f172a" />
                <rect x="40" y="95" width="16" height="8" fill="#0f172a" />
                <rect x="20" y="115" width="24" height="8" fill="#0f172a" />

                <rect x="140" y="100" width="12" height="16" fill="#0f172a" />
                <rect x="160" y="95" width="20" height="8" fill="#0f172a" />
                <rect x="150" y="125" width="15" height="10" fill="#0f172a" />

                <rect x="70" y="125" width="14" height="14" fill="#0f172a" />
                <rect x="95" y="130" width="8" height="16" fill="#0f172a" />
                <rect x="115" y="125" width="16" height="10" fill="#0f172a" />

                <rect x="70" y="150" width="10" height="16" fill="#0f172a" />
                <rect x="90" y="160" width="20" height="12" fill="#0f172a" />
                <rect x="120" y="150" width="12" height="15" fill="#0f172a" />
                <rect x="140" y="155" width="18" height="18" fill="#0f172a" />
                <rect x="165" y="165" width="15" height="10" fill="#0f172a" />
              </svg>
            </div>

            {/* Clear Primary Instructions */}
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">
                1. Open Klockit on your mobile device
              </p>
              <p className="text-xs text-slate-600">
                Scan this code on arrival to confirm physical presence directly.
              </p>
            </div>

            {/* Fallback Short 6-Digit Code */}
            <div className="w-full mt-5 pt-4 border-t border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Manual Backup Code (if camera is unavailable)
              </span>
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-xl px-4 py-2 font-mono text-xl font-black text-slate-900 tracking-wider">
                <span>{site.code}</span>
                <button
                  onClick={handleCopyCode}
                  title="Copy fallback code"
                  className="text-slate-500 hover:text-slate-900 p-1"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 italic">
                Note: Manual code check-ins provide weaker presence evidence and require Manager review.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200/70 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Presence Verification Policy</p>
              <p className="text-blue-800 leading-relaxed text-[11px]">
                Scanning this QR verifies that the Worker was physically present at {site.name}. 
                Mount this placard at the primary staff entrance or check-in kiosk.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Site ID: <span className="font-mono text-slate-700">{site.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSiteQrModalSiteId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              Done
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Placard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
