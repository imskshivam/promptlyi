import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
    const { loginWithCredentials, register } = useAuth();
    const nav = useNavigate();
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            let user;
            if (mode === "login") {
                user = await loginWithCredentials(email, password);
            } else {
                user = await register(email, password, name);
            }
            // After login/register redirect by role
            if (!user.role) nav("/onboarding", { replace: true });
            else if (user.role === "prompt_user" || user.role === "business") nav("/creator", { replace: true });
            else nav("/dashboard", { replace: true });
        } catch (e) {
            setError(e.response?.data?.detail || e.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-3">
                        {mode === "login" ? "Welcome back" : "Create account"}
                    </div>
                    <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter">
                        {mode === "login" ? "Sign in to Promptly" : "Join Promptly"}
                    </h1>
                    <p className="mt-3 text-[#66635D] text-sm">
                        {mode === "login"
                            ? "Enter your credentials to continue."
                            : "Start with 50 free credits on signup."}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-4">
                    {mode === "register" && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66635D]" />
                            <input
                                id="auth-name"
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] placeholder-[#AAA] focus:outline-none focus:border-[#FF4F00] transition-colors"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66635D]" />
                        <input
                            id="auth-email"
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] placeholder-[#AAA] focus:outline-none focus:border-[#FF4F00] transition-colors"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66635D]" />
                        <input
                            id="auth-password"
                            type={showPw ? "text" : "password"}
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-10 py-3 border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] placeholder-[#AAA] focus:outline-none focus:border-[#FF4F00] transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66635D] hover:text-[#1A1A1A]"
                        >
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                            {error}
                        </div>
                    )}

                    <button
                        id="auth-submit-btn"
                        type="submit"
                        disabled={loading}
                        className="w-full btn-vermilion hard-shadow text-base flex items-center justify-center gap-2"
                    >
                        {loading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : mode === "login" ? "Sign in" : "Create account"}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                {/* Toggle mode */}
                <div className="mt-6 text-center text-sm text-[#66635D]">
                    {mode === "login" ? (
                        <>Don't have an account?{" "}
                            <button
                                id="switch-to-register"
                                onClick={() => { setMode("register"); setError(null); }}
                                className="text-[#FF4F00] font-bold underline underline-offset-2"
                            >
                                Register
                            </button>
                        </>
                    ) : (
                        <>Already have an account?{" "}
                            <button
                                id="switch-to-login"
                                onClick={() => { setMode("login"); setError(null); }}
                                className="text-[#FF4F00] font-bold underline underline-offset-2"
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </div>

                <div className="mt-8 text-xs text-center text-[#66635D]">
                    By continuing you agree to our Terms and Privacy Policy.
                </div>
            </div>
        </div>
    );
}
