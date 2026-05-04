import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="border-t-2 border-[#1A1A1A] bg-[#1A1A1A] text-[#F7F5F0] mt-24">
            <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-[#FF4F00] border-2 border-white flex items-center justify-center font-black">P</div>
                        <span className="font-heading font-black text-xl">Promptly</span>
                    </div>
                    <p className="text-sm text-white/60 max-w-xs">The creator economy for prompt engineers. Earn, share, create.</p>
                </div>
                <div>
                    <div className="font-heading font-bold uppercase text-xs tracking-wider mb-3 text-[#FFD600]">Marketplace</div>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li><Link to="/marketplace">Browse</Link></li>
                        <li><Link to="/custom-works">Custom Work</Link></li>
                        <li><Link to="/pricing">Pricing</Link></li>
                    </ul>
                </div>
                <div>
                    <div className="font-heading font-bold uppercase text-xs tracking-wider mb-3 text-[#FFD600]">Creators</div>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li><Link to="/creator">Creator Dashboard</Link></li>
                        <li><Link to="/pricing">Subscriptions</Link></li>
                    </ul>
                </div>
                <div>
                    <div className="font-heading font-bold uppercase text-xs tracking-wider mb-3 text-[#FFD600]">Legal</div>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li>Terms</li>
                        <li>Privacy</li>
                        <li>Cookies</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
                © {new Date().getFullYear()} Promptly. Designed for creators, built to be earned.
            </div>
        </footer>
    );
}
