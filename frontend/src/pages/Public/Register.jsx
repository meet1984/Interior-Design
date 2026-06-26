import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';

/* ─────────────────────────────────────────────
   SHARED INPUT STYLES — mirrors Login.jsx
───────────────────────────────────────────── */
const inputCls =
  'w-full border border-[#E5E5E5] focus:border-[#C1121F] bg-[#FAFAFA] focus:bg-white px-4 py-3.5 text-sm text-[#111111] placeholder-[#CCCCCC] outline-none transition-all duration-200';
const inputIconCls = `${inputCls} pl-11`;
const labelCls =
  'block text-[10px] tracking-[0.18em] text-[#888888] uppercase font-semibold mb-1.5';

/** Safely extracts a human-readable message from a thrown error of unknown shape. */
const getErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.message) return err.message;
  return fallback;
};

/* ─────────────────────────────────────────────
   LEFT BRAND PANEL — identical to Login.jsx
───────────────────────────────────────────── */
const BrandPanel = () => (
  <div
    className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14"
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
          'linear-gradient(150deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.80) 45%, rgba(255,255,255,0.55) 100%)',
      }}
    />

    {/* Left red accent bar */}
    <div className="absolute left-0 top-0 w-[3px] h-full bg-[#C1121F]" />

    {/* Logo */}
    <Link to="/" className="relative z-10 block">
      <p
        className="text-xl font-bold text-[#111111] uppercase tracking-wider"
        style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
      >
        Klare Homes
      </p>
      <p className="text-[8px] tracking-[0.35em] text-[#C1121F] uppercase font-semibold mt-0.5">
        Luxury Architecture & Design
      </p>
    </Link>

    {/* Centre quote */}
    <div className="relative z-10 space-y-5 max-w-xs">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-[#E6C77A] rotate-45 shrink-0" aria-hidden="true" />
        <div className="flex-1 h-px bg-[#E5E5E5]" />
      </div>
      <blockquote
        className="text-2xl font-light text-[#111111] leading-snug"
        style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
      >
        "Where German precision meets Italian soul — every detail speaks."
      </blockquote>
      <p className="text-[9px] text-[#AAAAAA] uppercase tracking-[0.22em]">
        — Klare Homes Design Philosophy
      </p>
    </div>

    {/* Bottom trust strip */}
    <div className="relative z-10">
      <div className="h-px bg-[#E5E5E5] mb-6" />
      <div className="grid grid-cols-3 gap-4">
        {[
          ['15+', 'Years'],
          ['500+', 'Projects'],
          ['100%', 'Bespoke'],
        ].map(([num, label]) => (
          <div key={label} className="text-center">
            <p
              className="text-xl font-bold text-[#C1121F]"
              style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
            >
              {num}
            </p>
            <p className="text-[9px] text-[#AAAAAA] uppercase tracking-widest mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/** Password input with show/hide toggle, styled to match Login's password field exactly. */
const PasswordField = ({ id, label, placeholder, registration, error, autoComplete, trailing }) => {
  const [visible, setVisible] = useState(false);
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label htmlFor={id} className={`${labelCls} mb-0`}>{label}</label>
        {trailing}
      </div>
      <div className="relative">
        <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none" aria-hidden="true" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          className={`${inputIconCls} pr-11`}
          style={{ borderRadius: '2px' }}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#BBBBBB] hover:text-[#555555] transition-colors p-1"
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && <p id={errorId} className="text-red-500 text-xs mt-1.5">{error.message}</p>}
    </div>
  );
};

/** Two-dot step indicator for the registration flow. */
const StepProgress = ({ step }) => (
  <div className="flex items-center gap-3 mb-3" role="group" aria-label={`Registration step ${step} of 2`}>
    {[1, 2].map((s) => (
      <div
        key={s}
        aria-hidden="true"
        className={`h-[3px] flex-1 transition-all duration-500 ${step >= s ? 'bg-[#C1121F]' : 'bg-[#F0F0F0]'}`}
      />
    ))}
  </div>
);

export const Register = () => {
  const { register: registerUser, verifyRegistrationOtp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' }
  });
  const watchPassword = watch('password', '');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = async (data) => {
    setError(''); setLoading(true);
    try {
      const result = await registerUser(data.firstName, data.lastName, data.email, data.password, data.phone);
      if (result?.success) {
        setRegisteredEmail(result.email || data.email);
        setStep(2);
        setSuccessMsg(result.message);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to register account'));
    } finally { setLoading(false); }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setError(''); setSubmittingOtp(true);
    try {
      const result = await verifyRegistrationOtp(registeredEmail, otp);
      if (result?.success) navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid verification code.'));
    } finally { setSubmittingOtp(false); }
  };

  const handleResendOtp = async () => {
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const res = await API.post('/auth/resend-otp', { email: registeredEmail, type: 'registration' });
      if (res.data.success) {
        setSuccessMsg('A new OTP has been sent to your email.');
        setResendCooldown(30);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to resend OTP'));
    } finally { setLoading(false); }
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
      <BrandPanel />

      {/* ── Form panel ── */}
      <div className="auth-right-panel w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link to="/">
              <p
                className="text-2xl font-bold text-[#111111] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
              >
                Klare Homes
              </p>
              <p className="text-[8px] tracking-[0.3em] text-[#C1121F] uppercase font-semibold mt-1">
                Luxury Architecture & Design
              </p>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-[9px] tracking-[0.28em] text-[#C1121F] uppercase font-semibold mb-3">
              Studio Portal
            </p>
            <h1
              className="text-3xl font-bold text-[#111111] uppercase tracking-wide leading-tight"
              style={{ fontFamily: 'var(--font-heading, "Playfair Display"), Georgia, serif' }}
            >
              {step === 1 ? <>Create<br />Account</> : <>Verify<br />Email</>}
            </h1>
            <p className="text-sm text-[#888888] mt-3">
              {step === 1 ? 'Join our private client community.' : `Enter the code sent to ${registeredEmail}.`}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="w-8 h-px bg-[#C1121F]" />
              <div className="flex-1 h-px bg-[#F0F0F0]" />
            </div>
          </div>

          {/* Step progress + label */}
          <div className="mb-6">
            <StepProgress step={step} />
            <p className="text-xs text-[#AAAAAA]">
              Step {step} of 2 — {step === 1 ? 'Account Details' : 'Verify Email'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6"
              style={{ borderRadius: '2px' }}
            >
              <span className="shrink-0 mt-0.5 text-base leading-none">⚠</span>
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div
              role="status"
              aria-live="polite"
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 mb-6"
              style={{ borderRadius: '2px' }}
            >
              {successMsg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className={labelCls}>First Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none" aria-hidden="true" />
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      aria-invalid={errors.firstName ? 'true' : 'false'}
                      aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                      {...register('firstName', { required: 'Required' })}
                      placeholder="First"
                      className={inputIconCls}
                      style={{ borderRadius: '2px' }}
                    />
                  </div>
                  {errors.firstName && <p id="firstName-error" className="text-red-500 text-xs mt-1.5">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className={labelCls}>Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                    {...register('lastName', { required: 'Required' })}
                    placeholder="Last"
                    className={inputCls}
                    style={{ borderRadius: '2px' }}
                  />
                  {errors.lastName && <p id="lastName-error" className="text-red-500 text-xs mt-1.5">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelCls}>Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    {...register('email', { required: 'Email address is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
                    placeholder="architect@klarehomes.com"
                    className={inputIconCls}
                    style={{ borderRadius: '2px' }}
                  />
                </div>
                {errors.email && <p id="email-error" className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="phone" className={labelCls}>Phone <span className="text-[#CCCCCC] normal-case tracking-normal">(optional)</span></label>
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none" aria-hidden="true" />
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    {...register('phone')}
                    placeholder="+49 172..."
                    className={inputIconCls}
                    style={{ borderRadius: '2px' }}
                  />
                </div>
              </div>

              <PasswordField
                id="password"
                label="Password"
                placeholder="••••••••••••"
                autoComplete="new-password"
                error={errors.password}
                registration={register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                placeholder="••••••••••••"
                autoComplete="new-password"
                error={errors.confirmPassword}
                registration={register('confirmPassword', { required: 'Required', validate: (v) => v === watchPassword || 'Passwords do not match' })}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#C1121F] hover:bg-[#9B0F18] text-white text-[11px] uppercase tracking-[0.2em] font-semibold py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px"
                style={{ borderRadius: '2px' }}
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    Create Profile
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={onVerifyOtp} className="space-y-5">
              <div>
                <label htmlFor="otp" className={labelCls}>6-Digit Code</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className={inputCls}
                  style={{ borderRadius: '2px', letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem' }}
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={submittingOtp || otp.length !== 6}
                className="w-full flex items-center justify-center gap-3 bg-[#111111] hover:bg-[#333333] text-white text-[11px] uppercase tracking-[0.2em] font-semibold py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px"
                style={{ borderRadius: '2px' }}
              >
                {submittingOtp ? (
                  <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight size={13} />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-[#AAAAAA]">
                Didn't receive it?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resendCooldown > 0}
                  className="text-[#C1121F] hover:text-[#9B0F18] font-semibold transition-colors disabled:text-[#DDDDDD] disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                </button>
              </p>
            </form>
          )}

          {/* Footer link */}
          <div className="mt-8 pt-6 border-t border-[#F0F0F0] text-center">
            <p className="text-sm text-[#AAAAAA]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#C1121F] hover:text-[#9B0F18] font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          {/* Bottom watermark — aligns with brand panel */}
          <p className="mt-10 text-[9px] tracking-widest text-[#DDDDDD] uppercase text-center lg:text-left">
            Munich · Est. 2009
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;