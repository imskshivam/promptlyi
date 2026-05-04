import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Briefcase, ShoppingBag, ArrowRight } from "lucide-react";

export default function Onboarding() {
    const { user, selectRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    if (!user) return <div className="p-16 text-center">Please sign in.</div>;

    const pick = async (role) => {
        setLoading(true);
        try {
            await selectRole(role);
            nav(role === "business" ? "/creator" : "/dashboard", { replace: true });
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-3">Welcome, {user.name}</div>
                <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter">Choose your path.</h1>
                <p className="mt-4 text-[#66635D]">You can change this later from settings.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <button disabled={loading} onClick={() => pick("business")} className="text-left bg-white border-2 border-[#1A1A1A] hard-shadow p-8 hover:bg-[#FFD600] transition-colors group" data-testid="role-business">
                    <Briefcase className="w-10 h-10" />
                    <div className="font-heading text-3xl font-black mt-4">I'm a creator</div>
                    <p className="mt-2 text-[#66635D] text-sm">List prompts, earn money, take custom work. Monthly subscription.</p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-bold uppercase">Choose <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
                </button>
                <button disabled={loading} onClick={() => pick("normal")} className="text-left bg-white border-2 border-[#1A1A1A] hard-shadow p-8 hover:bg-[#FFD600] transition-colors group" data-testid="role-normal">
                    <ShoppingBag className="w-10 h-10" />
                    <div className="font-heading text-3xl font-black mt-4">I'm here to buy</div>
                    <p className="mt-2 text-[#66635D] text-sm">Buy prompts, unlock premium with credits, post custom requests.</p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-bold uppercase">Choose <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
                </button>
            </div>
        </div>
    );
}
