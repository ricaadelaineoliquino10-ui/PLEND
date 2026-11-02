import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const LoginView: React.FC = () => {
  const { login, resetPassword, authAccounts, inactivityNotice, clearInactivityNotice } = useApp();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'identify' | 'reset' | 'success'>('identify');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [identifiedAccount, setIdentifiedAccount] = useState<any | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Please enter both your registered username/email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(usernameOrEmail, password, rememberMe);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 350);
  };

  const handleQuickDemoFill = (role: 'admin' | 'staff') => {
    setErrorMessage(null);
    if (role === 'admin') {
      setUsernameOrEmail('admin');
      setPassword('Password123!');
    } else {
      setUsernameOrEmail('staff');
      setPassword('Password123!');
    }
  };

  // Forgot password handlers
  const handleIdentifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const trimmed = forgotIdentifier.trim().toLowerCase();
    const account = authAccounts.find(
      a => a.username.toLowerCase() === trimmed || a.email.toLowerCase() === trimmed
    );

    if (!account) {
      setForgotError('No authorized account found with this username or email.');
      return;
    }

    setIdentifiedAccount(account);
    setForgotStep('reset');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }

    const res = resetPassword(forgotIdentifier, newPassword, securityAnswer);
    if (res.success) {
      setForgotStep('success');
      setPassword(newPassword);
      setUsernameOrEmail(identifiedAccount?.username || forgotIdentifier);
    } else {
      setForgotError(res.error || 'Password reset failed.');
    }
  };

  const openForgotModal = () => {
    setForgotIdentifier(usernameOrEmail);
    setSecurityAnswer('');
    setNewPassword('');
    setForgotStep('identify');
    setForgotError(null);
    setIsForgotModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative selection:bg-[#56A0D3]/30">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 blur-3xl">
        <div className="w-full h-full bg-gradient-to-b from-[#56A0D3]/20 via-[#FAD2E1]/20 to-transparent" />
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header & Official Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-sm border border-slate-200/80">
            <img
              src="/assets/aistudio/image_7d56f63b.png"
              alt="PLEND Paluwagan & Lending System"
              className="h-14 w-auto object-contain max-w-[240px]"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Sign In to PLEND
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized Paluwagan & Lending Management System
            </p>
          </div>
        </div>

        {/* Inactivity Notification Banner */}
        {inactivityNotice && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-xs">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Session Expired</span>
              <span>{inactivityNotice}</span>
            </div>
            <button
              onClick={clearInactivityNotice}
              className="text-amber-700 hover:text-amber-900 font-bold text-xs cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-xs animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username or Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username or Registered Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={usernameOrEmail}
                  onChange={e => {
                    setUsernameOrEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="admin or admin@plend.coop"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30 focus:border-[#56A0D3] transition-all"
                />
              </div>
            </div>

            {/* Password Input with Show/Hide toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-xs font-medium text-[#2b72a8] hover:text-[#1d5077] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30 focus:border-[#56A0D3] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded text-[#56A0D3] focus:ring-[#56A0D3] border-slate-300 cursor-pointer accent-[#56A0D3]"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Remember this device
                </span>
              </label>

              <span className="text-[11px] text-slate-400">
                Auto-logout on 15m idle
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#56A0D3] hover:bg-[#438bc0] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
              Authorized Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('admin')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer group"
              >
                <span className="font-bold text-slate-900 block group-hover:text-[#2b72a8]">
                  Admin Account
                </span>
                <span className="text-[10px] text-slate-500 block">admin · Rica O.</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('staff')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer group"
              >
                <span className="font-bold text-slate-900 block group-hover:text-[#2b72a8]">
                  Staff / Collector
                </span>
                <span className="text-[10px] text-slate-500 block">staff · Danilo M.</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Access Protection Footer Notice */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Bank-grade session encryption & role authorization</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Protected system: Direct URL bypass is strictly prevented.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Account Password"
        subtitle="Verify your registered account to securely set a new password"
        maxWidth="md"
      >
        {forgotStep === 'identify' && (
          <form onSubmit={handleIdentifySubmit} className="space-y-4">
            {forgotError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {forgotError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter your Username or Email Address
              </label>
              <input
                type="text"
                required
                value={forgotIdentifier}
                onChange={e => setForgotIdentifier(e.target.value)}
                placeholder="e.g. admin or admin@plend.coop"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                We will locate your profile and challenge your security recovery.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#56A0D3] hover:bg-[#438bc0] rounded-lg cursor-pointer"
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {forgotStep === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {forgotError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {forgotError}
              </div>
            )}

            <div className="p-3 rounded-lg bg-[#56A0D3]/8 border border-[#56A0D3]/20 text-xs space-y-1">
              <span className="text-slate-500 block">Identified Account:</span>
              <span className="font-bold text-slate-900 block text-sm">
                {identifiedAccount?.name} ({identifiedAccount?.username})
              </span>
              <span className="text-slate-500 block text-[11px]">{identifiedAccount?.email}</span>
            </div>

            {identifiedAccount?.securityQuestion && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Security Recovery Question
                </label>
                <p className="text-xs text-slate-800 font-medium p-2 bg-slate-50 rounded-lg border border-slate-200 mb-2">
                  {identifiedAccount.securityQuestion}
                </p>
                <input
                  type="text"
                  required
                  value={securityAnswer}
                  onChange={e => setSecurityAnswer(e.target.value)}
                  placeholder="Your answer..."
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setForgotStep('identify')}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#56A0D3] hover:bg-[#438bc0] rounded-lg cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>
        )}

        {forgotStep === 'success' && (
          <div className="space-y-4 text-center py-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Password Successfully Reset!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Your credentials have been updated in the local security register. You can now log in immediately.
              </p>
            </div>
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="w-full py-2.5 px-4 rounded-lg bg-[#56A0D3] hover:bg-[#438bc0] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              Back to Login
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
