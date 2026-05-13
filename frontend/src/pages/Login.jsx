import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

export default function Login() {
    const { loginWithGoogle } = useAuth();
    const nav = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSuccess = async (credentialResponse) => {
        setError(null);
        setLoading(true);
        try {
            const user = await loginWithGoogle(credentialResponse.credential);
            // After login/register redirect by role
            if (!user.role) nav("/onboarding", { replace: true });
            else if (user.role === "prompt_user" || user.role === "business") nav("/creator", { replace: true });
            else nav("/dashboard", { replace: true });
        } catch (e) {
            setError(e.response?.data?.detail || e.message || "Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleError = () => {
        setError("Google sign-in was unsuccessful. Please try again.");
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-3">
                        Authentication
                    </div>
                    <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter">
                        Sign in to Promptly
                    </h1>
                    <p className="mt-3 text-[#66635D] text-sm">
                        Use your Google account to quickly and securely log in.
                    </p>
                </div>

                {/* Main Auth Card */}
                <div className="bg-white border-2 border-[#1A1A1A] p-8 hard-shadow flex flex-col items-center">
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-6">
                            <Loader2 className="w-8 h-8 animate-spin text-[#FF4F00] mb-4" />
                            <p className="text-sm font-bold text-[#1A1A1A]">Authenticating...</p>
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
                        <div className="mt-6 w-full bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 text-center rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-xs text-center text-[#66635D]">
                    By continuing you agree to our Terms and Privacy Policy.
                </div>
            </div>
        </div>
    );
}
