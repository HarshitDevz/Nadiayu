import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  Pill, 
  Activity, 
  Flame, 
  FileCode, 
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { CriticalPatientExtract } from '../../types';
import { motion } from 'motion/react';

interface CriticalAlertsDashboardProps {
  extract: CriticalPatientExtract;
  patientName?: string;
  uhid?: string;
  sourceTitle?: string;
}

export const CriticalAlertsDashboard: React.FC<CriticalAlertsDashboardProps> = ({
  extract,
  patientName = 'Active Patient',
  uhid = 'NO-UHID',
  sourceTitle = 'Ingested Prescription Slip'
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'visual' | 'json'>('visual');

  const totalCriticalMeds = extract.critical_meds.length;
  const totalAccidents = extract.accident_history.length;
  const totalAllergies = extract.allergies.length;
  const totalAlerts = totalCriticalMeds + totalAccidents + totalAllergies;

  const newEntriesCount = 
    extract.critical_meds.filter(m => m.status === 'new entry' || m.status === 'new').length +
    extract.accident_history.filter(a => a.status === 'new entry' || a.status === 'new').length +
    extract.allergies.filter(al => al.status === 'new entry' || al.status === 'new').length;

  const previouslyRecordedCount = totalAlerts - newEntriesCount;

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(extract, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(extract, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nadiayu-critical-alerts-${uhid}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (totalAlerts === 0) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Life-Critical Contraindications Found</h4>
        <p className="text-sm text-slate-700">
          Only routine non-hazardous prescriptions were detected (vitamins/mild antipyretics). Life-critical safety filters passed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* SUMMARY BANNER: ⚠️ Critical Patient Alerts Found */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border-2 border-red-300 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/30 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-red-950 tracking-tight">
                  ⚠️ Critical Patient Alerts Found
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-sm font-black mono shadow-2xs">
                  {totalAlerts} Total Alerts
                </span>
              </div>
              <p className="text-sm text-red-800/90 font-medium mt-0.5">
                AI extracted life-critical entities for <strong className="text-red-950">{patientName}</strong> ({uhid}). Routine medications filtered out.
              </p>
            </div>
          </div>

          {/* Quick Metrics & View Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-red-200 text-sm font-bold mono">
              {newEntriesCount > 0 && (
                <span className="text-red-600 font-extrabold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
                  {newEntriesCount} NEW
                </span>
              )}
              {newEntriesCount > 0 && previouslyRecordedCount > 0 && <span className="text-slate-300">|</span>}
              {previouslyRecordedCount > 0 && (
                <span className="text-slate-600 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {previouslyRecordedCount} Recorded
                </span>
              )}
            </div>

            <div className="flex items-center p-0.5 bg-white/90 border border-slate-200 rounded-xl text-sm font-bold">
              <button
                onClick={() => setActiveView('visual')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeView === 'visual' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setActiveView('json')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  activeView === 'json' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-3 h-3" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* VISUAL DASHBOARD VIEW */}
      {activeView === 'visual' ? (
        <div className="space-y-4">
          
          {/* SECTION 1: CRITICAL MEDICATIONS */}
          {totalCriticalMeds > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <Pill className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm sm:text-sm font-extrabold text-[#0F172A] uppercase tracking-wide">
                    1. Life-Critical &amp; Harmful Medicines ({totalCriticalMeds})
                  </h4>
                </div>
                <span className="text-sm text-slate-700 font-medium hidden sm:inline">
                  Anticoagulants &bull; Steroids &bull; Chemo &bull; Opioids &bull; High-Risk
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {extract.critical_meds.map((med, idx) => {
                  const isNew = med.status === 'new entry' || med.status === 'new';
                  return (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isNew 
                          ? 'bg-red-50/70 border-red-300 ring-1 ring-red-400/20' 
                          : 'bg-slate-50/80 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-black ${isNew ? 'text-red-950 font-bold' : 'text-slate-800'}`}>
                              {med.drug}
                            </span>
                            {med.category && (
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-sm font-bold text-slate-600 uppercase mono">
                                {med.category}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                            <span>Dose: <strong className="text-slate-900">{med.dose}</strong></span>
                            <span>&bull;</span>
                            <span>Freq: <strong className="text-slate-900">{med.frequency}</strong></span>
                          </div>
                        </div>

                        {/* STATUS BADGE */}
                        {isNew ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white text-sm font-black tracking-wider uppercase mono shadow-2xs shrink-0 animate-pulse">
                            <Flame className="w-3 h-3" />
                            NEW ENTRY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/80 text-slate-700 text-sm font-bold mono shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Previously Recorded
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: ACCIDENT & INJURY HISTORY */}
          {totalAccidents > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm sm:text-sm font-extrabold text-[#0F172A] uppercase tracking-wide">
                    2. Accident &amp; Injury History ({totalAccidents})
                  </h4>
                </div>
                <span className="text-sm text-slate-700 font-medium hidden sm:inline">
                  Fracture &bull; Head Injury &bull; Surgery &bull; Clinical History
                </span>
              </div>

              <div className="space-y-2.5">
                {extract.accident_history.map((acc, idx) => {
                  const isNew = acc.status === 'new entry' || acc.status === 'new';
                  return (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        isNew 
                          ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/20' 
                          : 'bg-slate-50/80 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                        <span className={`text-sm sm:text-sm ${isNew ? 'font-bold text-amber-950' : 'font-medium text-slate-800'}`}>
                          {acc.event}
                        </span>
                      </div>

                      {isNew ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-sm font-black uppercase mono shrink-0">
                          NEW ENTRY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/80 text-slate-700 text-sm font-bold mono shrink-0">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Previously Recorded
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: ALLERGIES & REACTIONS */}
          {totalAllergies > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm sm:text-sm font-extrabold text-[#0F172A] uppercase tracking-wide">
                    3. Documented Hypersensitivities &amp; Allergies ({totalAllergies})
                  </h4>
                </div>
                <span className="text-sm text-slate-700 font-medium hidden sm:inline">
                  Penicillin &bull; Sulfa &bull; NSAIDs &bull; Cephalosporins
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {extract.allergies.map((alg, idx) => {
                  const isNew = alg.status === 'new entry' || alg.status === 'new';
                  return (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border ${
                        isNew 
                          ? 'bg-red-50/80 border-red-300 ring-1 ring-red-400/20' 
                          : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className={`text-sm font-black ${isNew ? 'text-red-950' : 'text-slate-800'}`}>
                            {alg.drug}
                          </div>
                          <div className="text-sm text-red-700 font-semibold mt-1">
                            Reaction: {alg.reaction}
                          </div>
                        </div>

                        {isNew ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white text-sm font-black uppercase mono shrink-0 animate-pulse">
                            NEW ENTRY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/80 text-slate-700 text-sm font-bold mono shrink-0">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Previously Recorded
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NOISE FILTERING NOTICE */}
          <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Routine vitamins, fever/cough medications, and non-hazardous antacids were ignored per safety protocol.</span>
            </div>
            <span className="text-sm text-slate-600 font-mono hidden md:inline">Noise Filter: Active</span>
          </div>

        </div>
      ) : (
        /* JSON INSPECTOR VIEW */
        <div className="space-y-3">
          <div className="p-4 bg-slate-950 text-slate-100 rounded-2xl font-mono text-sm overflow-x-auto shadow-inner border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-600 text-sm">
              <span>// Extracted JSON Schema for EMR/FHIR Ingestion</span>
              <span>application/json</span>
            </div>
            <pre className="pt-3 leading-relaxed text-emerald-400">
              {JSON.stringify(extract, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS: EXPORT / DOWNLOAD / COPY */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 text-sm">
        <div className="text-slate-700 font-medium">
          Source: <span className="text-[#0F172A] font-bold">{sourceTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJSON}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download / Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
