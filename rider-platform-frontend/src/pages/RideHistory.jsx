// src/pages/RideHistory.jsx
import { useState } from 'react';
import { Search, Filter, Calendar, MapPin, Route, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const RideHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for past rides
  const pastRides = [
    {
      id: "R-9921",
      name: "Dapoli Hills Weekend Run",
      date: "Oct 24, 2025",
      start: "Thane",
      destination: "Dapoli Hills",
      distance: "215 km",
      duration: "4h 30m",
      status: "Completed",
      riders: 8
    },
    {
      id: "R-9844",
      name: "Kasmal Pen Trail",
      date: "Nov 02, 2025",
      start: "Thane",
      destination: "Kasmal Pen",
      distance: "85 km",
      duration: "1h 45m",
      status: "Completed",
      riders: 4
    },
    {
      id: "R-9710",
      name: "Morning City Cruise",
      date: "Nov 15, 2025",
      start: "Thane",
      destination: "Marine Drive",
      distance: "42 km",
      duration: "1h 10m",
      status: "Aborted",
      riders: 2
    },
    {
      id: "R-9650",
      name: "Night Rider Meetup",
      date: "Dec 05, 2025",
      start: "Thane",
      destination: "Lonavala",
      distance: "95 km",
      duration: "2h 00m",
      status: "Completed",
      riders: 15
    }
  ];

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
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {pastRides.map((ride) => (
                <tr key={ride.id} className="hover:bg-background/30 transition-colors group">
                  
                  {/* Ride Info */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-textMain mb-1">{ride.name}</div>
                    <div className="text-xs text-textMuted flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {ride.date} • {ride.id}
                    </div>
                  </td>

                  {/* Route */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-textMain mb-1">
                      <MapPin className="h-4 w-4 text-primary" /> {ride.start}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-textMuted">
                      <Route className="h-4 w-4 text-red-500" /> {ride.destination}
                    </div>
                  </td>

                  {/* Metrics */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-textMain">{ride.distance}</div>
                    <div className="text-xs text-textMuted">{ride.duration} • {ride.riders} Riders</div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      ride.status === 'Completed' 
                        ? 'bg-primary/10 text-primary border-primary/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {ride.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm font-medium text-primary hover:text-secondary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-surface bg-background/50 flex items-center justify-between">
          <p className="text-sm text-textMuted">Showing <span className="font-medium text-textMain">1</span> to <span className="font-medium text-textMain">4</span> of <span className="font-medium text-textMain">24</span> results</p>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg border border-surface bg-surface text-textMuted hover:text-textMain disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-lg border border-surface bg-surface text-textMuted hover:text-textMain">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RideHistory;