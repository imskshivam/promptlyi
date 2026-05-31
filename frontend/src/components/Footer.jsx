import React from "react";
import { Link } from "react-router-dom";
import { Zap, Twitter, Instagram, Linkedin, Github, ArrowRight } from "lucide-react";

const LINKS = {
  Product: [
    { label: "Browse Prompts", to: "/marketplace" },
    { label: "Leaderboard", to: "/leaderboard" },
    { label: "Custom Work", to: "/custom-works" },
  ],
  Creators: [
    { label: "Start Selling", to: "/" },
    { label: "Creator Dashboard", to: "/" },
    { label: "Pricing", to: "/marketplace" },
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
      <div className="border-b border-white/6">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-white mb-1">Stay in the loop</h3>
            <p className="text-gray-400 text-sm">Get the best new prompts delivered to your inbox every week.</p>
          </div>
          <form className="flex gap-3 max-w-sm w-full" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/60 focus:bg-white/8 transition-all"
            />
            <button
              type="submit"
              className="btn btn-primary !rounded-xl !py-3 !px-4 !text-sm shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-5 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_4px_12px_rgba(249,115,22,0.4)]">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-black text-xl text-white">Promptlyi</span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
            The world's largest curated marketplace for AI prompts. 
            Discover, create, and monetize your best prompts.
          </p>
          {/* Socials */}
          <div className="flex items-center gap-3">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-white/6 hover:bg-orange-500 border border-white/8 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([heading, items]) => (
          <div key={heading}>
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-orange-400 mb-4">{heading}</div>
            <ul className="space-y-3">
              {items.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
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
      <div className="border-t border-white/6">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Promptlyi. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Made with</span>
            <span className="text-orange-500">♥</span>
            <span className="text-xs text-gray-500">for creators worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
