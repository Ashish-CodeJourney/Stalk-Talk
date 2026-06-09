import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthProvider.js";
import { AuthCallback } from "./features/auth/AuthCallback.js";
import { ProtectedRoute } from "./features/auth/ProtectedRoute.js";
import { HomePage } from "./features/home/HomePage.js";

export const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<div>Chat coming soon</div>} />
      </Route>
    </Routes>
  </AuthProvider>
);
