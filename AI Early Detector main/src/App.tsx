import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AdhiraChatbot from "@/components/AdhiraChatbot";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import Index from "./pages/Index";
import Cancer from "./pages/Cancer";
import Arthritis from "./pages/Arthritis";
import Aids from "./pages/Aids";
import Covid from "./pages/Covid";
import Heart from "./pages/Heart";
import TB from "./pages/TB";
import Admin from "./pages/Admin";
import Reports from "./pages/Reports";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import Vitals from "./pages/Vitals";
import Assistant from "./pages/Assistant";
import Mental from "./pages/Mental";
import Doctor from "./pages/Doctor";
import Diabetes from "./pages/Diabetes";
import Education from "./pages/Education";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/cancer" element={<ProtectedRoute><Cancer /></ProtectedRoute>} />
              <Route path="/arthritis" element={<ProtectedRoute><Arthritis /></ProtectedRoute>} />
              <Route path="/aids" element={<ProtectedRoute><Aids /></ProtectedRoute>} />
              <Route path="/covid" element={<ProtectedRoute><Covid /></ProtectedRoute>} />
              <Route path="/heart" element={<ProtectedRoute><Heart /></ProtectedRoute>} />
              <Route path="/tb" element={<ProtectedRoute><TB /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/vitals" element={<ProtectedRoute><Vitals /></ProtectedRoute>} />
              <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
              <Route path="/mental" element={<ProtectedRoute><Mental /></ProtectedRoute>} />
              <Route path="/doctor" element={<ProtectedRoute><Doctor /></ProtectedRoute>} />
              <Route path="/diabetes" element={<ProtectedRoute><Diabetes /></ProtectedRoute>} />
              <Route path="/education" element={<ProtectedRoute><Education /></ProtectedRoute>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AdhiraChatbot />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
