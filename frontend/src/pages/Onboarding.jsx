import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";

const PROMPT_USER_PERKS = [
    "List unlimited prompts — completely free",
    "Add example images & videos to showcase",
    "Set your own credit price",
    "Track sales & revenue in your dashboard",
];

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

    if (!user) return <div className="p-16 text-center">Please sign in.</div>;

    const pick = async (role) => {
        setLoading(true);
        try {
            await selectRole(role);
            nav(role === "prompt_user" ? "/creator" : "/dashboard", { replace: true });
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-3">Welcome, {user.name} 👋</div>
                <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter">Choose your path.</h1>
                <p className="mt-4 text-[#66635D]">You can always switch later from your settings.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Prompt User Card */}
                <button
                    disabled={loading}
                    onClick={() => pick("prompt_user")}
                    className="text-left bg-white border-2 border-[#1A1A1A] hard-shadow p-8 hover:bg-[#FFD600] transition-colors group"
                    data-testid="role-prompt-user"
                >
                    <Sparkles className="w-10 h-10 text-[#FF4F00]" />
                    <div className="font-heading text-3xl font-black mt-4">I'm a Prompt User</div>
                    <p className="mt-2 text-[#66635D] text-sm">Sell your AI prompts to clients. Free to list — no subscription needed.</p>
                    <ul className="mt-5 space-y-2">
                        {PROMPT_USER_PERKS.map((p) => (
                            <li key={p} className="flex items-start gap-2 text-sm text-[#1A1A1A]">
                                <CheckCircle2 className="w-4 h-4 text-[#FF4F00] mt-0.5 flex-shrink-0" />
                                {p}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm font-bold uppercase">
                        Start selling <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>

                {/* Client Card */}
                <button
                    disabled={loading}
                    onClick={() => pick("client")}
                    className="text-left bg-white border-2 border-[#1A1A1A] hard-shadow p-8 hover:bg-[#FFD600] transition-colors group"
                    data-testid="role-client"
                >
                    <ShoppingBag className="w-10 h-10 text-[#0047FF]" />
                    <div className="font-heading text-3xl font-black mt-4">I'm a Client</div>
                    <p className="mt-2 text-[#66635D] text-sm">Discover & unlock premium AI prompts crafted by experts.</p>
                    <ul className="mt-5 space-y-2">
                        {CLIENT_PERKS.map((p) => (
                            <li key={p} className="flex items-start gap-2 text-sm text-[#1A1A1A]">
                                <CheckCircle2 className="w-4 h-4 text-[#0047FF] mt-0.5 flex-shrink-0" />
                                {p}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-2 text-sm font-bold uppercase">
                        Start browsing <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>
            </div>
        </div>
    );
}
