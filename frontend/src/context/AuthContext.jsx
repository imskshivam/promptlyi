import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { http } from "../lib/api";
import { logCustomEvent } from "../lib/firebase";

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const r = await http.get("/auth/me");
            setUser(r.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    // Navigate to login page — no external OAuth redirect
    const login = () => {
        window.location.href = "/login";
    };

    const loginWithGoogle = async (credential) => {
        const r = await http.post("/auth/google", { credential });
        setUser(r.data.user);
        logCustomEvent("login", { method: "Google" });
        return r.data.user;
    };

    const logout = async () => {
        await http.post("/auth/logout");
        setUser(null);
        window.location.href = "/";
    };

    const selectRole = async (role) => {
        const r = await http.post("/auth/role", { role });
        setUser(r.data);
        return r.data;
    };

    return (
        <AuthCtx.Provider value={{ user, loading, login, loginWithGoogle, logout, selectRole, refresh, setUser }}>
            {children}
        </AuthCtx.Provider>
    );
};

export const useAuth = () => useContext(AuthCtx);
