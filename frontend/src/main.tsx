import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "./styles/tailwind.css";
import App from "./router/App";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#165dff" },
    secondary: { main: "#7c3aed" },
    success: { main: "#16a34a" },
    error: { main: "#dc2626" },
    warning: { main: "#d89b2b" },
    background: {
      default: "#f4efe6",
      paper: "rgba(255,255,255,0.88)",
    },
    text: {
      primary: "#172033",
      secondary: "#5f6b7a",
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Space Grotesk","Aptos","Trebuchet MS","Segoe UI",sans-serif',
    h4: { fontWeight: 900, letterSpacing: -0.6 },
    h5: { fontWeight: 900, letterSpacing: -0.4 },
    h6: { fontWeight: 900, letterSpacing: -0.2 },
    button: { textTransform: "none", fontWeight: 800, letterSpacing: 0.1 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          boxShadow: "none",
        },
        contained: {
          boxShadow: "0 14px 30px rgba(22, 93, 255, 0.18)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          background: "rgba(255,255,255,0.75)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
