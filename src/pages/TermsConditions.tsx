import React from 'react';

const TermsAndConditionsPage = () => {
    return (
        <div className="bg-gray-100 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-12">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                        Terms & Conditions
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                        Customer satisfaction is our #1 priority. By proceeding with an order, you agree to these terms.
                    </p>
                </header>

                <div className="prose dark:prose-invert max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <h2>Guarantee & Warranty Policy</h2>
                    <p><strong>Private Access Tools:</strong> Every private tool includes a 25–27 Day Guarantee. If login fails or the tool stops working, you will receive a replacement or refund within 5–6 business days, provided all conditions are met.</p>
                    <p><strong>Shared / Extension-Based Tools:</strong> Delivered as-is due to the nature of shared access or browser extensions. ⚠️ No warranty or guarantee applies. Misuse or breaking usage rules immediately voids our responsibility.</p>

                    <h2>Delivery Policy</h2>
                    <p>Standard delivery time: 24–48 hours (working days). If delivery is not completed within this timeframe, you are eligible for a 100% refund. All products are digital-only. No physical items are shipped.</p>

                    <h2>Payment & Security Policy</h2>
                    <p>Full payment is required in advance before service activation. We never store or share your banking/credit card details. Fraudulent transactions (chargebacks, fake screenshots, false claims) will result in immediate termination of service without refund.</p>

                    <h2>Refund & Replacement Policy</h2>
                    <p>Refunds or replacements are provided only if all conditions below are met:</p>
                    <ul>
                        <li>✅ Technical issue verified by our support team</li>
                        <li>✅ Clear screenshot or video proof is provided</li>
                        <li>✅ The tool has been used according to rules & instructions</li>
                        <li>✅ The malfunction is from our side (not device/browser issue)</li>
                    </ul>
                    <p>No Refund/Replacement will be provided if:</p>
                    <ul>
                        <li>❌ The tool is no longer needed</li>
                        <li>❌ Complaint is vague, unverifiable, or lacks proof</li>
                        <li>❌ Misuse, lack of understanding, or device/browser conflicts caused the issue</li>
                        <li>❌ Rules and instructions were ignored or intentionally broken</li>
                    </ul>

                    <h2>Proof of Technical Issues</h2>
                    <p>A clear screenshot or screen recording must be submitted for all claims. Proof must be provided within the warranty period. Claims without visual proof will be rejected automatically.</p>

                    <h2>Responsibility & Misuse</h2>
                    <p>We are responsible only if you follow our instructions carefully and the issue originates from our platform/account. We are not responsible if:</p>
                    <ul>
                        <li>Account details are shared with unauthorized people</li>
                        <li>VPNs, third-party tools, or suspicious logins trigger account restrictions</li>
                        <li>Multiple unauthorized logins cause account bans</li>
                    </ul>

                    <h2>Account Ownership Disclaimer</h2>
                    <p>Purchasing from us gives you temporary subscription access, not permanent ownership. All digital tools remain the property of their respective parent companies (e.g., Canva, ChatGPT, Envato). King Subscription acts as a verified reseller/provider of access, not the original owner.</p>

                    <h2>Support & Resolution</h2>
                    <p>Issues must be reported via WhatsApp Support immediately. Share complete details, including screenshots or video proof. Investigation and resolution may take 5–6 business days.</p>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditionsPage;
