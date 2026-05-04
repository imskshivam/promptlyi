"use strict";

/**
 * Simple token-based credit-estimation engine.
 * - 1 credit per ~8 words
 * - +2 credits per complexity keyword hit
 * - tier: basic (≤5), standard (≤15), advanced (>15)
 */
const COMPLEXITY_KEYWORDS = ["step-by-step", "analyze", "json", "code", "full", "detailed", "advanced"];

function estimateCredits(text = "") {
    const t = String(text || "");
    const words = (t.match(/\w+/g) || []).length;
    const lower = t.toLowerCase();
    const complexity = COMPLEXITY_KEYWORDS.reduce((acc, k) => acc + (lower.includes(k) ? 1 : 0), 0);
    const base = Math.max(1, Math.floor(words / 8));
    const total = base + complexity * 2;
    const tier = total <= 5 ? "basic" : total <= 15 ? "standard" : "advanced";
    return { credits: total, words, complexity, tier };
}

module.exports = { estimateCredits };
