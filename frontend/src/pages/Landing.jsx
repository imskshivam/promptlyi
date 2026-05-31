import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, ArrowRight, CheckCircle2, Shield,
  Search, Users, Star, Box, Zap,
  Wallet, Share2, Instagram, Twitter, Youtube
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
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 overflow-hidden bg-brand-lt_green">
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
          <div className="animate-fadeup">
            <div className="badge bg-brand-lt_lime/20 text-brand-lt_lime border-none mb-6 w-fit flex items-center gap-2">
              <FlameIcon className="w-3.5 h-3.5 text-brand-lt_lime" /> #1 AI Prompt Marketplace
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white mb-6">
              Find perfect <span className="text-brand-lt_lime">AI prompts</span> in seconds.
            </h1>
            
            <p className="text-lg sm:text-xl text-brand-lt_lime/80 mb-10 max-w-xl leading-relaxed">
              Unlock the full power of ChatGPT, Midjourney, and Claude. Browse thousands of top-tier prompts curated by the community. 
              <span className="font-bold text-brand-lt_lime block mt-2">Start exploring today.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/marketplace" className="btn !bg-brand-lt_lime !text-brand-lt_green !border-transparent !rounded-full !py-5 !px-10 text-lg font-bold w-full sm:w-auto shadow-lg hover:shadow-xl hover:!bg-white hover:!text-brand-lt_green transition-all">
                Explore Prompts <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/creator" className="btn btn-ghost !text-white hover:!bg-white/10 !rounded-full !py-5 !px-10 text-lg font-bold w-full sm:w-auto transition-all">
                Share a Prompt
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-sm font-semibold text-brand-lt_lime/70">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-lt_lime" /> No signup required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-lt_lime" /> Premium prompts</span>
            </div>
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center animate-fadein delay-200">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] transform rotate-[-4deg] hover:rotate-0 transition-transform duration-500 border-8 border-brand-lt_lime">
              <img src="https://images.unsplash.com/photo-1693487048787-a19cc08ded79?w=800&q=80" alt="Hero artwork" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-lt_green via-brand-lt_green/60 to-transparent p-8">
                <div className="badge bg-brand-lt_lime text-brand-lt_green font-bold border-none mb-3">🎨 Midjourney</div>
                <h3 className="text-white font-black text-2xl leading-tight">Neon Cyberpunk Cityscapes</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (EARNING PLATFORM) ─── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="badge bg-brand-lt_pink text-brand-lt_purple font-bold border-none mb-4 px-4 py-1 rounded-full">Creator Economy</div>
            <h2 className="text-4xl md:text-6xl font-black text-brand-lt_purple tracking-tight mb-6">
              Two ways to <span className="text-brand-lt_green">Earn Money.</span>
            </h2>
            <p className="text-xl text-gray-600 font-medium">List your prompts on our platform and start earning today. Payout anytime.</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Step 1: List Prompts */}
            <div className="bg-brand-lt_light rounded-[3rem] p-8 md:p-12 shadow-sm relative z-10 flex flex-col md:flex-row items-center gap-8 mb-12 hover:-translate-y-1 transition-transform">
              <div className="w-24 h-24 rounded-[2rem] bg-brand-lt_pink flex items-center justify-center shrink-0">
                <Box className="w-10 h-10 text-brand-lt_purple" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-3xl font-black text-brand-lt_purple mb-3">1. List Your Prompts</h3>
                <p className="text-gray-600 text-lg font-medium leading-relaxed">Upload your best AI prompts to our marketplace. Set your price and showcase your skills to thousands of daily visitors.</p>
              </div>
            </div>

            {/* Split Paths with Animated Arrows */}
            <div className="hidden md:flex justify-center items-center gap-[20rem] absolute top-[30%] left-0 right-0 z-0">
               {/* Left Arrow (Direct Sales) */}
               <div className="flex flex-col items-center animate-bounce text-brand-lt_lime">
                 <ArrowRight className="w-16 h-16 transform rotate-[135deg] mb-2" />
               </div>
               
               {/* Right Arrow (Share Link) */}
               <div className="flex flex-col items-center animate-bounce text-brand-lt_pink" style={{animationDelay: '0.5s'}}>
                 <ArrowRight className="w-16 h-16 transform rotate-[45deg] mb-2" />
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative z-10 mb-12">
              {/* Path 1: Direct Buy */}
              <div className="bg-brand-lt_green rounded-[3rem] p-10 text-center hover:-translate-y-2 transition-transform duration-300 shadow-xl">
                <div className="w-20 h-20 mx-auto rounded-[2rem] bg-brand-lt_lime flex items-center justify-center mb-8">
                  <Users className="w-10 h-10 text-brand-lt_green" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Users Buy Directly</h3>
                <p className="text-brand-lt_light/90 text-lg leading-relaxed font-medium">Buyers browse the Promptlyi marketplace, find your amazing prompts, and purchase them directly from our website.</p>
              </div>

              {/* Path 2: Share Link */}
              <div className="bg-brand-lt_purple rounded-[3rem] p-10 text-center hover:-translate-y-2 transition-transform duration-300 shadow-xl">
                <div className="w-20 h-20 mx-auto rounded-[2rem] bg-brand-lt_pink flex items-center justify-center mb-8">
                  <Share2 className="w-10 h-10 text-brand-lt_purple" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Share Your Profile</h3>
                <p className="text-brand-lt_pink/90 text-lg leading-relaxed font-medium mb-8">Generate a custom profile link. Share it in your bio across all your social networks to drive your own audience.</p>
                
                <div className="flex justify-center items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"><Instagram className="w-6 h-6" /></div>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"><Twitter className="w-6 h-6" /></div>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"><Youtube className="w-6 h-6" /></div>
                </div>
              </div>
            </div>

            {/* Payout */}
            <div className="bg-brand-lt_pink rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-brand-lt_purple flex items-center justify-center shrink-0">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-brand-lt_purple mb-2">Easy Payouts Anytime</h3>
                  <p className="text-brand-lt_purple/80 text-lg font-medium">Withdraw your earnings directly to your bank account instantly.</p>
                </div>
              </div>
              <Link to="/creator" className="btn !bg-brand-lt_purple !text-white hover:!bg-brand-lt_green !rounded-full !py-5 !px-10 text-lg font-bold whitespace-nowrap transition-colors">
                Start Earning
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRENDING ─── */}
      <section className="py-24 bg-brand-lt_lime">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
            <div>
              <h2 className="text-5xl font-black text-brand-lt_green tracking-tight flex items-center gap-4">
                <FlameIcon className="w-10 h-10 text-brand-lt_green" /> Trending Now
              </h2>
              <p className="text-brand-lt_green/80 text-xl font-medium mt-3">The most popular prompts this week.</p>
            </div>
            <Link to="/marketplace" className="btn !bg-brand-lt_green !text-brand-lt_lime !rounded-full !py-4 !px-8 text-lg font-bold hover:!bg-white hover:!text-brand-lt_green transition-colors">
              View All Prompts <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DUMMY_PROMPTS.map((p) => <PromptCard key={p.id} prompt={p} />)}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-brand-lt_purple rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8">
              Stop guessing. <br/>Start prompting.
            </h2>
            <p className="text-2xl text-brand-lt_pink font-medium max-w-2xl mx-auto mb-12">
              Join thousands of creators, marketers, and developers finding their next great idea on Promptlyi.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/marketplace" className="btn !bg-brand-lt_lime !text-brand-lt_green !rounded-full !py-5 !px-12 text-xl font-black hover:scale-105 transition-transform shadow-xl">
                Browse Prompts
              </Link>
              <Link to="/creator" className="btn !bg-white/10 !text-white !border-white/20 !rounded-full !py-5 !px-12 text-xl font-bold hover:!bg-white/20 transition-all">
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
