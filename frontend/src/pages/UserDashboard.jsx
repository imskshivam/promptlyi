import React, { useEffect, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Coins, ShoppingBag, Plus } from "lucide-react";
import { toast } from "sonner";

export default function UserDashboard() {
    const { user, refresh } = useAuth();
    const [tab, setTab] = useState("wallet");
    const [packs, setPacks] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [myWorks, setMyWorks] = useState([]);
    const [work, setWork] = useState({ title: "", description: "", budget_inr: 5000, deadline_days: 7, category: "general" });

    useEffect(() => {
        http.get("/credits/packs").then((r) => setPacks(r.data));
        http.get("/purchases").then((r) => setPurchases(r.data)).catch(() => {});
        http.get("/custom-works/mine").then((r) => setMyWorks(r.data)).catch(() => {});
    }, []);

    const buyPack = async (id) => {
        try {
            const r = await http.post("/credits/buy", { pack_id: id });
            if (r.data.checkout_url) { window.location.href = r.data.checkout_url; return; }
            toast.success("Credits added!");
            refresh();
        } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    };

    const postWork = async (e) => {
        e.preventDefault();
        try {
            await http.post("/custom-works", { ...work, budget_inr: parseInt(work.budget_inr) });
            toast.success("Request posted!");
            setWork({ title: "", description: "", budget_inr: 5000, deadline_days: 7, category: "general" });
            http.get("/custom-works/mine").then((r) => setMyWorks(r.data));
        } catch { toast.error("Failed"); }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
                <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-2">Dashboard</div>
                    <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter">Hi {user?.name?.split(" ")[0]}.</h1>
                </div>
                <div className="bg-[#FFD600] border-2 border-[#1A1A1A] hard-shadow px-6 py-4">
                    <div className="text-xs uppercase font-bold tracking-wider">Balance</div>
                    <div className="font-heading font-black text-4xl inline-flex items-center gap-2"><Coins className="w-8 h-8" /> {user?.credits}</div>
                </div>
            </div>

            <div className="flex gap-2 mb-6 border-b-2 border-[#1A1A1A]">
                {[["wallet", "Wallet"], ["purchases", "Purchases"], ["works", "My Requests"]].map(([t, lbl]) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 -mb-0.5 border-2 border-b-0 ${tab === t ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-[#F7F5F0] border-transparent"}`}
                        data-testid={`utab-${t}`}>{lbl}</button>
                ))}
            </div>

            {tab === "wallet" && (
                <div className="grid sm:grid-cols-3 gap-5">
                    {packs.map((p) => (
                        <div key={p.id} className="bg-white border-2 border-[#1A1A1A] hard-shadow p-6" data-testid={`pack-${p.id}`}>
                            <div className="text-xs uppercase font-bold tracking-wider text-[#FF4F00]">{p.label}</div>
                            <div className="font-heading font-black text-5xl mt-2 inline-flex items-center gap-2"><Coins className="w-8 h-8 text-[#FFD600]" />{p.credits}</div>
                            <div className="text-sm text-[#66635D] mt-1">credits</div>
                            <div className="mt-4 font-heading text-3xl font-black">₹{p.price_inr}</div>
                            <button onClick={() => buyPack(p.id)} className="btn-vermilion w-full mt-4" data-testid={`buy-pack-${p.id}`}>Buy Pack</button>
                        </div>
                    ))}
                </div>
            )}

            {tab === "purchases" && (
                <div className="space-y-3">
                    {purchases.length === 0 ? <p className="text-[#66635D]">No purchases yet. <Link to="/marketplace" className="underline text-[#FF4F00]">Browse marketplace</Link></p> : purchases.map((pu) => (
                        <Link to={`/prompts/${pu.prompt_id}`} key={pu.id} className="flex items-center gap-4 bg-white border-2 border-[#1A1A1A] p-4 hover:bg-[#FFD600] transition-colors" data-testid={`pur-${pu.id}`}>
                            {pu.prompt?.preview_url && <img src={pu.prompt.preview_url} className="w-16 h-16 object-cover border-2 border-[#1A1A1A]" alt="" />}
                            <div className="flex-1">
                                <div className="font-heading font-bold">{pu.prompt?.title || "Prompt"}</div>
                                <div className="text-xs text-[#66635D]">{pu.prompt?.category} · {new Date(pu.created_at).toLocaleDateString()}</div>
                            </div>
                            <div className="text-sm font-bold">
                                {pu.method === "credits" ? <span className="text-[#0047FF]">{pu.credits_used} credits</span> : <span>₹{pu.amount_inr}</span>}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {tab === "works" && (
                <div className="grid md:grid-cols-12 gap-6">
                    <form onSubmit={postWork} className="md:col-span-5 bg-white border-2 border-[#1A1A1A] hard-shadow p-6 space-y-3">
                        <div className="font-heading font-black text-2xl flex items-center gap-2"><Plus className="w-5 h-5" /> Post a request</div>
                        <input placeholder="Task title" value={work.title} onChange={(e) => setWork({ ...work, title: e.target.value })} required className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" data-testid="work-title" />
                        <textarea placeholder="Describe what you need" value={work.description} onChange={(e) => setWork({ ...work, description: e.target.value })} required rows={5} className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" data-testid="work-desc" />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="number" placeholder="Budget ₹" value={work.budget_inr} onChange={(e) => setWork({ ...work, budget_inr: e.target.value })} className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" data-testid="work-budget" />
                            <input type="number" placeholder="Days" value={work.deadline_days} onChange={(e) => setWork({ ...work, deadline_days: parseInt(e.target.value) || 7 })} className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" data-testid="work-days" />
                        </div>
                        <button type="submit" className="btn-vermilion w-full" data-testid="work-submit">Post Request</button>
                    </form>
                    <div className="md:col-span-7 space-y-3">
                        <div className="font-heading font-black text-2xl">My requests</div>
                        {myWorks.length === 0 ? <p className="text-[#66635D]">No requests yet.</p> : myWorks.map((w) => (
                            <div key={w.id} className="bg-white border-2 border-[#1A1A1A] p-4" data-testid={`myw-${w.id}`}>
                                <div className="flex justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="font-heading font-bold">{w.title}</div>
                                        <div className="text-xs text-[#66635D] mt-1 line-clamp-2">{w.description}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">₹{w.budget_inr}</div>
                                        <div className="text-xs text-[#66635D]">{w.applicants?.length || 0} applied</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
