import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

/* ─────────────────────────────────────────────
   SHARED INPUT STYLES
───────────────────────────────────────────── */
const inputCls =
  'w-full border border-[#E5E5E5] focus:border-[#C1121F] bg-[#FAFAFA] focus:bg-white px-4 py-3.5 text-sm text-[#111111] placeholder-[#CCCCCC] outline-none transition-all duration-200';
const inputIconCls = `${inputCls} pl-11`;
const labelCls =
  'block text-[10px] tracking-[0.18em] text-[#888888] uppercase font-semibold mb-1.5';

/* ─────────────────────────────────────────────
   CUSTOM CHECKBOX
───────────────────────────────────────────── */
const Checkbox = ({ registration }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none group">
    <div className="relative shrink-0">
      <input type="checkbox" {...registration} className="sr-only peer" />
      <div
        className="w-4 h-4 border border-[#CCCCCC] peer-checked:bg-[#C1121F] peer-checked:border-[#C1121F] transition-all duration-150 flex items-center justify-center"
        style={{ borderRadius: '2px' }}
      >
        <svg
          className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
          viewBox="0 0 10 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M1 4l3 3 5-6" />
        </svg>
      </div>
    </div>
    <span className="text-xs text-[#666666] group-hover:text-[#333333] transition-colors">
      Remember me for 30 days
    </span>
  </label>
);

/* ─────────────────────────────────────────────
   LEFT BRAND PANEL
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
        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
      >
        Klare Homes
      </p>
      <p className="text-[8px] tracking-[0.35em] text-[#C1121F] uppercase font-semibold mt-0.5">
        Luxury Architecture & Design
      </p>
    </Link>

    {/* Centre quote */}
    <div className="relative z-10 space-y-5 max-w-xs">
      {/* Gold diamond accent */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-[#E6C77A] rotate-45 shrink-0" />
        <div className="flex-1 h-px bg-[#E5E5E5]" />
      </div>
      <blockquote
        className="text-2xl font-light text-[#111111] leading-snug"
        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
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
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
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

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export const Login = () => {
  const { login, verifyLoginOtp } = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const [requireOtp, setRequireOtp] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '', rememberMe: false } });

  const redirectPath = (role) => {
    if (role === 'admin')   return '/admin';
    if (role === 'manager') return '/manager';
    return '/';
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const result = await login(data.email, data.password, data.rememberMe);
      if (result?.requireOtp) {
        setRequireOtp(true);
        setLoginEmail(result.email);
      } else if (result?.success) {
        const target = location.state?.from?.pathname || redirectPath(result.user.role);
        navigate(target, { replace: true });
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setError('');
    setSubmittingOtp(true);
    try {
      const result = await verifyLoginOtp(loginEmail, otp);
      if (result?.success) {
        const target = location.state?.from?.pathname || redirectPath(result.user.role);
        navigate(target, { replace: true });
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Invalid verification code.');
    } finally {
      setSubmittingOtp(false);
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
      <BrandPanel />

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

          {/* Header */}
          <div className="mb-8">
            <p className="text-[9px] tracking-[0.28em] text-[#C1121F] uppercase font-semibold mb-3">
              Studio Portal
            </p>
            <h1
              className="text-3xl font-bold text-[#111111] uppercase tracking-wide leading-tight"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              {requireOtp ? (
                <>Verify<br />Account</>
              ) : (
                <>Welcome<br />Back</>
              )}
            </h1>
            <p className="text-sm text-[#888888] mt-3">
              {requireOtp ? 'Enter the code sent to your email.' : 'Sign in to your studio account.'}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="w-8 h-px bg-[#C1121F]" />
              <div className="flex-1 h-px bg-[#F0F0F0]" />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6"
              style={{ borderRadius: '2px' }}
            >
              <span className="shrink-0 mt-0.5 text-base leading-none">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          {!requireOtp ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className={labelCls}>Email Address</label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none"
                  />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                    })}
                    placeholder="architect@klarehomes.com"
                    className={inputIconCls}
                    style={{ borderRadius: '2px' }}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`${labelCls} mb-0`}>Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] text-[#C1121F] hover:text-[#9B0F18] uppercase tracking-wider transition-colors font-semibold"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    placeholder="••••••••••••"
                    className={`${inputIconCls} pr-11`}
                    style={{ borderRadius: '2px' }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#BBBBBB] hover:text-[#555555] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
                )}
              </div>

              {/* Remember me */}
              <Checkbox registration={register('rememberMe')} />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#C1121F] hover:bg-[#9B0F18] text-white text-[11px] uppercase tracking-[0.2em] font-semibold py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px"
                style={{ borderRadius: '2px' }}
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Enter Studio
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={onVerifyOtp} className="space-y-5">
              <div>
                <label className={labelCls}>6-Digit Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className={inputCls}
                  style={{ borderRadius: '2px', letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem' }}
                  autoComplete="one-time-code"
                />
              </div>
              <button
                type="submit"
                disabled={submittingOtp || otp.length !== 6}
                className="w-full flex items-center justify-center gap-3 bg-[#111111] hover:bg-[#333333] text-white text-[11px] uppercase tracking-[0.2em] font-semibold py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px"
                style={{ borderRadius: '2px' }}
              >
                {submittingOtp ? (
                  <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Verify & Enter
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer link */}
          <div className="mt-8 pt-6 border-t border-[#F0F0F0] text-center">
            <p className="text-sm text-[#AAAAAA]">
              New client?{' '}
              <Link
                to="/register"
                className="text-[#C1121F] hover:text-[#9B0F18] font-semibold transition-colors"
              >
                Create Profile
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

export default Login;