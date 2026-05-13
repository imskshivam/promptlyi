import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// This page is no longer used for OAuth callback.
// It now simply redirects authenticated users to the right place
// and unauthenticated users to /login.
export default function AuthCallback() {
    const nav = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            nav("/login", { replace: true });
        } else if (!user.role) {
            nav("/onboarding", { replace: true });
        } else if (user.role === "business") {
            nav("/creator", { replace: true });
        } else {
            nav("/dashboard", { replace: true });
        }
    }, [user, loading, nav]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
            <div className="text-center font-heading text-3xl font-black">Redirecting…</div>
        </div>
    );
}
