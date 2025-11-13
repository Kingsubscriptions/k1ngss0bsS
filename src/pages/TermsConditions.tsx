import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSeo } from '@/context/SeoContext';
import { Separator } from '@/components/ui/separator';
import { Shield, FileText, Clock, AlertTriangle } from 'lucide-react';

const TermsConditions = () => {
  useSeo('terms-conditions');
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold">Terms & Conditions</h1>
          </div>
          <p className="text-xl md:text-2xl opacity-90">
            By using our services, you agree to these terms and conditions
          </p>
          <p className="text-sm mt-4 opacity-75">Last updated: January 2025</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Welcome to King Subscriptions. These Terms and Conditions ("Terms") govern your use of our website 
                and services. By accessing or using our services, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                King Subscriptions is a digital subscription service provider based in Pakistan, offering genuine 
                premium subscriptions for various digital platforms and services.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>1. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                King Subscriptions provides access to premium digital subscriptions including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>Streaming services (Netflix, Disney+, etc.)</li>
                <li>Professional software (Adobe Creative Cloud, Canva Pro, etc.)</li>
                <li>AI tools (ChatGPT Plus, Perplexity Pro, etc.)</li>
                <li>Educational platforms (Coursera, Udemy, etc.)</li>
                <li>Productivity tools (Microsoft Office, Google Workspace, etc.)</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300">
                All subscriptions are genuine and sourced from official providers.
              </p>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle>2. Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">2.1 Payment Methods</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We accept payments through:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                <li>JazzCash: 03207848018</li>
                <li>Easypaisa: 03207848018</li>
                <li>Bank Transfer: UBL Account 0962312905792 (Ahmad Rasheed)</li>
              </ul>
              
              <h3 className="font-semibold">2.2 Payment Process</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                <li>Payment must be made in full before service delivery</li>
                <li>Payment confirmation screenshot is required</li>
                <li>Services are delivered after payment verification</li>
              </ul>

              <h3 className="font-semibold">2.3 Pricing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                All prices are listed in Pakistani Rupees (PKR) and US Dollars (USD). Prices may change without prior notice.
              </p>
            </CardContent>
          </Card>

          {/* Delivery Policy */}
          <Card>
            <CardHeader>
              <CardTitle>3. Delivery Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">3.1 Delivery Timeline</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Digital subscriptions are delivered instantly after payment verification, typically within 1-24 hours.
              </p>
              
              <h3 className="font-semibold">3.2 Delivery Method</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Subscription details are delivered via WhatsApp to the number provided during purchase.
              </p>
              
              <h3 className="font-semibold">3.3 Account Information</h3>
              <p className="text-gray-600 dark:text-gray-300">
                You will receive login credentials or invitation links as applicable to the subscription purchased.
              </p>
            </CardContent>
          </Card>

          {/* Refund Policy */}
          <Card>
            <CardHeader>
              <CardTitle>4. Refund & Replacement Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Important Policy</h3>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  We offer replacement instead of refunds. This policy ensures continuous service availability.
                </p>
              </div>
              
              <h3 className="font-semibold">4.1 Replacement Guarantee</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                <li>Free replacement if subscription stops working within the purchased period</li>
                <li>Replacement must be requested within 7 days of the issue</li>
                <li>Multiple replacements provided if necessary</li>
              </ul>
              
              <h3 className="font-semibold">4.2 Refund Conditions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Refunds are only considered if we cannot provide a working replacement after multiple attempts.
              </p>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>5. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">5.1 Account Usage</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                <li>Use subscriptions only for personal purposes</li>
                <li>Do not share account credentials with unauthorized users</li>
                <li>Follow the terms of service of the original service provider</li>
                <li>Do not attempt to change account passwords or settings</li>
              </ul>
              
              <h3 className="font-semibold">5.2 Prohibited Activities</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                <li>Reselling or redistributing subscriptions</li>
                <li>Using subscriptions for commercial purposes</li>
                <li>Attempting to hack or modify accounts</li>
                <li>Violating intellectual property rights</li>
              </ul>
            </CardContent>
          </Card>

          {/* Warranty & Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>6. Warranty & Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">6.1 Service Warranty</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We guarantee that all subscriptions are genuine and will work as described at the time of delivery.
              </p>
              
              <h3 className="font-semibold">6.2 Limitations</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                <li>We are not responsible for changes made by original service providers</li>
                <li>Service availability depends on third-party providers</li>
                <li>We do not guarantee uninterrupted service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy & Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle>7. Privacy & Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Your privacy is important to us. We collect and use your information only as described in our Privacy Policy.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                <li>We do not store payment information</li>
                <li>Personal data is used only for service delivery</li>
                <li>We do not share customer information with third parties</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card>
            <CardHeader>
              <CardTitle>8. Contact & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold">8.1 Customer Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our customer support is available 24/7 via WhatsApp: +92 327 6847960
              </p>
              
              <h3 className="font-semibold">8.2 Response Time</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We aim to respond to all queries within 1-6 hours.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>9. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. 
                Continued use of our services constitutes acceptance of modified Terms.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>10. Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                These Terms are governed by the laws of Pakistan. Any disputes will be resolved in the courts of Lahore, Pakistan.
              </p>
            </CardContent>
          </Card>

          <Separator />
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>If you have any questions about these Terms & Conditions, please contact us:</p>
            <p className="mt-2">
              <strong>WhatsApp:</strong> +92 327 6847960 | 
              <strong> Email:</strong> kingsubscriptionoffical@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;