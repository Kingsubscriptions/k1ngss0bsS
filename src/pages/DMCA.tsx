import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSeo } from '@/context/SeoContext';
import { Shield, FileText, Mail, AlertTriangle } from 'lucide-react';

const DMCA: React.FC = () => {
  useSeo('dmca');
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">DMCA Policy</h1>
          <p className="text-muted-foreground">
            Digital Millennium Copyright Act Compliance
          </p>
          <p className="text-muted-foreground">
            Last updated: August 23, 2024
          </p>
        </div>

        <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
              <Shield className="mr-2 h-5 w-5" />
              Our Commitment to Copyright Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 dark:text-blue-300">
              King Subscription respects the intellectual property rights of others and expects our users to do the same. 
              We comply with the Digital Millennium Copyright Act (DMCA) and respond promptly to valid copyright infringement notices.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Copyright Infringement Claims
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you believe that your copyrighted work has been infringed upon on our platform, please provide us with a written notice containing the following information:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Required Information:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                    <li>Identification of the copyrighted work claimed to have been infringed</li>
                    <li>Identification of the infringing material and its location on our site</li>
                    <li>Your contact information (address, phone number, email)</li>
                    <li>A statement of good faith belief that the use is not authorized</li>
                    <li>A statement that the information is accurate and you are authorized to act</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                How to Submit a DMCA Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Designated Copyright Agent:</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-semibold">King Subscription DMCA Agent</p>
                  <p className="text-muted-foreground">Email: itxahmadjan@gmail.com</p>
                  <p className="text-muted-foreground">Subject Line: "DMCA Copyright Infringement Notice"</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Alternative Contact:</h4>
                <p className="text-muted-foreground">WhatsApp: +92 327 6847960 (Business hours only)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Notice Receipt</h4>
                    <p className="text-muted-foreground">We acknowledge receipt of your DMCA notice within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Review & Investigation</h4>
                    <p className="text-muted-foreground">We review the claim and investigate the alleged infringement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Action Taken</h4>
                    <p className="text-muted-foreground">If valid, we remove or disable access to the infringing content</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-semibold">Notification</h4>
                    <p className="text-muted-foreground">We notify the alleged infringer and provide counter-notice procedures</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Counter-Notification Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you believe your content was removed in error, you may submit a counter-notification including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Your physical or electronic signature</li>
                <li>Identification of the removed material and its former location</li>
                <li>A statement under penalty of perjury that removal was a mistake</li>
                <li>Your name, address, phone number, and consent to jurisdiction</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-700 dark:text-amber-400">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Important Legal Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-amber-700 dark:text-amber-300">
              <p>• False DMCA claims may result in legal liability</p>
              <p>• We may terminate accounts of repeat infringers</p>
              <p>• This policy applies to all content on our platform</p>
              <p>• We reserve the right to remove content at our discretion</p>
              <p>• Consult with legal counsel if you're unsure about filing a claim</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safe Harbor Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                King Subscription operates as a service provider under the safe harbor provisions of the DMCA. 
                We do not monitor or control user-generated content but respond promptly to valid infringement notices. 
                Our compliance with DMCA procedures protects both copyright holders and legitimate users of our platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DMCA;