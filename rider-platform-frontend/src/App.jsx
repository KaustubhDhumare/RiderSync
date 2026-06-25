// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RideProvider } from "./context/RideContext";
// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Routes
import ProtectedRoute from "./routes/ProtectedRoutes";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateRide from "./pages/CreateRide";


function App() {
  return (
    <AuthProvider>
      <RideProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Placeholders for upcoming pages, ensuring the sidebar links don't break */}
                <Route path="/create-ride" element={<CreateRide />} />
                <Route
                  path="/tracking"
                  element={<div className="p-8">Live Tracking Placeholder</div>}
                />
                <Route
                  path="/history"
                  element={<div className="p-8">History Placeholder</div>}
                />
                <Route
                  path="/profile"
                  element={<div className="p-8">Profile Placeholder</div>}
                />
                <Route
                  path="/settings"
                  element={<div className="p-8">Settings Placeholder</div>}
                />
              </Route>
            </Route>
          </Routes>
        </Router>
      </RideProvider>
    </AuthProvider>
  );
}

export default App;
