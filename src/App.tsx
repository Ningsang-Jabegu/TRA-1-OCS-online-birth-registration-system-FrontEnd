import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BirthRegistration from "./pages/BirthRegistration";
import CertificateView from "./pages/CertificateView";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRecordDetails from "./pages/AdminRecordDetails";
import UserDetails from "./pages/UserDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ProfileUpdate from "./pages/ProfileUpdate";
import CertificateVerification from "./pages/CertificateVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/certificate-verification" element={<CertificateVerification />} />
            <Route 
              path="/dashboard" 
              element={(
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/profile/update" 
              element={(
                <ProtectedRoute>
                  <ProfileUpdate />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/birth-registration" 
              element={(
                <ProtectedRoute>
                  <BirthRegistration />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/certificate/:id" 
              element={(
                <ProtectedRoute>
                  <CertificateView />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/admin" 
              element={(
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              )} 
            />
            <Route
              path="/admin/record/:id"
              element={(
                <ProtectedRoute adminOnly>
                  <AdminRecordDetails />
                </ProtectedRoute>
              )}
            />
            <Route 
              path="/users/:id"
              element={(
                <ProtectedRoute adminOnly>
                  <UserDetails />
                </ProtectedRoute>
              )}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;