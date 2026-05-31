import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { http } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
    Download, Copy, CheckCircle2, ArrowLeft,
    ImageIcon, Video, ChevronLeft, ChevronRight,
    ListChecks, Heart, MessageCircle, Send, Loader2,
    Sparkles, User2, Zap, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { logCustomEvent } from "../lib/firebase";

const FALLBACK = "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80";

// ─── Comments Section ─────────────────────────────────────────────────────────
function CommentsSection({ promptId }) {
    const { user, login } = useAuth();
    const [comments, setComments] = useState([]);
    const [total, setTotal] = useState(0);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);

    const load = async () => {
        try {
            const r = await http.get(`/social/comments/${promptId}`);
            setComments(r.data.comments || []);
            setTotal(r.data.total || 0);
        } catch {}
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { load(); }, [promptId]);

    const submit = async (e) => {
        e.preventDefault();
        if (!user) { login(); return; }
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            const r = await http.post(`/social/comment/${promptId}`, { text: text.trim() });
            setComments((prev) => [r.data, ...prev]);
            setTotal((t) => t + 1);
            setText("");
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-8 border-t border-gray-100 pt-8">
            <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="w-5 h-5 text-orange-500" />
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    Comments <span className="text-gray-400 font-normal text-base">({total})</span>
                </h3>
            </div>

            {/* Comment Input */}
            <form onSubmit={submit} className="mb-8">
                <div className="flex gap-4 items-start">
                    {user ? (
                        user.picture ? (
                            <img src={user.picture} alt="" className="w-10 h-10 rounded-full border-2 border-orange-100 flex-shrink-0" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0 flex items-center justify-center font-black text-white text-sm">
                                {(user.name || "U")[0].toUpperCase()}
                            </div>
                        )
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                            <User2 className="w-5 h-5 text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={user ? "Share your thoughts…" : "Sign in to comment…"}
                            rows={3}
                            maxLength={1000}
                            disabled={!user}
                            className="input-orange resize-none text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-400 font-medium">{text.length}/1000</span>
                            {user ? (
                                <button
                                    type="submit"
                                    disabled={submitting || !text.trim()}
                                    className="btn btn-primary !rounded-xl !py-2 !px-5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                    Post
                                </button>
                            ) : (
                                <button type="button" onClick={login} className="btn btn-primary !rounded-xl !py-2 !px-5 text-xs">
                                    Sign in to comment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* Comment List */}
            {loading ? (
                <div className="space-y-5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                            <div className="flex-1 space-y-2 mt-1">
                                <div className="h-3 bg-gray-100 w-1/4 rounded-xl" />
                                <div className="h-3 bg-gray-50 w-3/4 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-10">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-8 h-8 text-orange-300" />
                    </div>
                    <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map((c) => (
                        <div key={c.id} className="flex gap-4">
                            {c.author_picture ? (
                                <img src={c.author_picture} alt="" className="w-10 h-10 rounded-full border border-gray-100 flex-shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex-shrink-0 flex items-center justify-center font-black text-sm border border-gray-200">
                                    {(c.author_name || "U")[0].toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 text-sm">{c.author_name || "Anonymous"}</span>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">{c.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
}

// ─── Main PromptDetail ─────────────────────────────────────────────────────────
export default function PromptDetail() {
    const { id } = useParams();
    const { user, login } = useAuth();
    const nav = useNavigate();
    const [p, setP] = useState(null);
    const [copied, setCopied] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [galleryIdx, setGalleryIdx] = useState(0);

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [liking, setLiking] = useState(false);

    const loadPrompt = async () => {
        try {
            const r = await http.get(`/prompts/${id}`);
            setP(r.data);
        } catch { toast.error("Prompt not found"); nav("/marketplace"); }
    };

    const loadLikes = async () => {
        try {
            const r = await http.get(`/social/likes/${id}`);
            setLiked(r.data.liked);
            setLikeCount(r.data.count);
        } catch {}
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadPrompt(); loadLikes(); }, [id]);

    const toggleLike = async () => {
        if (!user) { login(); return; }
        setLiking(true);
        try {
            const r = await http.post(`/social/like/${id}`);
            setLiked(r.data.liked);
            setLikeCount(r.data.count);
        } catch { toast.error("Could not update like"); }
        finally { setLiking(false); }
    };

    const unlock = async () => {
        if (!user) { login(); return; }
        setUnlocking(true);
        try {
            const r = await http.post("/prompts/purchase", { prompt_id: id });
            logCustomEvent("unlock_prompt", { prompt_id: id, is_free: true });
            toast.success("🎉 Prompt unlocked!");
            if (r.data.content) setP((prev) => ({ ...prev, content: r.data.content }));
            else loadPrompt();
        } catch (e) {
            toast.error(e.response?.data?.detail || "Failed to unlock");
        } finally { setUnlocking(false); }
    };

    const copy = () => {
        navigator.clipboard.writeText(p.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    if (!p) return (
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-12 gap-8 animate-pulse bg-white min-h-screen">
            <div className="col-span-12 md:col-span-7 aspect-[4/3] bg-gray-100 rounded-3xl" />
            <div className="col-span-12 md:col-span-5 space-y-4">
                <div className="h-10 bg-gray-100 rounded-xl w-3/4" />
                <div className="h-4 bg-gray-50 rounded-xl" />
                <div className="h-4 bg-gray-50 rounded-xl w-5/6" />
            </div>
        </div>
    );

    const owned = !!p.content;
    const gallery = [p.preview_url || FALLBACK, ...(p.example_images || [])].filter(Boolean);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-orange-500 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to marketplace
                </Link>

                <div className="grid md:grid-cols-12 gap-10">
                    {/* ======== Left: Gallery + Tags ======== */}
                    <div className="md:col-span-7">
                        {/* Main image / gallery */}
                        <div className="relative aspect-[4/3] bg-gray-50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
                            {p.example_video_url && galleryIdx === 0 ? (
                                <video src={p.example_video_url} controls className="w-full h-full object-cover" />
                            ) : (
                                <img src={gallery[galleryIdx] || gallery[0]} alt={p.title} className="w-full h-full object-cover" />
                            )}
                            {gallery.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setGalleryIdx(i => (i - 1 + gallery.length) % gallery.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur text-gray-900 rounded-full p-2.5 shadow-sm hover:scale-105 transition-transform"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setGalleryIdx(i => (i + 1) % gallery.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur text-gray-900 rounded-full p-2.5 shadow-sm hover:scale-105 transition-transform"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                        {galleryIdx + 1}/{gallery.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        {gallery.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                                {gallery.map((img, i) => (
                                    <button
                                        key={i} onClick={() => setGalleryIdx(i)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all border-2 ${
                                            i === galleryIdx ? "border-orange-500 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {p.example_video_url && (
                            <a href={p.example_video_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-xl">
                                <Video className="w-4 h-4" /> View example video
                            </a>
                        )}

                        {/* Tags */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            {p.tags?.map((t) => (
                                <span key={t} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase">#{t}</span>
                            ))}
                        </div>

                        {/* Requirements */}
                        {p.requirements && (
                            <div className="mt-8 bg-orange-50/50 border border-orange-100 rounded-2xl p-6">
                                <div className="flex items-center gap-2 font-black text-lg text-gray-900 mb-3">
                                    <ListChecks className="w-5 h-5 text-orange-500" /> Requirements
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{p.requirements}</p>
                            </div>
                        )}

                        {p.requires_user_media && p.requires_user_media !== "none" && p.user_media_instructions && (
                            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-6">
                                <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-blue-800 mb-2">
                                    {p.requires_user_media === "image" ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                    You'll need to provide a {p.requires_user_media}:
                                </div>
                                <p className="text-sm text-blue-900">{p.user_media_instructions}</p>
                            </div>
                        )}

                        <CommentsSection promptId={id} />
                    </div>

                    {/* ======== Right: Info + Actions ======== */}
                    <div className="md:col-span-5">
                        <div className="flex gap-2 mb-5 flex-wrap">
                            <span className="badge badge-dark">{p.category}</span>
                            {p.is_restricted ? (
                                <span className="badge bg-gray-900 text-white flex items-center gap-1 border-none shadow-sm">
                                    <Zap className="w-3.5 h-3.5 text-orange-400" />
                                    {p.price_credits || p.credits_required || 0} CR
                                </span>
                            ) : (
                                <span className="badge badge-orange">FREE</span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">{p.title}</h1>
                        <p className="mt-5 text-gray-500 leading-relaxed text-base">{p.description}</p>

                        <div className="mt-6 flex items-center gap-4 pb-6 border-b border-gray-100">
                            <button
                                onClick={toggleLike} disabled={liking} id="like-btn"
                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                                    liked
                                        ? "bg-orange-500 text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]"
                                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                }`}
                            >
                                <Heart className="w-4 h-4" fill={liked ? "white" : "none"} />
                                {liked ? "Liked" : "Like"}
                                <span className="ml-1 font-black">{likeCount}</span>
                            </button>
                            <span className="text-sm font-semibold text-gray-400 flex items-center gap-1.5">
                                <Download className="w-4 h-4" />{p.downloads || 0} uses
                            </span>
                        </div>

                        {/* Creator */}
                        <Link
                            to={`/creators/${p.creator?.id}`}
                            className="mt-6 flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
                        >
                            {p.creator?.picture ? (
                                <img src={p.creator.picture} className="w-12 h-12 rounded-full object-cover" alt="" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
                                    {(p.creator?.name || "C")[0].toUpperCase()}
                                </div>
                            )}
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Creator</div>
                                <div className="font-black text-gray-900 group-hover:text-orange-500 transition-colors">{p.creator?.name}</div>
                                {p.creator?.bio && <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{p.creator.bio}</div>}
                            </div>
                        </Link>

                        {/* Prompt Content Box */}
                        <div className="mt-8 p-6 sm:p-8 bg-white border border-gray-200 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
                            {/* Decorative gradient blur */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-orange-500" />
                                    <span className="font-black text-gray-900 text-lg">The Prompt</span>
                                </div>
                                {p.is_restricted ? (
                                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                        <Lock className="w-3.5 h-3.5 text-gray-500" /> Locked
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">FREE</span>
                                )}
                            </div>

                            {owned ? (
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase mb-3 bg-emerald-50 w-fit px-3 py-1 rounded-md">
                                        <CheckCircle2 className="w-4 h-4" /> Unlocked
                                    </div>
                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-sm text-gray-800 whitespace-pre-wrap break-words max-h-80 overflow-y-auto custom-scrollbar">
                                        {p.content}
                                    </div>
                                    <button
                                        onClick={copy}
                                        className={`mt-4 w-full flex items-center justify-center gap-2 !py-3 !rounded-xl transition-all font-bold ${
                                            copied ? "bg-emerald-500 text-white shadow-md" : "btn btn-dark"
                                        }`}
                                    >
                                        {copied ? <><CheckCircle2 className="w-5 h-5" /> Copied to clipboard!</> : <><Copy className="w-5 h-5" /> Copy prompt</>}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-5 relative z-10 text-center">
                                    <p className="text-gray-500 text-sm">
                                        {p.is_restricted ? `Click below to unlock this prompt for ${p.price_credits || p.credits_required} credits.` : "Click below to instantly access the full prompt — completely free."}
                                    </p>
                                    <button
                                        onClick={unlock} disabled={unlocking}
                                        className="btn btn-primary w-full flex items-center justify-center gap-2 !py-3.5 !rounded-xl !text-base disabled:opacity-60 shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_28px_rgba(249,115,22,0.4)]"
                                    >
                                        {p.is_restricted ? (
                                            <>
                                                <Zap className="w-5 h-5" />
                                                {unlocking ? "Unlocking…" : `Unlock for ${p.price_credits || p.credits_required} CR`}
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                {unlocking ? "Loading…" : "Get Prompt — FREE"}
                                            </>
                                        )}
                                    </button>
                                    {!user && <p className="text-xs font-semibold text-gray-400">Sign in to access prompts.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
