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
        <div className="min-h-screen bg-white py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="badge badge-orange mb-4">
                        <Sparkles className="w-3.5 h-3.5" /> Pricing
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-6">
                        Buy <span className="gradient-text-dark">Credits.</span>
                    </h1>
                    <p className="text-gray-500 text-lg leading-relaxed">
                        Buy credit packs to unlock premium restricted prompts. 
                        No hidden fees, no subscriptions.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
                    {packs.map((p, i) => (
                        <div key={p.id} className={`bg-white border rounded-3xl p-8 relative transition-all duration-300 ${
                            i === 1 
                                ? "border-orange-200 shadow-[0_20px_60px_rgba(249,115,22,0.15)] md:-translate-y-4 ring-4 ring-orange-50" 
                                : "border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-orange-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
                        }`} data-testid={`pack-card-${p.id}`}>
                            {i === 1 && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                                    Most Popular
                                </div>
                            )}
                            
                            <div className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">{p.label}</div>
                            
                            <div className="flex items-end gap-2 mb-2">
                                <div className="font-black text-6xl text-gray-900 leading-none">{p.credits}</div>
                                <div className="text-gray-500 font-semibold mb-1">credits</div>
                            </div>
                            
                            <div className="text-3xl font-black text-orange-500 mb-8">${p.price_usd}</div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                    Never expires
                                </li>
                                <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                    Unlock premium prompts
                                </li>
                            </ul>

                            <button onClick={() => buyPack(p.id)} className={`w-full !rounded-2xl !py-3.5 text-base font-bold transition-all ${
                                i === 1 ? "btn-primary" : "btn-ghost"
                            }`} data-testid={`pack-btn-${p.id}`}>
                                Buy {p.credits} Credits
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-24 max-w-4xl mx-auto bg-gray-50 rounded-3xl p-10 text-center border border-gray-100">
                    <h3 className="text-2xl font-black text-gray-900 mb-3">Dynamic pricing by country</h3>
                    <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
                        Prices shown in USD. Final checkout automatically converts based on your local currency and purchasing power via our payment processor.
                    </p>
                </div>
            </div>
        </div>
    );
}
