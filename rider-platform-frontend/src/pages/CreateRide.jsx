// src/pages/CreateRide.jsx
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { RideContext } from '../context/RideContext.jsx';
import { MapPin, Navigation, Calendar, Clock, Users, Shield, Loader2 } from 'lucide-react';

const CreateRide = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { createRide, isLoading } = useContext(RideContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const newRide = await createRide(data);
    // Navigate to the live tracking/room page once created
    navigate(`/tracking/${newRide.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textMain mb-2">Deploy a New Ride Room</h1>
        <p className="text-textMuted">Set your route, schedule the start time, and invite your pack.</p>
      </div>

      <div className="bg-surface border border-surface/50 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
          
          {/* General Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-textMain border-b border-surface/50 pb-2">Route Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Ride Name</label>
              <input
                type="text"
                {...register("name", { required: "Ride name is required" })}
                placeholder="e.g., Sunday Morning Canyon Run"
                className="block w-full px-4 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Starting Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <input
                    type="text"
                    {...register("startLocation", { required: "Start location is required" })}
                    placeholder="e.g., Thane, Maharashtra"
                    className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Destination</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Navigation className="h-5 w-5 text-red-500" />
                  </div>
                  <input
                    type="text"
                    {...register("destination", { required: "Destination is required" })}
                    placeholder="e.g., Dapoli Hills"
                    className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
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
                    {...register("date", { required: "Date is required" })}
                    className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
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
                    className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
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
                    className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
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
                    className="block w-full pl-10 pr-3 py-3 border border-surface bg-background rounded-xl text-textMain focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none"
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