import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2, Zap, Shield, Sparkles } from "lucide-react";

export default function Login() {
    const { loginWithGoogle } = useAuth();
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSuccess = async (credentialResponse) => {
        setError(null);
        setLoading(true);
        try {
            const returnedUser = await loginWithGoogle(credentialResponse.credential);
            if (!returnedUser.role) {
                nav("/onboarding", { replace: true });
            } else if (returnedUser.role === "business" || returnedUser.role === "prompt_user") {
                nav("/creator", { replace: true });
            } else {
                nav("/dashboard", { replace: true });
            }
        } catch (e) {
            setError(e.response?.data?.detail || e.message || "Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleError = () => setError("Google sign-in was unsuccessful. Please try again.");

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-16 bg-white">
            <div className="w-full max-w-md">
                {/* Icon */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_8px_24px_rgba(249,115,22,0.35)]">
                        <Zap className="w-8 h-8 text-white fill-white" />
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="badge badge-orange mx-auto w-fit mb-3">
                        <Sparkles className="w-3.5 h-3.5" /> Secure Authentication
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                        Sign in to <span className="gradient-text-dark">Promptlyi</span>
                    </h1>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Use your Google account to quickly and securely access thousands of premium AI prompts.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.07)] flex flex-col items-center">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                            <p className="text-sm font-semibold text-gray-700">Authenticating…</p>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center py-4">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={handleError}
                                useOneTap
                                theme="filled_black"
                                shape="pill"
                                size="large"
                                text="continue_with"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="mt-5 w-full bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 text-center rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Trust badges */}
                    <div className="mt-6 pt-5 border-t border-gray-50 w-full flex justify-center gap-6 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-orange-400" /> Secure OAuth
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-orange-400" /> Instant Access
                        </span>
                    </div>
                </div>

                <div className="mt-6 text-xs text-center text-gray-400">
                    By continuing you agree to our{" "}
                    <a href="/terms" className="text-orange-500 hover:underline">Terms</a>
                    {" "}and{" "}
                    <a href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</a>.
                </div>
            </div>
        </div>
    );
}
