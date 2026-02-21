import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import IssuancePage from "./pages/IssuancePage";
import VerificationPage from "./pages/VerificationPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="app-nav">
          <NavLink to="/" className={({ isActive }) => "app-nav-link" + (isActive ? " active" : "")} end>
            Issuance
          </NavLink>
          <NavLink to="/verification" className={({ isActive }) => "app-nav-link" + (isActive ? " active" : "")}>
            Verification
          </NavLink>
        </nav>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<IssuancePage />} />
            <Route path="/verification" element={<VerificationPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
