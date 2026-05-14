import React, { useEffect } from "react";

export default function PrivacyPolicy() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#F7F5F0] text-[#1A1A1A] py-20 px-6">
            <div className="max-w-4xl mx-auto bg-white border-4 border-[#1A1A1A] p-8 md:p-12 shadow-[8px_8px_0px_#1A1A1A]">
                <h1 className="font-heading font-black text-4xl md:text-5xl uppercase mb-8">Privacy Policy</h1>
                <div className="space-y-6 text-sm md:text-base leading-relaxed text-[#1A1A1A]/80">
                    <p className="font-bold text-[#FF4F00]">Last Updated: May 14, 2026</p>
                    
                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">1. Introduction</h2>
                        <p>At Promptly, we take your privacy and data security seriously. This Privacy Policy outlines how we collect, use, store, and protect your personal information when you use our website and services.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Account Information:</strong> We use Google OAuth for seamless authentication. We collect your basic profile information provided by Google, including your name, email address, and profile picture.</li>
                            <li><strong>Transaction Data:</strong> When you purchase credits or subscribe, we collect transaction history. <strong>We do not collect or store your raw credit card data.</strong> All payment processing is securely handled by our PCI-compliant provider, Dodo Payments.</li>
                            <li><strong>Usage Data:</strong> We collect anonymous analytics using Firebase to understand how users interact with our platform (e.g., page views, feature usage, MAU/DAU metrics) to improve our services.</li>
                            <li><strong>User Content:</strong> For Creators, we store the prompts, descriptions, and assets you upload to the platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">3. How We Use Your Information</h2>
                        <p>We use the collected information for the following purposes:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To provide, maintain, and improve the Promptly platform.</li>
                            <li>To process your transactions and manage your account balance.</li>
                            <li>To facilitate payouts to Creators.</li>
                            <li>To communicate with you regarding security updates, account alerts, and platform changes.</li>
                            <li>To prevent fraudulent activity and ensure compliance with our Terms and Conditions.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">4. Data Sharing and Disclosure</h2>
                        <p>We do not sell your personal data to third parties. We may share your information only in the following circumstances:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Service Providers:</strong> With trusted third-party services that assist in operating our platform (e.g., MongoDB Atlas for secure database hosting, Dodo Payments for billing, Firebase for analytics).</li>
                            <li><strong>Legal Compliance:</strong> If required by law, subpoena, or other legal processes, or to protect the rights, property, or safety of Promptly, our users, or others.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">5. Security</h2>
                        <p>We implement industry-standard security measures to protect your personal information. This includes:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Using HTTPS/SSL encryption for all data transmitted between your browser and our servers.</li>
                            <li>Storing your data in highly secure, SOC2-compliant cloud infrastructure (MongoDB Atlas/AWS).</li>
                            <li>Using secure JWT (JSON Web Tokens) for API authentication.</li>
                        </ul>
                        <p className="mt-2">While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">6. Cookies and Tracking Technologies</h2>
                        <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use the authentication portions of our service.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">7. Your Data Rights</h2>
                        <p>Depending on your location (such as the GDPR in Europe or CCPA in California), you may have the right to access, update, or delete the personal information we have on you. If you wish to delete your account and all associated data, please contact our support team.</p>
                    </section>

                    <section>
                        <h2 className="font-heading font-bold text-2xl mb-3 text-[#1A1A1A]">8. Contact Us</h2>
                        <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer at privacy@promptlyi.com.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
