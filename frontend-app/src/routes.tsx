import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your pages
import AuthenticationPage from "./pages/authentication/src/App"; 
import DashboardPage from "./pages/dashboard/src/App";
import FinalPage from "./pages/final/src/App";
import SimulationPage from "./pages/simulation/src/App";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthenticationPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/final" element={<FinalPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="*" element={<AuthenticationPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
