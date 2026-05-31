import React, { useEffect, useMemo, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Coins, IndianRupee, TrendingUp, Package, Sparkles, Trash2, Lock, Unlock, ImageIcon, Video, BarChart3, Banknote, Wallet, PenSquare, Plus, BookOpen, ShoppingBag, ArrowRight, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

const CATEGORIES = ["image","video","code","marketing","design","writing","business","seo","chatgpt","midjourney","3d","music"];

const EMPTY = {
    title: "", description: "", content: "", preview_url: "", media_type: "image",
    category: "image", tags: "", price_credits: 0,
    example_images: "", example_video_url: "", requirements: "",
    requires_user_media: "none", user_media_instructions: "",
};

function StatCard({ label, value, icon: Icon, color, iconColor }) {
    return (
        <div className={`rounded-3xl p-6 border border-gray-100 ${color} transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs uppercase font-bold tracking-wider opacity-80">{label}</div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white/50 backdrop-blur ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="font-black text-4xl">{value}</div>
        </div>
    );
}

export default function CreatorDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState("overview");
    const [stats, setStats] = useState({});
    const [prompts, setPrompts] = useState([]);
    const [sales, setSales] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [revenue, setRevenue] = useState({ series: [], interval: "monthly" });
    const [interval, setInterval] = useState("monthly");
    const [payouts, setPayouts] = useState([]);
    const [payoutAmount, setPayoutAmount] = useState("");
    const [form, setForm] = useState(EMPTY);
    const [estimate, setEstimate] = useState({ credits: 0, words: 0, tier: "basic", complexity: 0 });
    const [submitting, setSubmitting] = useState(false);

    const fetchAll = async () => {
        const [s, m, sl, p, pu] = await Promise.all([
            http.get("/dashboard/creator-stats"),
            http.get("/prompts/mine"),
            http.get("/dashboard/creator-sales").catch(() => ({ data: [] })),
            http.get("/payouts/history").catch(() => ({ data: [] })),
            http.get("/purchases").catch(() => ({ data: [] })),
        ]);
        setStats(s.data); setPrompts(m.data); setSales(sl.data); setPayouts(p.data); setPurchases(pu.data);
    };
    const fetchRevenue = async (iv) => {
        const r = await http.get(`/dashboard/creator-revenue?interval=${iv}`);
        setRevenue(r.data);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchAll(); fetchRevenue(interval); }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchRevenue(interval); }, [interval]);

    // Live credit estimate
    useEffect(() => {
        const t = setTimeout(async () => {
            if (!form.content) { setEstimate({ credits: 0, words: 0, tier: "basic", complexity: 0 }); return; }
            try {
                const r = await http.post("/credit-estimate", { text: form.content });
                setEstimate(r.data);
            } catch {}
        }, 250);
        return () => clearTimeout(t);
    }, [form.content]);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
                price_credits: parseInt(form.price_credits || 0),
                example_images: form.example_images
                    ? form.example_images.split("\n").map(u => u.trim()).filter(Boolean)
                    : [],
            };
            await http.post("/prompts", payload);
            toast.success("Prompt listed! Clients can now find and unlock it.");
            setForm(EMPTY); fetchAll(); setTab("overview");
        } catch (e) { toast.error(e.response?.data?.detail || "Could not create"); }
        finally { setSubmitting(false); }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this prompt?")) return;
        await http.delete(`/prompts/${id}`); fetchAll();
    };

    const requestPayout = async () => {
        const amt = parseInt(payoutAmount);
        if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
        try {
            await http.post("/payouts/request", { amount_usd: amt });
            toast.success("Payout requested! (MOCKED)");
            setPayoutAmount(""); fetchAll();
        } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    };

    const totalRevenue = useMemo(() => revenue.series.reduce((s, b) => s + (b.revenue || 0), 0), [revenue]);
    const totalSales = useMemo(() => revenue.series.reduce((s, b) => s + (b.sales || 0), 0), [revenue]);
    const commission = useMemo(() => Math.round((parseInt(payoutAmount) || 0) * 0.05), [payoutAmount]);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 pt-12 pb-10 px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="badge badge-orange mb-3 w-fit">Client Dashboard</div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                                Hi, <span className="gradient-text-dark">{user?.name?.split(" ")[0]}</span>.
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
                    <StatCard label="Prompts live" value={stats.prompts_count || 0} icon={Package} color="bg-white text-gray-900" iconColor="text-gray-500" />
                    <StatCard label="Sales this month" value={stats.earnings_this_month_usd || 0} icon={TrendingUp} color="bg-orange-50 text-orange-900 border-orange-100" iconColor="text-orange-500" />
                    <StatCard label="Total downloads" value={stats.total_downloads || 0} icon={IndianRupee} color="bg-blue-50 text-blue-900 border-blue-100" iconColor="text-blue-500" />
                    <StatCard label="Available balance" value={`$${stats.available_balance_usd || 0}`} icon={Wallet} color="bg-emerald-50 text-emerald-900 border-emerald-100" iconColor="text-emerald-500" />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                    {[
                        ["overview", "Overview"],
                        ["create", "Create Prompt"],
                        ["my-prompts", "My Prompts"],
                        ["revenue", "Revenue"],
                        ["sales", "Sales"],
                        ["payouts", "Payouts"],
                        ["library", "My Library"],
                        ["history", "Purchases History"],
                    ].map(([t, lbl]) => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                                tab === t ? "bg-gray-900 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            }`}
                            data-testid={`tab-${t}`}>{lbl}</button>
                    ))}
                </div>

                {/* ============ OVERVIEW ============ */}
                {tab === "overview" && (
                    <div className="grid md:grid-cols-12 gap-8">
                        {/* Listed prompts panel */}
                        <div className="md:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-2xl text-gray-900 flex items-center gap-2"><Package className="w-5 h-5 text-gray-400" /> Listed Prompts</h3>
                                <button onClick={() => setTab("create")} className="btn btn-primary !rounded-xl !py-2 !px-4 text-xs" data-testid="overview-create-btn">
                                    <Plus className="w-4 h-4 mr-1" /> New Prompt
                                </button>
                            </div>
                            {prompts.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Package className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium mb-6">No prompts listed yet. Publish your first prompt to start earning.</p>
                                    <button onClick={() => setTab("create")} className="btn btn-dark !rounded-xl">Create your first prompt</button>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[480px] overflow-auto pr-2 custom-scrollbar">
                                    {prompts.slice(0, 8).map((p) => (
                                        <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all group" data-testid={`overview-prompt-${p.id}`}>
                                            <img src={p.preview_url || "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?w=200"} className="w-14 h-14 rounded-xl object-cover border border-gray-200" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-gray-900 truncate group-hover:text-orange-500 transition-colors">{p.title}</div>
                                                <div className="text-xs text-gray-500 truncate mt-1">
                                                    {p.is_restricted ? <span className="font-semibold text-blue-600">{p.credits_required} credits</span> : <span className="font-semibold text-emerald-600">${p.price_usd}</span>}
                                                    <span className="mx-1.5 opacity-50">•</span>
                                                    {p.downloads || 0} downloads
                                                </div>
                                            </div>
                                            <span className="badge badge-dark !text-[10px] hidden sm:inline-flex">{p.category}</span>
                                        </div>
                                    ))}
                                    {prompts.length > 8 && (
                                        <button onClick={() => setTab("my-prompts")} className="w-full text-center py-4 text-sm font-bold text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors mt-2">
                                            View all {prompts.length} prompts →
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Earnings + Payout summary */}
                        <div className="md:col-span-5 space-y-6">
                            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
                                <div className="text-xs uppercase font-bold tracking-wider text-orange-400 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Earnings overview</div>
                                <div className="space-y-5">
                                    <div>
                                        <div className="text-xs text-white/60 font-medium mb-1">This month</div>
                                        <div className="font-black text-5xl tracking-tight">${stats.earnings_this_month_usd || 0}</div>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div>
                                        <div className="text-xs text-white/60 font-medium mb-1">Total earned</div>
                                        <div className="font-black text-3xl tracking-tight">${stats.earnings_usd || 0}</div>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-white/60 font-medium mb-1">Downloads</div>
                                            <div className="font-bold text-xl">{stats.total_downloads || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-white/60 font-medium mb-1">Paid out</div>
                                            <div className="font-bold text-xl">${stats.paid_out_usd || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-xs uppercase font-bold tracking-wider text-orange-500">Payout progress</div>
                                    <Banknote className="w-5 h-5 text-orange-500" />
                                </div>
                                <div className="font-black text-4xl text-gray-900">${stats.available_balance_usd || 0}</div>
                                <div className="text-sm text-gray-500 mt-1 font-medium">of ${stats.min_payout_usd || 8500} minimum (~$100)</div>
                                <div className="mt-5 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${stats.payout_eligible ? "bg-emerald-500" : "bg-orange-500"}`} style={{ width: `${Math.min(100, stats.payout_progress_pct || 0)}%` }} />
                                </div>
                                {stats.payout_eligible ? (
                                    <button onClick={() => setTab("payouts")} className="btn btn-primary w-full mt-6 !rounded-xl" data-testid="overview-payout-btn">
                                        Cash out now
                                    </button>
                                ) : (
                                    <div className="mt-5 text-xs text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        Earn <span className="font-bold text-gray-900">${Math.max(0, (stats.min_payout_usd || 8500) - (stats.available_balance_usd || 0))}</span> more to unlock payout. 5% commission applies on cashout.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ CREATE ============ */}
                {tab === "create" && (
                    <form onSubmit={submit} className="grid md:grid-cols-12 gap-8">
                        <div className="md:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 space-y-6">
                            <div className="pb-4 border-b border-gray-100 mb-6">
                                <h2 className="text-2xl font-black text-gray-900">Publish New Prompt</h2>
                                <p className="text-sm text-gray-500 mt-1">Fill out the details to list your prompt on the marketplace.</p>
                            </div>
                            
                            <div>
                                <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">Title</label>
                                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-orange" data-testid="input-title" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">Short description</label>
                                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="input-orange" data-testid="input-description" />
                            </div>
                            <div>
                                <label className="text-xs uppercase font-bold tracking-wider text-gray-700 mb-2 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-orange-500" /> Prompt content (Live Credit Analysis)</label>
                                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={8} className="input-orange font-mono text-sm resize-y" data-testid="input-content" />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">Category</label>
                                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-orange" data-testid="select-category">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">Tags (comma)</label>
                                    <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-orange" placeholder="midjourney, art" data-testid="input-tags" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">Preview Image URL</label>
                                <input value={form.preview_url} onChange={(e) => setForm({ ...form, preview_url: e.target.value })} className="input-orange" placeholder="https://..." data-testid="input-preview" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">Example Output Images (one URL per line, max 5)</label>
                                <textarea value={form.example_images} onChange={(e) => setForm({ ...form, example_images: e.target.value })} rows={3} className="input-orange text-sm resize-none" placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg" data-testid="input-example-images" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">Example Video URL (optional)</label>
                                <input value={form.example_video_url} onChange={(e) => setForm({ ...form, example_video_url: e.target.value })} className="input-orange" placeholder="https://youtube.com/..." data-testid="input-example-video" />
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">Requirements (what clients need to know/provide)</label>
                                <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} className="input-orange text-sm resize-none" placeholder="e.g. Works best with GPT-4. Requires a product photo..." data-testid="input-requirements" />
                            </div>

                            {/* Requires user media */}
                            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6">
                                <div className="text-xs uppercase font-bold tracking-wider text-orange-800 mb-3">Does this prompt require the user to upload an image / video?</div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[["none", "None", null], ["image", "Image", ImageIcon], ["video", "Video", Video]].map(([v, lbl, Ic]) => (
                                        <label key={v} className={`cursor-pointer rounded-xl border py-3 px-3 text-center text-xs font-bold uppercase tracking-wider transition-all ${form.requires_user_media === v ? "bg-orange-500 text-white border-orange-500 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"}`}>
                                            <input type="radio" name="rum" className="hidden" checked={form.requires_user_media === v} onChange={() => setForm({ ...form, requires_user_media: v })} data-testid={`rum-${v}`} />
                                            {Ic && <Ic className="w-4 h-4 inline mr-1.5 -mt-0.5" />}{lbl}
                                        </label>
                                    ))}
                                </div>
                                {form.requires_user_media !== "none" && (
                                    <input
                                        value={form.user_media_instructions}
                                        onChange={(e) => setForm({ ...form, user_media_instructions: e.target.value })}
                                        placeholder="Tell users what to upload (e.g. 'PNG of your product on neutral background')"
                                        className="mt-4 input-orange"
                                        data-testid="input-rum-instructions"
                                    />
                                )}
                                
                                <div className="mt-6 pt-6 border-t border-orange-200/50">
                                    <label className="block text-xs uppercase font-bold tracking-wider text-orange-800 mb-2">Credit Price (0 = free)</label>
                                    <div className="flex items-center gap-3">
                                        <Coins className="w-6 h-6 text-orange-500" />
                                        <input type="number" min="0" value={form.price_credits} onChange={(e) => setForm({ ...form, price_credits: e.target.value })} className="input-orange" data-testid="input-price-credits" />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 font-medium">
                                        <Lock className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Set to 0 to make the prompt free. Clients spend credits to unlock restricted prompts.
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={submitting} className="btn btn-primary w-full !py-4 !rounded-xl !text-base shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_28px_rgba(249,115,22,0.4)]" data-testid="submit-prompt-btn">
                                {submitting ? "Publishing…" : "Publish Prompt"}
                            </button>
                        </div>

                        <div className="md:col-span-5">
                            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl border border-gray-800 shadow-[0_20px_40px_rgba(0,0,0,0.2)] p-8 sticky top-24">
                                <div className="text-xs uppercase font-bold tracking-wider text-orange-400 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Credit Engine</div>
                                <div className="flex items-end gap-3 mb-6 pb-6 border-b border-white/10">
                                    <Coins className="w-10 h-10 text-orange-400 mb-2" />
                                    <div className="font-black text-6xl leading-none" data-testid="engine-credits">{estimate.credits}</div>
                                    <div className="text-base text-white/60 font-medium mb-1">credits</div>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between items-center"><span className="text-white/60">Words</span><span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white">{estimate.words}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-white/60">Complexity</span><span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white">{estimate.complexity}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-white/60">Calculated Tier</span><span className="badge bg-orange-500 text-white border-none">{estimate.tier}</span></div>
                                </div>
                                <div className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <p className="text-xs text-white/70 leading-relaxed">
                                        Credits scale automatically with token count and complexity keywords. When clients unlock restricted prompts, they pay this exact credit cost.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                

                {/* ============ LIBRARY ============ */}
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

                        {purchases.length === 0 ? (
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

                {/* ============ HISTORY ============ */}
                {tab === "history" && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <Clock className="w-6 h-6 text-orange-500" />
                                Purchases History
                            </h2>
                        </div>

                        {purchases.length === 0 ? (
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
                                            <th className="pb-4 px-4 text-xs uppercase font-bold tracking-wider text-gray-400 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {purchases.map((pu) => (
                                            <tr key={pu.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-4 text-sm font-medium text-gray-900">{new Date(pu.created_at).toLocaleDateString()}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    {pu.prompt ? <Link to={`/prompts/${pu.prompt_id}`} className="hover:text-orange-500 font-medium">{pu.prompt.title}</Link> : "Unknown Prompt"}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-900 font-bold text-right">
                                                    {pu.credits_used > 0 ? `${pu.credits_used} credits` : "Free"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ============ MY PROMPTS ============ */}
                {tab === "my-prompts" && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Manage Your Prompts</h2>
                        <div className="space-y-4">
                            {prompts.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-gray-500 font-medium">No prompts yet. Create your first one!</p>
                                </div>
                            ) : prompts.map((p) => (
                                <div key={p.id} className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all group" data-testid={`mine-${p.id}`}>
                                    <img src={p.preview_url || "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?w=200"} className="w-20 h-20 rounded-xl object-cover border border-gray-200" alt="" />
                                    <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                                        <div className="font-bold text-lg text-gray-900 group-hover:text-orange-500 transition-colors">{p.title}</div>
                                        <div className="text-sm text-gray-500 truncate mt-1">{p.description}</div>
                                        {p.requires_user_media !== "none" && (
                                            <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                {p.requires_user_media === "image" ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                                Requires {p.requires_user_media}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 w-full sm:w-auto border-t border-gray-100 sm:border-0 pt-4 sm:pt-0">
                                        <div className="text-base flex-1 sm:flex-none text-left sm:text-right">
                                            {p.is_restricted ? <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{p.credits_required} cr</span> : <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">${p.price_usd}</span>}
                                        </div>
                                        <div className="text-xs text-gray-400 font-semibold">{p.downloads || 0} downloads</div>
                                        <button onClick={() => remove(p.id)} className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors ml-auto sm:ml-0 mt-2" data-testid={`del-${p.id}`}>
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ============ REVENUE ============ */}
                {tab === "revenue" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900">Revenue Analytics</h3>
                                </div>
                                <div className="flex gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100 w-full sm:w-auto">
                                    {[["daily", "30 Days"], ["weekly", "12 Weeks"], ["monthly", "12 Months"]].map(([v, lbl]) => (
                                        <button key={v} onClick={() => setInterval(v)}
                                            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${interval === v ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-900"}`}
                                            data-testid={`int-${v}`}>{lbl}</button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid sm:grid-cols-3 gap-5 mb-10">
                                <StatCard label={`Revenue · ${interval}`} value={`$${totalRevenue}`} icon={IndianRupee} color="bg-orange-50 text-orange-900 border-orange-100" iconColor="text-orange-500" />
                                <StatCard label="Sales count" value={totalSales} icon={TrendingUp} color="bg-blue-50 text-blue-900 border-blue-100" iconColor="text-blue-500" />
                                <StatCard label="Available payout" value={`$${stats.available_balance_usd || 0}`} icon={Wallet} color="bg-emerald-50 text-emerald-900 border-emerald-100" iconColor="text-emerald-500" />
                            </div>
                            
                            <div className="h-[320px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenue.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                        <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                        <Tooltip contentStyle={{ background: "#111827", color: "white", borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }} cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={4} dot={{ fill: "white", stroke: "#f97316", strokeWidth: 2, r: 5 }} activeDot={{ r: 8, strokeWidth: 0, fill: "#f97316" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                            <div className="text-sm uppercase font-bold tracking-wider text-gray-500 mb-6">Sales Volume</div>
                            <div className="h-[240px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenue.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                        <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ background: "#111827", color: "white", borderRadius: "12px", border: "none" }} cursor={{fill: '#f3f4f6'}} />
                                        <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ SALES ============ */}
                {tab === "sales" && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900">Recent Sales</h2>
                            <span className="badge badge-orange">{sales.length} Transactions</span>
                        </div>
                        <div className="space-y-3">
                            {sales.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-gray-500 font-medium">No sales yet.</p>
                                </div>
                            ) : sales.map((s) => (
                                <div key={s.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-orange-100 transition-all" data-testid={`sale-${s.id}`}>
                                    {s.prompt?.preview_url ? (
                                        <img src={s.prompt.preview_url} className="w-12 h-12 rounded-xl object-cover border border-gray-200" alt="" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                            <Package className="w-5 h-5 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-gray-900 truncate">{s.prompt?.title || "Unknown Prompt"}</div>
                                        <div className="text-xs text-gray-500 font-medium mt-0.5">Bought by {s.buyer?.name} <span className="opacity-50 mx-1">•</span> {new Date(s.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-lg font-black text-right">
                                        {s.method === "credits" ? <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">{s.credits_used} cr</span> : <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-sm">+${s.amount_usd}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ============ PAYOUTS ============ */}
                {tab === "payouts" && (
                    <div className="grid md:grid-cols-12 gap-8">
                        <div className="md:col-span-5">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 sticky top-24">
                                <div className="font-black text-2xl text-gray-900 mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <Banknote className="w-5 h-5 text-orange-500" /> 
                                    </div>
                                    Request Payout
                                </div>
                                
                                <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                                    <div className="flex justify-between items-end mb-3">
                                        <span className="text-sm font-semibold text-gray-500">Available Balance</span>
                                        <span className="text-3xl font-black text-gray-900">${stats.available_balance_usd || 0}</span>
                                    </div>
                                    <div className="h-px bg-gray-200 w-full mb-3" />
                                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                                        <span>Minimum: <strong className="text-gray-900">${stats.min_payout_usd || 8500}</strong></span>
                                        <span>Fee: <strong className="text-gray-900">5%</strong></span>
                                    </div>
                                </div>

                                {!stats.payout_eligible && (
                                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800 mb-6 font-medium">
                                        Earn <span className="font-black text-orange-600">${Math.max(0, (stats.min_payout_usd || 8500) - (stats.available_balance_usd || 0))}</span> more to unlock payout (~$100 threshold).
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase font-bold tracking-wider text-gray-700 mb-2">Amount (USD)</label>
                                        <input type="number" placeholder={`Min $${stats.min_payout_usd || 8500}`} value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} disabled={!stats.payout_eligible} className="input-orange !py-3 !text-lg font-bold disabled:opacity-50 disabled:bg-gray-50" data-testid="payout-amount" />
                                    </div>
                                    
                                    {parseInt(payoutAmount) > 0 && (
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-sm space-y-3">
                                            <div className="flex justify-between font-medium text-emerald-800"><span>Requested</span><span>${payoutAmount}</span></div>
                                            <div className="flex justify-between font-medium text-orange-600"><span>Platform Fee (5%)</span><span>−${commission}</span></div>
                                            <div className="h-px bg-emerald-200/50 w-full" />
                                            <div className="flex justify-between font-black text-lg text-emerald-700"><span>You Receive</span><span>${(parseInt(payoutAmount) || 0) - commission}</span></div>
                                        </div>
                                    )}
                                    
                                    <button onClick={requestPayout} disabled={!stats.payout_eligible} className="btn btn-primary w-full !py-3.5 !rounded-xl !text-base shadow-[0_8px_20px_rgba(249,115,22,0.3)] disabled:shadow-none disabled:opacity-50" data-testid="payout-submit">Request Payout</button>
                                    <div className="text-xs text-center font-medium text-gray-400">Payouts are processed within 3 business days via Stripe.</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:col-span-7">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
                                <h2 className="text-2xl font-black text-gray-900 mb-6">Payout History</h2>
                                {payouts.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-gray-500 font-medium">No payouts requested yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {payouts.map((p) => (
                                            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-shadow" data-testid={`payout-${p.id}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.status === "processed" ? "bg-emerald-50 text-emerald-500" : "bg-orange-50 text-orange-500"}`}>
                                                        <Wallet className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-xl text-gray-900">${p.amount_usd}</div>
                                                        <div className="text-xs text-gray-500 font-medium">{new Date(p.requested_at).toLocaleDateString()} at {new Date(p.requested_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-500 font-medium mb-1">Net <span className="font-bold text-gray-900">${p.net_usd}</span></div>
                                                    <div className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                                                        p.status === "processed" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                                                    }`}>
                                                        {p.status}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
