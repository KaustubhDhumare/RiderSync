// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { MapPinOff, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12 text-center animate-in fade-in duration-500 relative overflow-hidden">
      
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] -z-10"></div>

      <div className="w-24 h-24 bg-surface border border-surface/50 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
        <MapPinOff className="h-12 w-12 text-red-500" />
      </div>
      
      <h1 className="text-6xl md:text-8xl font-extrabold text-textMain mb-4 tracking-tighter">
        404
      </h1>
      
      <h2 className="text-2xl md:text-3xl font-bold text-textMain mb-4">
        You've gone off-route!
      </h2>
      
      <p className="text-textMuted max-w-md mx-auto mb-10 text-lg">
        We can't find the page you're looking for. The ride room might have been deleted, or the link is incorrect.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-surface/50 hover:bg-surface/80 text-textMain font-medium rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" /> Go Back
        </button>
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-secondary text-background font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
        >
          <Home className="h-5 w-5" /> Return to Home
        </Link>
      </div>
      
    </div>
  );
};

export default NotFound; 