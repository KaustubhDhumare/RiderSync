// src/pages/Dashboard.jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Map as MapIcon, Activity, Clock, PlusCircle, ArrowRight, Route } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const stats = [
    { title: "Total Rides", value: "24", icon: Route, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Rooms", value: "2", icon: MapIcon, color: "text-primary", bg: "bg-primary/10" },
    { title: "Distance (km)", value: "1,240", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Hours Logged", value: "56", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" }
  ];

  const recentRides = [
    { id: 1, name: "Weekend Canyon Run", date: "Today, 08:00 AM", members: 12, status: "Active" },
    { id: 2, name: "Night City Cruise", date: "Yesterday, 10:00 PM", members: 5, status: "Completed" },
    { id: 3, name: "Mountain Pass Track", date: "Oct 12, 2023", members: 8, status: "Completed" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textMain mb-1">Welcome back, {user?.name?.split(' ')[0] || 'Rider'}!</h1>
          <p className="text-textMuted">Here's what's happening on your routes today.</p>
        </div>
        <Link to="/create-ride" className="bg-primary hover:bg-secondary text-background font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 flex items-center gap-2">
          <PlusCircle className="h-5 w-5" /> New Ride Room
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-surface p-6 rounded-2xl border border-surface/50 hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} group-hover:scale-110 transition-transform`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <p className="text-textMuted text-sm font-medium mb-1">{stat.title}</p>
            <h3 className="text-3xl font-bold text-textMain">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-textMain">Recent Ride Rooms</h2>
            <Link to="/history" className="text-sm text-primary hover:text-secondary font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="bg-surface rounded-2xl border border-surface/50 overflow-hidden">
            {recentRides.map((ride, idx) => (
              <div key={ride.id} className={`p-5 flex items-center justify-between hover:bg-background/50 transition-colors ${idx !== recentRides.length - 1 ? 'border-b border-surface' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${ride.status === 'Active' ? 'bg-primary animate-pulse' : 'bg-surface border-2 border-textMuted'}`}></div>
                  <div>
                    <h4 className="font-bold text-textMain">{ride.name}</h4>
                    <p className="text-sm text-textMuted">{ride.date} • {ride.members} Riders</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium border border-surface rounded-lg hover:bg-surface transition-colors">
                  {ride.status === 'Active' ? 'Join' : 'Details'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Actions / Promo */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-textMain">Quick Actions</h2>
          <div className="bg-gradient-to-br from-surface to-background border border-surface rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
            <MapIcon className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-bold text-textMain mb-2">Join by Code</h3>
            <p className="text-sm text-textMuted mb-4">Have an invite code from a friend? Enter it here to join instantly.</p>
            <div className="flex gap-2">
              <input type="text" placeholder="e.g. X7K-9P2" className="flex-1 bg-background border border-surface rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none" />
              <button className="bg-primary text-background font-bold px-4 py-2 rounded-xl hover:bg-secondary transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;