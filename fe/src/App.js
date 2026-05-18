import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import SignInPage from "./pages/SignInPage";
import ForgotPassword from "./pages/ForgotPassword";
import SignUpPage from "./pages/SignUpPage";
import MainPageCustomer from "./pages/MainPageCustomer";
import MainPageAdmin from "./pages/MainPageAdmin";
import MainPagePhotographer from "./pages/MainPagePhotographer";

import "./assets/styles/AuthPages.css";
import "./assets/styles/Layout.css";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("authToken");
  const roleStr = localStorage.getItem("userRole");
  const role = roleStr ? parseInt(roleStr, 10) : null;

  if (!token || role === null || isNaN(role)) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <MainPageCustomer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <MainPageAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/photographer"
          element={
            <ProtectedRoute allowedRoles={[3, 4]}>
              <MainPagePhotographer />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
