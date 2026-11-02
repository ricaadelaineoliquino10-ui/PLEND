import { ContributionPayment, Loan, Member, Payout, SystemSettings } from '../types';

export interface FinancialSummary {
  // Collections
  totalContributionsCollected: number;
  totalContributionsExpected: number;
  contributionCollectionRate: number; // percentage
  
  // Lending & Repayments
  totalPrincipalDisbursed: number;
  totalPrincipalRepaid: number;
  totalOutstandingPrincipal: number;
  totalInterestEarned: number;
  totalPenaltiesCollected: number;
  totalRevenue: number; // interest + penalties
  
  // Liquidity & Capital
  totalCashIn: number;
  totalCashOut: number;
  availableLendingCapital: number;
  
  // Counts
  totalMembers: number;
  activePaluwaganMembers: number;
  nonMemberBorrowers: number;
  totalActiveSlots: number;
  activeLoansCount: number;
  overdueLoansCount: number;
  pendingLoansCount: number;
  
  // Overdue amounts
  totalOverdueLoanBalance: number;
  totalUnpaidContributionsAmount: number;
  
  // Dividends
  totalDividendPool: number;
  projectedDividendPerSlot: number;
  totalPayoutsDisbursed: number;
}

export function formatCurrency(amount: number, symbol: string = '₱'): string {
  return `${symbol}${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCompactCurrency(amount: number, symbol: string = '₱'): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount, symbol);
}

export function calculateLoanBalance(loan: Loan): {
  principalRepaid: number;
  interestRepaid: number;
  penaltyRepaid: number;
  principalBalance: number;
  totalRepaid: number;
  isOverdue: boolean;
  daysOverdue: number;
} {
  const principalRepaid = (loan.repayments || []).reduce((sum, r) => sum + (r.principalPaid || 0), 0);
  const interestRepaid = (loan.repayments || []).reduce((sum, r) => sum + (r.interestPaid || 0), 0);
  const penaltyRepaid = (loan.repayments || []).reduce((sum, r) => sum + (r.penaltyPaid || 0), 0);
  const totalRepaid = principalRepaid + interestRepaid + penaltyRepaid;
  
  const principalBalance = Math.max(0, loan.principalAmount - principalRepaid);
  
  const dueDate = new Date(loan.dueDate);
  const now = new Date();
  const isOverdue = (loan.status === 'active' || loan.status === 'overdue') && principalBalance > 0 && now > dueDate;
  
  const diffTime = Math.max(0, now.getTime() - dueDate.getTime());
  const daysOverdue = isOverdue ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;

  return {
    principalRepaid,
    interestRepaid,
    penaltyRepaid,
    principalBalance,
    totalRepaid,
    isOverdue,
    daysOverdue,
  };
}

export function calculateFinancialSummary(
  members: Member[],
  contributions: ContributionPayment[],
  loans: Loan[],
  payouts: Payout[],
  _settings: SystemSettings
): FinancialSummary {
  // Members & Slots
  const activeMembersList = members.filter(m => m.status === 'active');
  const activePaluwaganMembers = activeMembersList.filter(m => m.classification === 'member');
  const nonMemberBorrowers = activeMembersList.filter(m => m.classification === 'non_member_borrower');
  const totalActiveSlots = activePaluwaganMembers.reduce((sum, m) => sum + (m.slots || 0), 0);

  // Contributions
  const totalContributionsCollected = contributions.reduce(
    (sum, c) => sum + (c.status === 'paid' || c.status === 'late' ? c.paidAmount : 0),
    0
  );
  const totalContributionsExpected = contributions.reduce((sum, c) => sum + c.expectedAmount, 0);
  const contributionCollectionRate = totalContributionsExpected > 0
    ? (totalContributionsCollected / totalContributionsExpected) * 100
    : 100;
  
  const totalUnpaidContributionsAmount = contributions
    .filter(c => c.status === 'unpaid' || c.status === 'late' && c.paidAmount < c.expectedAmount)
    .reduce((sum, c) => sum + (c.expectedAmount - c.paidAmount), 0);

  // Loans: Disbursed loans include active, fully_paid, and overdue
  const disbursedLoans = loans.filter(l => l.status === 'active' || l.status === 'fully_paid' || l.status === 'overdue');
  const totalPrincipalDisbursed = disbursedLoans.reduce((sum, l) => sum + l.principalAmount, 0);

  let totalPrincipalRepaid = 0;
  let totalInterestEarned = 0;
  let totalPenaltiesCollected = 0;
  let totalOutstandingPrincipal = 0;
  let totalOverdueLoanBalance = 0;

  disbursedLoans.forEach(loan => {
    const { principalRepaid, interestRepaid, penaltyRepaid, principalBalance, isOverdue } = calculateLoanBalance(loan);
    totalPrincipalRepaid += principalRepaid;
    totalInterestEarned += interestRepaid;
    totalPenaltiesCollected += penaltyRepaid;

    if (loan.status === 'active' || loan.status === 'overdue') {
      totalOutstandingPrincipal += principalBalance;
      if (isOverdue) {
        totalOverdueLoanBalance += principalBalance;
      }
    }
  });

  const totalRevenue = totalInterestEarned + totalPenaltiesCollected;

  // Payouts disbursed
  const totalPayoutsDisbursed = payouts
    .filter(p => p.status === 'disbursed' || p.status === 'claimed')
    .reduce((sum, p) => sum + p.finalPayout, 0);

  // Total Cash In:
  // 1. All member contributions paid in
  // 2. All principal repayments returned to cooperative pool
  // 3. All interest earned and penalties collected
  const totalCashIn = totalContributionsCollected + totalPrincipalRepaid + totalRevenue;

  // Total Cash Out:
  // 1. All loan principals disbursed
  // 2. Year-end payouts paid out to members
  const totalCashOut = totalPrincipalDisbursed + totalPayoutsDisbursed;

  // Available Lending Capital:
  // Liquid cash available right now to disburse as new loans or hold in reserve.
  // Net cash in - Net cash out
  const availableLendingCapital = Math.max(0, totalCashIn - totalCashOut);

  // Counts
  const activeLoansCount = loans.filter(l => l.status === 'active').length;
  const overdueLoansCount = loans.filter(l => {
    if (l.status === 'overdue') return true;
    if (l.status === 'active') {
      const { isOverdue } = calculateLoanBalance(l);
      return isOverdue;
    }
    return false;
  }).length;
  const pendingLoansCount = loans.filter(l => l.status === 'pending').length;

  // Dividend Pool is the total interest & penalty revenue earned from lending
  const totalDividendPool = totalRevenue;
  const projectedDividendPerSlot = totalActiveSlots > 0 ? totalDividendPool / totalActiveSlots : 0;

  return {
    totalContributionsCollected,
    totalContributionsExpected,
    contributionCollectionRate,
    totalPrincipalDisbursed,
    totalPrincipalRepaid,
    totalOutstandingPrincipal,
    totalInterestEarned,
    totalPenaltiesCollected,
    totalRevenue,
    totalCashIn,
    totalCashOut,
    availableLendingCapital,
    totalMembers: members.length,
    activePaluwaganMembers: activePaluwaganMembers.length,
    nonMemberBorrowers: nonMemberBorrowers.length,
    totalActiveSlots,
    activeLoansCount,
    overdueLoansCount,
    pendingLoansCount,
    totalOverdueLoanBalance,
    totalUnpaidContributionsAmount,
    totalDividendPool,
    projectedDividendPerSlot,
    totalPayoutsDisbursed,
  };
}

export function calculateMemberDividend(
  member: Member,
  totalActiveSlots: number,
  totalInterestEarned: number,
  memberTotalContributions: number
): {
  dividendEarned: number;
  finalPayout: number;
  slotSharePercentage: number;
} {
  if (member.classification !== 'member' || member.slots <= 0 || totalActiveSlots <= 0) {
    return {
      dividendEarned: 0,
      finalPayout: 0,
      slotSharePercentage: 0,
    };
  }

  // Dividend = (Member Slots ÷ Total Active Slots) × Total Interest Earned
  const slotSharePercentage = (member.slots / totalActiveSlots) * 100;
  const dividendEarned = (member.slots / totalActiveSlots) * totalInterestEarned;
  
  // Final Payout = Total Contributions + Dividend
  const finalPayout = memberTotalContributions + dividendEarned;

  return {
    dividendEarned,
    finalPayout,
    slotSharePercentage,
  };
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
