import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./features/auth/AuthProvider.js";
import { AuthCallback } from "./features/auth/AuthCallback.js";
import { ProtectedRoute } from "./features/auth/ProtectedRoute.js";
import { HomePage } from "./features/home/HomePage.js";
import { ChatPage } from "./features/chat/ChatPage.js";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  </QueryClientProvider>
);
