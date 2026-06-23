import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Mail, Lock, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm();
  const { register: registerReset, handleSubmit: handleResetSubmit, watch, formState: { errors: resetErrors } } = useForm();
  const newPassword = watch('newPassword');

  const onRequestSubmit = async (data) => {
    setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email: data.email });
      if (res.data.success) { setEmail(data.email); setStep(2); setSuccessMsg(res.data.message || 'OTP sent to your email.'); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to request password reset'); }
    finally { setLoading(false); }
  };

  const onResetSubmit = async (data) => {
    setError(''); setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { email, otp: data.otp, newPassword: data.newPassword });
      if (res.data.success) { setSuccessMsg('Password reset successfully!'); setTimeout(() => navigate('/login'), 2000); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to reset password'); }
    finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const res = await API.post('/auth/resend-otp', { email, type: 'forgot_password' });
      if (res.data.success) setSuccessMsg('A new OTP has been sent to your email.');
    } catch (err) { setError(err.response?.data?.message || 'Failed to resend OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center items-center p-14"
        style={{ background: 'linear-gradient(145deg, #0A0F1E 0%, #111827 60%, #1a1200 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C8A97E]/6 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 text-center space-y-8 max-w-sm">
          <Link to="/">
            <p className="text-2xl font-light tracking-[0.28em] text-white">SIGNATURE</p>
            <p className="text-[9px] tracking-[0.38em] text-[#C8A97E] uppercase mt-1">Luxury Architecture &amp; Design</p>
          </Link>
          <div className="w-16 h-16 rounded-full bg-[#C8A97E]/10 border border-[#C8A97E]/30 flex items-center justify-center mx-auto animate-floatUp">
            <KeyRound size={28} className="text-[#C8A97E]" />
          </div>
          <div>
            <h2 className="text-2xl font-light text-white tracking-wide">Account Recovery</h2>
            <p className="text-sm text-slate-400 font-sans mt-3 leading-relaxed">
              We take your studio access security seriously. Follow the steps to securely recover your account.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            {[1, 2].map(s => (
              <div key={s} className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#C8A97E]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-[#F5F4F0]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link to="/"><p className="text-2xl font-light tracking-[0.28em] text-stone-900">SIGNATURE</p></Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-stone-900 tracking-wide">
              {step === 1 ? 'Reset Password' : 'Create New Password'}
            </h1>
            <p className="text-sm text-stone-500 mt-2">
              {step === 1 ? 'Enter your email to receive a recovery code' : `Enter the code sent to ${email}`}
            </p>
            <div className="w-10 h-0.5 bg-[#C8A97E] mt-4" />
          </div>

          {/* Alerts */}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-5 rounded-sm font-sans">⚠ {error}</div>}
          {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 mb-5 rounded-sm font-sans">✓ {successMsg}</div>}

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit(onRequestSubmit)} className="space-y-5">
              <div>
                <label className="label-field">Registered Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="email"
                    {...registerEmail('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                    placeholder="architect@signature.com"
                    className="input-field pl-10"
                  />
                </div>
                {emailErrors.email && <p className="text-red-500 text-xs mt-1.5 font-sans">{emailErrors.email.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-4 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><span>Send Recovery Code</span><ArrowRight size={14} /></>}
              </button>

              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors mt-4">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-5">
              <div>
                <label className="label-field">Verification Code</label>
                <input type="text"
                  {...registerReset('otp', { required: 'OTP is required' })}
                  placeholder="0  0  0  0  0  0"
                  className="input-field text-center text-xl tracking-[0.5em] font-mono"
                />
                {resetErrors.otp && <p className="text-red-500 text-xs mt-1.5 font-sans">{resetErrors.otp.message}</p>}
              </div>

              <div>
                <label className="label-field">New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="password"
                    {...registerReset('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                </div>
                {resetErrors.newPassword && <p className="text-red-500 text-xs mt-1.5 font-sans">{resetErrors.newPassword.message}</p>}
              </div>

              <div>
                <label className="label-field">Confirm New Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="password"
                    {...registerReset('confirmPassword', { required: 'Required', validate: v => v === newPassword || 'Passwords do not match' })}
                    placeholder="••••••••"
                    className="input-field pl-10"
                  />
                </div>
                {resetErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-sans">{resetErrors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-4 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><span>Reset Password</span><ArrowRight size={14} /></>}
              </button>

              <p className="text-center text-sm text-stone-500 font-sans">
                Didn't receive it?{' '}
                <button type="button" onClick={handleResendOtp} disabled={loading} className="text-[#C8A97E] hover:text-[#A8834A] font-semibold transition-colors">
                  Resend Code
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
