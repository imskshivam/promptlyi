import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, ChevronRight } from "lucide-react";

function LegalSection({ number, title, children }) {
    return (
        <section className="relative pl-8 md:pl-12 pb-10 border-l-2 border-brand-lt_lime/30 last:border-0 last:pb-0 group">
            <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-brand-lt_lime border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />
            <h2 className="text-2xl font-black text-brand-lt_purple mb-4 flex items-center gap-2">
                <span className="text-brand-lt_lime bg-brand-lt_lime/10 px-2 py-0.5 rounded-lg text-lg">{number}.</span>
                {title}
            </h2>
            <div className="text-gray-600 text-base leading-relaxed space-y-3 font-medium">{children}</div>
        </section>
    );
}

export default function Terms() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen bg-brand-lt_light font-sans selection:bg-brand-lt_lime selection:text-brand-lt_green">
            {/* Header */}
            <div className="bg-brand-lt_green pt-32 pb-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 text-center animate-fadeup">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-lt_lime/20 text-brand-lt_lime font-bold text-sm mb-6">
                        <Shield className="w-4 h-4" /> Legal & Terms
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                        Terms & Conditions
                    </h1>
                    <p className="text-brand-lt_lime/80 text-lg font-medium max-w-2xl mx-auto">
                        Last Updated: May 14, 2026
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20 pb-24">
                <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100">
                    <div className="space-y-2">
                        <LegalSection number="1" title="Acceptance of Terms">
                            <p>Welcome to Promptlyi ("we", "us", "our"). By accessing or using our platform, website, and services, you agree to be bound by these Terms and Conditions. If you do not agree, you must not use our services.</p>
                        </LegalSection>
                        <LegalSection number="2" title="The Platform">
                            <p>Promptlyi is a marketplace connecting creators of AI prompts with users seeking to purchase access. We provide the infrastructure for hosting, selling, and executing these digital goods.</p>
                        </LegalSection>
                        <LegalSection number="3" title="Account Registration & Security">
                            <ul className="list-disc pl-5 space-y-2 marker:text-brand-lt_lime">
                                <li>You must be at least 18 years old to create an account.</li>
                                <li>You agree to provide accurate, current, and complete information during registration.</li>
                                <li>We utilize Google OAuth for authentication. You are responsible for safeguarding your account.</li>
                                <li>Promptlyi is not liable for any loss arising from your failure to protect your login credentials.</li>
                            </ul>
                        </LegalSection>
                        <LegalSection number="4" title="Intellectual Property & Prompt Ownership">
                            <p><strong className="text-brand-lt_purple">For Creators:</strong> By uploading a prompt, you retain all ownership rights. You grant Promptlyi a worldwide, non-exclusive, royalty-free license to host, display, and sell access to your prompt.</p>
                            <p><strong className="text-brand-lt_purple">For Buyers:</strong> Purchasing grants you a non-exclusive, non-transferable, revocable license for personal or commercial use. You may not resell or redistribute the raw prompt text on competing platforms.</p>
                        </LegalSection>
                        <LegalSection number="5" title="Payments & Credits">
                            <p>All transactions are processed securely via <strong className="text-brand-lt_purple">Dodo Payments</strong>. We do not store your credit card information.</p>
                            <ul className="list-disc pl-5 space-y-2 mt-3 marker:text-brand-lt_lime">
                                <li><strong className="text-brand-lt_purple">Credits:</strong> Purchases are final and non-refundable.</li>
                                <li><strong className="text-brand-lt_purple">Payouts:</strong> Creators earn a percentage subject to a 5% platform commission. Minimum payout threshold: $100 USD.</li>
                            </ul>
                        </LegalSection>
                        <LegalSection number="6" title="Prohibited Conduct">
                            <ul className="list-disc pl-5 space-y-2 marker:text-brand-lt_lime">
                                <li>Upload prompts that generate illegal, harmful, or sexually explicit content.</li>
                                <li>Attempt to reverse-engineer, scrape, or hack the platform.</li>
                                <li>Commit payment fraud or initiate unwarranted chargebacks.</li>
                                <li>Upload prompts that infringe on third-party intellectual property.</li>
                            </ul>
                        </LegalSection>
                        <LegalSection number="7" title="Limitation of Liability">
                            <p>Promptlyi is provided "AS IS". We do not guarantee prompts will produce specific results on third-party AI models. In no event shall Promptlyi be liable for indirect, incidental, or consequential damages.</p>
                        </LegalSection>
                        <LegalSection number="8" title="Termination">
                            <p>We reserve the right to suspend or terminate your account without notice for conduct that violates these Terms or is harmful to other users.</p>
                        </LegalSection>
                        <LegalSection number="9" title="Modifications to Terms">
                            <p>We may modify these Terms at any time. Continued use of the platform constitutes acceptance of the modified Terms.</p>
                        </LegalSection>
                        <LegalSection number="10" title="Contact Information">
                            <p>Questions? Contact us at <a href="mailto:legal@promptlyi.com" className="text-brand-lt_green font-bold hover:underline">legal@promptlyi.com</a>.</p>
                        </LegalSection>
                    </div>
                </div>

                <div className="mt-12 text-center flex items-center justify-center gap-2">
                    <span className="text-gray-500 font-medium">Also read our</span>
                    <Link to="/privacy" className="inline-flex items-center text-brand-lt_purple font-black hover:text-brand-lt_green transition-colors">
                        Privacy Policy <ChevronRight className="w-4 h-4 ml-0.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
