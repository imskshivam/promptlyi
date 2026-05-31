import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Download, Zap, Star } from "lucide-react";

const CAT_COLORS = {
  image:      "bg-pink-100 text-pink-600",
  video:      "bg-purple-100 text-purple-600",
  code:       "bg-blue-100 text-blue-600",
  marketing:  "bg-orange-100 text-orange-600",
  design:     "bg-indigo-100 text-indigo-600",
  writing:    "bg-yellow-100 text-yellow-600",
  business:   "bg-slate-100 text-slate-600",
  seo:        "bg-teal-100 text-teal-600",
  chatgpt:    "bg-green-100 text-green-600",
  midjourney: "bg-violet-100 text-violet-600",
  "3d":       "bg-cyan-100 text-cyan-600",
  music:      "bg-rose-100 text-rose-600",
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1676277793672-c2a0804e6b43?crop=entropy&cs=srgb&fm=jpg&w=800&q=80";

export default function PromptCard({ prompt, compact = false }) {
  const catColor = CAT_COLORS[prompt.category] || "bg-gray-100 text-gray-600";

  return (
    <Link
      to={`/prompts/${prompt.id}`}
      data-testid={`prompt-card-${prompt.id}`}
      className="prompt-card-new group flex flex-row sm:flex-col overflow-hidden bg-white border border-gray-100 rounded-2xl sm:rounded-3xl hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="relative aspect-square sm:aspect-[4/3] w-32 sm:w-full flex-shrink-0 bg-gray-50 border-r sm:border-r-0 sm:border-b border-gray-100 overflow-hidden">
        <img
          src={prompt.preview_url || FALLBACK_IMG}
          alt={prompt.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = FALLBACK_IMG; }}
        />
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 right-2 sm:right-3 flex flex-col sm:flex-row items-start sm:items-start justify-between gap-1.5 sm:gap-2">
          {prompt.is_restricted ? (
            <div className="flex items-center gap-1 bg-gray-900 text-white text-[9px] sm:text-[10px] font-bold uppercase px-2 py-1 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg shadow">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" />
              {prompt.price_credits || prompt.credits_required || 0} CR
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-orange-500 text-white text-[9px] sm:text-[10px] font-bold uppercase px-2 py-1 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg shadow">
              FREE
            </div>
          )}
          <div className={`text-[9px] sm:text-[10px] font-bold uppercase px-2 py-1 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg hidden sm:block ${catColor}`}>
            {prompt.category}
          </div>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 hidden sm:flex">
          <span className="text-white text-xs font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Quick unlock
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-3 group-hover:text-orange-500 transition-colors duration-200">
          {prompt.title}
        </h3>

        {!compact && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
            {prompt.description}
          </p>
        )}

        {/* Footer row */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
          {/* Creator */}
          <div className="flex items-center gap-2 min-w-0">
            {prompt.creator?.picture ? (
              <img
                src={prompt.creator.picture}
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                alt=""
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white shadow-sm flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-orange-600">
                {(prompt.creator?.name || "C")[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs text-gray-500 truncate max-w-[80px]">
              {prompt.creator?.name || "Creator"}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Heart className="w-3 h-3 text-orange-400" fill={prompt.likes_count > 0 ? "#fb923c" : "none"} />
              {prompt.likes_count || 0}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Download className="w-3 h-3" />
              {prompt.downloads || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
