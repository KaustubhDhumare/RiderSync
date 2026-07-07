// src/pages/CreateRide.jsx
import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { RideContext } from '../context/RideContext.jsx';
import { MapPin, Navigation, Calendar, Clock, Users, Shield, Loader2, Route, AlertCircle } from 'lucide-react';
import axios from 'axios';
import LocationInput from '../components/LocationInput.jsx'; 

const CreateRide = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { createRide, isLoading } = useContext(RideContext);
  const navigate = useNavigate();

  const [startLoc, setStartLoc] = useState(null);
  const [destLoc, setDestLoc] = useState(null);
  const [distance, setDistance] = useState(0);
  const [formError, setFormError] = useState('');

  // 🔴 Calculate tomorrow's date in YYYY-MM-DD format to block past/current dates
const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = [
    tomorrow.getFullYear(),
    String(tomorrow.getMonth() + 1).padStart(2, '0'),
    String(tomorrow.getDate()).padStart(2, '0'),
  ].join('-');

  useEffect(() => {
    const calculateDistance = async () => {
      if (startLoc && destLoc) {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${startLoc.coords.lng},${startLoc.coords.lat};${destLoc.coords.lng},${destLoc.coords.lat}?overview=false`;
          const res = await axios.get(url);
          
          if (res.data.routes && res.data.routes.length > 0) {
            const km = (res.data.routes[0].distance / 1000).toFixed(1);
            setDistance(Number(km));
          }
        } catch (err) {
          console.error("Failed to calculate distance with OSRM:", err);
        }
      }
    };

    calculateDistance();
  }, [startLoc, destLoc]);

  const onSubmit = async (data) => {
    if (!startLoc || !destLoc) {
      setFormError("Please select a valid Starting Location and Destination from the dropdown suggestions.");
      return;
    }
    setFormError('');

    const payload = {
      ...data,
      startLocation: startLoc, 
      destination: destLoc,    
      distance: distance,
      duration: Number((distance / 60).toFixed(1)) 
    };

    try {
      const newRide = await createRide(payload);
      navigate(`/tracking/${newRide.roomCode}`);
    } catch (err) {
      setFormError(err.message || "Failed to create ride. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">Deploy a New Ride Room</h1>
        <p className="text-textMuted">Set your route, schedule the start time, and invite your pack.</p>
      </div>

      <div className="bg-surface border border-surface/50 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
          
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{formError}</p>
            </div>
          )}

          {/* General Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-textMain border-b border-surface/50 pb-2">Route Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Ride Name</label>
              <input
                type="text"
                {...register("name", { required: "Ride name is required" })}
                placeholder="e.g., Sunday Morning Canyon Run"
                className="block w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors focus:outline-none"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LocationInput 
                label="Starting Location"
                placeholder="Search city, area, or landmark..."
                onLocationSelect={setStartLoc}
              />
              <LocationInput 
                label="Destination"
                placeholder="Where are you heading?..."
                onLocationSelect={setDestLoc}
              />
            </div>

            <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${distance > 0 ? 'grid-rows-[1fr] mt-6' : 'grid-rows-[0fr] mt-0'}`}>
              <div className="overflow-hidden">
                <div className="flex items-center gap-5 p-5 bg-primary/10 border border-primary/20 rounded-xl w-full shadow-inner">
                  <div className="bg-background p-3 rounded-xl shrink-0 shadow-sm border border-surface/50">
                    <Route className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-medium text-textMuted leading-tight mb-1">Calculated Route Distance</p>
                    <p className="text-2xl font-bold text-textMain leading-tight">
                      {distance} <span className="text-base text-primary">km</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Limits */}
          <div className="space-y-6 pt-4">
            <h2 className="text-xl font-bold text-textMain border-b border-surface/50 pb-2">Schedule & Access</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-textMuted" />
                  </div>
                  <input
                    type="date"
                    min={minDate} // 🔴 UI Lock: Calendar won't let them click past dates
                    {...register("date", { 
                      required: "Date is required",
                      validate: value => value >= minDate || "You cannot schedule a ride in the past. Select tomorrow or later." // 🔴 Logic Lock
                    })}
                    className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors focus:outline-none [color-scheme:dark]"
                  />
                </div>
                {/* 🔴 Display validation error message */}
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-textMuted" />
                  </div>
                  <input
                    type="time"
                    {...register("time", { required: "Time is required" })}
                    className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors focus:outline-none"
                  />
                </div>
                {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Maximum Riders</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-textMuted" />
                  </div>
                  <input
                    type="number"
                    defaultValue={10}
                    {...register("maxRiders")}
                    className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Visibility</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-textMuted" />
                  </div>
                  <select
                    {...register("visibility")}
                    className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none focus:outline-none"
                  >
                    <option value="private">Private (Invite Link Only)</option>
                    <option value="public">Public (Visible on Map)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-4">
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 font-bold text-textMain bg-surface border border-surface/50 rounded-xl hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 font-bold text-background bg-primary rounded-xl hover:bg-secondary transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Launch Ride Room'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateRide;