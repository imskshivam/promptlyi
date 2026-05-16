import React, { useEffect } from "react";

export default function Terms() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#F7F5F0] text-[#1A1A1A] py-20 px-6">
            <div className="max-w-4xl mx-auto bg-white border-4 border-[#1A1A1A] p-8 md:p-12 shadow-[8px_8px_0px_#1A1A1A]">
                <h1 className="font-heading font-black text-4xl md:text-5xl uppercase mb-8">Terms and Conditions</h1>
                <div className="space-y-6 text-sm md:text-base leading-relaxed text-[#1A1A1A]/80">
                    <p className="font-bold text-[#FF4F00]">Last Updated: May 14, 2026</p>
                    
                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">1. Acceptance of Terms</h2>
                        <p>Welcome to Promptlyi ("we", "us", "our"). By accessing or using our platform, website, and services, you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these terms, you must not use our services.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">2. The Platform</h2>
                        <p>Promptlyi is a marketplace connecting creators of AI prompts ("Creators") with users seeking to purchase access to these prompts ("Buyers"). We provide the infrastructure for hosting, selling, and executing these digital goods.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">3. Account Registration & Security</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>You must be at least 18 years old to create an account.</li>
                            <li>You agree to provide accurate, current, and complete information during registration.</li>
                            <li>We utilize Google OAuth for authentication. You are responsible for safeguarding your Google account.</li>
                            <li>Promptlyi is not liable for any loss or damage arising from your failure to protect your login credentials.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">4. Intellectual Property & Prompt Ownership</h2>
                        <p><strong>For Creators:</strong> By uploading a prompt to Promptlyi, you retain all ownership rights to your original prompt engineering. You grant Promptlyi a worldwide, non-exclusive, royalty-free license to host, display, and sell access to your prompt on our platform.</p>
                        <p className="mt-2"><strong>For Buyers:</strong> Purchasing a prompt grants you a non-exclusive, non-transferable, revocable license to use the prompt for personal or commercial purposes. You may not resell, redistribute, or publicly publish the raw prompt text on competing platforms.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">5. Payments, Credits & Subscriptions</h2>
                        <p>All financial transactions are processed securely via our third-party payment provider, <strong>Dodo Payments</strong>. Promptlyi does not directly store your credit card information.</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Credits:</strong> Purchases made via the credit system are final and non-refundable.</li>
                            <li><strong>Subscriptions:</strong> Creator subscription tiers auto-renew unless canceled prior to the billing date.</li>
                            <li><strong>Payouts:</strong> Creators earn a percentage of sales, subject to a 5% platform commission. Payouts are distributed upon reaching the minimum threshold of $100 USD.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">6. Prohibited Conduct</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Upload prompts that generate illegal, harmful, sexually explicit, or highly offensive content.</li>
                            <li>Attempt to reverse-engineer, scrape, or hack the Promptlyi platform.</li>
                            <li>Commit payment fraud or initiate unwarranted chargebacks.</li>
                            <li>Upload prompts that infringe on the intellectual property of third parties.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">7. Limitation of Liability</h2>
                        <p>Promptlyi is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee that prompts will produce specific or desired results on third-party AI models (e.g., ChatGPT, Midjourney, Claude) as AI systems are inherently unpredictable. In no event shall Promptlyi be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the platform.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">8. Termination</h2>
                        <p>We reserve the right to suspend or terminate your account at any time, without notice, for conduct that violates these Terms or is harmful to other users of the platform, us, or third parties.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">9. Modifications to Terms</h2>
                        <p>We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform constitutes acceptance of the modified Terms.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">10. Contact Information</h2>
                        <p>If you have any questions about these Terms, please contact us at legal@promptlyi.com.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
