import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { PhotographerLimitsProvider } from "./components/PhotographerLimitsContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const root = ReactDOM.createRoot(document.getElementById("root"));

const AppWithProviders = () => (
  <React.StrictMode>
    <PhotographerLimitsProvider>
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      ) : (
        <App />
      )}
    </PhotographerLimitsProvider>
  </React.StrictMode>
);

root.render(<AppWithProviders />);
