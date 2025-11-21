import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Web3Provider } from "./context/Web3Context";
import { AuthProvider } from "./contexts/AuthContext";
import BorrowerDashboard from "./pages/BorrowerDashboard";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import LandingPage from "./pages/LandingPage";
import LenderDashboard from "./pages/LenderDashboard";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Signup from "./pages/Signup";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Web3Provider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/old-landing" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/borrower" element={<BorrowerDashboard />} />
            <Route path="/lender" element={<LenderDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Web3Provider>
      </AuthProvider>
    </Router>
  );
}

export default App;
