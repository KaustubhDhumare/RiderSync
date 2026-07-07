// src/pages/LiveTracking.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Map as MapIcon,
  ArrowRight,
  Activity,
  Users,
  MapPin,
  Loader2,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  Route
} from "lucide-react";
import { rideApi } from "../api/rideApi";

const LiveTracking = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Data States
  const [publicRides, setPublicRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningRoom, setJoiningRoom] = useState(null);
  
  // Utility States
  const [roomCode, setRoomCode] = useState("");

  // Filter States
  const [searchLocation, setSearchLocation] = useState("");
  const [maxDistance, setMaxDistance] = useState(500); // 500 acts as "500+"

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ridesPerPage = 10; // Switched to 10 for a cleaner list view

  useEffect(() => {
    const fetchPublicRides = async () => {
      try {
        const allRides = await rideApi.getRides();
        // Fetch only public AND active rides
        const visibleRides = allRides.filter(
          (ride) => ride.visibility === "public" && ride.status === "active",
        );
        setPublicRides(visibleRides);
      } catch (error) {
        console.error("Failed to fetch public rides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicRides();
  }, []);

  // Reset to page 1 if user changes filters
  useEffect(() => {
    setCurrentPage(1);
  }, [searchLocation, maxDistance]);

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setJoiningRoom("manual");
    try {
      await rideApi.joinRide(roomCode.toUpperCase());
      navigate(`/tracking/${roomCode.toUpperCase()}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join room. Check code.");
      setJoiningRoom(null);
    }
  };

  const handleRideClick = async (ride) => {
    const currentUserId = user?._id || user?.id;
    const rideCreatorId = ride.creator?._id || ride.creator;

    const isCreator = rideCreatorId && currentUserId && rideCreatorId.toString() === currentUserId.toString();
    const isParticipant = ride.participants?.some((p) => {
      const pId = p?._id || p;
      return pId && currentUserId && pId.toString() === currentUserId.toString();
    });

    const hasAccess = isCreator || isParticipant;

    if (hasAccess) {
      navigate(`/tracking/${ride.roomCode}`);
    } else {
      setJoiningRoom(ride.roomCode);
      try {
        await rideApi.joinRide(ride.roomCode);
        navigate(`/tracking/${ride.roomCode}`);
      } catch (err) {
        console.error("FULL JOIN ERROR:", err);
        alert(err.response?.data?.message || "Failed to join ride.");
        setJoiningRoom(null);
      }
    }
  };

  // FILTER ENGINE LOGIC
  const filteredRides = publicRides.filter((ride) => {
    // 1. Location Filter
    const locationMatch = !searchLocation || 
      ride.startLocation?.name?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      ride.destination?.name?.toLowerCase().includes(searchLocation.toLowerCase());
    
    // 2. Distance Filter
    const rideDistance = Number(ride.distance) || 0;
    // If slider is maxed out at 500, treat it as "infinity/no limit"
    const distanceMatch = maxDistance >= 500 ? true : rideDistance <= maxDistance;

    return locationMatch && distanceMatch;
  });

  // PAGINATION LOGIC
  const indexOfLastRide = currentPage * ridesPerPage;
  const indexOfFirstRide = indexOfLastRide - ridesPerPage;
  const currentRides = filteredRides.slice(indexOfFirstRide, indexOfLastRide);
  const totalPages = Math.ceil(filteredRides.length / ridesPerPage);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-textMain mb-2">Live Tracking Hub</h1>
        <p className="text-textMuted">Join an active ride room or monitor public routes in real-time.</p>
      </div>

      {/* Top Utility Bar: Join by Code */}
      <div className="bg-gradient-to-r from-surface to-background border border-surface/50 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <MapIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-textMain">Have a Private Code?</h2>
            <p className="text-xs text-textMuted">Enter it instantly to sync your map.</p>
          </div>
        </div>
        
        <form onSubmit={handleJoinByCode} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="e.g. X7K-9P2"
            className="w-full md:w-64 bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none uppercase font-mono text-sm"
          />
          <button
            type="submit"
            disabled={!roomCode.trim() || joiningRoom === "manual"}
            className="bg-primary hover:bg-secondary text-background font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 text-sm"
          >
            {joiningRoom === "manual" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
          </button>
        </form>
      </div>

      {/* Filter Engine */}
      <div className="bg-surface border border-surface/50 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row gap-6 items-center">
        {/* Search Location */}
        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-textMuted" />
          </div>
          <input
            type="text"
            placeholder="Search by city or location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
          />
        </div>

        {/* Distance Slider */}
        <div className="flex-1 w-full flex items-center gap-4 bg-background border border-surface px-4 py-2 rounded-xl">
          <Route className="h-5 w-5 text-textMuted shrink-0" />
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-textMuted uppercase">Max Distance</span>
              <span className="text-xs font-bold text-primary">
                {maxDistance >= 500 ? "Any Distance" : `Up to ${maxDistance} km`}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-surface rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Content: High-Density List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
          </div>
        ) : currentRides.length === 0 ? (
          <div className="bg-surface border border-surface/50 rounded-2xl p-12 text-center shadow-lg">
            <MapPin className="h-12 w-12 text-textMuted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-textMain mb-1">No Active Rides Found</h3>
            <p className="text-textMuted">Try adjusting your filters or checking back later.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {currentRides.map((ride) => {
              const currentUserId = user?._id || user?.id;
              const rideCreatorId = ride.creator?._id || ride.creator;

              const isCreator = rideCreatorId && currentUserId && rideCreatorId.toString() === currentUserId.toString();
              const isParticipant = ride.participants?.some((p) => {
                const pId = p?._id || p;
                return pId && currentUserId && pId.toString() === currentUserId.toString();
              });

              const hasAccess = isCreator || isParticipant;
              const limit = ride.maxRiders || 10;
              const isFull = ride.participants?.length >= limit;

              return (
                <div 
                  key={ride._id} 
                  className="bg-surface border border-surface/50 rounded-xl p-4 hover:border-primary/30 hover:bg-background/50 transition-all shadow-md group flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left Block: Identity & Route */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-bold text-textMain group-hover:text-primary transition-colors text-base truncate">
                        {ride.name}
                      </h3>
                      <span className="bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full animate-pulse shrink-0 border border-primary/20">
                        LIVE
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-textMuted">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <span className="truncate max-w-[150px] lg:max-w-[200px]">{ride.startLocation?.name || ride.startLocation}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 shrink-0 text-textMuted/50" />
                      <div className="flex items-center gap-1.5 truncate">
                        <Route className="h-3.5 w-3.5 shrink-0 text-green-500" />
                        <span className="truncate max-w-[150px] lg:max-w-[200px]">{ride.destination?.name || ride.destination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Block: Quick Metrics */}
                  <div className="flex items-center gap-6 bg-background/50 border border-surface/50 px-4 py-2 rounded-lg shrink-0 w-full md:w-auto justify-between md:justify-center">
                    <div className="flex flex-col items-start md:items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-0.5">Riders</span>
                      <span className={`flex items-center gap-1.5 text-sm font-bold text-textMain ${isFull && !hasAccess ? "text-red-500" : ""}`}>
                        <Users className="h-3.5 w-3.5 shrink-0" /> {ride.participants?.length || 1}/{limit}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-surface/50 hidden md:block"></div>
                    <div className="flex flex-col items-start md:items-center text-right md:text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-0.5">Distance</span>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-textMain">
                        <Activity className="h-3.5 w-3.5 shrink-0" /> {ride.distance || "--"} km
                      </span>
                    </div>
                  </div>

                  {/* Right Block: Action Button */}
                  <div className="shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => handleRideClick(ride)}
                      disabled={joiningRoom === ride.roomCode || (!hasAccess && isFull)}
                      className={`w-full md:w-auto text-sm font-bold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                        hasAccess
                          ? "bg-background border border-primary/30 text-primary hover:bg-primary hover:text-background shadow-sm"
                          : isFull
                            ? "bg-background border border-red-500/20 text-red-500/50 cursor-not-allowed"
                            : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-transparent shadow-sm"
                      }`}
                    >
                      {joiningRoom === ride.roomCode ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : hasAccess ? (
                        <>Re-Join Map <ArrowRight className="h-4 w-4" /></>
                      ) : isFull ? (
                        "Room Full"
                      ) : (
                        <>Join Ride <CheckCircle2 className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {filteredRides.length > 0 && (
          <div className="bg-surface border border-surface/50 rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg mt-4">
            <p className="text-sm text-textMuted">
              Showing <span className="font-bold text-textMain">{(currentPage - 1) * ridesPerPage + 1}</span> to <span className="font-bold text-textMain">{Math.min(currentPage * ridesPerPage, filteredRides.length)}</span> of <span className="font-bold text-textMain">{filteredRides.length}</span> live rides
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-surface bg-background text-textMuted hover:text-textMain disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-surface bg-background text-textMuted hover:text-textMain disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default LiveTracking;