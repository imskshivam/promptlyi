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
                    <div className="w-20 h-20 rounded-[2rem] bg-brand-lt_pink flex items-center justify-center shadow-lg border-4 border-brand-lt_light">
                        <Zap className="w-10 h-10 text-brand-lt_purple fill-brand-lt_purple" />
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-lt_lime text-brand-lt_green text-xs font-black uppercase tracking-wider mx-auto mb-4">
                        <Sparkles className="w-4 h-4" /> Secure Authentication
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                        Sign in to <span className="text-brand-lt_purple">Promptlyi</span>
                    </h1>
                    <p className="text-brand-lt_purple/70 text-base font-medium leading-relaxed max-w-sm mx-auto">
                        Use your Google account to quickly and securely access thousands of premium AI prompts.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white border-4 border-brand-lt_light rounded-[3rem] p-8 shadow-xl flex flex-col items-center hover:border-brand-lt_pink transition-colors">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-brand-lt_purple" />
                            <p className="text-sm font-black text-brand-lt_purple">Authenticating…</p>
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
                        <div className="mt-5 w-full bg-brand-lt_pink/20 border-4 border-brand-lt_pink text-brand-lt_purple font-bold text-sm px-5 py-4 text-center rounded-[2rem]">
                            {error}
                        </div>
                    )}

                    {/* Trust badges */}
                    <div className="mt-6 pt-6 border-t-4 border-brand-lt_light w-full flex justify-center gap-8 text-xs font-bold text-brand-lt_purple/60">
                        <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-brand-lt_green" /> Secure OAuth
                        </span>
                        <span className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-brand-lt_lime fill-brand-lt_lime" /> Instant Access
                        </span>
                    </div>
                </div>

                <div className="mt-8 text-sm font-bold text-center text-brand-lt_purple/50">
                    By continuing you agree to our{" "}
                    <a href="/terms" className="text-brand-lt_purple hover:underline transition-all">Terms</a>
                    {" "}and{" "}
                    <a href="/privacy" className="text-brand-lt_purple hover:underline transition-all">Privacy Policy</a>.
                </div>
            </div>
        </div>
    );
}
