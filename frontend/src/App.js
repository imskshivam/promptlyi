import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import PromptDetail from "./pages/PromptDetail";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorDashboard from "./pages/CreatorDashboard";
import UserDashboard from "./pages/UserDashboard";
import Pricing from "./pages/Pricing";
import CustomWorks from "./pages/CustomWorks";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import PaymentSuccess from "./pages/PaymentSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

function Layout({ children }) {
    return (
        <div className="App min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster richColors position="top-right" />
                <Routes>
                    <Route path="/" element={<Layout><Landing /></Layout>} />
                    <Route path="/marketplace" element={<Layout><Marketplace /></Layout>} />
                    <Route path="/prompts/:id" element={<Layout><PromptDetail /></Layout>} />
                    <Route path="/creators/:id" element={<Layout><CreatorProfile /></Layout>} />
                    <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
                    <Route path="/custom-works" element={<Layout><CustomWorks /></Layout>} />
                    <Route path="/login" element={<Layout><Login /></Layout>} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/onboarding" element={<Layout><Onboarding /></Layout>} />
                    <Route path="/payments/success" element={<Layout><PaymentSuccess /></Layout>} />
                    <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
                    <Route path="/terms" element={<Layout><Terms /></Layout>} />
                    <Route
                        path="/creator"
                        element={<ProtectedRoute role="business"><Layout><CreatorDashboard /></Layout></ProtectedRoute>}
                    />
                    <Route
                        path="/dashboard"
                        element={<ProtectedRoute><Layout><UserDashboard /></Layout></ProtectedRoute>}
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
