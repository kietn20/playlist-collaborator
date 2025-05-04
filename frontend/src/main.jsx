// File: src/main.jsx
// Purpose: React application entry point
// Location: karmonic-frontend/src/

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Ensure Tailwind styles are imported

// MUI Imports
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Basic MUI theme (can be expanded later if needed)
const theme = createTheme({
  // We primarily use Tailwind for colors, but MUI needs a base theme.
  // You could map your colors here too if using MUI components heavily for color.
  palette: {
    mode: "dark", // Set base mode based on your background
    // Example mapping (Optional - needed if you use MUI color props like color="primary"):
    // primary: {
    //   main: '#cfcea0', // Your primary color
    // },
    // secondary: {
    //   main: '#527039', // Your secondary color
    // },
    // background: {
    //   default: '#080804', // Your background
    //   paper: '#1a1a1a' // Slightly lighter for paper elements if needed
    // },
    // text: {
    //   primary: '#f2f2e6' // Your text color
    // }
  },
  typography: {
    fontFamily: "Inter, sans-serif", // Set font family for MUI components
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Handles CSS resets and basic styles for MUI */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
