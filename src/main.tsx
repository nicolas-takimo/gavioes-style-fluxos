import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./canvas-shim";
import GavioesStyleFluxos from "./Fluxos";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <GavioesStyleFluxos />
  </ThemeProvider>,
);
