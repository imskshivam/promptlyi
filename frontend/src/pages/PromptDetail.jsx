import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Coins, IndianRupee, Lock, Download, Copy, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function PromptDetail() {
    const { id } = useParams();
    const { user, login } = useAuth();
    const nav = useNavigate();
    const [p, setP] = useState(null);
    const [copied, setCopied] = useState(false);
    const [purchasing, setPurchasing] = useState(false);

    const fetch = async () => {
        try {
            const r = await http.get(`/prompts/${id}`);
            setP(r.data);
        } catch (e) { toast.error("Prompt not found"); nav("/marketplace"); }
    };
    useEffect(() => { fetch(); /* eslint-disable-next-line */ }, [id]);

    const purchase = async (method) => {
        if (!user) { login(); return; }
        setPurchasing(true);
        try {
            const r = await http.post("/prompts/purchase", { prompt_id: id, method });
            toast.success("Purchase successful!");
            if (r.data.content) setP({ ...p, content: r.data.content });
            else fetch();
        } catch (e) {
            toast.error(e.response?.data?.detail || "Purchase failed");
        } finally { setPurchasing(false); }
    };

    const copy = () => {
        navigator.clipboard.writeText(p.content);
        setCopied(true); setTimeout(() => setCopied(false), 1500);
    };

    if (!p) return <div className="p-16 text-center">Loading…</div>;
    const owned = !!p.content;

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-[#66635D] hover:text-[#FF4F00] mb-6"><ArrowLeft className="w-4 h-4" /> Back to marketplace</Link>

            <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-7">
                    <div className="aspect-[4/3] bg-[#EFEBE1] border-2 border-[#1A1A1A] hard-shadow-lg overflow-hidden">
                        <img src={p.preview_url || "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80"} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {p.tags?.map((t) => (
                            <span key={t} className="px-2.5 py-1 bg-white border-2 border-[#1A1A1A] text-xs font-bold uppercase">#{t}</span>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-5">
                    <div className="flex gap-2 mb-4 flex-wrap">
                        <span className="px-2.5 py-1 bg-[#1A1A1A] text-white text-xs font-bold uppercase">{p.category}</span>
                        {p.is_restricted && <span className="px-2.5 py-1 bg-[#0047FF] text-white text-xs font-bold uppercase inline-flex items-center gap-1"><Lock className="w-3 h-3" />Credits only</span>}
                        {p.requires_user_media && p.requires_user_media !== "none" && (
                            <span className="px-2.5 py-1 bg-[#FF4F00] text-white text-xs font-bold uppercase inline-flex items-center gap-1">
                                Requires {p.requires_user_media}
                            </span>
                        )}
                    </div>
                    <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter leading-tight">{p.title}</h1>
                    <p className="mt-4 text-[#66635D]">{p.description}</p>

                    {p.requires_user_media && p.requires_user_media !== "none" && p.user_media_instructions && (
                        <div className="mt-4 bg-[#FFD600] border-2 border-[#1A1A1A] p-3 text-sm">
                            <span className="font-bold uppercase text-xs tracking-wider">You'll need to provide:</span>
                            <p className="mt-1">{p.user_media_instructions}</p>
                        </div>
                    )}

                    <Link to={`/creators/${p.creator?.id}`} className="mt-6 flex items-center gap-3 p-3 bg-white border-2 border-[#1A1A1A] hover:bg-[#FFD600] transition-colors" data-testid="creator-link">
                        {p.creator?.picture && <img src={p.creator.picture} className="w-10 h-10 rounded-full border-2 border-[#1A1A1A]" alt="" />}
                        <div>
                            <div className="text-xs uppercase tracking-wider text-[#66635D]">Creator</div>
                            <div className="font-heading font-bold">{p.creator?.name}</div>
                        </div>
                    </Link>

                    <div className="mt-6 p-6 bg-white border-2 border-[#1A1A1A] hard-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-wider text-[#66635D]">Price</div>
                                {p.is_restricted ? (
                                    <div className="font-heading text-3xl font-black text-[#0047FF] inline-flex items-center gap-1"><Coins className="w-6 h-6" />{p.credits_required} credits</div>
                                ) : p.price_inr > 0 ? (
                                    <div className="font-heading text-3xl font-black inline-flex items-center"><IndianRupee className="w-5 h-5" />{p.price_inr}</div>
                                ) : (
                                    <div className="font-heading text-3xl font-black text-[#FF4F00]">FREE</div>
                                )}
                            </div>
                            <div className="text-right text-xs text-[#66635D]">
                                <div className="inline-flex items-center gap-1"><Download className="w-3 h-3" /> {p.downloads || 0}</div>
                                <div className="mt-1">★ {p.rating?.toFixed(1)}</div>
                            </div>
                        </div>
                        {owned ? (
                            <div className="mt-5 p-4 bg-[#EFEBE1] border-2 border-[#1A1A1A] font-mono text-sm whitespace-pre-wrap break-words">
                                {p.content}
                                <button onClick={copy} className="mt-4 btn-ink !py-2 !px-3 text-xs w-full" data-testid="copy-prompt-btn">
                                    {copied ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy prompt</>}
                                </button>
                            </div>
                        ) : (
                            <div className="mt-5 space-y-2">
                                {p.is_restricted ? (
                                    <button onClick={() => purchase("credits")} disabled={purchasing} className="btn-vermilion w-full" data-testid="buy-credits-btn">
                                        {purchasing ? "Processing…" : `Unlock with ${p.credits_required} credits`}
                                    </button>
                                ) : p.price_inr > 0 ? (
                                    <button onClick={() => purchase("money")} disabled={purchasing} className="btn-vermilion w-full" data-testid="buy-money-btn">
                                        {purchasing ? "Processing…" : `Buy for ₹${p.price_inr}`}
                                    </button>
                                ) : (
                                    <button onClick={() => purchase("money")} disabled={purchasing} className="btn-vermilion w-full" data-testid="claim-free-btn">
                                        {purchasing ? "Processing…" : "Get it — FREE"}
                                    </button>
                                )}
                                {!user && <p className="text-xs text-[#66635D] text-center">Please sign in to purchase.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
