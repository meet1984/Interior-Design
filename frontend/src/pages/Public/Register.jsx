import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';
import { User, Mail, Lock, Phone, ArrowRight, CheckCircle } from 'lucide-react';

const AuthPanelLeft = ({ step }) => (
  <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14"
    style={{ background: 'linear-gradient(145deg, #0A0F1E 0%, #111827 60%, #1a1200 100%)' }}
  >
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A97E]/8 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C8A97E]/5 rounded-full blur-[80px]" />
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, rgba(10,15,30,0.96) 0%, rgba(10,15,30,0.88) 100%)' }} />
    </div>

    <div className="relative z-10">
      <Link to="/">
        <p className="text-2xl font-light tracking-[0.28em] text-white">SIGNATURE</p>
        <p className="text-[9px] tracking-[0.38em] text-[#C8A97E] uppercase mt-1">Luxury Architecture &amp; Design</p>
      </Link>
    </div>

    <div className="relative z-10 space-y-8">
      {/* Step progress */}
      <div className="space-y-2">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Registration Progress</p>
        <div className="flex gap-3">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#C8A97E]' : 'bg-white/10'}`} />
          ))}
        </div>
        <p className="text-xs text-slate-400">Step {step} of 2 — {step === 1 ? 'Account Details' : 'Verify Email'}</p>
      </div>

      <div className="space-y-4">
        {[
          { icon: CheckCircle, text: 'Access exclusive design collections' },
          { icon: CheckCircle, text: 'Save and favorite product designs' },
          { icon: CheckCircle, text: 'Request private showroom appointments' },
          { icon: CheckCircle, text: 'Track your project inquiries' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <Icon size={15} className="text-[#C8A97E] shrink-0" />
            <span className="text-sm text-slate-400 font-sans">{text}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="relative z-10 border-t border-white/5 pt-8">
      <p className="text-xs text-slate-600 font-sans leading-relaxed">
        By creating an account, you agree to our <a href="#" className="text-[#C8A97E]">Privacy Policy</a> and <a href="#" className="text-[#C8A97E]">Terms of Service</a>.
      </p>
    </div>
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

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' }
  });
  const watchPassword = watch('password', '');

  const onSubmit = async (data) => {
    setError(''); setLoading(true);
    try {
      const result = await registerUser(data.firstName, data.lastName, data.email, data.password, data.phone);
      if (result && result.success) {
        setRegisteredEmail(result.email || data.email);
        setStep(2);
        setSuccessMsg(result.message);
      }
    } catch (err) { setError(err || 'Failed to register account'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const result = await verifyRegistrationOtp(registeredEmail, otp);
      if (result && result.success) navigate('/client', { replace: true });
    } catch (err) { setError(err || 'Failed to verify OTP'); }
    finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      const res = await API.post('/auth/resend-otp', { email: registeredEmail, type: 'registration' });
      if (res.data.success) setSuccessMsg('A new OTP has been sent to your email.');
    } catch (err) { setError(err.response?.data?.message || 'Failed to resend OTP'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <AuthPanelLeft step={step} />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-[#F5F4F0] overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link to="/"><p className="text-2xl font-light tracking-[0.28em] text-stone-900">SIGNATURE</p></Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-stone-900 tracking-wide">
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-sm text-stone-500 mt-2">
              {step === 1 ? 'Join our private client community' : `We sent a verification code to ${registeredEmail}`}
            </p>
            <div className="w-10 h-0.5 bg-[#C8A97E] mt-4" />
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-5 rounded-sm font-sans">⚠ {error}</div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 mb-5 rounded-sm font-sans">✓ {successMsg}</div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">First Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input type="text" {...register('firstName', { required: 'Required' })} placeholder="First" className="input-field pl-10 text-sm" />
                  </div>
                  {errors.firstName && <p className="text-red-500 text-xs mt-1 font-sans">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="label-field">Last Name</label>
                  <input type="text" {...register('lastName', { required: 'Required' })} placeholder="Last" className="input-field text-sm" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1 font-sans">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="label-field">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="email" {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} placeholder="you@example.com" className="input-field pl-10 text-sm" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 font-sans">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label-field">Phone <span className="text-stone-400 normal-case tracking-normal">(optional)</span></label>
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="text" {...register('phone')} placeholder="+49 172..." className="input-field pl-10 text-sm" />
                </div>
              </div>

              <div>
                <label className="label-field">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="password" {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} placeholder="••••••••" className="input-field pl-10 text-sm" />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 font-sans">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label-field">Confirm Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="password" {...register('confirmPassword', { required: 'Required', validate: v => v === watchPassword || 'Passwords do not match' })} placeholder="••••••••" className="input-field pl-10 text-sm" />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-sans">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-4 mt-2 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><span>Create Private Profile</span><ArrowRight size={14} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="bg-white border border-stone-200 p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#C8A97E]/10 border border-[#C8A97E]/30 flex items-center justify-center mx-auto">
                  <Mail size={22} className="text-[#C8A97E]" />
                </div>
                <p className="text-sm text-stone-600 font-sans">Enter the 6-digit verification code sent to your email.</p>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="0  0  0  0  0  0"
                  className="w-full text-center text-2xl tracking-[0.6em] font-mono border border-stone-200 py-4 focus:border-[#C8A97E] focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/15 transition-all bg-stone-50"
                  required maxLength={6}
                />
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-4 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><span>Verify &amp; Continue</span><ArrowRight size={14} /></>}
              </button>

              <p className="text-center text-sm text-stone-500 font-sans">
                Didn't receive it?{' '}
                <button type="button" onClick={handleResendOtp} disabled={loading}
                  className="text-[#C8A97E] hover:text-[#A8834A] font-semibold transition-colors"
                >
                  Resend Code
                </button>
              </p>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-stone-200 text-center">
            <p className="text-sm text-stone-500">Already have an account?{' '}
              <Link to="/login" className="text-[#C8A97E] hover:text-[#A8834A] font-semibold transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
