import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';

export default function PatientProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/profiles/patient/me');
      setProfileData(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        dateOfBirth: response.data.dateOfBirth || '',
        address: response.data.address || '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/api/profiles/patient/me', formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      console.error(error);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }
    if (!passwordData.newPassword.trim()) {
      toast.error('New password is required');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await api.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPassword(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      console.error(error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
            <p className="text-sm text-slate-600 mt-1">Manage your personal information</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2.5 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <UserIcon className="w-4 h-4" />
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-base text-slate-600 font-medium">
                  {profileData?.fullName || 'Not provided'}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <EnvelopeIcon className="w-4 h-4" />
                Email Address
              </label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-base text-slate-600 font-medium">
                  {profileData?.email || 'Not provided'}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <PhoneIcon className="w-4 h-4" />
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-base text-slate-600 font-medium">
                  {profileData?.phone || 'Not provided'}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <CalendarIcon className="w-4 h-4" />
                Date of Birth
              </label>
              {editing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              ) : (
                <p className="text-base text-slate-600 font-medium">
                  {profileData?.dateOfBirth
                    ? new Date(profileData.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Not provided'}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <MapPinIcon className="w-4 h-4" />
                Address
              </label>
              {editing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-base text-slate-600 font-medium">
                  {profileData?.address || 'Not provided'}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      fullName: profileData?.fullName || '',
                      email: profileData?.email || '',
                      phone: profileData?.phone || '',
                      dateOfBirth: profileData?.dateOfBirth || '',
                      address: profileData?.address || '',
                    });
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl border border-sky-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Account Status</p>
              <p className="text-base font-semibold text-emerald-600 mt-1">Active</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Member Since</p>
              <p className="text-base font-semibold text-slate-700 mt-1">
                {profileData?.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <LockClosedIcon className="w-5 h-5 text-sky-500" />
              <h3 className="text-lg font-semibold text-slate-800">Change Password</h3>
            </div>
            {!changingPassword && (
              <button
                onClick={() => setChangingPassword(true)}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition-all"
              >
                Change Password
              </button>
            )}
          </div>

          {changingPassword && (
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your current password"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter your new password"
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-all shadow"
                >
                  Update Password
                </button>
                <button
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
