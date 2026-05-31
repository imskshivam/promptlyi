import React from "react";
import { Link } from "react-router-dom";
import { Zap, Twitter, Instagram, Linkedin, Github, ArrowRight } from "lucide-react";

const LINKS = {
  Product: [
    { label: "Browse Prompts", to: "/marketplace" },
    { label: "Leaderboard", to: "/leaderboard" },
    { label: "Custom Work", to: "/custom-works" },
  ],
  Resources: [
    { label: "Blog", to: "/blog" },
    { label: "Start Selling", to: "/" },
    { label: "Creator Dashboard", to: "/" },
    { label: "Pricing", to: "/pricing" },
  ],
  Legal: [
    { label: "Terms of Service", to: "/terms" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Cookie Policy", to: "/" },
  ],
};

const SOCIALS = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white mt-0">
      {/* Newsletter strip */}
      <div className="border-b-4 border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-white mb-2">Stay in the loop</h3>
            <p className="text-white/60 text-base font-bold">Get the best new prompts delivered to your inbox every week.</p>
          </div>
          <form className="flex gap-3 max-w-sm w-full" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white/5 border-2 border-white/10 rounded-full px-5 py-3 text-base font-bold text-white placeholder-white/30 focus:outline-none focus:border-brand-lt_lime focus:bg-white/10 transition-all"
            />
            <button
              type="submit"
              className="btn !bg-brand-lt_lime !text-brand-lt_green hover:!bg-brand-lt_pink hover:!text-brand-lt_purple !rounded-full !py-3 !px-5 shrink-0 transition-colors"
            >
              <ArrowRight className="w-5 h-5 font-black" />
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-3 mb-6 group w-fit">
            <div className="w-12 h-12 rounded-2xl bg-brand-lt_pink flex items-center justify-center shadow-lg border-2 border-transparent group-hover:border-white transition-all">
              <Zap className="w-6 h-6 text-brand-lt_purple fill-brand-lt_purple" />
            </div>
            <span className="font-black text-2xl text-white">Promptlyi</span>
          </Link>
          <p className="text-white/60 text-sm font-bold leading-relaxed max-w-xs mb-8">
            The world's largest curated marketplace for AI prompts. 
            Discover, create, and monetize your best prompts.
          </p>
          {/* Socials */}
          <div className="flex items-center gap-4">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-brand-lt_lime border-2 border-white/10 flex items-center justify-center text-white/60 hover:text-brand-lt_green hover:border-brand-lt_lime transition-all duration-200"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([heading, items]) => (
          <div key={heading}>
            <div className="text-sm font-black uppercase tracking-widest text-brand-lt_lime mb-6">{heading}</div>
            <ul className="space-y-4">
              {items.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-base font-bold text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t-2 border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-white/40">
            © {new Date().getFullYear()} Promptlyi. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white/40">Made with</span>
            <span className="text-brand-lt_pink text-lg">♥</span>
            <span className="text-sm font-bold text-white/40">for creators worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
