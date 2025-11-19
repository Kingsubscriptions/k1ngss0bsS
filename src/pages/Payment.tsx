import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldCheck } from 'lucide-react';

const PaymentPage = () => {
    return (
        <div className="bg-gray-100 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-12">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                        Payment Methods & How to Pay
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                        We accept multiple secure payment methods. Choose the one that works best for you.
                    </p>
                </header>

                <div className="max-w-4xl mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mobile Banking (JazzCash & EasyPaisa)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold">JazzCash</h3>
                                <p><strong>Account Number:</strong> 0300-784-8018</p>
                                <p><strong>Account Name:</strong> Ahmad Rasheed</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">EasyPaisa</h3>
                                <p><strong>Account Number:</strong> 0345-784-8018</p>
                                <p><strong>Account Name:</strong> Ahmad Rasheed</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Bank Transfer (UBL)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p><strong>Bank Name:</strong> United Bank Limited (UBL)</p>
                            <p><strong>Account Number:</strong> 0962-3129-05792</p>
                            <p><strong>Account Title:</strong> Ahmad Rasheed</p>
                            <p><strong>IBAN:</strong> PK12UBLL0000000000000000</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>International Payments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>PayPal:</strong> Send to kingsubscriptionoffical@gmail.com</p>
                            <p><strong>Credit/Debit Cards:</strong> Visa, MasterCard, American Express accepted.</p>
                            <p><strong>Cryptocurrency (Bitcoin):</strong> Contact us for our wallet address.</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-primary"/>Complete Payment Process</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p>1. Choose your preferred payment method from the options above.</p>
                            <p>2. Transfer the exact amount to any of the accounts shown.</p>
                            <p>3. Take a clear screenshot or photo of the payment confirmation/receipt.</p>
                            <p>4. Send the payment proof via WhatsApp (+92 327 6847960) with your order details.</p>
                            <p>5. Receive your subscription credentials instantly after verification.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
