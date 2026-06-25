// src/pages/Settings.jsx
import { useState } from 'react';
import { User, Bell, Lock, Shield, Eye, Save } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account Details', icon: User },
    { id: 'security', label: 'Password & Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Map', icon: Eye },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">Preferences</h1>
        <p className="text-textMuted">Manage your account settings, security, and map preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {/* Settings Content Area */}
        <div className="flex-1 bg-surface border border-surface/50 rounded-2xl p-6 md:p-8 shadow-xl">
          
          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-textMain border-b border-surface/50 pb-4">Account Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Full Name</label>
                  <input type="text" defaultValue="Kaustubh" className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
                  <input type="email" defaultValue="rider@example.com" className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-textMuted mb-2">Bio</label>
                  <textarea rows="4" className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" defaultValue="Passionate rider always looking for the next weekend trail..."></textarea>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-textMain border-b border-surface/50 pb-4">Change Password</h2>
              
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors" />
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-surface/50 pb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-textMain">Map & Data Privacy</h2>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-background border border-surface rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                  <div>
                    <p className="font-bold text-textMain">Ghost Mode</p>
                    <p className="text-sm text-textMuted">Hide my precise location from public rooms (shows 1km radius instead).</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 accent-primary bg-surface border-surface rounded" />
                </label>

                <label className="flex items-center justify-between p-4 bg-background border border-surface rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                  <div>
                    <p className="font-bold text-textMain">Profile Visibility</p>
                    <p className="text-sm text-textMuted">Allow other riders to click my avatar on the map to see my profile stats.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary bg-surface border-surface rounded" />
                </label>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-textMain border-b border-surface/50 pb-4">Alert Preferences</h2>
              
              <div className="space-y-4">
                {['Ride Invites', 'Route Deviations', 'When a rider disconnects', 'Weekly Stat Summary'].map((item, i) => (
                  <label key={i} className="flex items-center justify-between p-4 bg-background border border-surface rounded-xl cursor-pointer hover:border-primary/30 transition-colors">
                    <p className="font-medium text-textMain">{item}</p>
                    <input type="checkbox" defaultChecked={i < 3} className="w-5 h-5 accent-primary bg-surface border-surface rounded" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Global Save Button for all tabs */}
          <div className="pt-8 mt-8 border-t border-surface/50 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-secondary text-background font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20">
              <Save className="h-5 w-5" /> Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;