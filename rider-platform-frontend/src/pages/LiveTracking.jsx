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
} from "lucide-react";
import { rideApi } from "../api/rideApi";

const LiveTracking = () => {
  const { user } = useContext(AuthContext);
  const [roomCode, setRoomCode] = useState("");
  const [publicRides, setPublicRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningRoom, setJoiningRoom] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicRides = async () => {
      try {
        const allRides = await rideApi.getRides();
        // 🔴 THE FIX: Now it filters for both public AND active status
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

    const isCreator =
      rideCreatorId &&
      currentUserId &&
      rideCreatorId.toString() === currentUserId.toString();
    const isParticipant = ride.participants?.some((p) => {
      const pId = p?._id || p;
      return (
        pId && currentUserId && pId.toString() === currentUserId.toString()
      );
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

          <form onSubmit={handleJoinByCode} className="flex gap-3">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter Room Code (e.g. X7K-9P2)"
              className="flex-1 min-w-0 bg-background border border-surface rounded-xl px-4 py-3 text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none uppercase font-mono"
            />
            <button
              type="submit"
              disabled={!roomCode.trim() || joiningRoom === "manual"}
              className="bg-primary hover:bg-secondary text-background font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
            >
              {joiningRoom === "manual" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Join Map <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Public Active Rides */}
        <div className="bg-surface border border-surface/50 rounded-2xl p-6 shadow-xl flex flex-col max-h-[400px]">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-xl font-bold text-textMain flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" /> Active
              Public Rides
            </h2>
          </div>

          {/* 🔴 FIXED: Added overflow-x-hidden here to kill the horizontal scrollbar */}
          <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden pr-2">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : publicRides.length === 0 ? (
              <div className="text-center py-10 text-textMuted">
                No public rides available right now.
              </div>
            ) : (
              publicRides.map((ride) => {
                const currentUserId = user?._id || user?.id;
                const rideCreatorId = ride.creator?._id || ride.creator;

                const isCreator =
                  rideCreatorId &&
                  currentUserId &&
                  rideCreatorId.toString() === currentUserId.toString();
                const isParticipant = ride.participants?.some((p) => {
                  const pId = p?._id || p;
                  return (
                    pId &&
                    currentUserId &&
                    pId.toString() === currentUserId.toString()
                  );
                });

                const hasAccess = isCreator || isParticipant;
                const limit = ride.maxRiders || 10;
                const isFull = ride.participants?.length >= limit;

                return (
                  <div
                    key={ride._id}
                    className="bg-background border border-surface rounded-xl p-4 hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-bold text-textMain group-hover:text-primary transition-colors truncate">
                          {ride.name}
                        </h3>
                        <p className="text-sm text-textMuted flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 shrink-0 text-primary/70" />
                          <span className="truncate">
                            {ride.startLocation?.name || ride.startLocation} ➔{" "}
                            {ride.destination?.name || ride.destination}
                          </span>
                        </p>
                      </div>
                      <span className="bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full animate-pulse shrink-0">
                        LIVE
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface/50">
                      <div className="flex items-center gap-4 text-sm text-textMuted shrink-0">
                        <span
                          className={`flex items-center gap-1 ${isFull && !hasAccess ? "text-red-500 font-bold" : ""}`}
                        >
                          <Users className="h-4 w-4 shrink-0" />{" "}
                          {ride.participants?.length || 1}/{limit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-4 w-4 shrink-0" />{" "}
                          {ride.distance || "--"} km
                        </span>
                      </div>

                      <button
                        onClick={() => handleRideClick(ride)}
                        disabled={
                          joiningRoom === ride.roomCode ||
                          (!hasAccess && isFull)
                        }
                        className={`text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shrink-0 ml-2 ${
                          hasAccess
                            ? "bg-surface border border-primary/30 text-primary hover:bg-primary hover:text-background"
                            : isFull
                              ? "bg-surface border border-red-500/20 text-red-500/50 cursor-not-allowed"
                              : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                        }`}
                      >
                        {joiningRoom === ride.roomCode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : hasAccess ? (
                          <>
                            Enter Room <ArrowRight className="h-4 w-4" />
                          </>
                        ) : isFull ? (
                          "Room Full"
                        ) : (
                          <>
                            Join Ride <CheckCircle2 className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
