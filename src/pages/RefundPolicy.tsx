import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSeo } from '@/context/SeoContext';
import { RefreshCw, Clock, Shield, AlertCircle } from 'lucide-react';

const RefundPolicy: React.FC = () => {
  useSeo('refund-policy');
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground">
            Last updated: August 23, 2024
          </p>
        </div>

        <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700 dark:text-green-400">
              <Shield className="mr-2 h-5 w-5" />
              7-Day Money Back Guarantee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300">
              We stand behind our services with a 100% satisfaction guarantee. If you're not completely satisfied 
              with your purchase, you can request a full refund within 7 days of your order.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="mr-2 h-5 w-5" />
                Refund Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-green-600">Eligible for Full Refund:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Account credentials don't work as promised</li>
                  <li>Service is not delivered within 24 hours</li>
                  <li>Product doesn't match the description</li>
                  <li>Technical issues that cannot be resolved</li>
                  <li>Any other legitimate service-related concern</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-amber-600">Partial Refund Scenarios:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Request made after 7 days but within 30 days</li>
                  <li>Account was used but became non-functional</li>
                  <li>Downgrade to a different subscription tier</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Refund Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Request Refund (0-7 days)</h4>
                    <p className="text-muted-foreground">Contact us via WhatsApp or email within 7 days of purchase</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Review Process (1-2 days)</h4>
                    <p className="text-muted-foreground">We'll review your case and respond within 48 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Refund Processing (3-7 days)</h4>
                    <p className="text-muted-foreground">Once approved, refunds are processed within 3-7 business days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Request a Refund</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Via WhatsApp (Fastest):</h4>
                <p className="text-muted-foreground">Message us at +92 327 6847960 with your order details</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Via Email:</h4>
                <p className="text-muted-foreground">Send your refund request to itxahmadjan@gmail.com</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Information to Include:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Order number or transaction ID</li>
                  <li>Reason for refund request</li>
                  <li>Screenshots of any issues (if applicable)</li>
                  <li>Your contact information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-700 dark:text-amber-400">
                <AlertCircle className="mr-2 h-5 w-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-amber-700 dark:text-amber-300">
              <p>• Refunds are processed to the original payment method</p>
              <p>• Account access will be revoked upon refund approval</p>
              <p>• Refund requests after 30 days are not eligible</p>
              <p>• We reserve the right to refuse refunds for fraudulent requests</p>
              <p>• Processing times may vary depending on your payment provider</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alternative Solutions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Before requesting a refund, consider these alternatives:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Account replacement (if the current one has issues)</li>
                <li>Credit for future purchases</li>
                <li>Upgrade to a different service</li>
                <li>Technical support to resolve issues</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;