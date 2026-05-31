import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../lib/api";
import PromptCard from "../components/PromptCard";
import { Search, SlidersHorizontal, TrendingUp, Flame, Heart, Clock, X, PenSquare, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

const SORTS = [
    { id: "newest",  label: "Newest",           icon: Clock },
    { id: "liked",   label: "Most Liked",        icon: Heart },
    { id: "popular", label: "Most Downloaded",   icon: TrendingUp },
];

export default function Marketplace() {
    const { user, login } = useAuth();
    const [prompts, setPrompts]   = useState([]);
    const [cat, setCat]           = useState("all");
    const [sort, setSort]         = useState("newest");
    const [q, setQ]               = useState("");
    const [inputQ, setInputQ]     = useState("");
    const [loading, setLoading]   = useState(true);

    const fetchPrompts = async (category = cat, query = q, sortBy = sort) => {
        setLoading(true);
        try {
            const params = {};
            if (category !== "all") params.category = category;
            if (query) params.q = query;
            const r = await http.get("/prompts", { params });
            let data = r.data || [];
            if (sortBy === "liked")   data = [...data].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
            if (sortBy === "popular") data = [...data].sort((a, b) => (b.downloads    || 0) - (a.downloads    || 0));
            setPrompts(data);
        } finally { setLoading(false); }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchPrompts(cat, q, sort); }, [cat, sort]);

    const handleSearch = (e) => { e.preventDefault(); setQ(inputQ); fetchPrompts(cat, inputQ, sort); };
    const clearSearch  = ()  => { setInputQ(""); setQ(""); fetchPrompts(cat, "", sort); };

    return (
        <div className="min-h-screen bg-brand-lt_light">
            {/* ─── Hero Header ─── */}
            <div className="bg-brand-lt_green border-none py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="badge bg-brand-lt_lime/20 text-brand-lt_lime border-none mb-4 w-fit">
                                <Sparkles className="w-3.5 h-3.5" /> Community Prompts
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                                Discover <span className="text-brand-lt_lime">prompts.</span>
                            </h1>
                            <p className="text-brand-lt_lime/80 mt-3 max-w-md text-base font-medium">
                                Handcrafted by the community. All prompts are{" "}
                                <span className="font-bold text-brand-lt_lime">100% free</span>.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 items-start md:items-end">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex items-center bg-white border-4 border-transparent rounded-[2rem] shadow-lg overflow-hidden hover:border-brand-lt_pink transition-colors">
                                <Search className="w-5 h-5 mx-4 text-brand-lt_purple flex-shrink-0" />
                                <input
                                    value={inputQ}
                                    onChange={(e) => setInputQ(e.target.value)}
                                    placeholder="Search prompts…"
                                    className="py-4 pr-2 bg-transparent outline-none text-base w-56 text-brand-lt_purple font-bold placeholder:text-brand-lt_purple/50"
                                    data-testid="marketplace-search-input"
                                />
                                {inputQ && (
                                    <button type="button" onClick={clearSearch} className="px-2 text-brand-lt_purple/50 hover:text-brand-lt_purple">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                                <button type="submit" className="px-8 py-4 bg-brand-lt_lime text-brand-lt_green text-base font-black hover:bg-brand-lt_pink hover:text-brand-lt_purple transition-colors" data-testid="marketplace-search-btn">
                                    Go
                                </button>
                            </form>

                            {/* Share CTA */}
                            {user ? (
                                <Link to="/creator" className="btn !bg-brand-lt_pink !text-brand-lt_purple hover:!bg-brand-lt_purple hover:!text-white !border-transparent !rounded-full !py-3 !px-6 !text-sm font-bold transition-all">
                                    <PenSquare className="w-4 h-4 mr-1" /> Share Your Prompt
                                </Link>
                            ) : (
                                <button onClick={login} className="btn !bg-brand-lt_pink !text-brand-lt_purple hover:!bg-brand-lt_purple hover:!text-white !border-transparent !rounded-full !py-3 !px-6 !text-sm font-bold transition-all">
                                    <PenSquare className="w-4 h-4 mr-1" /> Share Your Prompt
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* ─── Sort ─── */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-1">Sort by:</span>
                    {SORTS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setSort(s.id)}
                                data-testid={`sort-${s.id}`}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                                    sort === s.id
                                        ? "bg-brand-lt_purple text-white border-brand-lt_purple shadow-sm"
                                        : "bg-white text-gray-600 border-transparent hover:border-brand-lt_pink hover:text-brand-lt_purple"
                                }`}
                            >
                                <Icon className="w-3 h-3" /> {s.label}
                            </button>
                        );
                    })}
                </div>

                {/* ─── Category Filters ─── */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <SlidersHorizontal className="w-4 h-4 text-brand-lt_purple" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Browse by category</span>
                    </div>
                    <div className="flex gap-2 flex-wrap pb-4 border-b border-gray-100">
                        {CATS.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setCat(c.id)}
                                className={`px-5 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                                    cat === c.id
                                        ? "bg-brand-lt_purple text-white border-brand-lt_purple shadow-md"
                                        : "bg-white text-gray-600 border-transparent hover:border-brand-lt_pink hover:text-brand-lt_purple"
                                }`}
                                data-testid={`cat-${c.id}`}
                            >
                                <span className="mr-1">{c.emoji}</span>{c.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Results Header ─── */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-brand-lt_pink flex items-center justify-center">
                        <Flame className="w-5 h-5 text-brand-lt_purple" />
                    </div>
                    <h2 className="text-3xl font-black text-brand-lt_purple tracking-tight">
                        {cat === "all" ? "All Prompts" : `${CATS.find(c => c.id === cat)?.label} Prompts`}
                        {q && <span className="text-brand-lt_purple/50 text-2xl font-bold"> · "{q}"</span>}
                    </h2>
                    {!loading && <span className="text-xs font-semibold text-gray-400 ml-auto">{prompts.length} prompts</span>}
                </div>

                {/* ─── Grid ─── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-gray-50 h-72 animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : prompts.length === 0 ? (
                    <div className="py-24 text-center bg-white rounded-[3rem] border-4 border-brand-lt_pink border-dashed">
                        <div className="text-6xl mb-6">🔍</div>
                        <div className="text-3xl font-black text-brand-lt_purple">No prompts found.</div>
                        <p className="text-brand-lt_purple/70 mt-3 font-medium text-lg">Try a different category or search term.</p>
                        {(cat !== "all" || q) && (
                            <button
                                onClick={() => { setCat("all"); setQ(""); setInputQ(""); }}
                                className="mt-8 btn !bg-brand-lt_lime !text-brand-lt_green hover:!bg-brand-lt_pink hover:!text-brand-lt_purple !rounded-full !px-8 !py-3 font-black text-lg transition-colors"
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
        </div>
    );
}
