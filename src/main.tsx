import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import "./refinement.css";
import "./discovery.css";
import "./community.css";
import "./mobile.css";
import "./resources.css";
import "./charter.css";
const root = document.getElementById("root")!;
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

if (
  root.hasChildNodes() &&
  root.dataset.path === window.location.pathname &&
  !window.location.search
) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
