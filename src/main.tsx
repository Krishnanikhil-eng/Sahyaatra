import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import "./i18n"; // Initialize i18n before app renders
import App from "./App";

// Prefer env-provided Convex URL, but fall back to the project deployment from README
// This ensures the app runs in production even if VITE_CONVEX_URL isn't set.
const convexUrl = (import.meta.env as any)?.VITE_CONVEX_URL ?? "https://steady-loris-921.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>,
);
