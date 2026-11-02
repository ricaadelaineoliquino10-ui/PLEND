import * as XLSX from 'xlsx';
import { ContributionPayment, Loan, Member, Payout, SystemSettings } from '../types';
import { calculateFinancialSummary, calculateLoanBalance, formatCurrency, MONTH_NAMES } from './calculations';

export function exportContributionsToExcel(
  members: Member[],
  contributions: ContributionPayment[],
  year: number
) {
  const paluwaganMembers = members.filter(m => m.classification === 'member');
  
  // Create matrix rows
  const matrixData = paluwaganMembers.map(member => {
    const row: Record<string, string | number> = {
      'Member Code': member.memberCode,
      'Full Name': member.fullName,
      'Slots': member.slots,
      'Monthly Rate': member.slots * 1000,
    };

    let totalPaid = 0;
    for (let m = 1; m <= 12; m++) {
      const payment = contributions.find(c => c.memberId === member.id && c.month === m && c.year === year);
      const statusText = payment?.status === 'paid' ? `Paid (₱${payment.paidAmount})` :
                         payment?.status === 'late' ? `Late (₱${payment.paidAmount})` : 'Unpaid';
      row[MONTH_NAMES[m - 1]] = statusText;
      if (payment && (payment.status === 'paid' || payment.status === 'late')) {
        totalPaid += payment.paidAmount;
      }
    }
    row['Total Paid'] = totalPaid;
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(matrixData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Contributions_${year}`);
  XLSX.writeFile(wb, `PLEND_Contributions_Ledger_${year}.xlsx`);
}

export function exportLoansToExcel(
  loans: Loan[],
  members: Member[]
) {
  const memberMap = new Map(members.map(m => [m.id, m]));

  const loanRows = loans.map(loan => {
    const borrower = memberMap.get(loan.borrowerId);
    const guarantor = loan.guarantorMemberId ? memberMap.get(loan.guarantorMemberId) : null;
    const { principalRepaid, interestRepaid, penaltyRepaid, principalBalance } = calculateLoanBalance(loan);

    return {
      'Loan Code': loan.loanCode,
      'Borrower': borrower?.fullName || 'Unknown',
      'Classification': loan.borrowerType === 'member' ? 'Member' : 'Non-Member Borrower',
      'Principal (₱)': loan.principalAmount,
      'Interest Rate (%/mo)': `${loan.interestRateMonthly}%`,
      'Term (Months)': loan.termMonths,
      'Start Date': loan.startDate,
      'Due Date': loan.dueDate,
      'Status': loan.status.toUpperCase(),
      'Principal Repaid (₱)': principalRepaid,
      'Outstanding Principal (₱)': principalBalance,
      'Interest Repaid (₱)': interestRepaid,
      'Penalties Repaid (₱)': penaltyRepaid,
      'Guarantor': guarantor?.fullName || 'None',
      'Loan Type': 'Unsecured Cash Loan',
      'Purpose': loan.purpose,
    };
  });

  const ws = XLSX.utils.json_to_sheet(loanRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Loans');
  XLSX.writeFile(wb, `PLEND_Loan_Portfolio_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportDividendsToExcel(
  payouts: Payout[],
  members: Member[],
  year: number
) {
  const memberMap = new Map(members.map(m => [m.id, m]));

  const rows = payouts.map(p => {
    const member = memberMap.get(p.memberId);
    return {
      'Voucher No': p.voucherNo,
      'Member Code': member?.memberCode || '',
      'Member Name': member?.fullName || '',
      'Slots': p.memberSlots,
      'Total Group Slots': p.totalSlots,
      'Share %': `${((p.memberSlots / (p.totalSlots || 1)) * 100).toFixed(2)}%`,
      'Total Contributions (₱)': p.totalMemberContributions,
      'Dividend Earned (₱)': p.dividendEarned,
      'Final Payout (₱)': p.finalPayout,
      'Payout Status': p.status.toUpperCase(),
      'Payment Method': p.paymentMethod || 'Pending',
      'Reference No': p.referenceNo || 'None',
      'Disbursed Date': p.disbursedDate || 'Pending',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Dividends_${year}`);
  XLSX.writeFile(wb, `PLEND_YearEnd_Dividends_${year}.xlsx`);
}

export function exportFinancialSummaryToExcel(
  members: Member[],
  contributions: ContributionPayment[],
  loans: Loan[],
  payouts: Payout[],
  settings: SystemSettings
) {
  const summary = calculateFinancialSummary(members, contributions, loans, payouts, settings);

  const kpis = [
    { 'Metric': 'Organization Name', 'Value': settings.orgName },
    { 'Metric': 'Cycle Year', 'Value': settings.cycleYear },
    { 'Metric': 'Total Paluwagan Contributions Collected (₱)', 'Value': summary.totalContributionsCollected },
    { 'Metric': 'Total Contributions Expected (₱)', 'Value': summary.totalContributionsExpected },
    { 'Metric': 'Collection Rate (%)', 'Value': `${summary.contributionCollectionRate.toFixed(1)}%` },
    { 'Metric': 'Total Principal Disbursed (₱)', 'Value': summary.totalPrincipalDisbursed },
    { 'Metric': 'Total Principal Repaid (₱)', 'Value': summary.totalPrincipalRepaid },
    { 'Metric': 'Total Outstanding Principal (Active Loans) (₱)', 'Value': summary.totalOutstandingPrincipal },
    { 'Metric': 'Total Interest Income Earned (₱)', 'Value': summary.totalInterestEarned },
    { 'Metric': 'Total Late Penalties Collected (₱)', 'Value': summary.totalPenaltiesCollected },
    { 'Metric': 'Total Revenue (Dividend Pool) (₱)', 'Value': summary.totalRevenue },
    { 'Metric': 'Available Lending Capital (Liquid Cash) (₱)', 'Value': summary.availableLendingCapital },
    { 'Metric': 'Total Active Members', 'Value': summary.activePaluwaganMembers },
    { 'Metric': 'Total Non-Member Borrowers', 'Value': summary.nonMemberBorrowers },
    { 'Metric': 'Total Active Paluwagan Slots', 'Value': summary.totalActiveSlots },
    { 'Metric': 'Active Loans Count', 'Value': summary.activeLoansCount },
    { 'Metric': 'Overdue Loans Count', 'Value': summary.overdueLoansCount },
    { 'Metric': 'Total Overdue Balance (₱)', 'Value': summary.totalOverdueLoanBalance },
    { 'Metric': 'Projected Dividend Per Slot (₱)', 'Value': summary.projectedDividendPerSlot },
  ];

  const ws = XLSX.utils.json_to_sheet(kpis);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Financial_Summary');
  XLSX.writeFile(wb, `PLEND_Financial_Summary_${settings.cycleYear}.xlsx`);
}
