import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/plus-jakarta-sans/wght.css";
import "@fontsource-variable/cairo/wght.css";
import "@fontsource/reem-kufi/arabic-700.css";
import "@fontsource/reem-kufi/latin-700.css";
import "./index.css";
import App from "./App.jsx";
import { configWarning } from "./lib/api.js";

if (configWarning) console.warn(configWarning);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
