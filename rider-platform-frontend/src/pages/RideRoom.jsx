// src/pages/RideRoom.jsx
import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { rideApi } from '../api/rideApi';
import { Users, MapPin, Navigation, Share2, PhoneOff, Clock, ShieldAlert, CheckCircle, Trash2, Loader2, Edit, X } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RideRoom = () => {
  const { roomId: roomCode } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useContext(AuthContext);

  const [ride, setRide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 🔴 Updated Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    startLocation: '', 
    destination: '', 
    date: '', 
    time: '',
    visibility: 'private' 
  });
  
  const [riders, setRiders] = useState([
    { id: 1, name: 'You', lat: 19.2183, lng: 72.9781, speed: '45 km/h' },
    { id: 2, name: 'Jade', lat: 19.2200, lng: 72.9800, speed: '42 km/h' }
  ]);
  
  const mapCenter = [19.2183, 72.9781];
  const routePolyline = [[19.2183, 72.9781], [19.2250, 72.9850], [19.2300, 72.9900]];

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const data = await rideApi.getRideById(roomCode);
        setRide(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to locate this room.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoomData();
  }, [roomCode]);

// Socket & GPS Logic
  useEffect(() => {
    if (socket && ride) {
      socket.connect();
      socket.emit('joinRoom', roomCode);

      // 1. Listen for other riders' locations
      socket.on('locationUpdate', (data) => {
        setRiders(prev => {
          const exists = prev.find(r => r.id === data.userId);
          if (exists) {
            return prev.map(r => r.id === data.userId ? { ...r, lat: data.lat, lng: data.lng, speed: data.speed } : r);
          }
          return [...prev, { id: data.userId, name: data.name, lat: data.lat, lng: data.lng, speed: data.speed }];
        });
      });

      // 2. Watch current location
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed } = position.coords;
          const payload = {
            roomCode,
            userId: user._id,
            name: user.name,
            lat: latitude,
            lng: longitude,
            speed: speed ? `${Math.round(speed * 3.6)} km/h` : '0 km/h'
          };
          
          // Emit to server
          socket.emit('locationUpdate', payload);
          
          // Update local state for "You"
          setRiders(prev => prev.map(r => r.name === 'You' ? { ...r, lat: latitude, lng: longitude } : r));
        },
        (err) => console.error("GPS Error:", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        socket.emit('leaveRoom', roomCode);
        socket.disconnect();
      };
    }
  }, [socket, roomCode, ride, user]);

  const isCreator = Boolean(ride && user && (ride.creator._id === user._id || ride.creator._id === user.id));

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this ride as ${newStatus}?`)) return;
    setIsUpdating(true);
    try {
      const updatedRide = await rideApi.updateRide(ride._id, { status: newStatus });
      setRide(updatedRide);
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updatedRide = await rideApi.updateRide(ride._id, editForm);
      setRide(updatedRide);
      setShowEditModal(false);
    } catch (err) {
      alert('Failed to update ride details.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 🔴 Populate the modal with the new fields when opened
  const openEditModal = () => {
    setEditForm({ 
      name: ride.name, 
      startLocation: ride.startLocation,
      destination: ride.destination, 
      date: ride.date, 
      time: ride.time,
      visibility: ride.visibility || 'private'
    });
    setShowEditModal(true);
  };

  const handleDeleteRide = async () => {
    if (!window.confirm('WARNING: This will permanently delete the room. Proceed?')) return;
    setIsUpdating(true);
    try {
      await rideApi.deleteRide(ride._id);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete ride.');
      setIsUpdating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode.toUpperCase());
    alert('Room code copied to clipboard!');
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (error) return <div className="text-center p-20 text-red-500 font-bold">{error}</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] animate-in fade-in duration-500">
      
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 h-full">
        
        {/* Header Card */}
        <div className="shrink-0 bg-surface border border-surface/50 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-bold text-textMain mb-1">{ride.name}</h1>
              <div className="flex items-center gap-2 text-primary text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${ride.status === 'active' ? 'bg-primary animate-ping' : 'bg-surface'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${ride.status === 'active' ? 'bg-primary' : ride.status === 'completed' ? 'bg-green-500' : 'bg-textMuted'}`}></span>
                </span>
                {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)} • <span className="uppercase text-[10px] bg-background px-1.5 py-0.5 rounded border border-surface text-textMuted">{ride.visibility}</span>
              </div>
            </div>
            <button onClick={handleCopyCode} className="text-xs font-mono font-bold bg-background border border-surface px-3 py-1.5 rounded-lg hover:text-primary transition-colors flex items-center gap-2">
              CODE: {roomCode.toUpperCase()}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background p-3 rounded-xl border border-surface">
              <MapPin className="h-4 w-4 text-amber-500 mb-1.5" />
              <p className="text-[10px] text-textMuted uppercase tracking-wider">Route</p>
              {/* Added Start Location to the UI card */}
              <p className="font-bold text-textMain text-sm truncate" title={`${ride.startLocation} to ${ride.destination}`}>
                {ride.startLocation} ➔ {ride.destination}
              </p>
            </div>
            <div className="bg-background p-3 rounded-xl border border-surface">
              <Clock className="h-4 w-4 text-blue-500 mb-1.5" />
              <p className="text-[10px] text-textMuted uppercase tracking-wider">Time</p>
              <p className="font-bold text-textMain text-sm truncate">{ride.date} • {ride.time}</p>
            </div>
          </div>
        </div>

        {/* CREATOR ADMIN PANEL */}
        {isCreator && (
          <div className="shrink-0 bg-red-500/5 border border-red-500/20 rounded-2xl p-4 shadow-lg">
            <div className="flex gap-2">
              <button onClick={openEditModal} className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs border border-blue-500/30">
                <Edit className="h-3.5 w-3.5" /> Edit
              </button>
              <button onClick={() => handleUpdateStatus('completed')} disabled={isUpdating || ride.status === 'completed'} className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-500 font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs border border-green-500/30">
                <CheckCircle className="h-3.5 w-3.5" /> Complete
              </button>
              <button onClick={handleDeleteRide} disabled={isUpdating} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs border border-red-500/30">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Riders List */}
        <div className="flex-1 min-h-0 bg-surface border border-surface/50 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <Users className="h-4 w-4 text-textMuted" />
            <h2 className="text-base font-bold text-textMain">Active Riders ({riders.length})</h2>
          </div>
          
          <div className="space-y-3 overflow-y-auto pr-2 pb-2">
            {riders.map((rider) => (
              <div key={rider.id} className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-surface hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold text-sm">
                    {rider.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-textMain text-sm">{rider.name}</p>
                    <p className="text-[10px] text-textMuted flex items-center gap-1 mt-0.5">
                      <Navigation className="h-3 w-3" /> {rider.speed}
                    </p>
                  </div>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-secondary px-2.5 py-1 bg-primary/10 rounded-md">
                  Focus
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <button onClick={() => navigate('/dashboard')} className="shrink-0 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors border border-red-500/20 text-sm">
          <PhoneOff className="h-4 w-4" /> Leave Ride Room
        </button>
      </div>

      {/* RIGHT PANEL: Live Map */}
      <div className="w-full lg:w-2/3 h-[50vh] lg:h-full bg-surface rounded-2xl border border-surface/50 overflow-hidden shadow-xl relative z-0">
        <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors' />
          {riders.map(rider => (
            <Marker key={rider.id} position={[rider.lat, rider.lng]}>
              <Popup className="custom-popup"><div className="font-bold text-gray-900">{rider.name}</div></Popup>
            </Marker>
          ))}
          <Polyline positions={routePolyline} color="#22C55E" weight={4} dashArray="10, 10" />
        </MapContainer>
      </div>

      {/* 🔴 FLOATING EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-surface rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-textMain">Edit Ride Details</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-background rounded-full transition-colors">
                <X className="h-5 w-5 text-textMuted" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">Ride Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:border-primary outline-none" required />
              </div>
              
              {/* 🔴 Start & Destination Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">Start</label>
                  <input type="text" value={editForm.startLocation} onChange={(e) => setEditForm({...editForm, startLocation: e.target.value})} className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:border-primary outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">Destination</label>
                  <input type="text" value={editForm.destination} onChange={(e) => setEditForm({...editForm, destination: e.target.value})} className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:border-primary outline-none" required />
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">Date</label>
                  <input type="date" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:border-primary outline-none [color-scheme:dark]" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">Time</label>
                  <input type="time" value={editForm.time} onChange={(e) => setEditForm({...editForm, time: e.target.value})} className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:border-primary outline-none [color-scheme:dark]" required />
                </div>
              </div>

              {/* 🔴 Visibility Dropdown */}
              <div>
                <label className="block text-xs font-bold text-textMuted uppercase mb-1.5">Visibility</label>
                <select value={editForm.visibility} onChange={(e) => setEditForm({...editForm, visibility: e.target.value})} className="w-full bg-background border border-surface rounded-xl px-4 py-2.5 text-textMain focus:border-primary outline-none">
                  <option value="private">Private (Invite Code Only)</option>
                  <option value="public">Public (Visible on Hub)</option>
                </select>
              </div>
              
              <button type="submit" disabled={isUpdating} className="w-full bg-primary hover:bg-secondary text-background font-bold py-3 rounded-xl mt-4 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RideRoom;