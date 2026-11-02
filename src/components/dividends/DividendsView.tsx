import React, { useState, useEffect } from 'react';
import {
  PieChart,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Coins,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Payout, PayoutStatus } from '../../types';
import { formatCurrency, calculateMemberDividend } from '../../utils/calculations';
import { exportDividendsToExcel } from '../../utils/exportReports';
import { Modal } from '../common/Modal';

export const DividendsView: React.FC = () => {
  const {
    payouts,
    members,
    contributions,
    loans,
    settings,
    currentUser,
    calculateAndGeneratePayouts,
    updatePayoutStatus,
    financialSummary,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'disbursed' | 'claimed'>('all');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedExtraInterest, setSimulatedExtraInterest] = useState<number>(10000);

  // Disburse Form State
  const [disburseMethod, setDisburseMethod] = useState<PaymentMethod>('GCash');
  const [disburseRefNo, setDisburseRefNo] = useState('');
  const [disburseNotes, setDisburseNotes] = useState('');

  // Automatically calculate initial payouts if empty
  useEffect(() => {
    if (payouts.length === 0) {
      calculateAndGeneratePayouts(settings.cycleYear);
    }
  }, [payouts.length, calculateAndGeneratePayouts, settings.cycleYear]);

  const filteredPayouts = payouts.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const openDisburseModal = (payout: Payout) => {
    setSelectedPayout(payout);
    const member = members.find(m => m.id === payout.memberId);
    setDisburseMethod(member?.paymentDetails.method || 'GCash');
    setDisburseRefNo('');
    setDisburseNotes('');
    setIsDisburseModalOpen(true);
  };

  const handleDisburseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;

    updatePayoutStatus(selectedPayout.id, 'disbursed', {
      paymentMethod: disburseMethod,
      referenceNo: disburseRefNo,
      notes: disburseNotes,
    });

    setIsDisburseModalOpen(false);
  };

  const handleMarkClaimed = (payout: Payout) => {
    updatePayoutStatus(payout.id, 'claimed');
  };

  const openVoucherModal = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsVoucherModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Dividend & Payout Management
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="font-semibold text-purple-700">Dividend = (Slots ÷ Total Slots) × Interest Pool</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-emerald-700">Payout = Contributions + Dividend</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          >
            {showSimulator ? 'Hide Simulator' : 'Growth Simulator'}
          </button>
          <button
            onClick={() => calculateAndGeneratePayouts(settings.cycleYear)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#56A0D3] text-white hover:bg-[#438bc0] transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Recalculate Pool</span>
          </button>
        </div>
      </div>

      {/* Interactive Growth Simulator Card */}
      {showSimulator && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-900">
                Simulate Additional Loan Interest Collections
              </span>
              <p className="text-[11px] text-slate-500">
                Model impact of future interest revenue on slot dividends
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[5000, 10000, 20000, 35000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setSimulatedExtraInterest(amt)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg cursor-pointer transition-colors tabular-nums ${
                    simulatedExtraInterest === amt
                      ? 'bg-[#56A0D3] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  +₱{(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={50000}
              step={1000}
              value={simulatedExtraInterest}
              onChange={e => setSimulatedExtraInterest(Number(e.target.value))}
              className="flex-1 accent-[#56A0D3] cursor-pointer"
            />
            <span className="font-bold text-slate-900 text-sm min-w-[80px] text-right tabular-nums">
              +₱{simulatedExtraInterest.toLocaleString()}
            </span>
          </div>

          {/* Simulated Impact Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Simulated Total Interest Pool</span>
              <span className="font-bold tracking-tight text-purple-900 text-sm mt-0.5 block tabular-nums">
                ₱{(financialSummary.totalRevenue + simulatedExtraInterest).toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Simulated Dividend / Slot</span>
              <span className="font-bold tracking-tight text-[#2b72a8] text-sm mt-0.5 block tabular-nums">
                ₱{(
                  (financialSummary.totalRevenue + simulatedExtraInterest) /
                  (financialSummary.totalActiveSlots || 1)
                ).toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <span className="text-emerald-800 block text-[11px]">Average Member Yield</span>
              <span className="font-bold tracking-tight text-emerald-900 text-sm mt-0.5 block tabular-nums">
                {(
                  ((financialSummary.totalRevenue + simulatedExtraInterest) /
                    (financialSummary.totalContributionsCollected || 1)) *
                  100
                ).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Total Interest Pool
          </span>
          <span className="text-2xl font-bold tracking-tight text-purple-900 tabular-nums mt-1 block">
            {formatCurrency(financialSummary.totalRevenue)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Total Active Slots
          </span>
          <span className="text-2xl font-bold tracking-tight text-[#2b72a8] tabular-nums mt-1 block">
            {financialSummary.totalActiveSlots} Slots
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Dividend / Slot
          </span>
          <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-1 block">
            {formatCurrency(financialSummary.projectedDividendPerSlot)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Total Disbursed
          </span>
          <span className="text-2xl font-bold tracking-tight text-emerald-700 tabular-nums mt-1 block">
            {formatCurrency(financialSummary.totalPayoutsDisbursed)}
          </span>
        </div>
      </div>

      {/* Controls & Export Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Payouts ({payouts.length})
          </button>
          <button
            onClick={() => setStatusFilter('processing')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'processing'
                ? 'bg-white text-amber-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Processing ({payouts.filter(p => p.status === 'processing').length})
          </button>
          <button
            onClick={() => setStatusFilter('disbursed')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'disbursed'
                ? 'bg-white text-blue-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disbursed ({payouts.filter(p => p.status === 'disbursed').length})
          </button>
          <button
            onClick={() => setStatusFilter('claimed')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'claimed'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Claimed ({payouts.filter(p => p.status === 'claimed').length})
          </button>
        </div>

        <button
          onClick={() => exportDividendsToExcel(payouts, members, settings.cycleYear)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Export Payout Sheet (.xlsx)</span>
        </button>
      </div>

      {/* Member Payout Distribution Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-600 font-semibold">
                <th className="py-3 px-4">Voucher / Member</th>
                <th className="py-3 px-4 text-center">Slots & Share</th>
                <th className="py-3 px-4 text-right">Total Contributions</th>
                <th className="py-3 px-4 text-right">Dividend Earned</th>
                <th className="py-3 px-4 text-center">Annual Yield</th>
                <th className="py-3 px-4 text-right">Final Payout</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No payouts found. Click "Recalculate & Sync Pool" above to generate payouts.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map(payout => {
                  const member = members.find(m => m.id === payout.memberId);
                  const sharePercentage = (payout.memberSlots / (payout.totalSlots || 1)) * 100;
                  const yieldRate = payout.totalMemberContributions > 0
                    ? (payout.dividendEarned / payout.totalMemberContributions) * 100
                    : 0;

                  return (
                    <tr key={payout.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Voucher & Member */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => openVoucherModal(payout)}
                          className="font-mono font-bold text-slate-900 hover:text-[#2b72a8] text-left transition-colors cursor-pointer block"
                        >
                          {payout.voucherNo}
                        </button>
                        <div className="font-semibold text-slate-900 mt-0.5">
                          {member?.fullName}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {member?.memberCode} · {member?.paymentDetails.method}
                        </span>
                      </td>

                      {/* Slots & Share % */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-[#2b72a8] tabular-nums block">
                          {payout.memberSlots} Slots
                        </span>
                        <span className="text-[11px] text-slate-500 tabular-nums block">
                          {sharePercentage.toFixed(1)}% share
                        </span>
                      </td>

                      {/* Contributions */}
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(payout.totalMemberContributions)}
                      </td>

                      {/* Dividend */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-purple-700 tabular-nums block">
                          +{formatCurrency(payout.dividendEarned)}
                        </span>
                      </td>

                      {/* Annual Yield ROI */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tabular-nums bg-purple-50 text-purple-800 border border-purple-100">
                          +{yieldRate.toFixed(2)}%
                        </span>
                      </td>

                      {/* Final Payout */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold tracking-tight text-sm text-emerald-700 tabular-nums block">
                          {formatCurrency(payout.finalPayout)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                            payout.status === 'claimed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : payout.status === 'disbursed'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {payout.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {payout.status === 'processing' && currentUser.role === 'admin' && (
                            <button
                              onClick={() => openDisburseModal(payout)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#56A0D3] hover:bg-[#438bc0] text-white transition-colors cursor-pointer"
                            >
                              Disburse
                            </button>
                          )}

                          {payout.status === 'disbursed' && (
                            <button
                              onClick={() => handleMarkClaimed(payout)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                            >
                              Mark Claimed
                            </button>
                          )}

                          <button
                            onClick={() => openVoucherModal(payout)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View / Print Payout Voucher"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse Modal */}
      {selectedPayout && (
        <Modal
          isOpen={isDisburseModalOpen}
          onClose={() => setIsDisburseModalOpen(false)}
          title={`Disburse Year-End Payout: ${selectedPayout.voucherNo}`}
          subtitle={`Member: ${members.find(m => m.id === selectedPayout.memberId)?.fullName}`}
          maxWidth="md"
        >
          <form onSubmit={handleDisburseSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paluwagan Contributions:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(selectedPayout.totalMemberContributions)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dividend Share ({selectedPayout.memberSlots} slots):</span>
                <span className="font-mono font-bold text-purple-700">
                  +{formatCurrency(selectedPayout.dividendEarned)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                <span className="font-bold text-slate-900">Total Disbursing:</span>
                <span className="font-mono font-extrabold text-emerald-700 text-base">
                  {formatCurrency(selectedPayout.finalPayout)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disbursement Method *
                </label>
                <select
                  value={disburseMethod}
                  onChange={e => setDisburseMethod(e.target.value as PaymentMethod)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash Handover</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference / Check No.
                </label>
                <input
                  type="text"
                  value={disburseRefNo}
                  onChange={e => setDisburseRefNo(e.target.value)}
                  placeholder="e.g. GCASH-PAYOUT-001"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disbursement Notes
              </label>
              <input
                type="text"
                value={disburseNotes}
                onChange={e => setDisburseNotes(e.target.value)}
                placeholder="e.g. Sent via GCash to 0917... confirmed receipt"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDisburseModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Confirm Disbursement
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Printable Payout Voucher */}
      {selectedPayout && (
        <Modal
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          title="Official Payout Voucher"
          subtitle={selectedPayout.voucherNo}
          maxWidth="md"
        >
          {(() => {
            const member = members.find(m => m.id === selectedPayout.memberId);

            return (
              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-slate-200 bg-[#F8FAFC] space-y-4 text-xs font-sans">
                  <div className="text-center pb-3 border-b border-slate-200">
                    <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                      PLEND PALUWAGAN & LENDING
                    </h3>
                    <p className="text-[11px] text-slate-500">Year-End Paluwagan Payout & Dividend Distribution Slip</p>
                    <span className="inline-block mt-1 text-[11px] font-mono font-bold text-[#2b72a8]">
                      Voucher No: {selectedPayout.voucherNo}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiary Member:</span>
                      <span className="font-bold text-slate-900">{member?.fullName} ({member?.memberCode})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paluwagan Slots:</span>
                      <span className="font-semibold text-slate-800">{selectedPayout.memberSlots} Slots ({((selectedPayout.memberSlots / selectedPayout.totalSlots) * 100).toFixed(1)}% Share)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cycle Year:</span>
                      <span className="font-semibold text-slate-800">{selectedPayout.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Paluwagan Contributions:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatCurrency(selectedPayout.totalMemberContributions)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Earned Interest Dividend:</span>
                      <span className="font-mono font-bold text-purple-700">
                        +{formatCurrency(selectedPayout.dividendEarned)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                      <span className="font-bold text-slate-900">Final Payout Amount:</span>
                      <span className="font-extrabold text-emerald-800 font-mono text-base">
                        {formatCurrency(selectedPayout.finalPayout)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Disbursement Status:</span>
                      <span className="font-semibold text-slate-800 uppercase">{selectedPayout.status}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-dashed border-slate-300 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
                    <div>
                      <div className="h-8 border-b border-slate-300 mb-1" />
                      <span>Authorized Treasurer / Admin</span>
                    </div>
                    <div>
                      <div className="h-8 border-b border-slate-300 mb-1" />
                      <span>Member Signature / Date</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsVoucherModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#56A0D3] hover:bg-[#438bc0] rounded-lg shadow-xs cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Payout Slip</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
