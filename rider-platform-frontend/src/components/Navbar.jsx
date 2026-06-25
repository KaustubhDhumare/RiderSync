// src/components/Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MapPin } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <MapPin className="text-primary h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-textMain">
              Rider<span className="text-primary">Sync</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#features" className="text-textMuted hover:text-textMain transition-colors">Features</a>
            <a href="/#how-it-works" className="text-textMuted hover:text-textMain transition-colors">How it Works</a>
            <div className="flex items-center space-x-4 ml-4 border-l border-surface pl-8">
              <Link to="/login" className="text-textMain hover:text-primary font-medium transition-colors">
                Log In
              </Link>
              <Link to="/register" className="bg-primary hover:bg-secondary text-background font-semibold px-6 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-textMuted hover:text-textMain">
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-surface border-b border-surface/50 px-4 pt-2 pb-6 space-y-4 shadow-xl">
          <a href="/#features" className="block text-textMuted hover:text-textMain py-2">Features</a>
          <a href="/#how-it-works" className="block text-textMuted hover:text-textMain py-2">How it Works</a>
          <div className="pt-4 flex flex-col gap-3">
            <Link to="/login" className="block text-center text-textMain bg-background py-3 rounded-xl border border-surface">
              Log In
            </Link>
            <Link to="/register" className="block text-center bg-primary text-background font-semibold py-3 rounded-xl">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;