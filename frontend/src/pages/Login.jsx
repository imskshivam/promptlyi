import React from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowUpRight } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    return (
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-3">Welcome back</div>
            <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter">Sign in to Promptly</h1>
            <p className="mt-6 text-[#66635D]">Secure login via Google. No passwords, no friction.</p>
            <button onClick={login} className="mt-10 btn-vermilion hard-shadow text-base" data-testid="login-google-btn">
                Continue with Google <ArrowUpRight className="w-4 h-4" />
            </button>
            <div className="mt-12 text-xs text-[#66635D]">
                By continuing you agree to our Terms and Privacy Policy.
            </div>
        </div>
    );
}
