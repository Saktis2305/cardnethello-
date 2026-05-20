import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PublicCard from "./components/PublicCard";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Sharing Digital Business Card page */}
        <Route path="/card/:id" element={<PublicCard />} />
        
        {/* Contacts Administration Panel Dashboard (Catch-all) */}
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
