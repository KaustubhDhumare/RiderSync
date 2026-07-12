// src/pages/RideRoom.jsx
import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSocket } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import { rideApi } from "../api/rideApi";
import axios from "axios";
import {
  Users,
  MapPin,
  Navigation,
  PhoneOff,
  Clock,
  CheckCircle,
  Trash2,
  Loader2,
  Edit,
  X,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RideRoom = () => {
  const { roomId: roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useContext(AuthContext);

  const [ride, setRide] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Autocomplete State & Ref
  const [suggestions, setSuggestions] = useState({ start: [], dest: [] });
  const searchTimeout = useRef(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    startLocation: "",
    startCoords: null,
    destination: "",
    destCoords: null,
    date: "",
    time: "",
    visibility: "private",
    maxRiders: 10,
  });

  const [riders, setRiders] = useState([]);

  // Fetch Room Data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const data = await rideApi.getRideById(roomCode);
        setRide(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to locate this room.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomData();
  }, [roomCode]);

  // Fetch Real Driving Route Line
  useEffect(() => {
    const fetchRouteLine = async () => {
      if (ride?.startLocation?.coords && ride?.destination?.coords) {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${ride.startLocation.coords.lng},${ride.startLocation.coords.lat};${ride.destination.coords.lng},${ride.destination.coords.lat}?overview=full&geometries=geojson`;
          const res = await axios.get(url);
          if (res.data.routes && res.data.routes.length > 0) {
            setRouteGeoJSON(res.data.routes[0].geometry);
          }
        } catch (err) {
          console.error("Failed to fetch route line:", err);
        }
      }
    };
    if (ride) fetchRouteLine();
  }, [ride]);

  // Socket & GPS Logic
  useEffect(() => {
    if (socket && ride && user) {
      socket.emit("joinRoom", roomCode);
      const myId = (user._id || user.id).toString();

      // 1. Listen for ride completion (Completely separate from location updates)
      socket.on("rideCompleted", () => {
        toast.success("Ride completed! Routing you to History.");
        setTimeout(() => {
          navigate("/history", { state: { refreshStats: true } });
        }, 1500); // 1.5 second delay so they can read the toast before routing
      });

      // 2. Listen for location updates
      socket.on("locationUpdate", (data) => {
        setRiders((prev) => {
          if (!data.userId) return prev;

          const exists = prev.find((r) => r.id === data.userId);
          if (exists) {
            return prev.map((r) =>
              r.id === data.userId
                ? { ...r, lat: data.lat, lng: data.lng, speed: data.speed }
                : r,
            );
          }
          return [
            ...prev,
            {
              id: data.userId,
              name: data.name,
              lat: data.lat,
              lng: data.lng,
              speed: data.speed,
            },
          ];
        });
      });

      let currentLat = ride.startLocation?.coords?.lat || 19.2183;
      let currentLng = ride.startLocation?.coords?.lng || 72.9781;
      let currentSpeed = "0 km/h";

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          currentLat = position.coords.latitude;
          currentLng = position.coords.longitude;
          currentSpeed = position.coords.speed
            ? `${Math.round(position.coords.speed * 3.6)} km/h`
            : "0 km/h";
        },
        (err) => console.error("GPS Error:", err.message),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );

      const heartbeatInterval = setInterval(() => {
        const payload = {
          roomCode,
          userId: myId,
          name: user.name,
          lat: currentLat,
          lng: currentLng,
          speed: currentSpeed,
        };

        socket.emit("locationUpdate", payload);

        setRiders((prev) => {
          const exists = prev.find((r) => r.id === myId);
          if (exists)
            return prev.map((r) =>
              r.id === myId
                ? {
                    ...r,
                    lat: currentLat,
                    lng: currentLng,
                    speed: currentSpeed,
                  }
                : r,
            );
          return [
            ...prev,
            {
              id: myId,
              name: "You",
              lat: currentLat,
              lng: currentLng,
              speed: currentSpeed,
            },
          ];
        });
      }, 3000);

      return () => {
        navigator.geolocation.clearWatch(watchId);
        clearInterval(heartbeatInterval);
        socket.emit("leaveRoom", roomCode);
        socket.off("locationUpdate");
      };
    }
  }, [socket, roomCode, ride, user]);

  const isCreator = Boolean(
    ride &&
    user &&
    (ride.creator?._id || ride.creator).toString() ===
      (user?._id || user?.id).toString(),
  );

  const handleLeaveRide = async () => {
    try {
      if (!isCreator) {
        await rideApi.leaveRide(roomCode);
      }
      socket.emit("leaveRoom", roomCode);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to leave ride:", err);
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    const handleTabClose = () => {
      if (!isCreator) {
        const token = localStorage.getItem("token");
        if (token) {
          fetch(`http://localhost:5000/api/rides/${roomCode}/leave`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            keepalive: true,
          }).catch((err) => console.error("Auto-kick failed", err));
        }
      }
    };

    window.addEventListener("beforeunload", handleTabClose);
    return () => window.removeEventListener("beforeunload", handleTabClose);
  }, [roomCode, isCreator]);
  //old
  // const handleUpdateStatus = async (newStatus) => {
  //   if (
  //     !window.confirm(
  //       `Are you sure you want to change this ride to ${newStatus}?`,
  //     )
  //   )
  //     return;
  //   setIsUpdating(true);
  //   try {
  //     const updatedRide = await rideApi.updateRide(ride._id, {
  //       status: newStatus,
  //     });
  //     setRide(updatedRide);
  //   } catch (err) {
  //     alert("Failed to update status.");
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

  const handleUpdateStatus = async (newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to change this ride to ${newStatus}?`,
      )
    )
      return;
    setIsUpdating(true);
    try {
      const updatedRide = await rideApi.updateRide(ride._id, {
        status: newStatus,
      });
      setRide(updatedRide);

      // 🔴 TELL ALL RIDERS TO GO TO HISTORY
      if (newStatus === "completed") {
        socket.emit("rideCompleted", roomCode);
        navigate("/history", { state: { refreshStats: true } });
      }
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };
  const openEditModal = () => {
    setEditForm({
      name: ride.name,
      startLocation: ride.startLocation.name,
      startCoords: ride.startLocation.coords,
      destination: ride.destination.name,
      destCoords: ride.destination.coords,
      date: ride.date,
      time: ride.time,
      visibility: ride.visibility || "private",
      maxRiders: ride.maxRiders || 10,
    });
    setSuggestions({ start: [], dest: [] });
    setShowEditModal(true);
  };

  // Autocomplete Handlers
  const handleLocationSearch = (type, query) => {
    const fieldName = type === "start" ? "startLocation" : "destination";
    setEditForm((prev) => ({ ...prev, [fieldName]: query }));

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 3) {
      setSuggestions((prev) => ({ ...prev, [type]: [] }));
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        );
        setSuggestions((prev) => ({ ...prev, [type]: res.data }));
      } catch (err) {
        console.error("Autocomplete error", err);
      }
    }, 500);
  };

  const handleSelectLocation = (type, place) => {
    const fieldName = type === "start" ? "startLocation" : "destination";
    const coordName = type === "start" ? "startCoords" : "destCoords";

    setEditForm((prev) => ({
      ...prev,
      [fieldName]: place.display_name,
      [coordName]: { lat: parseFloat(place.lat), lng: parseFloat(place.lon) },
    }));

    setSuggestions((prev) => ({ ...prev, [type]: [] }));
  };

  // Distance Calculation & Submit Logic
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      let updatedStart = ride.startLocation;
      let updatedDest = ride.destination;
      let locationChanged = false;

      if (editForm.startLocation !== ride.startLocation.name) {
        locationChanged = true;
        if (
          !editForm.startCoords ||
          editForm.startCoords.lat === ride.startLocation.coords.lat
        ) {
          const startRes = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editForm.startLocation)}`,
          );
          if (startRes.data && startRes.data.length > 0) {
            updatedStart = {
              name: editForm.startLocation,
              coords: {
                lat: parseFloat(startRes.data[0].lat),
                lng: parseFloat(startRes.data[0].lon),
              },
            };
          } else {
            alert(`Could not find coordinates for: ${editForm.startLocation}`);
            return setIsUpdating(false);
          }
        } else {
          updatedStart = {
            name: editForm.startLocation,
            coords: editForm.startCoords,
          };
        }
      }

      if (editForm.destination !== ride.destination.name) {
        locationChanged = true;
        if (
          !editForm.destCoords ||
          editForm.destCoords.lat === ride.destination.coords.lat
        ) {
          const destRes = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(editForm.destination)}`,
          );
          if (destRes.data && destRes.data.length > 0) {
            updatedDest = {
              name: editForm.destination,
              coords: {
                lat: parseFloat(destRes.data[0].lat),
                lng: parseFloat(destRes.data[0].lon),
              },
            };
          } else {
            alert(`Could not find coordinates for: ${editForm.destination}`);
            return setIsUpdating(false);
          }
        } else {
          updatedDest = {
            name: editForm.destination,
            coords: editForm.destCoords,
          };
        }
      }

      let newDistance = ride.distance;

      if (locationChanged) {
        try {
          const routeRes = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${updatedStart.coords.lng},${updatedStart.coords.lat};${updatedDest.coords.lng},${updatedDest.coords.lat}?overview=false`,
          );
          if (routeRes.data && routeRes.data.routes.length > 0) {
            newDistance = (routeRes.data.routes[0].distance / 1000).toFixed(1);
          }
        } catch (routeErr) {
          console.warn(
            "Could not fetch new driving distance, keeping old one.",
          );
        }
      }

      const safeData = {
        name: editForm.name,
        date: editForm.date,
        time: editForm.time,
        visibility: editForm.visibility,
        maxRiders: Number(editForm.maxRiders),
        startLocation: updatedStart,
        destination: updatedDest,
        distance: newDistance,
      };

      const updatedRide = await rideApi.updateRide(ride._id, safeData);
      setRide(updatedRide);
      setShowEditModal(false);
    } catch (err) {
      alert("Failed to update ride details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRide = async () => {
    if (
      !window.confirm(
        "WARNING: This will permanently delete the room. Proceed?",
      )
    )
      return;
    setIsUpdating(true);
    try {
      await rideApi.deleteRide(ride._id);
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to delete ride.");
      setIsUpdating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode.toUpperCase());
    alert("Room code copied to clipboard!");
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  if (error || !ride)
    return (
      <div className="text-center p-20 text-red-500 font-bold">
        {error || "Room not found."}
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] animate-in fade-in duration-500">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full">
        <div className="shrink-0 bg-surface border border-surface/50 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="pr-2 overflow-hidden">
              <h1 className="text-xl font-bold text-textMain mb-1 truncate">
                {ride.name}
              </h1>
              <div className="flex items-center gap-2 text-primary text-xs font-medium">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${ride.status === "active" ? "bg-primary animate-ping" : "bg-surface"}`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${ride.status === "active" ? "bg-primary" : ride.status === "completed" ? "bg-green-500" : "bg-textMuted"}`}
                  ></span>
                </span>
                {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)} •{" "}
                <span className="uppercase text-[10px] bg-background px-1.5 py-0.5 rounded border border-surface text-textMuted shrink-0">
                  {ride.visibility}
                </span>
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="shrink-0 text-xs font-mono font-bold bg-background border border-surface px-3 py-1.5 rounded-lg hover:text-primary transition-colors flex items-center gap-2"
            >
              CODE: {roomCode.toUpperCase()}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background p-3 rounded-xl border border-surface overflow-hidden">
              <MapPin className="h-4 w-4 text-amber-500 mb-1.5" />
              <p className="text-[10px] text-textMuted uppercase tracking-wider">
                Route ({ride.distance}km)
              </p>
              <p
                className="font-bold text-textMain text-sm truncate"
                title={`${ride.startLocation.name} to ${ride.destination.name}`}
              >
                {ride.startLocation.name} ➔ {ride.destination.name}
              </p>
            </div>
            <div className="bg-background p-3 rounded-xl border border-surface overflow-hidden">
              <Clock className="h-4 w-4 text-blue-500 mb-1.5" />
              <p className="text-[10px] text-textMuted uppercase tracking-wider">
                Time
              </p>
              <p className="font-bold text-textMain text-sm truncate">
                {ride.date} • {ride.time}
              </p>
            </div>
          </div>
        </div>

        {/* 🔴 CREATOR ADMIN PANEL - NOW DYNAMIC! */}
        {isCreator && (
          <div className="shrink-0 bg-red-500/5 border border-red-500/20 rounded-2xl p-4 shadow-lg">
            <div className="flex gap-2">
              <button
                onClick={openEditModal}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs border border-blue-500/30"
              >
                <Edit className="h-3.5 w-3.5" /> Edit
              </button>

              {ride.status === "upcoming" && (
                <button
                  onClick={() => handleUpdateStatus("active")}
                  disabled={isUpdating}
                  className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs border border-amber-500/30"
                >
                  <Activity className="h-3.5 w-3.5" /> Start Ride
                </button>
              )}

              {ride.status === "active" && (
                <button
                  onClick={() => handleUpdateStatus("completed")}
                  disabled={isUpdating}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-500 font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs border border-green-500/30"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Complete
                </button>
              )}

              <button
                onClick={handleDeleteRide}
                disabled={isUpdating}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs border border-red-500/30"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Riders List */}
        <div className="flex-1 min-h-0 bg-surface border border-surface/50 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <Users className="h-4 w-4 text-textMuted" />
            <h2 className="text-base font-bold text-textMain">
              Active Riders ({riders.length}/{ride.maxRiders || 10})
            </h2>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 pb-2">
            {riders.length === 0 && (
              <p className="text-sm text-textMuted text-center mt-4">
                Waiting for GPS signal...
              </p>
            )}
            {riders.map((rider) => (
              <div
                key={rider.id}
                className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-surface hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold text-sm uppercase">
                    {rider.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-textMain text-sm">
                      {rider.name}
                    </p>
                    <p className="text-[10px] text-textMuted flex items-center gap-1 mt-0.5">
                      <Navigation className="h-3 w-3" /> {rider.speed}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isCreator ? (
          <button
            onClick={handleLeaveRide}
            className="shrink-0 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors border border-red-500/20 text-sm"
          >
            <PhoneOff className="h-4 w-4" /> Leave Ride Room
          </button>
        ) : (
          <button
            onClick={() => {
              socket.emit("leaveRoom", roomCode);
              navigate("/dashboard");
            }}
            className="shrink-0 w-full py-3 bg-surface hover:bg-background text-textMuted hover:text-textMain font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors border border-surface/50 text-sm"
          >
            <X className="h-4 w-4" /> Return to Hub (Keep Room Live)
          </button>
        )}
      </div>

      {/* RIGHT PANEL: Live Map */}
      <div className="w-full lg:w-2/3 h-[50vh] lg:h-full bg-surface rounded-2xl border border-surface/50 overflow-hidden shadow-xl relative z-0">
        <MapContainer
          center={[
            ride.startLocation.coords.lat,
            ride.startLocation.coords.lng,
          ]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          {riders.length > 0 ? (
            riders.map((rider) => (
              <Marker
                key={rider.id}
                position={[
                  rider.lat || ride.startLocation.coords.lat,
                  rider.lng || ride.startLocation.coords.lng,
                ]}
              >
                <Popup className="font-bold text-gray-900">{rider.name}</Popup>
              </Marker>
            ))
          ) : (
            <Marker
              position={[
                ride.startLocation.coords.lat,
                ride.startLocation.coords.lng,
              ]}
            >
              <Popup>Waiting for GPS signal...</Popup>
            </Marker>
          )}

          {routeGeoJSON && (
            <GeoJSON
              data={routeGeoJSON}
              style={{
                color: "#22C55E",
                weight: 4,
                opacity: 0.7,
                dashArray: "10, 10",
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-surface rounded-3xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-textMain">
                Edit Ride Details
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-background rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-textMuted" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">
                  Ride Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  required
                />
              </div>

              {/* AUTOCOMPLETE LOCATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* START LOCATION */}
                <div className="relative">
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">
                    Start Location
                  </label>
                  <input
                    type="text"
                    value={editForm.startLocation}
                    onChange={(e) =>
                      handleLocationSearch("start", e.target.value)
                    }
                    className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    required
                  />
                  {suggestions.start.length > 0 && (
                    <ul className="absolute z-50 w-full bg-surface border border-surface/80 backdrop-blur-md rounded-xl mt-1 shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden">
                      {suggestions.start.map((place) => (
                        <li
                          key={place.place_id}
                          onClick={() => handleSelectLocation("start", place)}
                          className="px-4 py-3 hover:bg-primary/20 hover:text-primary cursor-pointer text-sm text-textMain border-b border-surface/50 last:border-0 truncate"
                        >
                          {place.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* DESTINATION */}
                <div className="relative">
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={editForm.destination}
                    onChange={(e) =>
                      handleLocationSearch("dest", e.target.value)
                    }
                    className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    required
                  />
                  {suggestions.dest.length > 0 && (
                    <ul className="absolute z-50 w-full bg-surface border border-surface/80 backdrop-blur-md rounded-xl mt-1 shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden">
                      {suggestions.dest.map((place) => (
                        <li
                          key={place.place_id}
                          onClick={() => handleSelectLocation("dest", place)}
                          className="px-4 py-3 hover:bg-primary/20 hover:text-primary cursor-pointer text-sm text-textMain border-b border-surface/50 last:border-0 truncate"
                        >
                          {place.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, date: e.target.value })
                    }
                    className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none [color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) =>
                      setEditForm({ ...editForm, time: e.target.value })
                    }
                    className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">
                    Visibility
                  </label>
                  <select
                    value={editForm.visibility}
                    onChange={(e) =>
                      setEditForm({ ...editForm, visibility: e.target.value })
                    }
                    className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">
                    Max Riders
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={editForm.maxRiders}
                    onChange={(e) =>
                      setEditForm({ ...editForm, maxRiders: e.target.value })
                    }
                    className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-primary hover:bg-secondary text-background font-bold py-3 rounded-xl mt-4 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-primary/20"
              >
                {isUpdating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideRoom;
