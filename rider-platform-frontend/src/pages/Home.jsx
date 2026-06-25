// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { Shield, Zap, Globe, Users, ArrowRight, Activity, MapPin } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-24 lg:py-32 overflow-hidden">
        {/* Abstract Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Ride Together. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">
              Track in Real-Time.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-textMuted mb-10">
            The ultimate platform for group rides. Create rooms, share live locations, track ETA, and never lose a rider again. Built for the modern road.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-secondary text-background font-bold rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2">
              Create Ride Room <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-surface hover:bg-surface/80 text-textMain border border-surface font-bold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
              Join Existing Ride
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Engineered for the Pack</h2>
            <p className="text-textMuted max-w-2xl mx-auto">Everything you need to coordinate massive group rides seamlessly without switching between multiple apps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              { icon: Globe, title: "Live Map Tracking", desc: "See exactly where everyone is in real-time with sub-second Socket.IO map updates." },
              { icon: Zap, title: "Instant Sync", desc: "No refreshing required. ETA, speed, and distance data is pushed directly to your screen." },
              { icon: Shield, title: "Private Rooms", desc: "Create invite-only rooms with secure access codes. What happens on the ride, stays on the ride." },
              { icon: Users, title: "Infinite Riders", desc: "Whether it's a duo or a mega-meetup of 500 riders, our architecture handles it effortlessly." },
              { icon: Activity, title: "Ride Analytics", desc: "Save your routes, track average speeds, and maintain a detailed history of your adventures." },
              { icon: MapPin, title: "Route Planning", desc: "Drop pins, set destinations, and share the polyline route directly onto everyone's screen." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-surface p-8 rounded-xl border border-surface/50 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                <div className="bg-background w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-textMuted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-surface to-background border border-surface p-10 md:p-16 rounded-3xl text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to hit the road?</h2>
            <p className="text-textMuted text-lg mb-10 max-w-xl mx-auto">
              Join thousands of riders already using RiderSync to plan, track, and dominate their weekend rides.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold rounded-xl hover:bg-secondary transition-all hover:scale-105">
              Start for Free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;