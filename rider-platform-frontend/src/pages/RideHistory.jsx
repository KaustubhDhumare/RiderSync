// src/pages/RideHistory.jsx
import { useState, useContext, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Route, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { RideContext } from '../context/RideContext';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const RideHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { userRides, fetchUserRides } = useContext(RideContext);
  const { refreshUser } = useContext(AuthContext);
  
  // Check if we just got routed here from a newly completed ride
  const location = useLocation();

  useEffect(() => {
    // 🔴 Fetch the latest rides for the table
    fetchUserRides();

    // 🔴 If routed from a completed ride, force the AuthContext to refresh stats
    if (location.state?.refreshStats) {
      refreshUser();
      // Clear the state so it doesn't infinitely refresh on reload
      window.history.replaceState({}, document.title);
    }
  }, [fetchUserRides, refreshUser, location.state]);

  // Only show past rides (Completed or Cancelled)
  const pastRides = userRides.filter(r => r.status === 'completed' || r.status === 'cancelled');

  // Basic search filter
  const filteredRides = pastRides.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.startLocation?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destination?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textMain mb-1">Ride History</h1>
          <p className="text-textMuted">Review your past routes, distances, and track your overall progress.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-surface/50 text-textMain font-medium rounded-xl hover:bg-background transition-colors">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-surface border border-surface/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-textMuted" />
          </div>
          <input
            type="text"
            placeholder="Search by ride name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-surface rounded-xl text-sm font-medium hover:text-primary transition-colors">
            <Calendar className="h-4 w-4" /> Date Range
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-surface rounded-xl text-sm font-medium hover:text-primary transition-colors">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-surface/50 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-surface text-textMuted text-sm">
                <th className="px-6 py-4 font-medium">Ride Info</th>
                <th className="px-6 py-4 font-medium">Route</th>
                <th className="px-6 py-4 font-medium">Metrics</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-textMuted">No past rides found.</td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride._id} className="hover:bg-background/30 transition-colors group">
                    
                    {/* Ride Info */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-textMain mb-1">{ride.name}</div>
                      <div className="text-xs text-textMuted flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {ride.date} • {ride.roomCode}
                      </div>
                    </td>

                    {/* Route */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-textMain mb-1">
                        <MapPin className="h-4 w-4 text-primary shrink-0" /> <span className="truncate max-w-[200px]">{ride.startLocation?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-textMuted">
                        <Route className="h-4 w-4 text-red-500 shrink-0" /> <span className="truncate max-w-[200px]">{ride.destination?.name}</span>
                      </div>
                    </td>

                    {/* Metrics */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-textMain">{ride.distance} km</div>
                      <div className="text-xs text-textMuted">{ride.participants?.length || 1} Riders</div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        ride.status === 'completed' 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RideHistory;