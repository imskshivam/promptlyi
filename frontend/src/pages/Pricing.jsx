import React, { useEffect, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Check, Coins, Star } from "lucide-react";

export default function Pricing() {
    const { user, refresh, login } = useAuth();
    const [plans, setPlans] = useState([]);
    const [packs, setPacks] = useState([]);
    const [mode, setMode] = useState("business");

    useEffect(() => {
        http.get("/subscriptions/plans").then((r) => setPlans(r.data));
        http.get("/credits/packs").then((r) => setPacks(r.data));
    }, []);

    const subscribe = async (id) => {
        if (!user) { login(); return; }
        try {
            const r = await http.post("/subscriptions/subscribe", { plan_id: id });
            if (r.data.checkout_url) { window.location.href = r.data.checkout_url; return; }
            toast.success("Subscribed!"); refresh();
        } catch (e) { toast.error(e.response?.data?.detail || "Subscription failed"); }
    };

    const buyPack = async (id) => {
        if (!user) { login(); return; }
        try {
            const r = await http.post("/credits/buy", { pack_id: id });
            if (r.data.checkout_url) { window.location.href = r.data.checkout_url; return; }
            toast.success("Credits added!"); refresh();
        } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-3">Pricing</div>
                <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter">Fair prices. Real earnings.</h1>
                <p className="mt-6 text-[#66635D] max-w-xl mx-auto">Business creators subscribe monthly to list prompts. Users buy credit packs to unlock restricted prompts.</p>
            </div>

            <div className="mt-10 inline-flex border-2 border-[#1A1A1A] mx-auto bg-white" style={{ display: "flex", width: "fit-content", marginInline: "auto" }}>
                {[["business", "Creator Plans"], ["user", "User Credit Packs"]].map(([m, lbl]) => (
                    <button key={m} onClick={() => setMode(m)}
                        className={`px-6 py-3 text-sm font-bold uppercase ${mode === m ? "bg-[#1A1A1A] text-white" : ""}`}
                        data-testid={`pricing-mode-${m}`}>{lbl}</button>
                ))}
            </div>

            {mode === "business" ? (
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    {plans.map((p, i) => {
                        const featured = i === 1;
                        return (
                            <div key={p.id} className={`relative bg-white border-2 border-[#1A1A1A] p-8 ${featured ? "hard-shadow-cobalt md:-translate-y-4" : "hard-shadow"}`} data-testid={`plan-${p.id}`}>
                                {featured && <div className="absolute -top-3 left-8 px-3 py-1 bg-[#0047FF] text-white text-xs font-bold uppercase inline-flex items-center gap-1"><Star className="w-3 h-3" /> Most popular</div>}
                                <div className="text-xs uppercase tracking-wider font-bold text-[#FF4F00]">{p.name}</div>
                                <div className="mt-4 font-heading font-black text-6xl">₹{p.price_inr}</div>
                                <div className="text-sm text-[#66635D]">per month</div>
                                <ul className="mt-6 space-y-2 text-sm">
                                    {p.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2"><Check className="w-4 h-4 text-[#FF4F00] shrink-0 mt-0.5" /> {f}</li>
                                    ))}
                                </ul>
                                <button onClick={() => subscribe(p.id)} className={`mt-8 w-full ${featured ? "btn-vermilion" : "btn-ink"}`} data-testid={`sub-btn-${p.id}`}>Subscribe</button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    {packs.map((p, i) => (
                        <div key={p.id} className={`bg-white border-2 border-[#1A1A1A] p-8 ${i === 1 ? "hard-shadow-vermilion md:-translate-y-4" : "hard-shadow"}`} data-testid={`pack-card-${p.id}`}>
                            <div className="text-xs uppercase tracking-wider font-bold text-[#0047FF]">{p.label}</div>
                            <div className="mt-4 font-heading font-black text-6xl inline-flex items-center gap-2"><Coins className="w-10 h-10 text-[#FFD600]" />{p.credits}</div>
                            <div className="text-sm text-[#66635D]">credits</div>
                            <div className="mt-6 font-heading text-3xl font-black">₹{p.price_inr}</div>
                            <button onClick={() => buyPack(p.id)} className="mt-8 w-full btn-vermilion" data-testid={`pack-btn-${p.id}`}>Buy Now</button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-16 bg-[#1A1A1A] text-white p-10 text-center border-2 border-[#1A1A1A]">
                <h3 className="font-heading text-3xl font-black">Dynamic pricing by country</h3>
                <p className="mt-2 text-white/70 text-sm max-w-xl mx-auto">Prices shown in INR. Final checkout automatically converts based on your country via our payment processor.</p>
            </div>
        </div>
    );
}
