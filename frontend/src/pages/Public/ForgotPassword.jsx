import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Mail, Lock, ArrowRight, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';

/* ─────────────────────────────────────────────
   SHARED INPUT STYLES
───────────────────────────────────────────── */
const inputCls =
  'w-full border border-[#E5E5E5] focus:border-[#C1121F] bg-[#FAFAFA] focus:bg-white px-4 py-3.5 text-sm text-[#111111] placeholder-[#CCCCCC] outline-none transition-all duration-200';
const inputIconCls = `${inputCls} pl-11`;
const labelCls =
  'block text-[10px] tracking-[0.18em] text-[#888888] uppercase font-semibold mb-1.5';

/* ─────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────── */
const StepIndicator = ({ current, total }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div
          className="transition-all duration-500"
          style={{
            width: current > i ? '32px' : '8px',
            height: '2px',
            background: current > i ? '#C1121F' : '#E5E5E5',
          }}
        />
      </React.Fragment>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   LEFT BRAND PANEL
───────────────────────────────────────────── */
const BrandPanel = ({ step }) => (
  <div
    className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col"
    style={{
      backgroundImage:
        'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    {/* Overlay */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 45%, rgba(255,255,255,0.55) 100%)',
      }}
    />

    {/* Left red accent bar */}
    <div className="absolute left-0 top-0 w-[3px] h-full bg-[#C1121F]" />

    {/* Content */}
    <div className="relative z-10 flex flex-col h-full p-14">

      {/* Logo */}
      <Link to="/" className="block">
        <p
          className="text-xl font-bold text-[#111111] tracking-wider uppercase"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          Klare Homes
        </p>
        <p className="text-[8px] tracking-[0.35em] text-[#C1121F] uppercase font-semibold mt-0.5">
          Luxury Architecture & Design
        </p>
      </Link>

      {/* Center block */}
      <div className="flex-1 flex flex-col justify-center max-w-xs space-y-8">
        {/* Icon */}
        <div
          className="w-14 h-14 flex items-center justify-center border border-[#E5E5E5] bg-white"
          style={{ borderRadius: '2px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        >
          <KeyRound size={24} className="text-[#C1121F]" />
        </div>

        <div>
          <p className="text-[9px] tracking-[0.28em] text-[#C1121F] uppercase font-semibold mb-3">
            Account Recovery
          </p>
          <h2
            className="text-3xl font-bold text-[#111111] uppercase tracking-wide leading-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Secure
            <br />
            Access
          </h2>
          <p className="text-sm text-[#666666] mt-4 leading-relaxed">
            We take your studio access security seriously.
            Follow the steps to securely recover your account credentials.
          </p>
        </div>

        {/* Step progress */}
        <div className="space-y-2">
          <p className="text-[9px] tracking-widest text-[#AAAAAA] uppercase">
            Step {Math.min(step, 2)} of 2
          </p>
          <StepIndicator current={step} total={2} />
          <div className="flex gap-6 mt-2">
            {['Email Verification', 'New Password'].map((label, i) => (
              <span
                key={label}
                className="text-[9px] tracking-wider uppercase font-semibold transition-colors duration-300"
                style={{ color: step > i ? '#C1121F' : '#CCCCCC' }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom watermark */}
      <p className="text-[9px] tracking-widest text-[#CCCCCC] uppercase">
        Munich · Est. 2009
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep]           = useState(1);
  const [email, setEmail]         = useState('');
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading]     = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm();

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch,
    formState: { errors: resetErrors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onRequestSubmit = async (data) => {
    setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email: data.email });
      if (res.data.success) {
        setEmail(data.email);
        setStep(2);
        setSuccessMsg(res.data.message || 'Recovery code sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', {
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      if (res.data.success) {
        setResetDone(true);
        setSuccessMsg('Password reset successfully.');
        setTimeout(() => navigate('/login'), 2400);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const res = await API.post('/auth/resend-otp', { email, type: 'forgot_password' });
      if (res.data.success) setSuccessMsg('A new recovery code has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container min-h-screen flex">
      <style>{`
        /* MOBILE OVERRIDES */
        @media (max-width: 768px) {
          .auth-container { min-height: calc(100vh - 56px) !important; }
          .auth-right-panel { padding-top: 40px !important; padding-bottom: 40px !important; }
        }
      `}</style>
      {/* ── Brand panel ── */}
      <BrandPanel step={step} />

      {/* ── Form panel ── */}
      <div className="auth-right-panel w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link to="/">
              <p
                className="text-2xl font-bold text-[#111111] uppercase tracking-wider"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                Klare Homes
              </p>
              <p className="text-[8px] tracking-[0.3em] text-[#C1121F] uppercase font-semibold mt-1">
                Luxury Architecture & Design
              </p>
            </Link>
          </div>

          {/* ── Step header ── */}
          <div className="mb-8">
            <p className="text-[9px] tracking-[0.28em] text-[#C1121F] uppercase font-semibold mb-3">
              {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
            </p>
            <h1
              className="text-3xl font-bold text-[#111111] uppercase tracking-wide leading-tight"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              {step === 1 ? 'Reset\nPassword' : 'New\nPassword'}
            </h1>
            <p className="text-sm text-[#888888] mt-3 leading-relaxed">
              {step === 1
                ? 'Enter your registered email to receive a secure recovery code.'
                : `Enter the 6-digit code sent to ${email}`}
            </p>
            {/* Brand rule */}
            <div className="mt-5 flex items-center gap-3">
              <div className="w-8 h-px bg-[#C1121F]" />
              <div className="flex-1 h-px bg-[#F0F0F0]" />
            </div>
          </div>

          {/* ── Alerts ── */}
          {error && (
            <div
              className="text-red-700 text-sm px-4 py-3 mb-5 border border-red-200 bg-red-50 flex items-start gap-2"
              style={{ borderRadius: '2px' }}
            >
              <span className="shrink-0 mt-0.5">⚠</span>
              {error}
            </div>
          )}
          {successMsg && !resetDone && (
            <div
              className="text-emerald-700 text-sm px-4 py-3 mb-5 border border-emerald-200 bg-emerald-50 flex items-start gap-2"
              style={{ borderRadius: '2px' }}
            >
              <CheckCircle size={14} className="shrink-0 mt-0.5" />
              {successMsg}
            </div>
          )}

          {/* ── SUCCESS STATE ── */}
          {resetDone ? (
            <div className="py-10 text-center space-y-4">
              <div
                className="w-14 h-14 mx-auto flex items-center justify-center bg-emerald-50 border border-emerald-200"
                style={{ borderRadius: '2px' }}
              >
                <CheckCircle size={26} className="text-emerald-500" />
              </div>
              <div>
                <p
                  className="text-lg font-bold text-[#111111] uppercase tracking-wide"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  Password Updated
                </p>
                <p className="text-sm text-[#888888] mt-1">
                  Redirecting you to sign in…
                </p>
              </div>
              <div
                className="h-0.5 bg-[#F0F0F0] mx-auto w-16 overflow-hidden"
              >
                <div
                  className="h-full bg-[#C1121F] animate-[grow_2.4s_linear]"
                  style={{ animation: 'width 2.4s linear forwards', width: '0%' }}
                />
              </div>
            </div>
          ) : step === 1 ? (
            /* ── STEP 1: Email form ── */
            <form onSubmit={handleEmailSubmit(onRequestSubmit)} className="space-y-5">
              <div>
                <label className={labelCls}>Registered Email</label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none"
                  />
                  <input
                    type="email"
                    {...registerEmail('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                    })}
                    placeholder="architect@klarehomes.com"
                    className={inputIconCls}
                    style={{ borderRadius: '2px' }}
                  />
                </div>
                {emailErrors.email && (
                  <p className="text-red-500 text-xs mt-1.5">{emailErrors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#C1121F] hover:bg-[#9B0F18] text-white text-[11px] uppercase tracking-[0.2em] font-semibold py-4 disabled:opacity-50 transition-all duration-200 hover:-translate-y-px"
                style={{ borderRadius: '2px' }}
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Code</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-[#AAAAAA] hover:text-[#333333] transition-colors mt-1 group"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Sign In
              </Link>
            </form>
          ) : (
            /* ── STEP 2: OTP + new password ── */
            <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-5">

              {/* OTP field */}
              <div>
                <label className={labelCls}>Recovery Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  {...registerReset('otp', { required: 'Recovery code is required' })}
                  placeholder="· · · · · ·"
                  className={`${inputCls} text-center text-2xl tracking-[0.6em] font-mono`}
                  style={{ borderRadius: '2px' }}
                />
                {resetErrors.otp && (
                  <p className="text-red-500 text-xs mt-1.5">{resetErrors.otp.message}</p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#F0F0F0]" />
                <span className="text-[9px] tracking-widest text-[#CCCCCC] uppercase">New Credentials</span>
                <div className="flex-1 h-px bg-[#F0F0F0]" />
              </div>

              {/* New password */}
              <div>
                <label className={labelCls}>New Password</label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none"
                  />
                  <input
                    type="password"
                    {...registerReset('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                    placeholder="••••••••"
                    className={inputIconCls}
                    style={{ borderRadius: '2px' }}
                  />
                </div>
                {resetErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1.5">{resetErrors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className={labelCls}>Confirm New Password</label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none"
                  />
                  <input
                    type="password"
                    {...registerReset('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (v) => v === newPassword || 'Passwords do not match',
                    })}
                    placeholder="••••••••"
                    className={inputIconCls}
                    style={{ borderRadius: '2px' }}
                  />
                </div>
                {resetErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1.5">{resetErrors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#C1121F] hover:bg-[#9B0F18] text-white text-[11px] uppercase tracking-[0.2em] font-semibold py-4 disabled:opacity-50 transition-all duration-200 hover:-translate-y-px"
                style={{ borderRadius: '2px' }}
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>

              {/* Resend */}
              <p className="text-center text-sm text-[#AAAAAA]">
                Didn't receive it?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-[#C1121F] hover:text-[#9B0F18] font-semibold transition-colors disabled:opacity-40"
                >
                  Resend Code
                </button>
              </p>

              {/* Back to step 1 */}
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setSuccessMsg(''); }}
                className="flex items-center justify-center gap-2 w-full text-sm text-[#AAAAAA] hover:text-[#333333] transition-colors group"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;