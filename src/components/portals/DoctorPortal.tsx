import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Trash2,
  CheckCircle2,
  ClipboardList,
  User,
  FlaskConical
} from 'lucide-react';

interface DrugLine {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const uid = () => Math.random().toString(36).slice(2, 8);

const emptyDrug = (): DrugLine => ({
  id: uid(),
  medicine: '',
  dosage: '',
  frequency: 'OD',
  duration: '5 days',
});

export const DoctorPortal: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [drugs, setDrugs] = useState<DrugLine[]>([emptyDrug()]);
  const [issued, setIssued] = useState<boolean>(false);
  const [lastRecord, setLastRecord] = useState<{ patient: string; drugs: DrugLine[] } | null>(null);

  const addDrug = () => setDrugs(prev => [...prev, emptyDrug()]);
  const removeDrug = (id: string) => setDrugs(prev => prev.filter(d => d.id !== id));
  const updateDrug = (id: string, field: keyof DrugLine, value: string) =>
    setDrugs(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));

  const handleIssue = () => {
    if (!patientName.trim() || drugs.every(d => !d.medicine.trim())) return;
    setLastRecord({ patient: patientName, drugs: drugs.filter(d => d.medicine.trim()) });
    setIssued(true);
  };

  const handleReset = () => {
    setIssued(false);
    setPatientName('');
    setDrugs([emptyDrug()]);
    setLastRecord(null);
  };

  if (issued && lastRecord) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4 gap-6">
        {/* Success Badge */}
        <div className="w-full max-w-lg bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 flex items-start gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-emerald-900 font-extrabold text-base">Digital Prescription Issued!</p>
            <p className="text-emerald-700 text-sm mt-0.5">Transmitted directly to Pharmacist queue</p>
            <p className="text-emerald-600 text-xs font-mono mt-1">RX-{Date.now().toString().slice(-6)} · Just now</p>
          </div>
        </div>

        {/* Issued Record Card */}
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-md overflow-hidden">
          <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm font-bold mono">DIGITAL PRESCRIPTION</span>
            </div>
            <span className="text-emerald-400 text-xs mono font-bold">✓ VERIFIED</span>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center gap-2 text-slate-700 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-900">{lastRecord.patient}</span>
            </div>
            <div className="space-y-2">
              {lastRecord.drugs.map((d, i) => (
                <div key={d.id} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-1.5 py-0.5 shrink-0 mono">Rx{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900">{d.medicine}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{d.dosage} · {d.frequency} · {d.duration}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Issued by: ER Physician (Emergency Desk)</span>
              <span className="font-mono">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
        >
          Issue Another Prescription
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-blue-100 font-bold uppercase tracking-wider">Doctor Portal</p>
            <h2 className="text-lg font-extrabold text-white">Digital Prescription Desk</h2>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Patient Name
            </label>
            <input
              id="doctor-patient-name"
              type="text"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              placeholder="e.g. Mr. Karambir Singh"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5" />
                Medicines & Dosages
              </label>
              <button
                onClick={addDrug}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Line
              </button>
            </div>

            <div className="space-y-2.5">
              {drugs.map((d, i) => (
                <div key={d.id} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs font-bold text-blue-600 w-6 shrink-0">Rx{i + 1}</span>
                  <input
                    type="text"
                    value={d.medicine}
                    onChange={e => updateDrug(d.id, 'medicine', e.target.value)}
                    placeholder="Medicine name"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors min-w-0"
                  />
                  <input
                    type="text"
                    value={d.dosage}
                    onChange={e => updateDrug(d.id, 'dosage', e.target.value)}
                    placeholder="Dose"
                    className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                  <select
                    value={d.frequency}
                    onChange={e => updateDrug(d.id, 'frequency', e.target.value)}
                    className="w-16 bg-white border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                  >
                    {['OD', 'BD', 'TDS', 'QID', 'STAT', 'SOS'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  {drugs.length > 1 && (
                    <button
                      onClick={() => removeDrug(d.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Issue Button */}
          <button
            id="issue-prescription-btn"
            onClick={handleIssue}
            disabled={!patientName.trim() || drugs.every(d => !d.medicine.trim())}
            className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all duration-200 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            Issue Digital Prescription
          </button>
        </div>
      </div>
    </div>
  );
};
