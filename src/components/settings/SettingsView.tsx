import React, { useState } from 'react';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Building,
  Coins,
  Percent,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDefaults,
    exportDatabaseJson,
    importDatabaseJson,
    currentUser,
  } = useApp();

  const [formData, setFormData] = useState({
    orgName: settings.orgName,
    cycleYear: settings.cycleYear,
    contributionPerSlot: settings.contributionPerSlot,
    defaultMemberInterestRate: settings.defaultMemberInterestRate,
    defaultNonMemberInterestRate: settings.defaultNonMemberInterestRate,
    penaltyPerMonthLate: settings.penaltyPerMonthLate,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      orgName: formData.orgName,
      cycleYear: Number(formData.cycleYear),
      contributionPerSlot: Number(formData.contributionPerSlot),
      defaultMemberInterestRate: Number(formData.defaultMemberInterestRate),
      defaultNonMemberInterestRate: Number(formData.defaultNonMemberInterestRate),
      penaltyPerMonthLate: Number(formData.penaltyPerMonthLate),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJson(content);
        if (success) {
          setImportStatus('Database successfully restored from backup!');
        } else {
          setImportStatus('Failed to restore database: Invalid backup file format.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to the default seed cooperative state? All custom edits will be replaced.')) {
      resetToDefaults();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cooperative & Paluwagan Rules
            </h3>
            <p className="text-xs text-slate-500">
              Configure base contribution rates, lending interest margins, and cycle calendar
            </p>
          </div>
          {saveSuccess && (
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              <span>Saved Successfully</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Organization / Circle Name
            </label>
            <input
              type="text"
              required
              value={formData.orgName}
              onChange={e => setFormData({ ...formData, orgName: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Active Cycle Year
            </label>
            <input
              type="number"
              required
              min={2020}
              max={2035}
              value={formData.cycleYear}
              onChange={e => setFormData({ ...formData, cycleYear: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contribution Per Slot (₱) *
            </label>
            <input
              type="number"
              required
              min={100}
              step={100}
              value={formData.contributionPerSlot}
              onChange={e => setFormData({ ...formData, contributionPerSlot: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Default: ₱1,000 / month per slot
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Member Loan Interest (% / mo)
            </label>
            <input
              type="number"
              required
              min={0.5}
              step={0.5}
              value={formData.defaultMemberInterestRate}
              onChange={e => setFormData({ ...formData, defaultMemberInterestRate: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Preferential member borrowing rate
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Non-Member Interest (% / mo)
            </label>
            <input
              type="number"
              required
              min={1}
              step={0.5}
              value={formData.defaultNonMemberInterestRate}
              onChange={e => setFormData({ ...formData, defaultNonMemberInterestRate: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              External borrower credit rate
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Late Contribution Penalty (₱ / month)
          </label>
          <input
            type="number"
            required
            min={0}
            value={formData.penaltyPerMonthLate}
            onChange={e => setFormData({ ...formData, penaltyPerMonthLate: Number(e.target.value) })}
            className="w-full max-w-xs px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
          />
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Flat surcharge assessed for contributions made past the monthly cutoff date.
          </span>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#56A0D3] hover:bg-[#438bc0] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save System Rules</span>
          </button>
        </div>
      </form>

      {/* Database Backup & Restore */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Database Backup & Portability
          </h3>
          <p className="text-xs text-slate-500">
            All records persist locally in your browser storage. You can download complete snapshots or restore from previous JSON backups.
          </p>
        </div>

        {importStatus && (
          <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={exportDatabaseJson}
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
          >
            <Download className="h-5 w-5 text-[#2b72a8] mb-1.5" />
            <span className="text-xs font-bold text-slate-900">Export JSON Backup</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Download full snapshot file</span>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white flex flex-col items-center justify-center text-center transition-all cursor-pointer">
            <Upload className="h-5 w-5 text-emerald-600 mb-1.5" />
            <span className="text-xs font-bold text-slate-900">Restore Backup</span>
            <span className="text-[11px] text-slate-500 mt-0.5">Upload .json backup file</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Reset to Seed Data */}
          <button
            onClick={handleResetData}
            className="p-4 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50/50 hover:bg-rose-50 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
          >
            <RotateCcw className="h-5 w-5 text-rose-600 mb-1.5" />
            <span className="text-xs font-bold text-rose-900">Reset to Sample Data</span>
            <span className="text-[11px] text-rose-700 mt-0.5">Restore default seed circle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
