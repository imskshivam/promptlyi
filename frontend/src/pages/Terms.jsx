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

export default function Terms() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen bg-white py-16 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10">
                    <div className="badge badge-orange mb-4 w-fit">Legal</div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">Terms & Conditions</h1>
                    <p className="text-orange-500 font-semibold text-sm">Last Updated: May 14, 2026</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.06)] space-y-7">
                    <LegalSection number="1" title="Acceptance of Terms">
                        <p>Welcome to Promptlyi ("we", "us", "our"). By accessing or using our platform, website, and services, you agree to be bound by these Terms and Conditions. If you do not agree, you must not use our services.</p>
                    </LegalSection>
                    <LegalSection number="2" title="The Platform">
                        <p>Promptlyi is a marketplace connecting creators of AI prompts with users seeking to purchase access. We provide the infrastructure for hosting, selling, and executing these digital goods.</p>
                    </LegalSection>
                    <LegalSection number="3" title="Account Registration & Security">
                        <ul className="list-disc pl-5 space-y-1">
                            <li>You must be at least 18 years old to create an account.</li>
                            <li>You agree to provide accurate, current, and complete information during registration.</li>
                            <li>We utilize Google OAuth for authentication. You are responsible for safeguarding your Google account.</li>
                            <li>Promptlyi is not liable for any loss arising from your failure to protect your login credentials.</li>
                        </ul>
                    </LegalSection>
                    <LegalSection number="4" title="Intellectual Property & Prompt Ownership">
                        <p><strong>For Creators:</strong> By uploading a prompt, you retain all ownership rights. You grant Promptlyi a worldwide, non-exclusive, royalty-free license to host, display, and sell access to your prompt.</p>
                        <p><strong>For Buyers:</strong> Purchasing grants you a non-exclusive, non-transferable, revocable license for personal or commercial use. You may not resell or redistribute the raw prompt text on competing platforms.</p>
                    </LegalSection>
                    <LegalSection number="5" title="Payments, Credits & Subscriptions">
                        <p>All transactions are processed securely via <strong>Dodo Payments</strong>. We do not store your credit card information.</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Credits:</strong> Purchases are final and non-refundable.</li>
                            <li><strong>Subscriptions:</strong> Auto-renew unless canceled before the billing date.</li>
                            <li><strong>Payouts:</strong> Creators earn a percentage subject to a 5% platform commission. Minimum payout threshold: $100 USD.</li>
                        </ul>
                    </LegalSection>
                    <LegalSection number="6" title="Prohibited Conduct">
                        <ul className="list-disc pl-5 space-y-1">
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
                        <p>Questions? Contact us at <a href="mailto:legal@promptlyi.com" className="text-orange-500 hover:underline">legal@promptlyi.com</a>.</p>
                    </LegalSection>
                </div>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Also read our <Link to="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link>
                </div>
            </div>
        </div>
    );
}
