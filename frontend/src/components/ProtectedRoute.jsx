import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-16 text-center font-heading">Loading…</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (!user.role) return <Navigate to="/onboarding" replace />;
    if (role && user.role !== role) return <Navigate to="/" replace />;
    return children;
}
