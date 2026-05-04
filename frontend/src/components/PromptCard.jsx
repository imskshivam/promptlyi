import React from "react";
import { Link } from "react-router-dom";
import { Coins, IndianRupee, Download, Lock } from "lucide-react";

export default function PromptCard({ prompt, compact = false }) {
    const fallback = "https://images.unsplash.com/photo-1693487048787-a19cc08ded79?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80";
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
                {prompt.is_restricted && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-[#0047FF] text-white text-xs font-bold uppercase">
                        <Lock className="w-3 h-3" /> Restricted
                    </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 bg-[#1A1A1A] text-white text-xs font-bold uppercase">{prompt.category}</div>
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-bold text-base leading-tight line-clamp-2">{prompt.title}</h3>
                        {!compact && <p className="text-xs text-[#66635D] mt-1 line-clamp-2">{prompt.description}</p>}
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-[#66635D]">
                        {prompt.creator?.picture && (
                            <img src={prompt.creator.picture} className="w-5 h-5 rounded-full border border-[#1A1A1A]" alt="" />
                        )}
                        <span className="truncate max-w-[100px]">{prompt.creator?.name || "Creator"}</span>
                        <span>·</span>
                        <Download className="w-3 h-3" /> {prompt.downloads || 0}
                    </div>
                    <div className="font-bold text-sm">
                        {prompt.is_restricted ? (
                            <span className="inline-flex items-center gap-1 text-[#0047FF]">
                                <Coins className="w-3.5 h-3.5" /> {prompt.credits_required}
                            </span>
                        ) : prompt.price_inr > 0 ? (
                            <span className="inline-flex items-center gap-0.5"><IndianRupee className="w-3.5 h-3.5" />{prompt.price_inr}</span>
                        ) : (
                            <span className="text-[#FF4F00]">FREE</span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
