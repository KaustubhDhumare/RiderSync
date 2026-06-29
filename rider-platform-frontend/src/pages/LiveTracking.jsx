// src/pages/LiveTracking.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Map as MapIcon,
  ArrowRight,
  Activity,
  Users,
  MapPin,
  Search,
  Loader2,
} from "lucide-react";
import { rideApi } from "../api/rideApi"; // 🔴 Import your API!

const LiveTracking = () => {
  const [roomCode, setRoomCode] = useState("");
  const [publicRides, setPublicRides] = useState([]); // 🔴 State for real DB data
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 🔴 Fetch real rides when the page loads
  useEffect(() => {
    const fetchPublicRides = async () => {
      try {
        const allRides = await rideApi.getRides();
        // Only show rides that were set to 'public' in the Create Ride form
        const visibleRides = allRides.filter(
          (ride) => ride.visibility === "public",
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

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      // Redirects to the RideRoom map page
      navigate(`/tracking/${roomCode}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">
          Live Tracking Hub
        </h1>
        <p className="text-textMuted">
          Join an active ride room or monitor public routes in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Join by Code Section */}
        <div className="bg-gradient-to-br from-surface to-background border border-surface/50 rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>

          <div className="mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <MapIcon className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-textMain mb-2">
              Join a Private Ride
            </h2>
            <p className="text-textMuted">
              Have a room code from a friend? Enter it below to sync your
              location and join the map.
            </p>
          </div>

          <form onSubmit={handleJoinRoom} className="flex gap-3">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter Room Code (e.g. X7K-9P2)"
              className="flex-1 bg-background border border-surface rounded-xl px-4 py-3 text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none uppercase font-mono"
            />
            <button
              type="submit"
              disabled={!roomCode.trim()}
              className="bg-primary hover:bg-secondary text-background font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              Join Map <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Public Active Rides */}
        <div className="bg-surface border border-surface/50 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" /> Active
              Public Rides
            </h2>
            <button className="text-textMuted hover:text-textMain">
              <Search className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : publicRides.length === 0 ? (
              <div className="text-center py-10 text-textMuted">
                No public rides available right now.
              </div>
            ) : (
              publicRides.map((ride) => (
                <div
                  key={ride._id}
                  className="bg-background border border-surface rounded-xl p-4 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-textMain group-hover:text-primary transition-colors">
                        {ride.name}
                      </h3>
                      <p className="text-sm text-textMuted flex items-center gap-1 mt-1">
                        {/* 🔴 Merged DB startLocation and destination! */}
                        <MapPin className="h-3 w-3" /> {ride.startLocation} ➔{" "}
                        {ride.destination}
                      </p>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                      LIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface/50">
                    <div className="flex items-center gap-4 text-sm text-textMuted">
                      {/* 🔴 Reading dynamic participants array length from MongoDB! */}
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />{" "}
                        {ride.participants?.length || 1}/{ride.maxRiders}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" /> -- km/h
                      </span>
                    </div>
                    <button
                      // 🔴 Changed from ride._id to ride.roomCode
                      onClick={() => navigate(`/tracking/${ride.roomCode}`)}
                      className="text-sm font-medium text-textMain hover:text-primary transition-colors"
                    >
                      Spectate Room
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
