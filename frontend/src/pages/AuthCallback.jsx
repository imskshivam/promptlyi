import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
    const nav = useNavigate();
    const { refresh } = useAuth();
    const [err, setErr] = useState(null);

    useEffect(() => {
        const run = async () => {
            const hash = window.location.hash || "";
            const params = new URLSearchParams(hash.replace(/^#/, ""));
            const sessionId = params.get("session_id");
            if (!sessionId) { setErr("Missing session_id"); return; }
            try {
                const r = await http.post("/auth/session", null, { headers: { "X-Session-ID": sessionId } });
                await refresh();
                // fresh user? go to onboarding if no role yet
                if (!r.data.user.role) nav("/onboarding", { replace: true });
                else if (r.data.user.role === "business") nav("/creator", { replace: true });
                else nav("/dashboard", { replace: true });
            } catch (e) { setErr(e.response?.data?.detail || "Authentication failed"); }
        };
        run();
    }, [nav, refresh]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
            <div className="text-center">
                <div className="font-heading text-3xl font-black">{err ? "Sign-in failed" : "Signing you in…"}</div>
                {err && <div className="mt-4 text-sm text-[#66635D]">{err}</div>}
            </div>
        </div>
    );
}
