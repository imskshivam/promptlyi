import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { http } from "../lib/api";

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

    const loginWithCredentials = async (email, password) => {
        const r = await http.post("/auth/login", { email, password });
        setUser(r.data.user);
        return r.data.user;
    };

    const register = async (email, password, name) => {
        const r = await http.post("/auth/register", { email, password, name });
        setUser(r.data.user);
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
        <AuthCtx.Provider value={{ user, loading, login, loginWithCredentials, register, logout, selectRole, refresh, setUser }}>
            {children}
        </AuthCtx.Provider>
    );
};

export const useAuth = () => useContext(AuthCtx);
