import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
    Coins, Lock, Download, Copy, CheckCircle2, ArrowLeft,
    ImageIcon, Video, AlertCircle, ChevronLeft, ChevronRight,
    ListChecks, ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { logCustomEvent } from "../lib/firebase";

export default function PromptDetail() {
    const { id } = useParams();
    const { user, login, refresh } = useAuth();
    const nav = useNavigate();
    const [p, setP] = useState(null);
    const [copied, setCopied] = useState(false);
    const [purchasing, setPurchasing] = useState(false);
    const [galleryIdx, setGalleryIdx] = useState(0);

    const loadPrompt = async () => {
        try {
            const r = await http.get(`/prompts/${id}`);
            setP(r.data);
        } catch { toast.error("Prompt not found"); nav("/marketplace"); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadPrompt(); }, [id]);

    const purchase = async () => {
        if (!user) { login(); return; }
        setPurchasing(true);
        try {
            const r = await http.post("/prompts/purchase", { prompt_id: id });
            if (r.data.already_owned) {
                toast.info("You already own this prompt.");
                if (r.data.content) setP(prev => ({ ...prev, content: r.data.content }));
                return;
            }
            logCustomEvent("unlock_prompt", { prompt_id: id, is_free: isFree, price_credits: priceCredits });
            toast.success("🎉 Unlocked! Prompt content is now visible.");
            await refresh(); // update credit balance in navbar
            if (r.data.content) setP(prev => ({ ...prev, content: r.data.content }));
            else loadPrompt();
        } catch (e) {
            const msg = e.response?.data?.detail || "Purchase failed";
            if (msg.includes("Insufficient credits")) {
                toast.error(msg + " — Buy more credits from your dashboard.");
            } else {
                toast.error(msg);
            }
        } finally { setPurchasing(false); }
    };

    const copy = () => {
        navigator.clipboard.writeText(p.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    if (!p) return (
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-12 gap-8 animate-pulse">
            <div className="col-span-7 aspect-[4/3] bg-[#EFEBE1] border-2 border-[#1A1A1A]" />
            <div className="col-span-5 space-y-4">
                <div className="h-8 bg-[#EFEBE1] w-3/4" />
                <div className="h-4 bg-[#EFEBE1]" />
                <div className="h-4 bg-[#EFEBE1] w-5/6" />
            </div>
        </div>
    );

    const owned = !!p.content;
    const priceCredits = p.price_credits ?? p.credits_required ?? 0;
    const isFree = priceCredits === 0;

    // Build gallery: preview + example images
    const gallery = [
        p.preview_url || "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80",
        ...(p.example_images || []),
    ].filter(Boolean);

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-[#66635D] hover:text-[#FF4F00] mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to marketplace
            </Link>

            <div className="grid md:grid-cols-12 gap-8">
                {/* ======== Left: Gallery + Tags ======== */}
                <div className="md:col-span-7">
                    {/* Main image / gallery */}
                    <div className="relative aspect-[4/3] bg-[#EFEBE1] border-2 border-[#1A1A1A] hard-shadow overflow-hidden">
                        {p.example_video_url && galleryIdx === 0 ? (
                            <video src={p.example_video_url} controls className="w-full h-full object-cover" />
                        ) : (
                            <img
                                src={gallery[galleryIdx] || gallery[0]}
                                alt={p.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                        {gallery.length > 1 && (
                            <>
                                <button
                                    onClick={() => setGalleryIdx(i => (i - 1 + gallery.length) % gallery.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white border-2 border-[#1A1A1A] p-1 hover:bg-[#FFD600]"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setGalleryIdx(i => (i + 1) % gallery.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border-2 border-[#1A1A1A] p-1 hover:bg-[#FFD600]"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-[#1A1A1A] text-white text-xs font-bold px-2 py-1">
                                    {galleryIdx + 1}/{gallery.length}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {gallery.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                            {gallery.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setGalleryIdx(i)}
                                    className={`flex-shrink-0 w-16 h-16 border-2 overflow-hidden transition-all ${i === galleryIdx ? "border-[#FF4F00]" : "border-[#1A1A1A] opacity-60 hover:opacity-100"}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Example video link */}
                    {p.example_video_url && (
                        <a
                            href={p.example_video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#0047FF] hover:underline"
                        >
                            <Video className="w-4 h-4" /> View example video
                        </a>
                    )}

                    {/* Tags */}
                    <div className="mt-5 flex flex-wrap gap-2">
                        {p.tags?.map((t) => (
                            <span key={t} className="px-2.5 py-1 bg-white border-2 border-[#1A1A1A] text-xs font-bold uppercase">#{t}</span>
                        ))}
                    </div>

                    {/* Requirements section */}
                    {p.requirements && (
                        <div className="mt-6 bg-[#EFEBE1] border-2 border-[#1A1A1A] p-5">
                            <div className="flex items-center gap-2 font-heading font-bold text-lg mb-2">
                                <ListChecks className="w-5 h-5 text-[#FF4F00]" /> Requirements
                            </div>
                            <p className="text-sm text-[#1A1A1A] whitespace-pre-line">{p.requirements}</p>
                        </div>
                    )}

                    {p.requires_user_media && p.requires_user_media !== "none" && p.user_media_instructions && (
                        <div className="mt-4 bg-[#FFD600] border-2 border-[#1A1A1A] p-4">
                            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider mb-1">
                                {p.requires_user_media === "image" ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                You'll need to provide a {p.requires_user_media}:
                            </div>
                            <p className="text-sm">{p.user_media_instructions}</p>
                        </div>
                    )}
                </div>

                {/* ======== Right: Purchase panel ======== */}
                <div className="md:col-span-5">
                    {/* Badges */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                        <span className="px-2.5 py-1 bg-[#1A1A1A] text-white text-xs font-bold uppercase">{p.category}</span>
                        {!isFree && (
                            <span className="px-2.5 py-1 bg-[#0047FF] text-white text-xs font-bold uppercase inline-flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Premium
                            </span>
                        )}
                    </div>

                    <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter leading-tight">{p.title}</h1>
                    <p className="mt-4 text-[#66635D] leading-relaxed">{p.description}</p>

                    {/* Creator */}
                    <Link
                        to={`/creators/${p.creator?.id}`}
                        className="mt-6 flex items-center gap-3 p-3 bg-white border-2 border-[#1A1A1A] hover:bg-[#FFD600] transition-colors"
                        data-testid="creator-link"
                    >
                        {p.creator?.picture ? (
                            <img src={p.creator.picture} className="w-10 h-10 rounded-full border-2 border-[#1A1A1A]" alt="" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#EFEBE1] border-2 border-[#1A1A1A] flex items-center justify-center font-bold text-base">
                                {(p.creator?.name || "C")[0].toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="text-xs uppercase tracking-wider text-[#66635D]">Prompt User</div>
                            <div className="font-heading font-bold">{p.creator?.name}</div>
                            {p.creator?.bio && <div className="text-xs text-[#66635D] line-clamp-1 mt-0.5">{p.creator.bio}</div>}
                        </div>
                    </Link>

                    {/* Price + CTA box */}
                    <div className="mt-6 p-6 bg-white border-2 border-[#1A1A1A] hard-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-xs uppercase tracking-wider text-[#66635D] mb-1">Price</div>
                                {isFree ? (
                                    <div className="font-heading text-3xl font-black text-[#FF4F00]">FREE</div>
                                ) : (
                                    <div className="font-heading text-3xl font-black text-[#0047FF] inline-flex items-center gap-2">
                                        <Coins className="w-6 h-6" />
                                        {priceCredits}
                                        <span className="text-base font-normal text-[#66635D]">credits</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-right text-xs text-[#66635D]">
                                <div className="inline-flex items-center gap-1"><Download className="w-3 h-3" /> {p.downloads || 0} unlocks</div>
                                <div className="mt-1">★ {p.rating?.toFixed(1)}</div>
                            </div>
                        </div>

                        {/* Credit balance hint */}
                        {!isFree && user && !owned && (
                            <div className="mb-3 flex items-center gap-2 text-xs text-[#66635D] bg-[#F7F5F0] border border-[#D8D4C9] px-3 py-2">
                                <Coins className="w-3 h-3 text-[#FFD600]" />
                                Your balance: <span className="font-bold text-[#1A1A1A] ml-1">{user.credits || 0} credits</span>
                                {(user.credits || 0) < priceCredits && (
                                    <Link to="/dashboard" className="ml-auto text-[#FF4F00] font-bold hover:underline">Buy credits →</Link>
                                )}
                            </div>
                        )}

                        {/* Content revealed */}
                        {owned ? (
                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase mb-2">
                                    <CheckCircle2 className="w-4 h-4" /> Unlocked
                                </div>
                                <div className="p-4 bg-[#EFEBE1] border-2 border-[#1A1A1A] font-mono text-sm whitespace-pre-wrap break-words max-h-72 overflow-auto">
                                    {p.content}
                                </div>
                                <button
                                    onClick={copy}
                                    className="mt-3 btn-ink !py-2 !px-3 text-xs w-full flex items-center justify-center gap-2"
                                    data-testid="copy-prompt-btn"
                                >
                                    {copied ? <><CheckCircle2 className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy prompt</>}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <button
                                    onClick={purchase}
                                    disabled={purchasing || (!isFree && user && (user.credits || 0) < priceCredits)}
                                    className="btn-vermilion w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    data-testid="unlock-btn"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    {purchasing
                                        ? "Processing…"
                                        : isFree
                                            ? "Get it — FREE"
                                            : `Unlock for ${priceCredits} credits`}
                                </button>
                                {!user && (
                                    <p className="text-xs text-[#66635D] text-center flex items-center justify-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Please sign in to purchase.
                                    </p>
                                )}
                                {!isFree && !user && (
                                    <p className="text-xs text-[#66635D] text-center">
                                        New users get <span className="font-bold">50 free credits</span> on signup.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Lock notice */}
                    {!owned && (
                        <div className="mt-3 flex items-start gap-2 text-xs text-[#66635D]">
                            <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            The full prompt is hidden. Purchase to reveal and copy it.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
