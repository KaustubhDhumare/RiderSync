// src/layouts/PublicLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {/* Main content area expands to fill available space */}
      <main className="flex-grow pt-20"> 
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;