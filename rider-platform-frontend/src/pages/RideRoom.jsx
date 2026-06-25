// src/pages/RideRoom.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '../context/SocketContext';
import { Users, MapPin, Navigation, Share2, PhoneOff, Activity, Clock } from 'lucide-react';

// FIX: Leaflet default icon issue with Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RideRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  
  // Mock Data for the UI phase (Thane/Mumbai coordinates)
  const [riders, setRiders] = useState([
    { id: 1, name: 'You', lat: 19.2183, lng: 72.9781, speed: '45 km/h' },
    { id: 2, name: 'Jade', lat: 19.2200, lng: 72.9800, speed: '42 km/h' }
  ]);
  
  const mapCenter = [19.2183, 72.9781];
  const routePolyline = [
    [19.2183, 72.9781], [19.2250, 72.9850], [19.2300, 72.9900]
  ];

  useEffect(() => {
    if (socket) {
      socket.connect();
      socket.emit('joinRoom', roomId);

      // Example socket listeners
      socket.on('locationUpdate', (data) => {
        // Handle incoming live locations later
        console.log("Location update received:", data);
      });
    }
    return () => {
      if (socket) {
        socket.emit('leaveRoom', roomId);
        socket.disconnect();
      }
    };
  }, [socket, roomId]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] animate-in fade-in duration-500">
      
      {/* LEFT PANEL: Room Details */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 h-full overflow-y-auto pr-2">
        
        {/* Header Card */}
        <div className="bg-surface border border-surface/50 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-textMain mb-1">Sunday Canyon Run</h1>
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                Live Tracking Active
              </div>
            </div>
            <button className="p-2 bg-background rounded-xl hover:bg-surface/80 transition-colors group">
              <Share2 className="h-5 w-5 text-textMuted group-hover:text-primary transition-colors" />
            </button>
          </div>

          <div className="bg-background rounded-xl p-4 border border-surface flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-textMuted mb-1">Room Code</p>
              <p className="text-lg font-mono font-bold text-textMain">{roomId.toUpperCase()}</p>
            </div>
            <button className="text-xs bg-surface px-3 py-1.5 rounded-lg font-medium hover:text-primary transition-colors">
              Copy
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background p-3 rounded-xl border border-surface">
              <Clock className="h-5 w-5 text-amber-500 mb-2" />
              <p className="text-xs text-textMuted">ETA</p>
              <p className="font-bold text-textMain">45 mins</p>
            </div>
            <div className="bg-background p-3 rounded-xl border border-surface">
              <Activity className="h-5 w-5 text-blue-500 mb-2" />
              <p className="text-xs text-textMuted">Avg Speed</p>
              <p className="font-bold text-textMain">42 km/h</p>
            </div>
          </div>
        </div>

        {/* Riders List */}
        <div className="bg-surface border border-surface/50 rounded-2xl p-6 shadow-lg flex-1">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-textMuted" />
            <h2 className="text-lg font-bold text-textMain">Active Riders ({riders.length})</h2>
          </div>
          
          <div className="space-y-4">
            {riders.map((rider) => (
              <div key={rider.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-surface hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold">
                    {rider.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-textMain text-sm">{rider.name}</p>
                    <p className="text-xs text-textMuted flex items-center gap-1">
                      <Navigation className="h-3 w-3" /> {rider.speed}
                    </p>
                  </div>
                </div>
                <button className="text-xs font-medium text-primary hover:text-secondary px-3 py-1 bg-primary/10 rounded-lg">
                  Focus Map
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors border border-red-500/20"
        >
          <PhoneOff className="h-5 w-5" /> Leave Ride Room
        </button>
      </div>

      {/* RIGHT PANEL: Live Map */}
      <div className="w-full lg:w-2/3 h-[50vh] lg:h-full bg-surface rounded-2xl border border-surface/50 overflow-hidden shadow-xl relative z-0">
        <MapContainer 
          center={mapCenter} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          {/* Using CartoDB Dark Matter for that premium dark mode look */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {/* Riders Markers */}
          {riders.map(rider => (
            <Marker key={rider.id} position={[rider.lat, rider.lng]}>
              <Popup className="custom-popup">
                <div className="font-bold text-gray-900">{rider.name}</div>
                <div className="text-sm text-gray-600">{rider.speed}</div>
              </Popup>
            </Marker>
          ))}

          {/* Planned Route */}
          <Polyline positions={routePolyline} color="#22C55E" weight={4} dashArray="10, 10" />
        </MapContainer>
      </div>

    </div>
  );
};

export default RideRoom;