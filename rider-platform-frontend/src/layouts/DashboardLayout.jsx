// src/layouts/DashboardLayout.jsx
import { useState, useContext } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, PlusCircle, Map, History, 
  User, Settings, LogOut, Menu, X, MapPin 
} from 'lucide-react';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  console.log("MY USER OBJECT CONTAINS:", user);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Ride', path: '/create-ride', icon: PlusCircle },
    { name: 'Live Tracking', path: '/tracking', icon: Map },
    { name: 'Ride History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-6">
      <div className="px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="bg-primary/10 p-2 rounded-xl">
            <MapPin className="text-primary h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-textMain">
            Rider<span className="text-primary">Sync</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${isActive 
                  ? 'bg-primary text-background shadow-lg shadow-primary/20' 
                  : 'text-textMuted hover:bg-surface hover:text-textMain'}
              `}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Area & Logout */}
      <div className="px-6 border-t border-surface pt-6">
        <div className="flex items-center gap-3 mb-6">
          {/* 🔴 DYNAMIC AVATAR LOGIC */}
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="h-10 w-10 rounded-full object-cover border border-surface"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-surface border border-primary flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          
          <div>
            <p className="text-sm font-bold text-textMain">{user?.name || 'Rider'}</p>
            <p className="text-xs text-textMuted truncate w-32">{user?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors font-medium"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 bg-background border-r border-surface sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
        <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface shadow-2xl border-r border-surface z-10">
          <SidebarContent />
          <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-6 text-textMuted hover:text-textMain">
            <X className="h-6 w-6" />
          </button>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-surface px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <MapPin className="text-primary h-6 w-6" />
            <span className="text-xl font-bold text-textMain">RiderSync</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(true)} className="text-textMuted hover:text-textMain p-2 bg-surface rounded-lg">
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;