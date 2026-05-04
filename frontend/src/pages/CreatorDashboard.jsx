import React, { useEffect, useMemo, useState } from "react";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Coins, IndianRupee, TrendingUp, Package, Sparkles, Trash2, Lock, Unlock, ImageIcon, Video, BarChart3, Banknote, Wallet } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

const EMPTY = {
    title: "", description: "", content: "", preview_url: "", media_type: "image",
    category: "image", tags: "", price_inr: 0, is_restricted: false,
    requires_user_media: "none", user_media_instructions: "",
};

function StatCard({ label, value, icon: Icon, bg }) {
    return (
        <div className={`${bg} border-2 border-[#1A1A1A] hard-shadow p-5`}>
            <Icon className="w-5 h-5 mb-2" />
            <div className="font-heading font-black text-3xl">{value}</div>
            <div className="text-xs uppercase font-bold tracking-wider">{label}</div>
        </div>
    );
}

export default function CreatorDashboard() {
    const { user } = useAuth();
    const [tab, setTab] = useState("create");
    const [stats, setStats] = useState({});
    const [prompts, setPrompts] = useState([]);
    const [sales, setSales] = useState([]);
    const [revenue, setRevenue] = useState({ series: [], interval: "monthly" });
    const [interval, setInterval] = useState("monthly");
    const [payouts, setPayouts] = useState([]);
    const [payoutAmount, setPayoutAmount] = useState("");
    const [form, setForm] = useState(EMPTY);
    const [estimate, setEstimate] = useState({ credits: 0, words: 0, tier: "basic", complexity: 0 });
    const [submitting, setSubmitting] = useState(false);

    const fetchAll = async () => {
        const [s, m, sl, p] = await Promise.all([
            http.get("/dashboard/creator-stats"),
            http.get("/prompts/mine"),
            http.get("/dashboard/creator-sales").catch(() => ({ data: [] })),
            http.get("/payouts/history").catch(() => ({ data: [] })),
        ]);
        setStats(s.data); setPrompts(m.data); setSales(sl.data); setPayouts(p.data);
    };
    const fetchRevenue = async (iv) => {
        const r = await http.get(`/dashboard/creator-revenue?interval=${iv}`);
        setRevenue(r.data);
    };

    useEffect(() => { fetchAll(); fetchRevenue(interval); /* eslint-disable-next-line */ }, []);
    useEffect(() => { fetchRevenue(interval); /* eslint-disable-next-line */ }, [interval]);

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
                price_inr: parseInt(form.price_inr || 0),
            };
            await http.post("/prompts", payload);
            toast.success("Prompt listed! Users can preview and unlock.");
            setForm(EMPTY); fetchAll();
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
            await http.post("/payouts/request", { amount_inr: amt });
            toast.success("Payout requested! (MOCKED)");
            setPayoutAmount(""); fetchAll();
        } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    };

    const totalRevenue = useMemo(() => revenue.series.reduce((s, b) => s + (b.revenue || 0), 0), [revenue]);
    const totalSales = useMemo(() => revenue.series.reduce((s, b) => s + (b.sales || 0), 0), [revenue]);
    const commission = useMemo(() => Math.round((parseInt(payoutAmount) || 0) * 0.05), [payoutAmount]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-2">Creator Dashboard</div>
                    <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter">Hi {user?.name?.split(" ")[0]}.</h1>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                <StatCard label="Prompts live" value={stats.prompts_count || 0} icon={Package} bg="bg-white" />
                <StatCard label="Earnings this month" value={`₹${stats.earnings_this_month_inr || 0}`} icon={TrendingUp} bg="bg-[#FFD600]" />
                <StatCard label="Total earnings" value={`₹${stats.earnings_inr || 0}`} icon={IndianRupee} bg="bg-[#0047FF] text-white" />
                <StatCard label="Available" value={`₹${stats.available_balance_inr || 0}`} icon={Wallet} bg="bg-white" />
                <StatCard label="Plan" value={stats.subscription_plan || "FREE"} icon={Sparkles} bg="bg-[#FF4F00] text-white" />
            </div>

            <div className="flex gap-1 mb-6 border-b-2 border-[#1A1A1A] flex-wrap">
                {[
                    ["overview", "Overview"],
                    ["create", "Create Prompt"],
                    ["my-prompts", "My Prompts"],
                    ["revenue", "Revenue"],
                    ["sales", "Sales"],
                    ["payouts", "Payouts"],
                ].map(([t, lbl]) => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 -mb-0.5 border-2 border-b-0 text-sm font-bold ${tab === t ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-[#F7F5F0] border-transparent hover:bg-white"}`}
                        data-testid={`tab-${t}`}>{lbl}</button>
                ))}
            </div>

            {/* ============ OVERVIEW ============ */}
            {tab === "overview" && (
                <div className="grid md:grid-cols-12 gap-6">
                    {/* Listed prompts panel */}
                    <div className="md:col-span-7 bg-white border-2 border-[#1A1A1A] hard-shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading text-2xl font-black flex items-center gap-2"><Package className="w-5 h-5" /> Your Listed Prompts</h3>
                            <button onClick={() => setTab("create")} className="btn-vermilion !py-1.5 !px-3 text-xs" data-testid="overview-create-btn">+ New</button>
                        </div>
                        {prompts.length === 0 ? (
                            <div className="text-center py-10 text-[#66635D]">
                                <p className="mb-4">No prompts listed yet. Publish your first prompt to start earning.</p>
                                <button onClick={() => setTab("create")} className="btn-ink">Create your first prompt →</button>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[480px] overflow-auto">
                                {prompts.slice(0, 8).map((p) => (
                                    <div key={p.id} className="flex items-center gap-3 p-3 border-2 border-[#1A1A1A] bg-[#F7F5F0]" data-testid={`overview-prompt-${p.id}`}>
                                        <img src={p.preview_url || "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?w=200"} className="w-12 h-12 object-cover border-2 border-[#1A1A1A]" alt="" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-heading font-bold text-sm truncate">{p.title}</div>
                                            <div className="text-xs text-[#66635D] truncate">
                                                {p.is_restricted ? `${p.credits_required} credits` : `₹${p.price_inr}`} · {p.downloads || 0} downloads
                                            </div>
                                        </div>
                                        <span className="text-xs uppercase font-bold tracking-wider text-[#0047FF]">{p.category}</span>
                                    </div>
                                ))}
                                {prompts.length > 8 && (
                                    <button onClick={() => setTab("my-prompts")} className="w-full text-center py-2 text-xs uppercase font-bold tracking-wider text-[#FF4F00] hover:underline">
                                        View all {prompts.length} prompts →
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Earnings + Payout summary */}
                    <div className="md:col-span-5 space-y-4">
                        <div className="bg-[#1A1A1A] text-[#F7F5F0] border-2 border-[#1A1A1A] hard-shadow-vermilion p-6">
                            <div className="text-xs uppercase font-bold tracking-wider text-[#FFD600] mb-2">Earnings overview</div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-white/60 uppercase tracking-wider">This month</div>
                                    <div className="font-heading font-black text-4xl">₹{stats.earnings_this_month_inr || 0}</div>
                                </div>
                                <div className="border-t border-white/10 pt-3">
                                    <div className="text-xs text-white/60 uppercase tracking-wider">Total earned</div>
                                    <div className="font-heading font-black text-2xl">₹{stats.earnings_inr || 0}</div>
                                </div>
                                <div className="border-t border-white/10 pt-3 grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <div className="text-white/60 uppercase tracking-wider">Downloads</div>
                                        <div className="font-bold text-base">{stats.total_downloads || 0}</div>
                                    </div>
                                    <div>
                                        <div className="text-white/60 uppercase tracking-wider">Paid out</div>
                                        <div className="font-bold text-base">₹{stats.paid_out_inr || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-[#1A1A1A] hard-shadow p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-xs uppercase font-bold tracking-wider text-[#FF4F00]">Payout progress</div>
                                <Banknote className="w-5 h-5 text-[#FF4F00]" />
                            </div>
                            <div className="font-heading font-black text-3xl">₹{stats.available_balance_inr || 0}</div>
                            <div className="text-xs text-[#66635D] mt-1">of ₹{stats.min_payout_inr || 8500} minimum (~$100)</div>
                            <div className="mt-3 h-3 bg-[#EFEBE1] border-2 border-[#1A1A1A] overflow-hidden">
                                <div className={`h-full ${stats.payout_eligible ? "bg-[#FFD600]" : "bg-[#FF4F00]"}`} style={{ width: `${stats.payout_progress_pct || 0}%` }} />
                            </div>
                            {stats.payout_eligible ? (
                                <button onClick={() => setTab("payouts")} className="btn-vermilion w-full mt-4 hard-shadow" data-testid="overview-payout-btn">
                                    Cash out now →
                                </button>
                            ) : (
                                <div className="mt-3 text-xs text-[#66635D]">
                                    Earn <span className="font-bold text-[#1A1A1A]">₹{Math.max(0, (stats.min_payout_inr || 8500) - (stats.available_balance_inr || 0))}</span> more to unlock payout. 5% commission applies on cashout.
                                </div>
                            )}
                        </div>

                        <div className="bg-[#FFD600] border-2 border-[#1A1A1A] hard-shadow p-5 text-sm">
                            <div className="font-heading font-black text-base mb-1">💡 Boost your earnings</div>
                            <p className="text-[#1A1A1A]/80">List restricted (credits-only) prompts for premium IP. Use the Credit Engine to price fairly.</p>
                            <button onClick={() => setTab("create")} className="mt-3 btn-ink !py-1.5 !px-3 text-xs" data-testid="overview-list-btn">Create restricted prompt →</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============ CREATE ============ */}
            {tab === "create" && (
                <form onSubmit={submit} className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 space-y-4 bg-white border-2 border-[#1A1A1A] hard-shadow p-6">
                        <div>
                            <label className="block text-xs uppercase font-bold tracking-wider mb-1">Title</label>
                            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" data-testid="input-title" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold tracking-wider mb-1">Short description</label>
                            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" data-testid="input-description" />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold tracking-wider mb-1 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Prompt content (the credit engine analyzes this live)</label>
                            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={8} className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0] font-mono text-sm" data-testid="input-content" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase font-bold tracking-wider mb-1">Category</label>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" data-testid="select-category">
                                    <option value="image">Image</option>
                                    <option value="code">Code</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="design">Design</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase font-bold tracking-wider mb-1">Tags (comma)</label>
                                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" placeholder="midjourney, art" data-testid="input-tags" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold tracking-wider mb-1">Reference image / video URL (preview)</label>
                            <input value={form.preview_url} onChange={(e) => setForm({ ...form, preview_url: e.target.value })} className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" placeholder="https://..." data-testid="input-preview" />
                        </div>

                        {/* Requires user media */}
                        <div className="bg-[#EFEBE1] border-2 border-[#1A1A1A] p-4">
                            <div className="text-xs uppercase font-bold tracking-wider mb-2">Does this prompt require the user to upload an image / video?</div>
                            <div className="grid grid-cols-3 gap-2">
                                {[["none", "None", null], ["image", "Image", ImageIcon], ["video", "Video", Video]].map(([v, lbl, Ic]) => (
                                    <label key={v} className={`cursor-pointer border-2 border-[#1A1A1A] py-2 px-3 text-center text-xs font-bold uppercase tracking-wider transition-colors ${form.requires_user_media === v ? "bg-[#FF4F00] text-white" : "bg-[#F7F5F0]"}`}>
                                        <input type="radio" name="rum" className="hidden" checked={form.requires_user_media === v} onChange={() => setForm({ ...form, requires_user_media: v })} data-testid={`rum-${v}`} />
                                        {Ic && <Ic className="w-4 h-4 inline mr-1" />}{lbl}
                                    </label>
                                ))}
                            </div>
                            {form.requires_user_media !== "none" && (
                                <input
                                    value={form.user_media_instructions}
                                    onChange={(e) => setForm({ ...form, user_media_instructions: e.target.value })}
                                    placeholder="Tell users what to upload (e.g. 'PNG of your product on neutral background')"
                                    className="mt-2 w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0] text-sm"
                                    data-testid="input-rum-instructions"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.is_restricted} onChange={(e) => setForm({ ...form, is_restricted: e.target.checked })} data-testid="check-restricted" />
                                <span className="text-sm font-bold">{form.is_restricted ? <><Lock className="w-3 h-3 inline" /> Credits only</> : <><Unlock className="w-3 h-3 inline" /> Direct buy (₹)</>}</span>
                            </label>
                            {!form.is_restricted && (
                                <div className="flex-1">
                                    <label className="block text-xs uppercase font-bold tracking-wider mb-1">Price ₹</label>
                                    <input type="number" value={form.price_inr} onChange={(e) => setForm({ ...form, price_inr: e.target.value })} className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0]" data-testid="input-price" />
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-[#66635D]">
                            <Lock className="w-3 h-3 inline mr-1" /> All prompts are preview-locked by default. Users see the preview & description but must buy / unlock to see the prompt content.
                        </div>
                        <button type="submit" disabled={submitting} className="btn-vermilion w-full hard-shadow" data-testid="submit-prompt-btn">
                            {submitting ? "Publishing…" : "Publish Prompt"}
                        </button>
                    </div>

                    <div className="md:col-span-5">
                        <div className="bg-[#1A1A1A] text-[#F7F5F0] border-2 border-[#1A1A1A] hard-shadow-vermilion p-6 sticky top-24">
                            <div className="text-xs uppercase font-bold tracking-wider text-[#FFD600] mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Credit Engine</div>
                            <div className="flex items-baseline gap-2 mb-4">
                                <Coins className="w-8 h-8 text-[#FFD600]" />
                                <div className="font-heading font-black text-6xl" data-testid="engine-credits">{estimate.credits}</div>
                                <div className="text-sm text-white/60">credits</div>
                            </div>
                            <div className="space-y-2 text-sm font-mono">
                                <div className="flex justify-between border-b border-white/10 py-2"><span>Words</span><span>{estimate.words}</span></div>
                                <div className="flex justify-between border-b border-white/10 py-2"><span>Complexity</span><span>{estimate.complexity}</span></div>
                                <div className="flex justify-between border-b border-white/10 py-2"><span>Tier</span><span className="uppercase font-bold text-[#FFD600]">{estimate.tier}</span></div>
                            </div>
                            <p className="mt-4 text-xs text-white/60 leading-relaxed">
                                Credits scale with token count + complexity keywords. Users unlock restricted prompts by paying this credit cost.
                            </p>
                        </div>
                    </div>
                </form>
            )}

            {/* ============ MY PROMPTS ============ */}
            {tab === "my-prompts" && (
                <div className="space-y-3">
                    {prompts.length === 0 ? <p className="text-[#66635D]">No prompts yet. Create your first one!</p> : prompts.map((p) => (
                        <div key={p.id} className="flex items-center gap-4 bg-white border-2 border-[#1A1A1A] p-4" data-testid={`mine-${p.id}`}>
                            <img src={p.preview_url || "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?w=200"} className="w-16 h-16 object-cover border-2 border-[#1A1A1A]" alt="" />
                            <div className="flex-1 min-w-0">
                                <div className="font-heading font-bold">{p.title}</div>
                                <div className="text-xs text-[#66635D] truncate">{p.description}</div>
                                {p.requires_user_media !== "none" && (
                                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#0047FF]">
                                        {p.requires_user_media === "image" ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                        Requires {p.requires_user_media}
                                    </div>
                                )}
                            </div>
                            <div className="text-sm">
                                {p.is_restricted ? <span className="text-[#0047FF] font-bold">{p.credits_required} cr</span> : <span>₹{p.price_inr}</span>}
                            </div>
                            <div className="text-xs text-[#66635D]">{p.downloads || 0} dl</div>
                            <button onClick={() => remove(p.id)} className="p-2 border-2 border-[#1A1A1A] hover:bg-red-500 hover:text-white" data-testid={`del-${p.id}`}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ============ REVENUE ============ */}
            {tab === "revenue" && (
                <div>
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[#FF4F00]" />
                            <h3 className="font-heading text-2xl font-bold">Revenue analytics</h3>
                        </div>
                        <div className="flex gap-1 border-2 border-[#1A1A1A] bg-white">
                            {[["daily", "30D"], ["weekly", "12W"], ["monthly", "12M"]].map(([v, lbl]) => (
                                <button key={v} onClick={() => setInterval(v)}
                                    className={`px-4 py-2 text-xs font-bold uppercase ${interval === v ? "bg-[#1A1A1A] text-white" : ""}`}
                                    data-testid={`int-${v}`}>{lbl}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                        <StatCard label={`Revenue · ${interval}`} value={`₹${totalRevenue}`} icon={IndianRupee} bg="bg-[#FFD600]" />
                        <StatCard label="Sales count" value={totalSales} icon={TrendingUp} bg="bg-white" />
                        <StatCard label="Available payout" value={`₹${stats.available_balance_inr || 0}`} icon={Wallet} bg="bg-[#0047FF] text-white" />
                    </div>
                    <div className="bg-white border-2 border-[#1A1A1A] hard-shadow p-6">
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={revenue.series} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#D8D4C9" />
                                <XAxis dataKey="label" stroke="#1A1A1A" fontSize={11} />
                                <YAxis stroke="#1A1A1A" fontSize={11} />
                                <Tooltip contentStyle={{ background: "#1A1A1A", color: "white", border: "2px solid #1A1A1A", fontFamily: "monospace" }} />
                                <Line type="monotone" dataKey="revenue" stroke="#FF4F00" strokeWidth={3} dot={{ fill: "#FF4F00", r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 bg-white border-2 border-[#1A1A1A] hard-shadow p-6">
                        <div className="text-xs uppercase font-bold tracking-wider mb-3">Sales count</div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={revenue.series}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#D8D4C9" />
                                <XAxis dataKey="label" stroke="#1A1A1A" fontSize={11} />
                                <YAxis stroke="#1A1A1A" fontSize={11} />
                                <Tooltip contentStyle={{ background: "#1A1A1A", color: "white" }} />
                                <Bar dataKey="sales" fill="#0047FF" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ============ SALES ============ */}
            {tab === "sales" && (
                <div className="space-y-3">
                    <div className="text-xs uppercase font-bold tracking-wider text-[#66635D] mb-2">Every purchase of your prompts</div>
                    {sales.length === 0 ? <p className="text-[#66635D]">No sales yet.</p> : sales.map((s) => (
                        <div key={s.id} className="flex items-center gap-4 bg-white border-2 border-[#1A1A1A] p-4" data-testid={`sale-${s.id}`}>
                            {s.prompt?.preview_url && <img src={s.prompt.preview_url} className="w-12 h-12 object-cover border-2 border-[#1A1A1A]" alt="" />}
                            <div className="flex-1 min-w-0">
                                <div className="font-heading font-bold text-sm">{s.prompt?.title}</div>
                                <div className="text-xs text-[#66635D]">Sold to {s.buyer?.name} · {new Date(s.created_at).toLocaleString()}</div>
                            </div>
                            <div className="text-sm font-bold">
                                {s.method === "credits" ? <span className="text-[#0047FF]">{s.credits_used} credits</span> : <span>+₹{s.amount_inr}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ============ PAYOUTS ============ */}
            {tab === "payouts" && (
                <div className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 bg-white border-2 border-[#1A1A1A] hard-shadow p-6 space-y-3">
                        <div className="font-heading font-black text-2xl flex items-center gap-2"><Banknote className="w-5 h-5 text-[#FF4F00]" /> Request payout</div>
                        <div className="text-sm text-[#66635D]">
                            Available: <span className="font-bold text-[#1A1A1A]">₹{stats.available_balance_inr || 0}</span> ·
                            Minimum: <span className="font-bold text-[#1A1A1A]">₹{stats.min_payout_inr || 8500}</span> ·
                            Commission: <span className="font-bold">5%</span>
                        </div>
                        {!stats.payout_eligible && (
                            <div className="bg-[#EFEBE1] border-2 border-[#1A1A1A] p-3 text-xs">
                                Earn <span className="font-bold">₹{Math.max(0, (stats.min_payout_inr || 8500) - (stats.available_balance_inr || 0))}</span> more to unlock payout (~$100 minimum threshold).
                            </div>
                        )}
                        <input type="number" placeholder={`Amount ₹ (min ${stats.min_payout_inr || 8500})`} value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} disabled={!stats.payout_eligible} className="w-full px-3 py-2 border-2 border-[#1A1A1A] bg-[#F7F5F0] disabled:opacity-50" data-testid="payout-amount" />
                        {parseInt(payoutAmount) > 0 && (
                            <div className="bg-[#EFEBE1] border-2 border-[#1A1A1A] p-3 text-sm space-y-1 font-mono">
                                <div className="flex justify-between"><span>Requested</span><span>₹{payoutAmount}</span></div>
                                <div className="flex justify-between text-[#FF4F00]"><span>− Commission (5%)</span><span>−₹{commission}</span></div>
                                <div className="flex justify-between border-t border-[#1A1A1A] pt-1 mt-1 font-bold"><span>You receive</span><span>₹{(parseInt(payoutAmount) || 0) - commission}</span></div>
                            </div>
                        )}
                        <button onClick={requestPayout} disabled={!stats.payout_eligible} className="btn-vermilion w-full disabled:opacity-50 disabled:cursor-not-allowed" data-testid="payout-submit">Request Payout</button>
                        <div className="text-xs text-[#66635D]">Payouts are processed within 3 business days. (MOCKED)</div>
                    </div>
                    <div className="md:col-span-7">
                        <div className="font-heading font-black text-2xl mb-3">Payout history</div>
                        {payouts.length === 0 ? <p className="text-[#66635D]">No payouts yet.</p> : (
                            <div className="space-y-2">
                                {payouts.map((p) => (
                                    <div key={p.id} className="bg-white border-2 border-[#1A1A1A] p-4 flex items-center justify-between" data-testid={`payout-${p.id}`}>
                                        <div>
                                            <div className="font-heading font-bold">₹{p.amount_inr}</div>
                                            <div className="text-xs text-[#66635D]">{new Date(p.requested_at).toLocaleString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-[#66635D]">−5% = <span className="font-bold text-[#1A1A1A]">₹{p.net_inr}</span></div>
                                            <div className={`mt-1 inline-block px-2 py-0.5 text-[10px] font-bold uppercase border-2 border-[#1A1A1A] ${p.status === "processed" ? "bg-[#FFD600]" : "bg-white"}`}>{p.status}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
