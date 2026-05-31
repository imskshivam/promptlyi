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
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 pt-12 pb-10 px-6 mb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="badge badge-orange mb-3 w-fit">User Dashboard</div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                                Welcome, <span className="gradient-text-dark">{user?.name?.split(" ")[0]}</span>.
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 min-w-[140px]">
                                <div className="text-xs uppercase font-bold tracking-wider text-orange-800 mb-1">Purchased</div>
                                <div className="font-black text-3xl text-orange-600">{purchases.length}</div>
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
                            className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                tab === t ? "bg-gray-900 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                        >
                            {lbl}
                        </button>
                    ))}
                </div>

                {/* ─── My Library ─── */}
                {tab === "library" && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-orange-500" />
                                Unlocked Prompts
                            </h2>
                            <Link to="/marketplace" className="btn btn-ghost !rounded-xl !text-sm">
                                Browse Marketplace <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
                        ) : purchases.length === 0 ? (
                            <div className="py-20 text-center bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="font-black text-xl text-gray-900 mb-2">No prompts unlocked yet</h3>
                                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Discover premium AI prompts crafted by experts and unlock them to see them here.</p>
                                <Link to="/marketplace" className="btn btn-primary !rounded-xl inline-flex">Explore Prompts</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {purchases.map((pu) => pu.prompt && (
                                    <Link key={pu.id} to={`/prompts/${pu.prompt_id}`} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-lg transition-all flex flex-col">
                                        <div className="aspect-video bg-gray-50 overflow-hidden relative">
                                            {pu.prompt.preview_url ? (
                                                <img src={pu.prompt.preview_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen className="w-10 h-10" /></div>
                                            )}
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg text-gray-900 shadow-sm">
                                                {pu.prompt.category}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-orange-500 transition-colors line-clamp-1">{pu.prompt.title}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{pu.prompt.description}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <span className="text-xs font-semibold text-gray-400">Purchased on {new Date(pu.created_at).toLocaleDateString()}</span>
                                                <span className="text-orange-500 font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    View <ChevronRight className="w-3.5 h-3.5" />
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
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <Clock className="w-6 h-6 text-orange-500" />
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
                                        <tr className="border-b border-gray-100">
                                            <th className="pb-4 px-4 text-xs uppercase font-bold tracking-wider text-gray-400">Date</th>
                                            <th className="pb-4 px-4 text-xs uppercase font-bold tracking-wider text-gray-400">Prompt</th>
                                            <th className="pb-4 px-4 text-xs uppercase font-bold tracking-wider text-gray-400">Creator</th>
                                            <th className="pb-4 px-4 text-xs uppercase font-bold tracking-wider text-gray-400 text-right">Amount</th>
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
