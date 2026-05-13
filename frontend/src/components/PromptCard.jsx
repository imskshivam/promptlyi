import React from "react";
import { Link } from "react-router-dom";
import { Coins, Download, Lock } from "lucide-react";

const CAT_COLORS = {
    image:      "bg-pink-500",
    video:      "bg-purple-600",
    code:       "bg-emerald-600",
    marketing:  "bg-orange-500",
    design:     "bg-indigo-500",
    writing:    "bg-yellow-600",
    business:   "bg-slate-600",
    seo:        "bg-teal-600",
    chatgpt:    "bg-green-600",
    midjourney: "bg-violet-600",
    "3d":       "bg-cyan-600",
    music:      "bg-rose-600",
};

export default function PromptCard({ prompt, compact = false }) {
    const fallback = "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80";
    const catColor = CAT_COLORS[prompt.category] || "bg-[#1A1A1A]";

    const priceCredits = prompt.price_credits ?? prompt.credits_required ?? 0;
    const isFree = priceCredits === 0;

    return (
        <Link
            to={`/prompts/${prompt.id}`}
            data-testid={`prompt-card-${prompt.id}`}
            className="group block bg-white border-2 border-[#1A1A1A] hard-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#1A1A1A] transition-all"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#EFEBE1] border-b-2 border-[#1A1A1A]">
                <img
                    src={prompt.preview_url || fallback}
                    alt={prompt.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    onError={(e) => { e.target.src = fallback; }}
                />
                {/* Lock badge for paid prompts */}
                {!isFree && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-[#0047FF] text-white text-xs font-bold uppercase">
                        <Lock className="w-3 h-3" /> Premium
                    </div>
                )}
                {/* Category badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 text-white text-xs font-bold uppercase ${catColor}`}>
                    {prompt.category}
                </div>
            </div>

            <div className="p-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-base leading-tight line-clamp-2">{prompt.title}</h3>
                    {!compact && <p className="text-xs text-[#66635D] mt-1 line-clamp-2">{prompt.description}</p>}
                </div>

                <div className="mt-3 flex items-center justify-between">
                    {/* Creator info */}
                    <div className="flex items-center gap-1.5 text-xs text-[#66635D] min-w-0">
                        {prompt.creator?.picture ? (
                            <img src={prompt.creator.picture} className="w-5 h-5 rounded-full border border-[#1A1A1A] flex-shrink-0" alt="" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-[#EFEBE1] border border-[#1A1A1A] flex-shrink-0 flex items-center justify-center text-[9px] font-bold">
                                {(prompt.creator?.name || "C")[0].toUpperCase()}
                            </div>
                        )}
                        <span className="truncate max-w-[90px]">{prompt.creator?.name || "Creator"}</span>
                        <span className="flex-shrink-0">·</span>
                        <Download className="w-3 h-3 flex-shrink-0" />
                        <span className="flex-shrink-0">{prompt.downloads || 0}</span>
                    </div>

                    {/* Price */}
                    <div className="font-bold text-sm flex-shrink-0 ml-2">
                        {isFree ? (
                            <span className="text-[#FF4F00] font-black">FREE</span>
                        ) : (
                            <span className="inline-flex items-center gap-1 bg-[#FFD600] border border-[#1A1A1A] px-2 py-0.5 text-[#1A1A1A]">
                                <Coins className="w-3 h-3" /> {priceCredits}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
