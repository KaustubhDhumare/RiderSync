// src/pages/Dashboard.jsx
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { RideContext } from '../context/RideContext'; // 🔴 Import RideContext
import { Map as MapIcon, Activity, Clock, PlusCircle, ArrowRight, Route, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // 🔴 Import useNavigate

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  // 🔴 Pull in the real data states
  const { userRides, fetchUserRides, isLoading } = useContext(RideContext); 
  const navigate = useNavigate();

  // State for the "Join by Code" input on the right column
  const [joinCode, setJoinCode] = useState('');

  // 🔴 Fetch the user's specific rides when the dashboard loads
  useEffect(() => {
    fetchUserRides();
  }, [fetchUserRides]);

  // Handle joining a room directly from the quick action card
  const handleJoinByCode = () => {
    if (joinCode.trim()) {
      navigate(`/tracking/${joinCode.toUpperCase()}`);
    }
  };

  // Mock stats (You can wire these to real DB aggregations later!)
const stats = [
    { title: "Total Rides", value: user?.totalRides || 0, icon: Route, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Rooms", value: userRides.filter(r => r.status === 'active').length || 0, icon: MapIcon, color: "text-primary", bg: "bg-primary/10" },
    { title: "Distance (km)", value: user?.totalDistance ? Number(user.totalDistance).toFixed(1) : "0.0", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Hours Logged", value: "--", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" } // We'll do time later
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
            <h2 className="text-xl font-bold text-textMain">My Garage Rooms</h2>
            <Link to="/history" className="text-sm text-primary hover:text-secondary font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="bg-surface rounded-2xl border border-surface/50 overflow-hidden min-h-[200px]">
            {/* 🔴 Conditional Rendering based on real data */}
            {isLoading ? (
              <div className="flex justify-center items-center h-full py-12">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : userRides.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-textMuted mb-4">You haven't created or joined any rides yet.</p>
                <Link to="/create-ride" className="text-primary hover:underline font-medium">Create your first ride</Link>
              </div>
            ) : (
              userRides.map((ride, idx) => (
                <div key={ride._id} className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-background/50 transition-colors gap-4 ${idx !== userRides.length - 1 ? 'border-b border-surface' : ''}`}>
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Status Dot */}
                    <div className={`w-3 h-3 rounded-full mt-1.5 sm:mt-0 ${
                      ride.status === 'active' ? 'bg-primary animate-pulse' : 
                      ride.status === 'completed' ? 'bg-green-500' : 'bg-surface border-2 border-textMuted'
                    }`}></div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-textMain">{ride.name}</h4>
                        {/* 🔴 Added Visibility Badge */}
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-background border border-surface text-textMuted">
                          {ride.visibility}
                        </span>
                      </div>
                      <p className="text-sm text-textMuted mt-0.5">
                        {ride.date} • Code: <span className="text-primary font-mono font-medium">{ride.roomCode}</span>
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/tracking/${ride.roomCode}`)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium border border-surface rounded-lg hover:bg-surface text-textMain transition-colors"
                  >
                    {ride.status === 'active' ? 'Re-join Map' : 'View Room'}
                  </button>
                </div>
              ))
            )}
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
            <div className="flex gap-2 relative z-10">
              <input 
                type="text" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g. X7K9P2" 
                className="flex-1 bg-background border border-surface rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none uppercase font-mono" 
              />
              <button 
                onClick={handleJoinByCode}
                disabled={!joinCode.trim()}
                className="bg-primary text-background font-bold px-4 py-2 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
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