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
        <div className={`rounded-[2rem] p-6 border-4 border-transparent bg-white hover:border-brand-lt_pink transition-all shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
                <div className="text-xs uppercase font-black tracking-wider text-brand-lt_purple opacity-80">{label}</div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-lt_pink text-brand-lt_purple`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="font-black text-4xl text-brand-lt_purple">{value}</div>
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
        <div className="min-h-screen bg-brand-lt_light pb-20">
            {/* Header */}
            <div className="bg-brand-lt_green border-none pt-12 pb-10 px-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="badge bg-brand-lt_lime/20 text-brand-lt_lime border-none mb-3 w-fit">Creator Dashboard</div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                Hi, <span className="text-brand-lt_lime">{user?.name?.split(" ")[0]}</span>.
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
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${
                                tab === t ? "bg-brand-lt_purple text-white shadow-md border-brand-lt_purple" : "bg-white text-gray-600 hover:border-brand-lt_pink border-transparent"
                            }`}
                            data-testid={`tab-${t}`}>{lbl}</button>
                    ))}
                </div>

                {/* ============ OVERVIEW ============ */}
                {tab === "overview" && (
                    <div className="grid md:grid-cols-12 gap-8">
                        {/* Listed prompts panel */}
                        <div className="md:col-span-7 bg-white rounded-[3rem] border-4 border-transparent hover:border-brand-lt_pink shadow-lg p-8 transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-3xl text-brand-lt_purple flex items-center gap-2"><Package className="w-7 h-7 text-brand-lt_lime" /> Listed Prompts</h3>
                                <button onClick={() => setTab("create")} className="btn !bg-brand-lt_lime !text-brand-lt_green hover:!bg-brand-lt_pink hover:!text-brand-lt_purple !rounded-full !py-3 !px-5 text-sm font-black transition-colors" data-testid="overview-create-btn">
                                    <Plus className="w-5 h-5 mr-1" /> New Prompt
                                </button>
                            </div>
                            {prompts.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-[3rem] border-4 border-brand-lt_pink border-dashed">
                                    <div className="w-20 h-20 bg-brand-lt_pink rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <Package className="w-10 h-10 text-brand-lt_purple" />
                                    </div>
                                    <p className="text-brand-lt_purple/70 font-medium mb-8 text-lg">No prompts listed yet. Publish your first prompt to start earning.</p>
                                    <button onClick={() => setTab("create")} className="btn !bg-brand-lt_purple !text-white hover:!bg-brand-lt_green !rounded-full !py-3 !px-8 text-lg font-black transition-colors">Create your first prompt</button>
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
                            <div className="bg-brand-lt_purple text-white rounded-[3rem] p-10 shadow-xl border-none">
                                <div className="text-sm uppercase font-black tracking-wider text-brand-lt_lime mb-6 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Earnings overview</div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-sm text-brand-lt_pink font-bold mb-2">This month</div>
                                        <div className="font-black text-6xl tracking-tight text-white">${stats.earnings_this_month_usd || 0}</div>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full" />
                                    <div>
                                        <div className="text-sm text-brand-lt_pink font-bold mb-2">Total earned</div>
                                        <div className="font-black text-4xl tracking-tight text-white">${stats.earnings_usd || 0}</div>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-brand-lt_pink font-bold mb-2">Downloads</div>
                                            <div className="font-black text-2xl text-white">{stats.total_downloads || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-brand-lt_pink font-bold mb-2">Paid out</div>
                                            <div className="font-black text-2xl text-white">${stats.paid_out_usd || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[3rem] border-4 border-transparent hover:border-brand-lt_pink shadow-lg p-8 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-xs uppercase font-black tracking-wider text-brand-lt_purple">Payout progress</div>
                                    <Banknote className="w-6 h-6 text-brand-lt_lime" />
                                </div>
                                <div className="font-black text-4xl text-gray-900">${stats.available_balance_usd || 0}</div>
                                <div className="text-sm text-gray-500 mt-1 font-medium">of ${stats.min_payout_usd || 8500} minimum (~$100)</div>
                                <div className="mt-5 h-4 bg-brand-lt_light rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${stats.payout_eligible ? "bg-brand-lt_lime" : "bg-brand-lt_purple"}`} style={{ width: `${Math.min(100, stats.payout_progress_pct || 0)}%` }} />
                                </div>
                                {stats.payout_eligible ? (
                                    <button onClick={() => setTab("payouts")} className="btn !bg-brand-lt_lime !text-brand-lt_green hover:!bg-brand-lt_pink hover:!text-brand-lt_purple w-full mt-6 !rounded-full !py-3 font-black text-lg transition-colors" data-testid="overview-payout-btn">
                                        Cash out now
                                    </button>
                                ) : (
                                    <div className="mt-5 text-sm font-bold text-brand-lt_purple bg-brand-lt_pink rounded-[1.5rem] p-4">
                                        Earn <span className="font-black">${Math.max(0, (stats.min_payout_usd || 8500) - (stats.available_balance_usd || 0))}</span> more to unlock payout. 5% commission applies on cashout.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ============ CREATE ============ */}
                {tab === "create" && (
                    <form onSubmit={submit} className="grid md:grid-cols-12 gap-8">
                        <div className="md:col-span-7 bg-white rounded-[3rem] border-4 border-transparent shadow-lg p-8 space-y-6">
                            <div className="pb-4 border-b-2 border-brand-lt_light mb-6">
                                <h2 className="text-3xl font-black text-brand-lt_purple">Publish New Prompt</h2>
                                <p className="text-sm font-bold text-gray-500 mt-1">Fill out the details to list your prompt on the marketplace.</p>
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
                            <div className="bg-brand-lt_pink rounded-[2rem] p-6 border-none">
                                <div className="text-xs uppercase font-black tracking-wider text-brand-lt_purple mb-3">Does this prompt require the user to upload an image / video?</div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[["none", "None", null], ["image", "Image", ImageIcon], ["video", "Video", Video]].map(([v, lbl, Ic]) => (
                                        <label key={v} className={`cursor-pointer rounded-xl border-4 py-3 px-3 text-center text-xs font-black uppercase tracking-wider transition-all ${form.requires_user_media === v ? "bg-brand-lt_purple text-white border-brand-lt_purple shadow-md" : "bg-white text-gray-600 border-transparent hover:border-brand-lt_lime"}`}>
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
                                
                                <div className="mt-6 pt-6 border-t-2 border-brand-lt_purple/20">
                                    <label className="block text-xs uppercase font-black tracking-wider text-brand-lt_purple mb-2">Credit Price (0 = free)</label>
                                    <div className="flex items-center gap-3">
                                        <Coins className="w-6 h-6 text-brand-lt_purple" />
                                        <input type="number" min="0" value={form.price_credits} onChange={(e) => setForm({ ...form, price_credits: e.target.value })} className="input-orange" data-testid="input-price-credits" />
                                    </div>
                                    <div className="text-xs text-brand-lt_purple/70 mt-2 font-bold">
                                        <Lock className="w-3.5 h-3.5 inline mr-1 text-brand-lt_purple/50" /> Set to 0 to make the prompt free. Clients spend credits to unlock restricted prompts.
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={submitting} className="btn !bg-brand-lt_lime !text-brand-lt_green hover:!bg-brand-lt_pink hover:!text-brand-lt_purple w-full !py-4 !rounded-full !text-lg font-black transition-all" data-testid="submit-prompt-btn">
                                {submitting ? "Publishing…" : "Publish Prompt"}
                            </button>
                        </div>

                        <div className="md:col-span-5">
                            <div className="bg-brand-lt_purple text-white rounded-[3rem] p-8 shadow-xl sticky top-24">
                                <div className="text-xs uppercase font-black tracking-wider text-brand-lt_lime mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Credit Engine</div>
                                <div className="flex items-end gap-3 mb-6 pb-6 border-b-4 border-white/10">
                                    <Coins className="w-10 h-10 text-brand-lt_lime mb-2" />
                                    <div className="font-black text-6xl leading-none text-white" data-testid="engine-credits">{estimate.credits}</div>
                                    <div className="text-base font-bold text-brand-lt_pink mb-1">credits</div>
                                </div>
                                <div className="space-y-4 text-sm font-bold">
                                    <div className="flex justify-between items-center"><span className="text-white">Words</span><span className="font-mono bg-brand-lt_pink text-brand-lt_purple px-2 py-0.5 rounded-lg">{estimate.words}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-white">Complexity</span><span className="font-mono bg-brand-lt_pink text-brand-lt_purple px-2 py-0.5 rounded-lg">{estimate.complexity}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-white">Calculated Tier</span><span className="badge bg-brand-lt_lime text-brand-lt_green border-none">{estimate.tier}</span></div>
                                </div>
                                <div className="mt-8 bg-brand-lt_pink/10 rounded-2xl p-4">
                                    <p className="text-xs text-white leading-relaxed font-bold">
                                        Credits scale automatically with token count and complexity keywords. When clients unlock restricted prompts, they pay this exact credit cost.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                

                {/* ============ LIBRARY ============ */}
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

                        {purchases.length === 0 ? (
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
                    <div className="bg-white rounded-[3rem] border-4 border-transparent shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-brand-lt_purple flex items-center gap-3">
                                <Clock className="w-8 h-8 text-brand-lt_lime" />
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
                                        <tr className="border-b-2 border-brand-lt_light">
                                            <th className="pb-4 px-4 text-xs uppercase font-black tracking-wider text-brand-lt_purple">Date</th>
                                            <th className="pb-4 px-4 text-xs uppercase font-black tracking-wider text-brand-lt_purple">Prompt</th>
                                            <th className="pb-4 px-4 text-xs uppercase font-black tracking-wider text-brand-lt_purple text-right">Amount</th>
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
                    <div className="bg-white rounded-[3rem] border-4 border-transparent shadow-lg p-8">
                        <h2 className="text-3xl font-black text-brand-lt_purple mb-6">Manage Your Prompts</h2>
                        <div className="space-y-4">
                            {prompts.length === 0 ? (
                                <div className="text-center py-10 bg-brand-lt_light rounded-[2rem] border-4 border-brand-lt_pink border-dashed">
                                    <p className="text-brand-lt_purple/70 font-bold text-lg">No prompts yet. Create your first one!</p>
                                </div>
                            ) : prompts.map((p) => (
                                <div key={p.id} className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-[2rem] border-4 border-transparent bg-white hover:border-brand-lt_pink hover:shadow-lg transition-all group" data-testid={`mine-${p.id}`}>
                                    <img src={p.preview_url || "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?w=200"} className="w-24 h-24 rounded-2xl object-cover border-4 border-brand-lt_light" alt="" />
                                    <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                                        <div className="font-black text-xl text-brand-lt_purple group-hover:text-brand-lt_green transition-colors">{p.title}</div>
                                        <div className="text-sm font-medium text-gray-500 truncate mt-1">{p.description}</div>
                                        {p.requires_user_media !== "none" && (
                                            <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase font-black text-brand-lt_purple bg-brand-lt_pink px-3 py-1 rounded-xl">
                                                {p.requires_user_media === "image" ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                                Requires {p.requires_user_media}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 w-full sm:w-auto border-t-2 border-brand-lt_light sm:border-0 pt-4 sm:pt-0">
                                        <div className="text-base flex-1 sm:flex-none text-left sm:text-right">
                                            {p.is_restricted ? <span className="font-black text-white bg-brand-lt_purple px-3 py-1 rounded-xl">{p.credits_required} cr</span> : <span className="font-black text-brand-lt_green bg-brand-lt_lime px-3 py-1 rounded-xl">${p.price_usd}</span>}
                                        </div>
                                        <div className="text-xs text-brand-lt_purple/50 font-black">{p.downloads || 0} downloads</div>
                                        <button onClick={() => remove(p.id)} className="p-3 rounded-2xl bg-brand-lt_light text-brand-lt_purple hover:bg-brand-lt_pink hover:text-brand-lt_purple transition-colors ml-auto sm:ml-0 mt-2" data-testid={`del-${p.id}`}>
                                            <Trash2 className="w-5 h-5" />
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
                        <div className="bg-white rounded-[3rem] border-4 border-transparent shadow-lg p-8">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-lt_pink flex items-center justify-center">
                                        <BarChart3 className="w-7 h-7 text-brand-lt_purple" />
                                    </div>
                                    <h3 className="text-3xl font-black text-brand-lt_purple">Revenue Analytics</h3>
                                </div>
                                <div className="flex gap-2 p-1.5 bg-brand-lt_light rounded-2xl border-none w-full sm:w-auto">
                                    {[["daily", "30 Days"], ["weekly", "12 Weeks"], ["monthly", "12 Months"]].map(([v, lbl]) => (
                                        <button key={v} onClick={() => setInterval(v)}
                                            className={`flex-1 sm:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all ${interval === v ? "bg-brand-lt_purple text-white shadow-md" : "text-brand-lt_purple/50 hover:text-brand-lt_purple"}`}
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
                        
                        <div className="bg-white rounded-[3rem] border-4 border-transparent shadow-lg p-8">
                            <div className="text-sm uppercase font-black tracking-wider text-brand-lt_purple mb-6">Sales Volume</div>
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
                    <div className="bg-white rounded-[3rem] border-4 border-transparent shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black text-brand-lt_purple">Recent Sales</h2>
                            <span className="badge bg-brand-lt_lime text-brand-lt_green font-black px-4 py-1.5 rounded-xl border-none">{sales.length} Transactions</span>
                        </div>
                        <div className="space-y-3">
                            {sales.length === 0 ? (
                                <div className="text-center py-10 bg-brand-lt_light rounded-[2rem] border-4 border-brand-lt_pink border-dashed">
                                    <p className="text-brand-lt_purple/70 font-bold text-lg">No sales yet.</p>
                                </div>
                            ) : sales.map((s) => (
                                <div key={s.id} className="flex items-center gap-4 bg-white border-4 border-brand-lt_light rounded-[2rem] p-4 hover:shadow-lg hover:border-brand-lt_pink transition-all" data-testid={`sale-${s.id}`}>
                                    {s.prompt?.preview_url ? (
                                        <img src={s.prompt.preview_url} className="w-14 h-14 rounded-2xl object-cover border-4 border-brand-lt_light" alt="" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-brand-lt_pink flex items-center justify-center">
                                            <Package className="w-6 h-6 text-brand-lt_purple" />
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
                        <div className="md:col-span-5 space-y-6">
                            <div className="bg-brand-lt_green text-white rounded-[3rem] p-8 shadow-xl border-none">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-lt_lime flex items-center justify-center">
                                        <Banknote className="w-7 h-7 text-brand-lt_green" />
                                    </div>
                                    <span className="badge bg-white/20 text-white border-none font-bold">Minimum ${stats.min_payout_usd || 8500}</span>
                                </div>
                                <div className="text-sm font-bold text-brand-lt_lime mb-2">Available for payout</div>
                                <div className="font-black text-5xl tracking-tight mb-8">${stats.available_balance_usd || 0}</div>
                                
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-lt_green font-black text-xl">$</div>
                                        <input
                                            type="number"
                                            value={payoutAmount}
                                            onChange={(e) => setPayoutAmount(e.target.value)}
                                            placeholder="Amount to withdraw"
                                            className="w-full bg-white text-brand-lt_green placeholder:text-brand-lt_green/50 text-xl font-black py-4 pl-10 pr-4 rounded-full border-none focus:ring-4 focus:ring-brand-lt_lime/50 transition-all outline-none"
                                            max={stats.available_balance_usd || 0}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-white/80 px-2">
                                        <span>5% Commission</span>
                                        <span>-${commission} fee</span>
                                    </div>
                                    <button onClick={requestPayout} disabled={!payoutAmount || parseInt(payoutAmount) <= 0 || parseInt(payoutAmount) > (stats.available_balance_usd || 0)} className="btn !bg-brand-lt_lime !text-brand-lt_green hover:!bg-brand-lt_pink hover:!text-brand-lt_purple w-full !py-4 !rounded-full !text-lg font-black transition-all">
                                        Withdraw to Bank
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-7">
                            <div className="bg-white rounded-[3rem] border-4 border-transparent shadow-lg p-8">
                                <h3 className="text-2xl font-black text-brand-lt_purple mb-6">Payout History</h3>
                                {payouts.length === 0 ? (
                                    <div className="text-center py-10 bg-brand-lt_light rounded-[2rem] border-4 border-brand-lt_pink border-dashed">
                                        <p className="text-brand-lt_purple/70 font-bold text-lg">No past payouts.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b-2 border-brand-lt_light">
                                                    <th className="pb-4 px-4 text-xs uppercase font-black tracking-wider text-brand-lt_purple">Date</th>
                                                    <th className="pb-4 px-4 text-xs uppercase font-black tracking-wider text-brand-lt_purple">Status</th>
                                                    <th className="pb-4 px-4 text-xs uppercase font-black tracking-wider text-brand-lt_purple text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y-2 divide-brand-lt_light">
                                                {payouts.map((p) => (
                                                    <tr key={p.id} className="hover:bg-brand-lt_light/50 transition-colors">
                                                        <td className="py-4 px-4 text-sm font-bold text-gray-900">{new Date(p.requested_at).toLocaleDateString()}</td>
                                                        <td className="py-4 px-4">
                                                            <div className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl ${
                                                                p.status === "processed" ? "bg-brand-lt_lime text-brand-lt_green" : "bg-brand-lt_pink text-brand-lt_purple"
                                                            }`}>
                                                                {p.status}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            <div className="font-black text-gray-900">${p.amount_usd}</div>
                                                            <div className="text-xs text-gray-500 font-bold mt-1">Net ${p.net_usd}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
