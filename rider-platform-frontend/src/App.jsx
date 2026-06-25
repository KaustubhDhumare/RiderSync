// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RideProvider } from "./context/RideContext";
import { SocketProvider } from "./context/SocketContext";
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
import RideRoom from "./pages/RideRoom";
import RideHistory from "./pages/RideHistory";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import LiveTracking from "./pages/LiveTracking";

function App() {
  return (
    <AuthProvider>
      <RideProvider>
        <SocketProvider>
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
                  element={<LiveTracking />} />
                <Route
                  path="/tracking/:roomId"
                  element={<RideRoom/>}
                />
                <Route
                  path="/history"
                  element={<RideHistory />} />
                <Route
                  path="/profile"
                  element={<Profile />}
                />
                <Route
                  path="/settings"
                  element={<Settings />}
                />
              </Route>
            </Route>
          </Routes>
        </Router>
        </SocketProvider>
      </RideProvider>
    </AuthProvider>
  );
}

export default App;
