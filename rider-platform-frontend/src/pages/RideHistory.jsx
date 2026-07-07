// src/pages/RideHistory.jsx
import { useState, useContext, useEffect } from 'react';
import { Calendar, MapPin, Route, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { RideContext } from '../context/RideContext';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const RideHistory = () => {
  const { userRides, fetchUserRides } = useContext(RideContext);
  const { refreshUser } = useContext(AuthContext);
  
  const location = useLocation();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ridesPerPage = 10;

  // 🔴 Date Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchUserRides();

    if (location.state?.refreshStats) {
      refreshUser();
      window.history.replaceState({}, document.title);
    }
  }, [fetchUserRides, refreshUser, location.state]);

  // 🔴 Reset to page 1 whenever the user changes the date filters
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  // 1. Get past rides
  const pastRides = userRides.filter(r => r.status === 'completed' || r.status === 'cancelled');

  // 2. 🔴 Apply Date Range Filter
  const filteredRides = pastRides.filter(ride => {
    if (!startDate && !endDate) return true;
    
    // Convert string dates to Date objects for accurate mathematical comparison
    const rDate = new Date(ride.date);
    const sDate = startDate ? new Date(startDate) : null;
    const eDate = endDate ? new Date(endDate) : null;

    if (sDate && rDate < sDate) return false;
    if (eDate && rDate > eDate) return false;
    
    return true;
  });

  // 3. Apply Pagination to the FILTERED results
  const indexOfLastRide = currentPage * ridesPerPage;
  const indexOfFirstRide = indexOfLastRide - ridesPerPage;
  const currentRides = filteredRides.slice(indexOfFirstRide, indexOfLastRide);
  const totalPages = Math.ceil(filteredRides.length / ridesPerPage);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-textMain mb-1">Ride History</h1>
          <p className="text-textMuted">Review your past routes, distances, and track your overall progress.</p>
        </div>
      </div>

      {/* 🔴 Functional Date Range Filter */}
      <div className="bg-surface border border-surface/50 rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-textMuted" />
          <span className="text-sm font-bold text-textMain uppercase tracking-wider">Filter Dates:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-background border border-surface rounded-xl px-3 py-2 text-sm text-textMain focus:ring-2 focus:ring-primary/50 outline-none [color-scheme:dark]"
          />
          <span className="text-textMuted text-sm font-medium">to</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-background border border-surface rounded-xl px-3 py-2 text-sm text-textMain focus:ring-2 focus:ring-primary/50 outline-none [color-scheme:dark]"
          />
        </div>

        {(startDate || endDate) && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors ml-auto"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
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
              {currentRides.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12">
                    <p className="text-textMuted font-medium">No past rides found in this date range.</p>
                  </td>
                </tr>
              ) : (
                currentRides.map((ride) => (
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

        {/* Pagination Footer */}
        {filteredRides.length > 0 && (
          <div className="px-6 py-4 border-t border-surface bg-background/50 flex items-center justify-between">
            <p className="text-sm text-textMuted">
              Showing <span className="font-medium text-textMain">{(currentPage - 1) * ridesPerPage + 1}</span> to <span className="font-medium text-textMain">{Math.min(currentPage * ridesPerPage, filteredRides.length)}</span> of <span className="font-medium text-textMain">{filteredRides.length}</span> results
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="p-2 rounded-lg border border-surface bg-surface text-textMuted hover:text-textMain disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="p-2 rounded-lg border border-surface bg-surface text-textMuted hover:text-textMain disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideHistory;