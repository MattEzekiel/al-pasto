import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LandingPage from "./pages/LandingPage";
import RulesPage from "./pages/RulesPage";

// Routing exists only for the prerendered marketing pages. The game keeps
// living at "/" with its phase-driven screens; marketing pages link around
// with plain <a> tags so navigations serve the static HTML.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/juego" element={<LandingPage locale="es" />} />
          <Route path="/game" element={<LandingPage locale="en" />} />
          <Route path="/como-jugar" element={<RulesPage locale="es" />} />
          <Route path="/how-to-play" element={<RulesPage locale="en" />} />
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
