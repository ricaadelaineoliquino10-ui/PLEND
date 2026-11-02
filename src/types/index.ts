export type MemberClassification = 'member' | 'non_member_borrower';
export type MemberStatus = 'active' | 'inactive' | 'archived';

export interface PaymentDetails {
  method: 'GCash' | 'Bank Transfer' | 'Cash';
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
}

export interface Member {
  id: string;
  memberCode: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  classification: MemberClassification;
  slots: number; // 0 for non-member borrowers, 1+ for paluwagan members
  joinedDate: string;
  paymentDetails: PaymentDetails;
  status: MemberStatus;
  notes?: string;
}

export type ContributionStatus = 'paid' | 'unpaid' | 'late';
export type PaymentMethod = 'GCash' | 'Bank Transfer' | 'Cash';

export interface ContributionPayment {
  id: string;
  memberId: string;
  month: number; // 1-12
  year: number;
  expectedAmount: number;
  paidAmount: number;
  status: ContributionStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  referenceNo?: string;
  receiptNo?: string;
  notes?: string;
  recordedBy: string;
}

export type LoanStatus = 'pending' | 'approved' | 'active' | 'fully_paid' | 'overdue' | 'rejected';

export interface LoanRepayment {
  id: string;
  loanId: string;
  paymentDate: string;
  principalPaid: number;
  interestPaid: number;
  penaltyPaid: number;
  totalPaid: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  receiptNo: string;
  recordedBy: string;
  notes?: string;
}

export interface Loan {
  id: string;
  loanCode: string;
  borrowerId: string;
  borrowerType: MemberClassification;
  principalAmount: number;
  interestRateMonthly: number; // e.g. 5 for 5% per month
  termMonths: number;
  startDate: string;
  dueDate: string;
  guarantorMemberId?: string; // Optional co-maker
  purpose: string;
  status: LoanStatus;
  approvedDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  repayments: LoanRepayment[];
  createdAt: string;
}

export type PayoutStatus = 'processing' | 'disbursed' | 'claimed';

export interface Payout {
  id: string;
  memberId: string;
  year: number;
  memberSlots: number;
  totalSlots: number;
  totalMemberContributions: number;
  dividendEarned: number; // (memberSlots / totalActiveSlots) * totalInterestEarned
  finalPayout: number; // totalMemberContributions + dividendEarned
  status: PayoutStatus;
  disbursedDate?: string;
  paymentMethod?: PaymentMethod;
  referenceNo?: string;
  voucherNo: string;
  claimedDate?: string;
  notes?: string;
}

export type AuditModule = 'members' | 'contributions' | 'loans' | 'payouts' | 'system';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'admin' | 'staff';
  action: string;
  module: AuditModule;
  details: string;
}

export interface SystemSettings {
  orgName: string;
  cycleYear: number;
  contributionPerSlot: number; // e.g. 1000 PHP
  defaultMemberInterestRate: number; // e.g. 3% monthly
  defaultNonMemberInterestRate: number; // e.g. 5% monthly
  penaltyPerMonthLate: number; // e.g. 50 PHP or 2%
  payoutMonth: number; // 12
  currencySymbol: string; // ₱
}

export interface UserSession {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'staff';
  email: string;
  lastLogin?: string;
  rememberMe?: boolean;
}

export interface AuthAccount {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  passwordHash: string; // Stored password hash
  securityQuestion?: string;
  securityAnswer?: string;
}
