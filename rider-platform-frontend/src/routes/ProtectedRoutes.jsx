// src/routes/ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    );
  }

  // If there is no user, redirect to login while saving the attempted path (optional)
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;