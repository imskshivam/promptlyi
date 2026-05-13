import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../lib/api";
import PromptCard from "../components/PromptCard";
import { Search, SlidersHorizontal, TrendingUp, Crown, Download, X } from "lucide-react";

const CATS = [
    { id: "all",        label: "All",        emoji: "✨" },
    { id: "image",      label: "Image",      emoji: "🖼️" },
    { id: "video",      label: "Video",      emoji: "🎬" },
    { id: "code",       label: "Code",       emoji: "💻" },
    { id: "marketing",  label: "Marketing",  emoji: "📣" },
    { id: "design",     label: "Design",     emoji: "🎨" },
    { id: "writing",    label: "Writing",    emoji: "✍️" },
    { id: "business",   label: "Business",   emoji: "💼" },
    { id: "seo",        label: "SEO",        emoji: "🔍" },
    { id: "chatgpt",    label: "ChatGPT",    emoji: "🤖" },
    { id: "midjourney", label: "Midjourney", emoji: "🌌" },
    { id: "3d",         label: "3D",         emoji: "🧊" },
    { id: "music",      label: "Music",      emoji: "🎵" },
];

export default function Marketplace() {
    const [prompts, setPrompts] = useState([]);
    const [trending, setTrending] = useState([]);
    const [cat, setCat] = useState("all");
    const [q, setQ] = useState("");
    const [inputQ, setInputQ] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchPrompts = async (category = cat, query = q) => {
        setLoading(true);
        try {
            const params = {};
            if (category !== "all") params.category = category;
            if (query) params.q = query;
            const r = await http.get("/prompts", { params });
            setPrompts(r.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        http.get("/creators/trending?limit=6").then((r) => setTrending(r.data || [])).catch(() => {});
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchPrompts(cat, q); }, [cat]);

    const handleSearch = (e) => {
        e.preventDefault();
        setQ(inputQ);
        fetchPrompts(cat, inputQ);
    };

    const clearSearch = () => {
        setInputQ("");
        setQ("");
        fetchPrompts(cat, "");
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* ========= Header ========= */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-2">Marketplace</div>
                    <h1 className="font-heading text-5xl md:text-6xl font-black tracking-tighter">Discover prompts.</h1>
                    <p className="text-[#66635D] mt-3 max-w-md">
                        Handcrafted by prompt experts. Browse free — unlock with credits.
                    </p>
                </div>
                <form
                    onSubmit={handleSearch}
                    className="flex items-center bg-white border-2 border-[#1A1A1A] hard-shadow"
                >
                    <Search className="w-4 h-4 mx-3 text-[#66635D]" />
                    <input
                        value={inputQ}
                        onChange={(e) => setInputQ(e.target.value)}
                        placeholder="Search prompts..."
                        className="py-3 pr-2 bg-transparent outline-none text-sm w-56"
                        data-testid="marketplace-search-input"
                    />
                    {inputQ && (
                        <button type="button" onClick={clearSearch} className="px-2 text-[#66635D] hover:text-[#1A1A1A]">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button type="submit" className="px-4 py-3 bg-[#1A1A1A] text-white text-sm font-bold" data-testid="marketplace-search-btn">GO</button>
                </form>
            </div>

            {/* ========= Trending Creators ========= */}
            {trending.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-[#FF4F00]" />
                            <h2 className="font-heading text-2xl font-bold tracking-tight">Top Trending Creators</h2>
                        </div>
                        <span className="text-xs uppercase tracking-wider font-bold text-[#66635D]">By downloads · 30d</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {trending.map((t, idx) => (
                            <Link
                                to={`/creators/${t.creator.id}`}
                                key={t.creator.id}
                                data-testid={`trending-${t.creator.id}`}
                                className="group bg-white border-2 border-[#1A1A1A] hard-shadow p-4 flex flex-col items-center text-center hover:bg-[#FFD600] transition-colors"
                            >
                                <div className="relative">
                                    <img
                                        src={t.creator.picture || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80"}
                                        alt={t.creator.name}
                                        className="w-16 h-16 object-cover border-2 border-[#1A1A1A]"
                                    />
                                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#FF4F00] text-white border-2 border-[#1A1A1A] flex items-center justify-center text-xs font-black">
                                        {idx + 1}
                                    </div>
                                </div>
                                <div className="mt-3 font-heading font-bold text-sm leading-tight line-clamp-1">{t.creator.name}</div>
                                <div className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#66635D]">
                                    <Download className="w-3 h-3" /> {t.total_downloads}
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-[#66635D]">{t.prompts_count} prompts</div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ========= Category Filters ========= */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                    <SlidersHorizontal className="w-4 h-4 text-[#66635D]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#66635D]">Browse by category</span>
                </div>
                <div className="flex gap-2 flex-wrap border-b-2 border-[#1A1A1A] pb-4">
                    {CATS.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setCat(c.id)}
                            className={`px-4 py-1.5 border-2 border-[#1A1A1A] text-xs font-bold transition-colors ${
                                cat === c.id ? "bg-[#1A1A1A] text-white" : "bg-white hover:bg-[#FFD600]"
                            }`}
                            data-testid={`cat-${c.id}`}
                        >
                            <span className="mr-1">{c.emoji}</span>{c.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ========= Results header ========= */}
            <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-[#0047FF]" />
                <h2 className="font-heading text-2xl font-bold tracking-tight">
                    {cat === "all" ? "All Prompts" : `${CATS.find(c => c.id === cat)?.label} Prompts`}
                    {q && <span className="text-[#66635D] text-lg font-normal"> · "{q}"</span>}
                </h2>
                {!loading && <span className="text-xs font-bold text-[#66635D] ml-auto">{prompts.length} results</span>}
            </div>

            {/* ========= Prompts grid ========= */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white border-2 border-[#1A1A1A] h-72 animate-pulse" />
                    ))}
                </div>
            ) : prompts.length === 0 ? (
                <div className="py-16 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <div className="font-heading text-2xl font-bold">No prompts found.</div>
                    <p className="text-[#66635D] mt-2">Try a different category or search term.</p>
                    {(cat !== "all" || q) && (
                        <button
                            onClick={() => { setCat("all"); setQ(""); setInputQ(""); }}
                            className="mt-4 btn-ink"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {prompts.map((p) => <PromptCard key={p.id} prompt={p} />)}
                </div>
            )}
        </div>
    );
}
