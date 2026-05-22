import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../lib/api";
import PromptCard from "../components/PromptCard";
import { ArrowUpRight, Sparkles, Coins, TrendingUp, Users, Zap, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const HERO_BG = "https://images.unsplash.com/photo-1776981986367-09705e5c6872?crop=entropy&cs=srgb&fm=jpg&w=1400&q=80";

export default function Landing() {
    const [prompts, setPrompts] = useState([]);
    const { login, user } = useAuth();

    useEffect(() => {
        http.post("/dev/seed").catch(() => {});
        http.get("/prompts?limit=8").then((r) => setPrompts(r.data || [])).catch(() => {});
    }, []);

    return (
        <div className="relative">
            {/* ---------------- HERO ---------------- */}
            <section className="relative border-b-2 border-[#1A1A1A] overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-60" />
                <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-12 gap-8 items-center relative">
                    <div className="md:col-span-7 animate-fadeup">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD600] border-2 border-[#1A1A1A] text-xs font-bold uppercase tracking-wider mb-6">
                            <Sparkles className="w-3 h-3" /> Top quality AI prompts
                        </div>
                        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                            Find perfect <br />
                            <span className="text-[#FF4F00]">AI</span> <span className="underline decoration-[6px] decoration-[#0047FF] underline-offset-8">prompts.</span>
                        </h1>
                        <p className="mt-8 text-lg md:text-xl max-w-xl text-[#1A1A1A]/75">
                            We curate the best AI prompts. A premium platform built for you to find the perfect prompt for any task and unlock incredible generations.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            {/* <button onClick={login} className="btn-vermilion text-base hard-shadow" data-testid="hero-start-earning">
                                Start Earning <ArrowUpRight className="w-5 h-5" />
                            </button> */}
                            <Link to="/marketplace" className="btn-outline text-base" data-testid="hero-browse-btn">
                                Browse Prompts
                            </Link>
                        </div>
                        <div className="mt-12 flex items-center gap-8 text-sm text-[#66635D]">
                            <div><span className="font-heading font-black text-2xl text-[#1A1A1A]">12K+</span> prompts</div>
                            <div><span className="font-heading font-black text-2xl text-[#1A1A1A]">3.4K</span> categories</div>
                            <div><span className="font-heading font-black text-2xl text-[#1A1A1A]">150K+</span> generations</div>
                        </div>
                    </div>
                    <div className="md:col-span-5 relative animate-fadeup">
                        <div className="relative aspect-[4/5] bg-[#1A1A1A] border-2 border-[#1A1A1A] overflow-hidden hard-shadow-lg">
                            <img src={HERO_BG} alt="abstract" className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1A1A1A] to-transparent">
                                <div className="inline-flex items-center gap-2 text-[#FFD600] text-xs font-bold uppercase">featured prompt</div>
                                <div className="text-white font-heading text-2xl font-bold mt-1">SaaS Copywriter • 10 Credits</div>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-[#FFD600] border-2 border-[#1A1A1A] px-4 py-3 hard-shadow text-xs font-bold uppercase">
                            🎉 24 new prompts added today
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------- VALUE MARQUEE ------------- */}
            <section className="bg-[#1A1A1A] border-y-2 border-[#1A1A1A] overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#1A1A1A] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#1A1A1A] to-transparent z-10 pointer-events-none" />
                <div className="marquee-track py-5 text-[#FFD600] font-heading text-2xl md:text-3xl font-black tracking-tight">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-12 pr-12 shrink-0">
                            <span>GPT-5</span><span className="text-[#FF4F00]">✦</span>
                            <span>Midjourney</span><span className="text-[#FF4F00]">✦</span>
                            <span>Claude</span><span className="text-[#FF4F00]">✦</span>
                            <span>Sora 2</span><span className="text-[#FF4F00]">✦</span>
                            <span>Nano Banana</span><span className="text-[#FF4F00]">✦</span>
                            <span>FLUX</span><span className="text-[#FF4F00]">✦</span>
                            <span>RunwayML</span><span className="text-[#FF4F00]">✦</span>
                            <span>DALL·E</span><span className="text-[#FF4F00]">✦</span>
                            <span>Stable Diffusion</span><span className="text-[#FF4F00]">✦</span>
                            <span>Veo 3</span><span className="text-[#FF4F00]">✦</span>
                            <span>Llama 4</span><span className="text-[#FF4F00]">✦</span>
                            <span>Pika</span><span className="text-[#FF4F00]">✦</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ------------- HOW IT WORKS ------------- */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-2">How it works</div>
                        <h2 className="font-heading text-4xl md:text-5xl font-black tracking-tight max-w-xl">Three steps to perfect generations.</h2>
                    </div>
                    <Link to="/pricing" className="btn-outline">See pricing →</Link>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { n: "01", t: "Find your prompt", d: "Browse our extensive catalog of premium prompts. Filter by model, category, and use case.", icon: Users, accent: "bg-[#FF4F00]" },
                        { n: "02", t: "Unlock instantly", d: "Use your credits to securely unlock the exact prompt details and instructions.", icon: Zap, accent: "bg-[#0047FF]" },
                        { n: "03", t: "Generate like a pro", d: "Copy the prompt to your favorite AI tool and get amazing results every time.", icon: Coins, accent: "bg-[#FFD600]" },
                    ].map((s, idx) => (
                        <div key={s.n} className="bg-white border-2 border-[#1A1A1A] hard-shadow p-6 relative" data-testid={`how-step-${idx}`}>
                            <div className={`${s.accent} text-[#1A1A1A] inline-flex items-center justify-center w-14 h-14 border-2 border-[#1A1A1A] font-heading font-black text-2xl mb-4`}>{s.n}</div>
                            <s.icon className="absolute top-6 right-6 w-6 h-6 text-[#1A1A1A]/30" />
                            <h3 className="font-heading text-2xl font-bold mt-2">{s.t}</h3>
                            <p className="mt-3 text-sm text-[#66635D] leading-relaxed">{s.d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ------------- FEATURED PROMPTS ------------- */}
            <section className="bg-[#EFEBE1] border-y-2 border-[#1A1A1A]">
                <div className="max-w-7xl mx-auto px-6 py-20">
                    <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#0047FF] mb-2">Trending</div>
                            <h2 className="font-heading text-4xl md:text-5xl font-black tracking-tight">Hot prompts this week.</h2>
                        </div>
                        <Link to="/marketplace" className="btn-ink">See all prompts →</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {prompts.slice(0, 8).map((p) => (<PromptCard key={p.id} prompt={p} compact />))}
                    </div>
                </div>
            </section>

            {/* ------------- CREDIT ENGINE CALLOUT ------------- */}
            <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-12 gap-10 items-center">
                <div className="md:col-span-5">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF4F00] mb-2">Built-in Credit Engine</div>
                    <h2 className="font-heading text-4xl md:text-5xl font-black tracking-tight">
                        Find the prompt. <br /> Fairly priced.
                    </h2>
                    <p className="mt-6 text-[#66635D] max-w-md">
                        No guesswork. Our engine prices prompts based on token count and complexity so you always get a square deal.
                    </p>
                    <Link to="/marketplace" className="btn-vermilion mt-8 inline-flex">Browse prompts →</Link>
                </div>
                <div className="md:col-span-7">
                    <div className="bg-[#1A1A1A] text-[#F7F5F0] p-6 border-2 border-[#1A1A1A] hard-shadow-vermilion font-mono text-sm">
                        <div className="flex gap-2 mb-4">
                            <span className="w-3 h-3 rounded-full bg-[#FF4F00]" />
                            <span className="w-3 h-3 rounded-full bg-[#FFD600]" />
                            <span className="w-3 h-3 rounded-full bg-[#0047FF]" />
                        </div>
                        <pre className="whitespace-pre-wrap leading-relaxed text-[#F7F5F0]/90">
{`> Act as a senior SaaS copywriter.
  Given a product, produce a hero
  headline (max 9 words), sub-headline,
  three feature blurbs and a CTA.
  Return JSON, step-by-step.`}
                        </pre>
                        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                            <span className="text-white/60">Tokens: ~36 · Complexity: 3</span>
                            <span className="inline-flex items-center gap-1 bg-[#FFD600] text-[#1A1A1A] px-2 py-1 font-bold">
                                <Coins className="w-3 h-3" /> 10 CREDITS · ADVANCED
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------- TESTIMONIALS ------------- */}
            <section className="bg-[#1A1A1A] text-[#F7F5F0] border-y-2 border-[#1A1A1A]">
                <div className="max-w-7xl mx-auto px-6 py-20">
                    <div className="max-w-2xl">
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD600] mb-2">Customer voices</div>
                        <h2 className="font-heading text-4xl md:text-5xl font-black tracking-tight">Real results. Real fast.</h2>
                    </div>
                    <div className="mt-12 grid md:grid-cols-3 gap-5">
                        {[
                            { q: "I saved countless hours trying to get the right Midjourney style. The prompt I bought worked perfectly on the first try.", n: "Priya M.", r: "Illustrator" },
                            { q: "The quality of the SaaS copywriting prompts here is unmatched. It feels like having a senior writer on demand.", n: "Rahul S.", r: "Marketing Director" },
                            { q: "I found exactly the system prompt I needed for my app's backend AI. This platform is a lifesaver.", n: "Meera K.", r: "Software Engineer" },
                        ].map((t, i) => (
                            <div key={i} className="bg-[#F7F5F0] text-[#1A1A1A] p-6 border-2 border-[#F7F5F0]" data-testid={`testimonial-${i}`}>
                                <div className="font-heading text-3xl text-[#FF4F00] leading-none">&ldquo;</div>
                                <p className="mt-2 text-sm leading-relaxed">{t.q}</p>
                                <div className="mt-5 font-heading font-bold">{t.n} <span className="text-[#66635D] font-normal">· {t.r}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ------------- FINAL CTA ------------- */}
            <section className="max-w-7xl mx-auto px-6 py-24 text-center">
                <TrendingUp className="w-10 h-10 mx-auto text-[#FF4F00]" />
                <h2 className="font-heading text-5xl md:text-7xl font-black tracking-tighter mt-6 max-w-3xl mx-auto">Your perfect AI generation is one prompt away.</h2>
                <p className="mt-6 text-[#66635D] max-w-xl mx-auto text-lg">Find your first premium prompt today.</p>
                <div className="mt-10 flex flex-wrap gap-4 justify-center">
                    {user ? (
                        <Link to="/dashboard" className="btn-vermilion hard-shadow" data-testid="final-cta-dashboard">Go to Dashboard →</Link>
                    ) : (
                        <button onClick={login} className="btn-vermilion hard-shadow" data-testid="final-cta-signup">Sign up now →</button>
                    )}
                    <Link to="/marketplace" className="btn-outline" data-testid="final-cta-browse">Browse prompts</Link>
                </div>
                <div className="mt-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#66635D]">
                    <ShieldCheck className="w-4 h-4" /> Fair pricing · Premium quality · Instant unlock
                </div>
            </section>
        </div>
    );
}
