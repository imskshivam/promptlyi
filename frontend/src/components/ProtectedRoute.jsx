import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-16 text-center font-heading">Loading…</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (!user.role) return <Navigate to="/onboarding" replace />;

    // Role enforcement: route a logged-in user to *their* dashboard
    if (role && user.role !== role) {
        const correctPath = user.role === "business" ? "/creator" : "/dashboard";
        return <Navigate to={correctPath} replace />;
    }

    // No specific role required, but ensure creators don't accidentally land on the buyer dashboard.
    if (!role && user.role === "business") {
        return <Navigate to="/creator" replace />;
    }
    return children;
}
