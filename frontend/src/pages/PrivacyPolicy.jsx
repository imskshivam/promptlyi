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

export default function PrivacyPolicy() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen bg-brand-lt_light font-sans selection:bg-brand-lt_lime selection:text-brand-lt_green">
            {/* Header */}
            <div className="bg-brand-lt_green pt-32 pb-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 text-center animate-fadeup">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-lt_lime/20 text-brand-lt_lime font-bold text-sm mb-6">
                        <Shield className="w-4 h-4" /> Legal & Privacy
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
                        Privacy Policy
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
                        <LegalSection number="1" title="Introduction">
                            <p>At Promptlyi, we take your privacy seriously. This Privacy Policy outlines how we collect, use, store, and protect your personal information when you use our website and services.</p>
                        </LegalSection>
                        <LegalSection number="2" title="Information We Collect">
                            <ul className="list-disc pl-5 space-y-2 marker:text-brand-lt_lime">
                                <li><strong className="text-brand-lt_purple">Account Information:</strong> We use Google OAuth for authentication and collect your name, email, and profile picture.</li>
                                <li><strong className="text-brand-lt_purple">Transaction Data:</strong> We collect transaction history. <strong>We do not store raw credit card data.</strong> All payments are handled securely by Dodo Payments.</li>
                                <li><strong className="text-brand-lt_purple">Usage Data:</strong> Anonymous analytics to improve our platform experience.</li>
                                <li><strong className="text-brand-lt_purple">User Content:</strong> Prompts, descriptions, and assets you upload as a Creator.</li>
                            </ul>
                        </LegalSection>
                        <LegalSection number="3" title="How We Use Your Information">
                            <ul className="list-disc pl-5 space-y-2 marker:text-brand-lt_lime">
                                <li>To provide, maintain, and improve the Promptlyi platform.</li>
                                <li>To process transactions and manage your account balance.</li>
                                <li>To facilitate payouts to Creators.</li>
                                <li>To communicate security updates and platform changes.</li>
                                <li>To prevent fraudulent activity and ensure compliance.</li>
                            </ul>
                        </LegalSection>
                        <LegalSection number="4" title="Data Sharing & Disclosure">
                            <p>We do not sell your personal data. We may share information with:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-3 marker:text-brand-lt_lime">
                                <li><strong className="text-brand-lt_purple">Service Providers:</strong> Secure database hosts and payment processors.</li>
                                <li><strong className="text-brand-lt_purple">Legal Compliance:</strong> If required by law or to protect the rights of Promptlyi or users.</li>
                            </ul>
                        </LegalSection>
                        <LegalSection number="5" title="Security">
                            <p>We implement industry-standard security measures including:</p>
                            <ul className="list-disc pl-5 space-y-2 mt-3 marker:text-brand-lt_lime">
                                <li>HTTPS/SSL encryption for all data transmission.</li>
                                <li>SOC2-compliant cloud infrastructure.</li>
                                <li>Secure JWT authentication for all API endpoints.</li>
                            </ul>
                            <p className="mt-4">No method of internet transmission is 100% secure, but we strive to protect your data with industry best practices.</p>
                        </LegalSection>
                        <LegalSection number="6" title="Cookies & Tracking">
                            <p>We use cookies and similar technologies to track activity and hold certain information. You can instruct your browser to refuse all cookies, though this may affect authentication features.</p>
                        </LegalSection>
                        <LegalSection number="7" title="Your Data Rights">
                            <p>Depending on your location, you may have the right to access, update, or delete your personal information. To delete your account and all associated data, please contact our support team.</p>
                        </LegalSection>
                        <LegalSection number="8" title="Contact Us">
                            <p>Questions about this Privacy Policy? Contact our Data Protection Officer at <a href="mailto:privacy@promptlyi.com" className="text-brand-lt_green font-bold hover:underline">privacy@promptlyi.com</a>.</p>
                        </LegalSection>
                    </div>
                </div>

                <div className="mt-12 text-center flex items-center justify-center gap-2">
                    <span className="text-gray-500 font-medium">Also read our</span>
                    <Link to="/terms" className="inline-flex items-center text-brand-lt_purple font-black hover:text-brand-lt_green transition-colors">
                        Terms of Service <ChevronRight className="w-4 h-4 ml-0.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
