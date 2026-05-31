import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../lib/api";
import { Heart, Crown, Trophy, Medal, Flame, Download } from "lucide-react";

const RANK_STYLES = [
    {
        bg: "bg-gradient-to-br from-amber-400 to-yellow-500",
        icon: <Crown className="w-7 h-7 text-amber-900" />,
        label: "1st", textAccent: "text-amber-900", badge: "bg-amber-900 text-amber-100",
    },
    {
        bg: "bg-gradient-to-br from-slate-300 to-slate-400",
        icon: <Trophy className="w-6 h-6 text-slate-700" />,
        label: "2nd", textAccent: "text-slate-700", badge: "bg-slate-700 text-slate-100",
    },
    {
        bg: "bg-gradient-to-br from-orange-400 to-orange-600",
        icon: <Medal className="w-6 h-6 text-orange-100" />,
        label: "3rd", textAccent: "text-orange-100", badge: "bg-orange-900 text-orange-100",
    },
];

const CAT_COLORS = {
    image: "bg-pink-100 text-pink-600", video: "bg-purple-100 text-purple-600",
    code: "bg-blue-100 text-blue-600", marketing: "bg-orange-100 text-orange-600",
    design: "bg-indigo-100 text-indigo-600", writing: "bg-yellow-100 text-yellow-700",
    business: "bg-slate-100 text-slate-600", seo: "bg-teal-100 text-teal-600",
    chatgpt: "bg-green-100 text-green-600", midjourney: "bg-violet-100 text-violet-600",
    "3d": "bg-cyan-100 text-cyan-600", music: "bg-rose-100 text-rose-600",
};

const FALLBACK = "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?crop=entropy&cs=srgb&fm=jpg&w=800&q=80";

function PodiumCard({ entry, styleData }) {
    return (
        <Link
            to={`/prompts/${entry.prompt.id}`}
            className={`group relative flex flex-col rounded-2xl ${styleData.bg} overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)] transition-all duration-300`}
        >
            <div className={`absolute top-3 left-3 z-10 w-10 h-10 rounded-full ${styleData.badge} flex items-center justify-center font-black text-lg border-2 border-white/30`}>
                {entry.rank}
            </div>
            <div className="absolute top-3 right-3 z-10">{styleData.icon}</div>
            <div className="aspect-[4/3] overflow-hidden">
                <img
                    src={entry.prompt.preview_url || FALLBACK} alt={entry.prompt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = FALLBACK; }}
                />
            </div>
            <div className="p-5 flex flex-col gap-2">
                <span className={`inline-block w-fit px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-lg ${CAT_COLORS[entry.prompt.category] || "bg-white/20 text-white"}`}>
                    {entry.prompt.category}
                </span>
                <h3 className={`font-black text-lg leading-tight line-clamp-2 ${styleData.textAccent}`}>{entry.prompt.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                    {entry.prompt.creator?.picture ? (
                        <img src={entry.prompt.creator.picture} alt="" className="w-6 h-6 rounded-full border-2 border-white/50" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
                            {(entry.prompt.creator?.name || "C")[0].toUpperCase()}
                        </div>
                    )}
                    <span className={`text-xs font-semibold truncate ${styleData.textAccent} opacity-90`}>{entry.prompt.creator?.name}</span>
                </div>
                <div className={`flex items-center gap-3 pt-2 border-t border-white/20 ${styleData.textAccent}`}>
                    <span className="inline-flex items-center gap-1 text-sm font-black">
                        <Heart className="w-4 h-4" fill="currentColor" />
                        {entry.monthly_likes > 0 ? entry.monthly_likes : entry.total_likes}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold opacity-70">
                        <Flame className="w-3 h-3" /> This month
                    </span>
                </div>
            </div>
        </Link>
    );
}

function LeaderRow({ entry }) {
    return (
        <Link
            to={`/prompts/${entry.prompt.id}`}
            className="group flex items-center gap-5 bg-white border border-gray-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)] hover:-translate-y-0.5 transition-all duration-200"
        >
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center font-black text-base">
                {entry.rank}
            </div>
            <div className="w-14 h-14 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100">
                <img
                    src={entry.prompt.preview_url || FALLBACK} alt={entry.prompt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = FALLBACK; }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md mb-1 ${CAT_COLORS[entry.prompt.category] || "bg-gray-100 text-gray-600"}`}>
                    {entry.prompt.category}
                </span>
                <div className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">{entry.prompt.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">by {entry.prompt.creator?.name}</div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <span className="inline-flex items-center gap-1 font-black text-orange-500 text-base">
                    <Heart className="w-4 h-4" fill="#f97316" />
                    {entry.monthly_likes > 0 ? entry.monthly_likes : entry.total_likes}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                    <Download className="w-2.5 h-2.5" />{entry.prompt.downloads || 0}
                </span>
            </div>
        </Link>
    );
}

export default function Leaderboard() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        http.get("/social/leaderboard/monthly")
            .then((r) => setData(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const podium = data?.results?.slice(0, 3) || [];
    const rest   = data?.results?.slice(3) || [];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <div className="badge badge-orange mx-auto w-fit mb-5">
                        <Flame className="w-3.5 h-3.5" /> Monthly Rankings
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight leading-none mb-4">
                        Leader<span className="gradient-text-dark">board.</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        The most-loved prompts of {data?.month || "this month"}. Ranked by community likes.
                    </p>
                    {data?.month && (
                        <div className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-full font-semibold text-sm shadow-[0_4px_14px_rgba(249,115,22,0.4)]">
                            🏆 {data.month}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-96 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : data?.results?.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-6xl mb-4">🏆</div>
                        <h2 className="text-3xl font-black text-gray-900">No rankings yet!</h2>
                        <p className="text-gray-500 mt-2">Start liking prompts to fuel the leaderboard.</p>
                        <Link to="/marketplace" className="mt-6 btn btn-primary !rounded-2xl inline-flex">Explore Prompts</Link>
                    </div>
                ) : (
                    <>
                        {podium.length > 0 && (
                            <section className="mb-12">
                                <div className="flex items-center gap-2 mb-6">
                                    <Crown className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-2xl font-black text-gray-900">Top 3 This Month</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {podium.map((entry) => (
                                        <PodiumCard key={entry.prompt.id} entry={entry} styleData={RANK_STYLES[entry.rank - 1]} />
                                    ))}
                                </div>
                            </section>
                        )}
                        {rest.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-5 border-t border-gray-100 pt-8">
                                    <Trophy className="w-5 h-5 text-orange-500" />
                                    <h2 className="text-2xl font-black text-gray-900">Honourable Mentions</h2>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {rest.map((entry) => <LeaderRow key={entry.prompt.id} entry={entry} />)}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* CTA */}
                <div className="mt-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-10 text-white text-center shadow-[0_20px_60px_rgba(249,115,22,0.3)]">
                    <h3 className="text-3xl font-black mb-2">Want to top the board?</h3>
                    <p className="text-orange-100 mb-6">Create a great prompt and let the community decide.</p>
                    <Link to="/creator" className="btn btn-white !rounded-2xl !px-8 inline-flex">
                        ✍️ Create a Prompt
                    </Link>
                </div>
            </div>
        </div>
    );
}
