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
        <div className="min-h-screen bg-white">
            {/* ─── Hero Header ─── */}
            <div className="bg-white border-b border-gray-100 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="badge badge-orange mb-4 w-fit">
                                <Sparkles className="w-3.5 h-3.5" /> Community Prompts
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
                                Discover <span className="gradient-text-dark">prompts.</span>
                            </h1>
                            <p className="text-gray-500 mt-3 max-w-md text-base">
                                Handcrafted by the community. All prompts are{" "}
                                <span className="font-bold text-orange-500">100% free</span>.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 items-start md:items-end">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:border-orange-300 transition-colors">
                                <Search className="w-4 h-4 mx-4 text-gray-400 flex-shrink-0" />
                                <input
                                    value={inputQ}
                                    onChange={(e) => setInputQ(e.target.value)}
                                    placeholder="Search prompts…"
                                    className="py-3 pr-2 bg-transparent outline-none text-sm w-52 text-gray-700"
                                    data-testid="marketplace-search-input"
                                />
                                {inputQ && (
                                    <button type="button" onClick={clearSearch} className="px-2 text-gray-400 hover:text-gray-700">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <button type="submit" className="px-5 py-3 bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors" data-testid="marketplace-search-btn">
                                    Go
                                </button>
                            </form>

                            {/* Share CTA */}
                            {user ? (
                                <Link to="/creator" className="btn btn-primary !rounded-xl !py-2 !px-5 !text-sm">
                                    <PenSquare className="w-3.5 h-3.5" /> Share Your Prompt
                                </Link>
                            ) : (
                                <button onClick={login} className="btn btn-primary !rounded-xl !py-2 !px-5 !text-sm">
                                    <PenSquare className="w-3.5 h-3.5" /> Share Your Prompt
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
                                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                    sort === s.id
                                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
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
                        <SlidersHorizontal className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Browse by category</span>
                    </div>
                    <div className="flex gap-2 flex-wrap pb-4 border-b border-gray-100">
                        {CATS.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setCat(c.id)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                    cat === c.id
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                                }`}
                                data-testid={`cat-${c.id}`}
                            >
                                <span className="mr-1">{c.emoji}</span>{c.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Results Header ─── */}
                <div className="flex items-center gap-2 mb-6">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                        {cat === "all" ? "All Prompts" : `${CATS.find(c => c.id === cat)?.label} Prompts`}
                        {q && <span className="text-gray-400 text-base font-normal"> · "{q}"</span>}
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
                    <div className="py-20 text-center">
                        <div className="text-5xl mb-4">🔍</div>
                        <div className="text-2xl font-bold text-gray-900">No prompts found.</div>
                        <p className="text-gray-500 mt-2">Try a different category or search term.</p>
                        {(cat !== "all" || q) && (
                            <button
                                onClick={() => { setCat("all"); setQ(""); setInputQ(""); }}
                                className="mt-6 btn btn-primary !rounded-xl"
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
