import React, { useEffect, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
    ShoppingBag, BookOpen, Clock, Loader2, ArrowRight,
    Zap, IndianRupee, CreditCard, ChevronRight, Download
} from "lucide-react";
import { toast } from "sonner";

export default function UserDashboard() {
    const { user } = useAuth();
    const [purchases, setPurchases] = useState([]);
    const [tab, setTab] = useState("library");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        http.get("/purchases")
            .then((r) => setPurchases(r.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-brand-lt_light pb-20">
            {/* Header */}
            <div className="bg-brand-lt_green border-none pt-12 pb-10 px-6 mb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="badge bg-brand-lt_lime/20 text-brand-lt_lime border-none mb-3 w-fit">User Dashboard</div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                Welcome, <span className="text-brand-lt_lime">{user?.name?.split(" ")[0]}</span>.
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-brand-lt_lime border-none rounded-[2rem] p-4 min-w-[140px] shadow-lg">
                                <div className="text-xs uppercase font-black tracking-wider text-brand-lt_green mb-1">Purchased</div>
                                <div className="font-black text-4xl text-brand-lt_green">{purchases.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                    {[
                        ["library", "My Library"],
                        ["history", "Transaction History"],
                    ].map(([t, lbl]) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${
                                tab === t ? "bg-brand-lt_purple text-white shadow-md border-brand-lt_purple" : "bg-white text-gray-600 border-transparent hover:border-brand-lt_pink"
                            }`}
                        >
                            {lbl}
                        </button>
                    ))}
                </div>

                {/* ─── My Library ─── */}
                {tab === "library" && (
                    <div className="bg-white rounded-[3rem] border-4 border-transparent shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-brand-lt_purple flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-brand-lt_lime" />
                                Unlocked Prompts
                            </h2>
                            <Link to="/marketplace" className="btn !bg-brand-lt_pink !text-brand-lt_purple hover:!bg-brand-lt_purple hover:!text-white !rounded-full !text-sm font-bold transition-all">
                                Browse Marketplace <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-lt_purple" /></div>
                        ) : purchases.length === 0 ? (
                            <div className="py-24 text-center bg-white rounded-[3rem] border-4 border-brand-lt_pink border-dashed">
                                <div className="w-20 h-20 rounded-3xl bg-brand-lt_pink shadow-sm flex items-center justify-center mx-auto mb-6">
                                    <ShoppingBag className="w-10 h-10 text-brand-lt_purple" />
                                </div>
                                <h3 className="font-black text-2xl text-brand-lt_purple mb-2">No prompts unlocked yet</h3>
                                <p className="text-brand-lt_purple/70 text-base font-medium mb-8 max-w-sm mx-auto">Discover premium AI prompts crafted by experts and unlock them to see them here.</p>
                                <Link to="/marketplace" className="btn !bg-brand-lt_lime !text-brand-lt_green hover:!bg-brand-lt_pink hover:!text-brand-lt_purple !rounded-full !px-8 !py-3 font-black text-lg transition-colors inline-flex">Explore Prompts</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {purchases.map((pu) => pu.prompt && (
                                    <Link key={pu.id} to={`/prompts/${pu.prompt_id}`} className="group bg-white border-4 border-transparent rounded-[2rem] overflow-hidden hover:border-brand-lt_pink hover:shadow-xl transition-all flex flex-col">
                                        <div className="aspect-video bg-brand-lt_light overflow-hidden relative">
                                            {pu.prompt.preview_url ? (
                                                <img src={pu.prompt.preview_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen className="w-10 h-10" /></div>
                                            )}
                                            <div className="absolute top-3 left-3 bg-brand-lt_purple text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-md">
                                                {pu.prompt.category}
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="font-black text-brand-lt_purple text-lg mb-2 group-hover:text-brand-lt_green transition-colors line-clamp-1">{pu.prompt.title}</h3>
                                            <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6 flex-1">{pu.prompt.description}</p>
                                            <div className="flex items-center justify-between pt-4 border-t-2 border-brand-lt_light">
                                                <span className="text-xs font-bold text-gray-400">Purchased on {new Date(pu.created_at).toLocaleDateString()}</span>
                                                <span className="text-brand-lt_purple font-black text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    View <ChevronRight className="w-4 h-4 text-brand-lt_lime" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Transaction History ─── */}
                {tab === "history" && (
                    <div className="bg-white rounded-[3rem] border-4 border-transparent shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-brand-lt_purple flex items-center gap-3">
                                <Clock className="w-8 h-8 text-brand-lt_lime" />
                                Transaction History
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
                        ) : purchases.length === 0 ? (
                            <div className="py-20 text-center bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-gray-400 font-medium">No transactions found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-brand-lt_light">
                                            <th className="pb-4 px-4 text-xs uppercase font-black tracking-wider text-brand-lt_purple">Date</th>
                                            <th className="pb-4 px-4 text-xs uppercase font-black tracking-wider text-brand-lt_purple">Prompt</th>
                                            <th className="pb-4 px-4 text-xs uppercase font-black tracking-wider text-brand-lt_purple">Creator</th>
                                            <th className="pb-4 px-4 text-xs uppercase font-black tracking-wider text-brand-lt_purple text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {purchases.map((pu) => (
                                            <tr key={pu.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-4 text-sm font-medium text-gray-600">
                                                    {new Date(pu.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {pu.prompt?.preview_url ? (
                                                            <img src={pu.prompt.preview_url} className="w-10 h-10 rounded-lg object-cover border border-gray-100" alt="" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <BookOpen className="w-4 h-4 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <span className="font-bold text-sm text-gray-900">{pu.prompt?.title || "Unknown"}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-500 font-medium">
                                                    {pu.prompt?.creator?.name || "Unknown"}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    {pu.method === "credits" ? (
                                                        <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                                                            <Zap className="w-3.5 h-3.5" /> {pu.credits_used}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                                                            ${pu.amount_usd}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
