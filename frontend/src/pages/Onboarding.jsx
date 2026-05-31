import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ShoppingBag, ArrowRight, CheckCircle2, Zap } from "lucide-react";

const CLIENT_PERKS = [
    "Browse 1000s of AI prompts",
    "Search by category (image, code, marketing…)",
    "Buy credits to unlock premium prompts",
    "Keep a full purchase history",
];

export default function Onboarding() {
    const { user, selectRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    if (!user) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <p className="text-gray-500">Please sign in to continue.</p>
        </div>
    );

    const pick = async (role) => {
        setLoading(true);
        try {
            await selectRole(role);
            nav(role === "business" ? "/creator" : "/dashboard", { replace: true });
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6 py-20">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_8px_24px_rgba(249,115,22,0.35)] mb-6">
                        <Zap className="w-8 h-8 text-white fill-white" />
                    </div>
                    <div className="badge badge-orange mx-auto w-fit mb-3">
                        Welcome, {user.name} 👋
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
                        Choose your <span className="gradient-text-dark">path.</span>
                    </h1>
                    <p className="text-gray-500">You can always switch later from your settings.</p>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <button
                        disabled={loading}
                        onClick={() => pick("normal")}
                        className="w-full text-left bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-orange-200 hover:shadow-[0_8px_40px_rgba(249,115,22,0.12)] transition-all duration-300 group"
                        data-testid="role-user"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                            <ShoppingBag className="w-7 h-7 text-orange-500" />
                        </div>
                        <div className="text-2xl font-black text-gray-900 mb-2">I'm a User</div>
                        <p className="text-gray-500 text-sm mb-5">Discover & unlock premium AI prompts. Browse and manage your purchases.</p>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-start gap-2.5 text-sm text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                Browse 1000s of AI prompts
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                Track your bought prompts
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                Keep a full transaction history
                            </li>
                        </ul>
                        <div className="flex items-center gap-2 text-sm font-bold text-orange-500 group-hover:gap-3 transition-all">
                            Start browsing <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => pick("business")}
                        className="w-full text-left bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-blue-200 hover:shadow-[0_8px_40px_rgba(59,130,246,0.12)] transition-all duration-300 group"
                        data-testid="role-client"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-7 h-7 text-blue-500" />
                        </div>
                        <div className="text-2xl font-black text-gray-900 mb-2">I'm a Client (Creator)</div>
                        <p className="text-gray-500 text-sm mb-5">Sell prompts and manage your revenue with a professional CRM.</p>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-start gap-2.5 text-sm text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                Post and sell prompts
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                View revenue & sales volume
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                Request payouts easily
                            </li>
                        </ul>
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-500 group-hover:gap-3 transition-all">
                            Go to CRM <ArrowRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>

                {loading && (
                    <div className="mt-6 text-center text-sm text-gray-400">Setting up your account…</div>
                )}
            </div>
        </div>
    );
}
