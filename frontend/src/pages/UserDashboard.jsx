import React, { useEffect, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Coins, ShoppingBag, History, Plus, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function UserDashboard() {
    const { user, refresh } = useAuth();
    const [tab, setTab] = useState("wallet");
    const [packs, setPacks] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [creditHistory, setCreditHistory] = useState([]);

    useEffect(() => {
        http.get("/credits/packs").then((r) => setPacks(r.data || [])).catch(() => {});
        http.get("/purchases").then((r) => setPurchases(r.data || [])).catch(() => {});
        http.get("/credits/history").then((r) => setCreditHistory(r.data || [])).catch(() => {});
    }, []);

    const buyPack = async (id) => {
        try {
            const r = await http.post("/credits/buy", { pack_id: id });
            if (r.data.checkout_url) { window.location.href = r.data.checkout_url; return; }
            toast.success("Credits added!");
            refresh();
        } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    };

    const TABS = [
        ["wallet", "Buy Credits", Coins],
        ["purchases", "My Prompts", ShoppingBag],
        ["history", "Transactions", History],
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
                <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-2">Client Dashboard</div>
                    <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter">Hi {user?.name?.split(" ")[0]}.</h1>
                </div>
                <div className="bg-[#FFD600] border-2 border-[#1A1A1A] hard-shadow px-6 py-4">
                    <div className="text-xs uppercase font-bold tracking-wider">Credit Balance</div>
                    <div className="font-heading font-black text-4xl inline-flex items-center gap-2">
                        <Coins className="w-8 h-8" /> {user?.credits || 0}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b-2 border-[#1A1A1A]">
                {TABS.map(([t, lbl, Icon]) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 -mb-0.5 border-2 border-b-0 flex items-center gap-2 text-sm font-bold ${tab === t ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-[#F7F5F0] border-transparent hover:bg-white"}`}
                        data-testid={`utab-${t}`}>
                        <Icon className="w-4 h-4" />{lbl}
                    </button>
                ))}
            </div>

            {/* Buy Credits */}
            {tab === "wallet" && (
                <div>
                    <p className="text-[#66635D] mb-6">Purchase credits to unlock premium prompts from top prompt users.</p>
                    <div className="grid sm:grid-cols-3 gap-5">
                        {packs.map((p) => (
                            <div key={p.id} className="bg-white border-2 border-[#1A1A1A] hard-shadow p-6 flex flex-col" data-testid={`pack-${p.id}`}>
                                <div className="text-xs uppercase font-bold tracking-wider text-[#FF4F00]">{p.label}</div>
                                <div className="font-heading font-black text-5xl mt-3 inline-flex items-center gap-2">
                                    <Coins className="w-8 h-8 text-[#FFD600]" />{p.credits}
                                </div>
                                <div className="text-sm text-[#66635D] mt-1">credits</div>
                                <div className="mt-4 font-heading text-3xl font-black">${p.price_usd}</div>
                                <div className="text-xs text-[#66635D] mb-4">≈ ${(p.price_usd / p.credits).toFixed(2)} per credit</div>
                                <button onClick={() => buyPack(p.id)} className="btn-vermilion w-full mt-auto" data-testid={`buy-pack-${p.id}`}>
                                    Buy Pack <ArrowRight className="w-4 h-4 inline ml-1" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* My Purchased Prompts */}
            {tab === "purchases" && (
                <div className="space-y-3">
                    {purchases.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="text-4xl mb-3">🛍️</div>
                            <div className="font-heading text-2xl font-bold">No prompts yet.</div>
                            <p className="text-[#66635D] mt-2">Browse the marketplace and unlock your first prompt.</p>
                            <Link to="/marketplace" className="btn-vermilion inline-flex mt-4">Browse Marketplace</Link>
                        </div>
                    ) : purchases.map((pu) => (
                        <Link
                            to={`/prompts/${pu.prompt_id}`}
                            key={pu.id}
                            className="flex items-center gap-4 bg-white border-2 border-[#1A1A1A] p-4 hover:bg-[#FFD600] transition-colors group"
                            data-testid={`pur-${pu.id}`}
                        >
                            {pu.prompt?.preview_url ? (
                                <img src={pu.prompt.preview_url} className="w-16 h-16 object-cover border-2 border-[#1A1A1A] flex-shrink-0" alt="" />
                            ) : (
                                <div className="w-16 h-16 bg-[#EFEBE1] border-2 border-[#1A1A1A] flex-shrink-0 flex items-center justify-center text-2xl">📝</div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-heading font-bold">{pu.prompt?.title || "Prompt"}</div>
                                <div className="text-xs text-[#66635D] mt-1">
                                    <span className="uppercase font-bold">{pu.prompt?.category}</span>
                                    {" · "}
                                    <Clock className="w-3 h-3 inline" /> {new Date(pu.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="text-sm font-bold flex-shrink-0">
                                {pu.method === "credits" ? (
                                    <span className="inline-flex items-center gap-1 text-[#0047FF]">
                                        <Coins className="w-3.5 h-3.5" /> {pu.credits_used} credits
                                    </span>
                                ) : pu.method === "free" ? (
                                    <span className="text-[#FF4F00]">FREE</span>
                                ) : (
                                    <span>${pu.amount_usd}</span>
                                )}
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            )}

            {/* Transaction History */}
            {tab === "history" && (
                <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#66635D] mb-4">
                        All credit transactions — purchases &amp; unlocks
                    </div>
                    {creditHistory.length === 0 ? (
                        <p className="text-[#66635D] py-8 text-center">No transactions yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {creditHistory.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center gap-4 bg-white border-2 border-[#1A1A1A] p-4"
                                    data-testid={`tx-${tx.id}`}
                                >
                                    <div className={`w-10 h-10 border-2 border-[#1A1A1A] flex items-center justify-center font-black text-lg flex-shrink-0 ${tx.amount > 0 ? "bg-[#FFD600]" : "bg-[#EFEBE1]"}`}>
                                        {tx.amount > 0 ? "+" : "−"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm">
                                            {tx.type === "purchase" ? `Bought credit pack` : tx.type === "spend" ? `Unlocked prompt` : tx.type}
                                        </div>
                                        {tx.prompt_title && (
                                            <div className="text-xs text-[#66635D] truncate">{tx.prompt_title}</div>
                                        )}
                                        <div className="text-xs text-[#66635D]">
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            {new Date(tx.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className={`font-heading font-black text-xl flex-shrink-0 ${tx.amount > 0 ? "text-green-600" : "text-[#FF4F00]"}`}>
                                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                                        <span className="text-xs font-normal ml-1 text-[#66635D]">cr</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
