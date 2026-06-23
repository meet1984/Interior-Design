import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';

export const UserProfile = () => {
  const { user, setUser } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const formRef = useRef(null);

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
          'Content-Type': 'multipart/form-data'
        }
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
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 p-8 shadow-sm font-display">
      <div className="mb-8">
        <h2 className="text-xl font-light uppercase tracking-widest text-slate-800">My Profile Settings</h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Configure security credentials and contact card</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 mb-6 text-center font-sans">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 mb-6 text-center font-sans">
          {error}
        </div>
      )}

      <form ref={formRef} onSubmit={showOtp ? handleVerifyAndSave : handleRequestOtp} className="space-y-6 font-sans text-xs">
        
        {/* Profile Picture */}
        <div className="space-y-2">
          <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Profile Photo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border flex items-center justify-center text-[#C8A97E] font-bold text-lg">
              {user.avatar ? (
                <img src={`${import.meta.env.VITE_API_URL}${user.avatar}`} alt="Avatar" className="w-full h-full rounded-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : null}
              {!user.avatar ? `${user.firstName[0]}${user.lastName[0]}` : ''}
            </div>
            <div>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                disabled={showOtp}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-none file:border file:border-[#C8A97E] file:text-[9px] file:font-semibold file:uppercase file:tracking-widest file:bg-transparent file:text-[#C8A97E] hover:file:bg-[#C8A97E] hover:file:text-white file:cursor-pointer disabled:opacity-50"
              />
              <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">JPG, PNG, WEBP (Max 2MB)</p>
            </div>
          </div>
        </div>

        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">First Name</label>
            <input
              type="text"
              name="firstName"
              required
              disabled={showOtp}
              defaultValue={user.firstName}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#C8A97E] focus:outline-none disabled:bg-slate-100"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Last Name</label>
            <input
              type="text"
              name="lastName"
              required
              disabled={showOtp}
              defaultValue={user.lastName}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#C8A97E] focus:outline-none disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Email Address</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block">Phone Number</label>
            <input
              type="text"
              name="phone"
              disabled={showOtp}
              defaultValue={user.phone}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#C8A97E] focus:outline-none disabled:bg-slate-100"
            />
          </div>
        </div>

        {showOtp && (
          <div className="p-4 bg-slate-50 border border-slate-200 mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold block text-center">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#C8A97E] focus:outline-none text-slate-800 text-center text-lg tracking-[0.5em] font-mono rounded-none"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowOtp(false);
                setOtp('');
              }}
              className="w-full text-[10px] text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors text-center"
            >
              Cancel Update
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold tracking-widest uppercase text-xs"
        >
          {loading ? 'Processing...' : (showOtp ? 'VERIFY & SAVE CHANGES' : 'REQUEST OTP TO SAVE')}
        </button>
      </form>
    </div>
  );
};
export default UserProfile;
