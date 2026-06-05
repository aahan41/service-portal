import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Force dark mode
document.documentElement.classList.add("dark");

// Wire up JWT auth token from localStorage to every API request
setAuthTokenGetter(() => localStorage.getItem("auth_token"));

createRoot(document.getElementById("root")!).render(<App />);
