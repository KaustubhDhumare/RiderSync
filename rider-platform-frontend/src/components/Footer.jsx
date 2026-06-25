// src/components/Footer.jsx
import { MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-surface pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <MapPin className="text-primary h-5 w-5" />
            <span className="text-xl font-bold text-textMain">
              Rider<span className="text-primary">Sync</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm text-textMuted">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-textMuted/60">
          &copy; {new Date().getFullYear()} RiderSync Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;