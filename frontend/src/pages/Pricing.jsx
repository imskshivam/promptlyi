import React, { useEffect, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Coins } from "lucide-react";
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
        <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-3">Pricing</div>
                <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter">Credits</h1>
                <p className="mt-6 text-[#66635D] max-w-xl mx-auto">Buy credit packs to unlock premium restricted prompts.</p>
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-6">
                {packs.map((p, i) => (
                    <div key={p.id} className={`bg-white border-2 border-[#1A1A1A] p-8 ${i === 1 ? "hard-shadow-vermilion md:-translate-y-4" : "hard-shadow"}`} data-testid={`pack-card-${p.id}`}>
                        <div className="text-xs uppercase tracking-wider font-bold text-[#0047FF]">{p.label}</div>
                        <div className="mt-4 font-heading font-black text-6xl inline-flex items-center gap-2"><Coins className="w-10 h-10 text-[#FFD600]" />{p.credits}</div>
                        <div className="text-sm text-[#66635D]">credits</div>
                        <div className="mt-6 font-heading text-3xl font-black">${p.price_usd}</div>
                        <button onClick={() => buyPack(p.id)} className="mt-8 w-full btn-vermilion" data-testid={`pack-btn-${p.id}`}>Buy Now</button>
                    </div>
                ))}
            </div>

            <div className="mt-16 bg-[#1A1A1A] text-white p-10 text-center border-2 border-[#1A1A1A]">
                <h3 className="font-heading text-3xl font-black">Dynamic pricing by country</h3>
                <p className="mt-2 text-white/70 text-sm max-w-xl mx-auto">Prices shown in USD. Final checkout automatically converts based on your country via our payment processor.</p>
            </div>
        </div>
    );
}
