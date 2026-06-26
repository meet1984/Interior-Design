import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';
import { getImageUrl } from '../../services/imageUrl';

// Shared studio tokens — same set used across Manager screens.
const palette = {
  red: '#C1121F',
  deepRed: '#9B0F18',
  navy: '#34495E',
  sage: '#8D9A84',
  stone: '#F2EFEA',
  border: '#E5E5E5',
  textPrimary: '#111111',
  textSecondary: '#666666',
  textMuted: '#888888',
  charcoal: '#1C1A17',
};

const inputBaseStyle = {
  color: palette.textPrimary,
  backgroundColor: palette.stone,
  border: `1px solid ${palette.border}`,
};

export const UserProfile = () => {
  const { user, setUser } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const formRef = useRef(null);

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  const hasAvatar = Boolean(user.avatar) && !avatarFailed;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await API.post('/auth/profile/request-otp');
      if (res.data.success) {
        setShowOtp(true);
        setSuccessMsg('OTP sent to your email. Please enter it to verify your changes.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSave = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    setError('');

    const formData = new FormData(formRef.current);
    formData.append('otp', otp);

    try {
      const res = await API.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        setSuccessMsg('Profile configurations updated successfully.');
        setUser(res.data.user);
        setShowOtp(false);
        setOtp('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-2xl mx-auto bg-white p-8 font-display"
      style={{ border: `1px solid ${palette.border}`, boxShadow: '0 1px 2px rgba(17,17,17,0.03)' }}
    >
      <div className="mb-8 pb-8" style={{ borderBottom: `1px solid ${palette.border}` }}>
        <p
          className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold"
          style={{ color: palette.red }}
        >
          Account Settings
        </p>
        <h2 className="text-2xl font-light tracking-tight mt-1" style={{ color: palette.textPrimary }}>
          My Profile
        </h2>
        <p className="text-sm font-sans mt-1" style={{ color: palette.textSecondary }}>
          Configure your security credentials and contact card.
        </p>
      </div>

      {successMsg && (
        <div
          role="status"
          aria-live="polite"
          className="text-xs px-4 py-3 mb-6 text-center font-sans"
          style={{ backgroundColor: '#F1F4EF', border: `1px solid ${palette.sage}55`, color: '#5C6856' }}
        >
          {successMsg}
        </div>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="text-xs px-4 py-3 mb-6 text-center font-sans"
          style={{ backgroundColor: '#FBEAEA', border: `1px solid ${palette.red}55`, color: palette.deepRed }}
        >
          {error}
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={showOtp ? handleVerifyAndSave : handleRequestOtp}
        className="space-y-6 font-sans text-xs"
      >
        {/* Profile Picture */}
        <div className="space-y-2">
          <label
            htmlFor="avatar-input"
            className="text-[10px] uppercase tracking-widest font-semibold block"
            style={{ color: palette.textMuted }}
          >
            Profile Photo
          </label>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
              style={{ backgroundColor: palette.stone, color: palette.navy, border: `1px solid ${palette.border}` }}
            >
              {hasAvatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span aria-hidden="true">{initials || '—'}</span>
              )}
            </div>
            <div>
              {/* file: pseudo-element variants can't take inline styles, so the brand
                  hex is used directly here to stay in sync with palette.red */}
              <input
                id="avatar-input"
                type="file"
                name="avatar"
                accept="image/*"
                disabled={showOtp}
                className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-none file:border file:border-[#C1121F] file:text-[10px] file:font-semibold file:uppercase file:tracking-widest file:bg-transparent file:text-[#C1121F] hover:file:bg-[#C1121F] hover:file:text-white file:cursor-pointer file:transition-colors file:duration-300 disabled:opacity-50"
                style={{ color: palette.textSecondary }}
              />
              <p className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: palette.textMuted }}>
                JPG, PNG, WEBP (max 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label
              htmlFor="firstName-input"
              className="text-[10px] uppercase tracking-widest font-semibold block"
              style={{ color: palette.textMuted }}
            >
              First Name
            </label>
            <input
              id="firstName-input"
              type="text"
              name="firstName"
              required
              disabled={showOtp}
              defaultValue={user.firstName}
              className="w-full px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
              style={{ ...inputBaseStyle, outlineColor: palette.red }}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="lastName-input"
              className="text-[10px] uppercase tracking-widest font-semibold block"
              style={{ color: palette.textMuted }}
            >
              Last Name
            </label>
            <input
              id="lastName-input"
              type="text"
              name="lastName"
              required
              disabled={showOtp}
              defaultValue={user.lastName}
              className="w-full px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
              style={{ ...inputBaseStyle, outlineColor: palette.red }}
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label
              htmlFor="email-input"
              className="text-[10px] uppercase tracking-widest font-semibold block"
              style={{ color: palette.textMuted }}
            >
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2.5 cursor-not-allowed"
              style={{ backgroundColor: '#FAFAFA', border: `1px solid ${palette.border}`, color: palette.textMuted }}
            />
            <p className="text-[10px]" style={{ color: palette.textMuted }}>
              Contact studio admin to change your email.
            </p>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="phone-input"
              className="text-[10px] uppercase tracking-widest font-semibold block"
              style={{ color: palette.textMuted }}
            >
              Phone Number
            </label>
            <input
              id="phone-input"
              type="text"
              name="phone"
              disabled={showOtp}
              defaultValue={user.phone}
              className="w-full px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
              style={{ ...inputBaseStyle, outlineColor: palette.red }}
            />
          </div>
        </div>

        {showOtp && (
          <div
            className="p-6 mt-6 space-y-4"
            style={{ backgroundColor: palette.stone, border: `1px solid ${palette.border}` }}
          >
            <div className="space-y-2">
              <label
                htmlFor="otp-input"
                className="text-[10px] uppercase tracking-widest font-semibold block text-center"
                style={{ color: palette.textMuted }}
              >
                Enter verification code
              </label>
              <input
                id="otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                className="w-full px-4 py-3 text-center text-lg tracking-[0.5em] font-mono rounded-none focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${palette.border}`,
                  color: palette.textPrimary,
                  outlineColor: palette.red,
                }}
                required
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowOtp(false);
                setOtp('');
                setError('');
              }}
              className="w-full text-[10px] uppercase tracking-widest transition-colors duration-250 text-center hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: palette.textMuted, outlineColor: palette.red }}
            >
              Cancel update
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-white font-semibold tracking-widest uppercase text-xs transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: loading ? palette.textMuted : palette.red, outlineColor: palette.red }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = palette.deepRed; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = palette.red; }}
        >
          {loading ? 'Processing…' : showOtp ? 'Verify & save changes' : 'Request OTP to save'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;