import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Helper: is the user a prompt user (seller)?
function isPromptUser(role) {
    return role === "prompt_user" || role === "business";
}

export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-16 text-center font-heading">Loading…</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (!user.role) return <Navigate to="/onboarding" replace />;

    // Route enforcement when a specific role is required
    if (role === "business" && !isPromptUser(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Prompt users who land on the client dashboard get redirected
    if (!role && isPromptUser(user.role)) {
        return <Navigate to="/creator" replace />;
    }

    return children;
}
