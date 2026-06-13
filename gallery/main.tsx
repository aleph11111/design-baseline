import * as React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Gallery } from "./Gallery";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("gallery: #root not found");

createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <Gallery />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
