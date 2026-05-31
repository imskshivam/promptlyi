import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function LegalSection({ number, title, children }) {
    return (
        <section className="pb-6 border-b border-gray-100 last:border-0">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
                <span className="text-orange-500 mr-2">{number}.</span>{title}
            </h2>
            <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
        </section>
    );
}

export default function PrivacyPolicy() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen bg-white py-16 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10">
                    <div className="badge badge-orange mb-4 w-fit">Legal</div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">Privacy Policy</h1>
                    <p className="text-orange-500 font-semibold text-sm">Last Updated: May 14, 2026</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.06)] space-y-7">
                    <LegalSection number="1" title="Introduction">
                        <p>At Promptlyi, we take your privacy seriously. This Privacy Policy outlines how we collect, use, store, and protect your personal information when you use our website and services.</p>
                    </LegalSection>
                    <LegalSection number="2" title="Information We Collect">
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Account Information:</strong> We use Google OAuth for authentication and collect your name, email, and profile picture.</li>
                            <li><strong>Transaction Data:</strong> We collect transaction history. <strong>We do not store raw credit card data.</strong> All payments are handled by our PCI-compliant provider, Dodo Payments.</li>
                            <li><strong>Usage Data:</strong> Anonymous analytics via Firebase to improve our services.</li>
                            <li><strong>User Content:</strong> Prompts, descriptions, and assets you upload as a Creator.</li>
                        </ul>
                    </LegalSection>
                    <LegalSection number="3" title="How We Use Your Information">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>To provide, maintain, and improve the Promptlyi platform.</li>
                            <li>To process transactions and manage your account balance.</li>
                            <li>To facilitate payouts to Creators.</li>
                            <li>To communicate security updates and platform changes.</li>
                            <li>To prevent fraudulent activity and ensure compliance.</li>
                        </ul>
                    </LegalSection>
                    <LegalSection number="4" title="Data Sharing and Disclosure">
                        <p>We do not sell your personal data. We may share information with:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Service Providers:</strong> MongoDB Atlas, Dodo Payments, Firebase for analytics.</li>
                            <li><strong>Legal Compliance:</strong> If required by law or to protect the rights of Promptlyi or users.</li>
                        </ul>
                    </LegalSection>
                    <LegalSection number="5" title="Security">
                        <p>We implement industry-standard security measures including:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>HTTPS/SSL encryption for all data transmission.</li>
                            <li>SOC2-compliant cloud infrastructure (MongoDB Atlas/AWS).</li>
                            <li>Secure JWT authentication for all API endpoints.</li>
                        </ul>
                        <p className="mt-2">No method of internet transmission is 100% secure, but we strive to protect your data with industry best practices.</p>
                    </LegalSection>
                    <LegalSection number="6" title="Cookies and Tracking">
                        <p>We use cookies and similar technologies to track activity and hold certain information. You can instruct your browser to refuse all cookies, though this may affect authentication features.</p>
                    </LegalSection>
                    <LegalSection number="7" title="Your Data Rights">
                        <p>Depending on your location (GDPR in Europe, CCPA in California), you may have the right to access, update, or delete your personal information. To delete your account and all associated data, please contact our support team.</p>
                    </LegalSection>
                    <LegalSection number="8" title="Contact Us">
                        <p>Questions about this Privacy Policy? Contact our Data Protection Officer at <a href="mailto:privacy@promptlyi.com" className="text-orange-500 hover:underline">privacy@promptlyi.com</a>.</p>
                    </LegalSection>
                </div>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Also read our <Link to="/terms" className="text-orange-500 hover:underline">Terms of Service</Link>
                </div>
            </div>
        </div>
    );
}
