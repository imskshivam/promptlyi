import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, ArrowRight, CheckCircle2, Shield,
  Search, Users, Star, Box, Zap
} from "lucide-react";
import PromptCard from "../components/PromptCard";

const DUMMY_PROMPTS = [
  {
    id: "1", title: "Photorealistic Cyberpunk Cityscape", description: "Generates an incredibly detailed cyberpunk city street with neon lights, reflections, and atmospheric fog.",
    category: "midjourney", price_usd: 0, preview_url: "https://images.unsplash.com/photo-1515630278258-407f66498911?w=600&q=80",
    likes_count: 420, comments_count: 56, creator: { name: "NeonDreams", picture: "https://i.pravatar.cc/150?u=1" }
  },
  {
    id: "2", title: "SaaS Landing Page Copywriter", description: "A system prompt that turns GPT-4 into an expert conversion copywriter for B2B SaaS landing pages.",
    category: "writing", price_usd: 0, preview_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    likes_count: 315, comments_count: 24, creator: { name: "CopyPro", picture: "https://i.pravatar.cc/150?u=2" }
  },
  {
    id: "3", title: "React Component Generator", description: "Generate accessible, responsive, and fully styled React components using Tailwind CSS and Framer Motion.",
    category: "code", price_usd: 0, preview_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
    likes_count: 850, comments_count: 112, creator: { name: "DevMaster", picture: "https://i.pravatar.cc/150?u=3" }
  },
  {
    id: "4", title: "Minimalist Logo Designer", description: "Prompt for DALL-E 3 to create clean, modern, minimalist vector logos for startups.",
    category: "design", price_usd: 0, preview_url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80",
    likes_count: 275, comments_count: 18, creator: { name: "VectorArt", picture: "https://i.pravatar.cc/150?u=4" }
  }
];

export default function Landing() {
  return (
    <div className="overflow-x-hidden bg-white">
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-orange-400/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
          <div className="animate-fadeup">
            <div className="badge badge-orange mb-6 w-fit">
              <FlameIcon className="w-3.5 h-3.5" /> #1 AI Prompt Marketplace
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-gray-900 mb-6">
              Find perfect <span className="gradient-text-dark">AI prompts</span> in seconds.
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-xl leading-relaxed">
              Unlock the full power of ChatGPT, Midjourney, and Claude. Browse thousands of top-tier prompts curated by the community. 
              <span className="font-bold text-orange-500 block mt-2">100% Free. Always.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/marketplace" className="btn btn-primary !rounded-2xl !py-4 !px-8 text-lg w-full sm:w-auto shadow-[0_8px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.4)]">
                Explore Prompts <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/creator" className="btn btn-ghost !rounded-2xl !py-4 !px-8 text-lg w-full sm:w-auto">
                Share a Prompt
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-sm font-semibold text-gray-400">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> No signup required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Free forever</span>
            </div>
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center animate-fadein delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full blur-3xl opacity-50 animate-pulse-orange" />
            
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <img src="https://images.unsplash.com/photo-1693487048787-a19cc08ded79?w=800&q=80" alt="Hero artwork" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                <div className="badge bg-white/20 text-white backdrop-blur-md border-none mb-3">🎨 Midjourney</div>
                <h3 className="text-white font-black text-2xl leading-tight">Neon Cyberpunk Cityscapes</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="badge badge-orange mb-4">How it works</div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Simple. Fast. <span className="gradient-text-dark">Free.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 opacity-50 z-0" />
            
            {[
              { i: Search, title: "Find", desc: "Search thousands of prompts across categories like coding, marketing, and art." },
              { i: Zap, title: "Copy", desc: "Found what you need? Just click to copy the prompt instantly. No paywalls." },
              { i: Sparkles, title: "Create", desc: "Paste into your favorite AI tool and watch the magic happen." }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500 transition-all duration-300">
                  <step.i className="w-8 h-8 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRENDING ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <FlameIcon className="w-8 h-8 text-orange-500" /> Trending Now
              </h2>
              <p className="text-gray-500 mt-2">The most popular prompts this week.</p>
            </div>
            <Link to="/marketplace" className="btn btn-ghost !rounded-xl !py-2.5">
              View All Prompts <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DUMMY_PROMPTS.map((p) => <PromptCard key={p.id} prompt={p} />)}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-[0_20px_60px_rgba(249,115,22,0.3)]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
              Stop guessing. Start prompting.
            </h2>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-10">
              Join thousands of creators, marketers, and developers finding their next great idea on Promptlyi.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/marketplace" className="btn btn-white !rounded-2xl !py-4 !px-10 text-lg shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                Browse Prompts
              </Link>
              <Link to="/creator" className="btn !bg-orange-700 !text-white !border-transparent !rounded-2xl !py-4 !px-10 text-lg hover:!bg-orange-800">
                Share a Prompt
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// FlameIcon helper
function FlameIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}
