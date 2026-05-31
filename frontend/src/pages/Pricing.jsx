import React, { useEffect, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Coins, Sparkles, Check } from "lucide-react";
import { logCustomEvent } from "../lib/firebase";

export default function Pricing() {
    const { user, refresh, login } = useAuth();
    const [packs, setPacks] = useState([]);

    useEffect(() => {
        http.get("/credits/packs").then((r) => setPacks(r.data));
    }, []);

    const buyPack = async (id) => {
        if (!user) { login(); return; }
        try {
            logCustomEvent("purchase_credits", { pack_id: id });
            const r = await http.post("/credits/buy", { pack_id: id });
            if (r.data.checkout_url) { window.location.href = r.data.checkout_url; return; }
            toast.success("Credits added!"); refresh();
        } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    };

    return (
        <div className="min-h-screen bg-brand-lt_green py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="badge bg-brand-lt_lime/20 text-brand-lt_lime border-none mb-4">
                        <Sparkles className="w-3.5 h-3.5" /> Pricing
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                        Buy <span className="text-brand-lt_lime">Credits.</span>
                    </h1>
                    <p className="text-brand-lt_lime/80 text-lg leading-relaxed font-medium">
                        Buy credit packs to unlock premium restricted prompts. 
                        No hidden fees, no subscriptions.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
                    {packs.map((p, i) => (
                        <div key={p.id} className={`bg-white border-4 rounded-[3rem] p-8 relative transition-all duration-300 ${
                            i === 1 
                                ? "border-brand-lt_purple shadow-2xl md:-translate-y-4 ring-8 ring-brand-lt_purple/20 bg-brand-lt_light" 
                                : "border-transparent shadow-lg hover:border-brand-lt_pink hover:shadow-xl"
                        }`} data-testid={`pack-card-${p.id}`}>
                            {i === 1 && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-lt_purple text-white text-[11px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-md">
                                    Most Popular
                                </div>
                            )}
                            
                            <div className="text-sm font-black uppercase tracking-wider text-gray-400 mb-6">{p.label}</div>
                            
                            <div className="flex items-end gap-2 mb-2">
                                <div className="font-black text-6xl text-brand-lt_purple leading-none">{p.credits}</div>
                                <div className="text-brand-lt_purple/60 font-bold mb-1">credits</div>
                            </div>
                            
                            <div className="text-3xl font-black text-gray-900 mb-8">${p.price_usd}</div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-gray-700 font-bold">
                                    <div className="w-6 h-6 rounded-full bg-brand-lt_lime flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-brand-lt_green" />
                                    </div>
                                    Never expires
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-700 font-bold">
                                    <div className="w-6 h-6 rounded-full bg-brand-lt_lime flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-brand-lt_green" />
                                    </div>
                                    Unlock premium prompts
                                </li>
                            </ul>

                            <button onClick={() => buyPack(p.id)} className={`w-full !rounded-full !py-4 text-lg font-black transition-all ${
                                i === 1 
                                  ? "!bg-brand-lt_purple !text-white hover:!bg-brand-lt_green" 
                                  : "!bg-brand-lt_light !text-brand-lt_purple hover:!bg-brand-lt_pink"
                            }`} data-testid={`pack-btn-${p.id}`}>
                                Buy {p.credits} Credits
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-24 max-w-4xl mx-auto bg-brand-lt_pink rounded-[3rem] p-10 text-center shadow-lg">
                    <h3 className="text-3xl font-black text-brand-lt_purple mb-3">Dynamic pricing by country</h3>
                    <p className="text-brand-lt_purple/80 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                        Prices shown in USD. Final checkout automatically converts based on your local currency and purchasing power via our payment processor.
                    </p>
                </div>
            </div>
        </div>
    );
}
