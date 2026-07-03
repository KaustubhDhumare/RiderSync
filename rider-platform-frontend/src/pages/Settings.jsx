// src/pages/Settings.jsx
import { useState, useEffect, useContext } from 'react';
import { User, Lock, Save, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { authApi } from '../api/authApi';

const Settings = () => {
  const { user, setUser } = useContext(AuthContext); 
  const [activeTab, setActiveTab] = useState('account');

  const [status, setStatus] = useState({ type: '', message: '' });

  // 🔴 Added phone to state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  });

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'account', label: 'Account Details', icon: User },
    { id: 'security', label: 'Password & Security', icon: Lock },
  ];

  // 🔴 Pre-fill includes phone
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!profileForm.name || !profileForm.email) {
      return setStatus({ type: 'error', message: 'Name and Email are required.' });
    }

    setStatus({ type: 'loading', message: '' });

    try {
      // 🔴 Send phone to backend
      const res = await authApi.updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio
      });
      
      setStatus({ type: 'success', message: res.message || 'Profile successfully updated.' });
      
      if (setUser && user) {
        // 🔴 Safely merge the new fields including phone
        const updatedUser = { 
          ...user, 
          name: res.name, 
          email: res.email, 
          phone: res.phone,
          bio: res.bio 
        };
        
        setUser(updatedUser); 
        
        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'All fields are required.' });
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'New passwords do not match.' });
    }

    if (passwords.newPassword.length < 6) {
      return setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
    }

    setStatus({ type: 'loading', message: '' });

    try {
      const res = await authApi.changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      
      setStatus({ type: 'success', message: res.message || 'Password successfully updated.' });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">Preferences</h1>
        <p className="text-textMuted">Manage your account settings and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setStatus({ type: '', message: '' }); 
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-primary text-background shadow-lg shadow-primary/20' 
                  : 'text-textMuted hover:bg-surface hover:text-textMain'
              }`}
            >
              <tab.icon className="h-5 w-5" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-surface border border-surface/50 rounded-2xl p-6 md:p-8 shadow-xl">
          
          {status.type === 'error' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
              <AlertCircle className="h-5 w-5 shrink-0" /> {status.message}
            </div>
          )}
          {status.type === 'success' && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 text-sm font-bold">
              <CheckCircle2 className="h-5 w-5 shrink-0" /> {status.message}
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-textMain border-b border-surface/50 pb-4">Account Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors" 
                  />
                </div>
                
                {/* 🔴 New Phone Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-textMuted mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={profileForm.phone} 
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-textMuted mb-2">Bio</label>
                  <textarea 
                    rows="4" 
                    value={profileForm.bio} 
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    placeholder="Tell other riders about yourself..."
                    className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors" 
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 flex justify-start">
                <button 
                  type="submit" 
                  disabled={status.type === 'loading'}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-secondary text-background font-bold rounded-xl transition-all disabled:opacity-50 disabled:hover:translate-y-0 shadow-lg shadow-primary/20"
                >
                  {status.type === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Update Profile
                </button>
              </div>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center border-b border-surface/50 pb-4">
                <h2 className="text-xl font-bold text-textMain">Change Password</h2>
                
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-2 text-sm font-bold text-textMuted hover:text-primary transition-colors"
                >
                  {showPassword ? <><EyeOff className="h-4 w-4" /> Hide</> : <><Eye className="h-4 w-4" /> Show</>}
                </button>
              </div>
              
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Current Password</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={passwords.oldPassword}
                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">New Password</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Confirm New Password</label>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-start">
                <button 
                  type="submit" 
                  disabled={status.type === 'loading'}
                  className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-secondary text-background font-bold rounded-xl transition-all disabled:opacity-50 disabled:hover:translate-y-0 shadow-lg shadow-primary/20"
                >
                  {status.type === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Update Password
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;