import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  const redirectPath = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'manager') return '/manager';
    return '/';
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const result = await login(data.email, data.password, data.rememberMe);
      if (result && result.success) {
        const target = location.state?.from?.pathname || redirectPath(result.user.role);
        navigate(target, { replace: true });
      }
    } catch (err) {
      setError(err || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Left panel — brand visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-14"
        style={{ background: 'linear-gradient(145deg, #0A0F1E 0%, #111827 60%, #1a1200 100%)' }}
      >
        {/* Background decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A97E]/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C8A97E]/5 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, rgba(10,15,30,0.96) 0%, rgba(10,15,30,0.88) 100%)' }} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/">
            <p className="text-2xl font-light tracking-[0.28em] text-white">SIGNATURE</p>
            <p className="text-[9px] tracking-[0.38em] text-[#C8A97E] uppercase mt-1">Luxury Architecture &amp; Design</p>
          </Link>
        </div>

        {/* Quote block */}
        <div className="relative z-10 space-y-6">
          <div className="w-10 h-px bg-[#C8A97E]" />
          <blockquote className="text-2xl font-extralight text-white/90 leading-snug tracking-wide">
            "Where German precision meets Italian soul — every detail speaks."
          </blockquote>
          <p className="text-xs text-slate-500 uppercase tracking-widest">— Signature Design Philosophy</p>
        </div>

        {/* Trust signals */}
        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
          {[['15+', 'Years'], ['500+', 'Projects'], ['100%', 'Bespoke']].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="text-xl font-light text-[#C8A97E]">{num}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-[#F5F4F0]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link to="/">
              <p className="text-2xl font-light tracking-[0.28em] text-stone-900">SIGNATURE</p>
              <p className="text-[9px] tracking-widest text-[#C8A97E] uppercase mt-1">Luxury Architecture &amp; Design</p>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-stone-900 tracking-wide">Welcome back</h1>
            <p className="text-sm text-stone-500 mt-2">Sign in to your studio account</p>
            <div className="w-10 h-0.5 bg-[#C8A97E] mt-4" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6 rounded-sm font-sans flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label-field">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  placeholder="architect@signature.com"
                  className="input-field pl-11"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-sans">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label-field mb-0">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-[#C8A97E] hover:text-[#A8834A] uppercase tracking-wider transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••••••"
                  className="input-field pl-11 pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-sans">{errors.password.message}</p>}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div className="relative">
                <input type="checkbox" {...register('rememberMe')}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 border border-stone-300 peer-checked:bg-[#C8A97E] peer-checked:border-[#C8A97E] transition-all flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white hidden peer-checked:block" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4l3 3 5-6" />
                  </svg>
                </div>
              </div>
              <span className="text-xs text-stone-500 tracking-wider uppercase">Remember me for 30 days</span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-gold w-full py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#C8A97E] disabled:hover:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Enter Studio <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-200 text-center">
            <p className="text-sm text-stone-500">
              New client?{' '}
              <Link to="/register" className="text-[#C8A97E] hover:text-[#A8834A] font-semibold transition-colors">
                Create Profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
