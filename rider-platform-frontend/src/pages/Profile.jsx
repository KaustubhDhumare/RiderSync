// src/pages/Profile.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Camera,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Shield,
  Activity,
  Route,
} from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useContext(AuthContext);

  // Safely format the MongoDB timestamp into "Month Year" (e.g., "October 2025")
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently Joined";

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Banner Area */}
      <div className="relative rounded-3xl overflow-hidden bg-surface border border-surface/50 shadow-xl">
        {/* Abstract Banner Background */}
        <div className="h-48 bg-gradient-to-r from-primary/20 via-surface to-secondary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-6">
            {/* Avatar Section */}
            <div className="relative group shrink-0">
              <div className="h-32 w-32 rounded-2xl bg-background border-4 border-surface flex items-center justify-center text-4xl text-primary font-bold shadow-2xl overflow-hidden uppercase">
                {/* 🔴 FIXED: Render an image tag if the URL exists, otherwise fallback to the first letter */}
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0) || "U"
                )}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-primary text-background rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-secondary">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-textMain">
                {user?.name || "Rider Name"}
              </h1>
              {/* <p className="text-textMuted flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" /> Earth
              </p> */}
            </div>

            <Link
              to="/settings"
              className="px-6 py-2.5 bg-surface border border-surface/80 hover:bg-background text-textMain font-medium rounded-xl transition-colors shadow-sm shrink-0"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Info */}
        <div className="space-y-6">
          <div className="bg-surface border border-surface/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-textMain mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Personal Details
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-textMuted mb-1">Email Address</p>
                <div className="flex items-center gap-3 text-textMain bg-background p-3 rounded-xl border border-surface">
                  <Mail className="h-4 w-4 text-textMuted shrink-0" />
                  <span className="truncate">
                    {user?.email || "Not provided"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-textMuted mb-1">Phone Number</p>
                <div className="flex items-center gap-3 text-textMain bg-background p-3 rounded-xl border border-surface">
                  <Phone className="h-4 w-4 text-textMuted shrink-0" />
                  {user?.phone || "Not provided"}
                </div>
              </div>
              <div>
                <p className="text-sm text-textMuted mb-1">Member Since</p>
                <div className="flex items-center gap-3 text-textMain bg-background p-3 rounded-xl border border-surface">
                  <Calendar className="h-4 w-4 text-textMuted shrink-0" />
                  {memberSince}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-surface/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-textMain mb-6">
              Lifetime Statistics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-4 rounded-xl border border-surface text-center hover:border-primary/30 transition-colors">
                <Route className="h-6 w-6 text-primary mx-auto mb-2" />
                {/* 🔴 Now pulls real totalRides from the database */}
                <h3 className="text-2xl font-bold text-textMain">
                  {user?.totalRides || 0}
                </h3>
                <p className="text-xs text-textMuted mt-1">Total Routes</p>
              </div>
              <div className="bg-background p-4 rounded-xl border border-surface text-center hover:border-primary/30 transition-colors">
                <Activity className="h-6 w-6 text-secondary mx-auto mb-2" />
                {/* 🔴 Now pulls real distance and formats it to 1 decimal place */}
                <h3 className="text-2xl font-bold text-textMain">
                  {user?.totalDistance
                    ? Number(user.totalDistance).toFixed(1)
                    : 0}
                </h3>
                <p className="text-xs text-textMuted mt-1">Distance (km)</p>
              </div>
            </div>
          </div>

          {/* Bio / About */}
          <div className="bg-surface border border-surface/50 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-textMain mb-4">About Me</h2>
            <p className="text-textMuted leading-relaxed whitespace-pre-wrap">
              {user?.bio || "This rider hasn't added a bio yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
