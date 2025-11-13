import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSeo } from '@/context/SeoContext';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CreditCard, Smartphone, Building } from 'lucide-react';

const Contact = () => {
  useSeo('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // WhatsApp integration
    const whatsappMessage = `Hello! I'm ${formData.name}. Email: ${formData.email}. Message: ${formData.message}`;
    const whatsappURL = `https://wa.me/923276847960?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Get in touch with us for any questions about our premium digital subscriptions. We're here to help you 24/7!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-600">WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">+92 327 6847960</p>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => window.open('https://wa.me/923276847960', '_blank')}
              >
                Chat Now
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-blue-600">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">kingsubscriptionoffical@gmail.com</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-purple-600">Office Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">Amanah Mall Office 705, Lahore, Pakistan</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-600">Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">24/7 Available on WhatsApp</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* About Section */}
          <div>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl mb-4">About King Subscriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  King Subscriptions is Pakistan's leading provider of premium digital subscriptions at unbeatable prices. 
                  We specialize in delivering genuine subscriptions for popular services like Netflix, Canva Pro, ChatGPT, 
                  Adobe Creative Cloud, and many more.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  With thousands of satisfied customers across Pakistan, we pride ourselves on instant delivery, 
                  100% genuine products, and exceptional customer support. Our team is available 24/7 to assist you 
                  with any questions or concerns.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Trust King Subscriptions for all your digital subscription needs and join our growing community of happy customers!
                </p>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-2xl">Payment Methods & How to Pay</CardTitle>
                </div>
                <CardDescription>
                  We accept multiple secure payment methods. Choose the one that works best for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mobile Banking */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Mobile Banking (JazzCash & EasyPaisa)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="font-medium text-blue-800 dark:text-blue-200">JazzCash</p>
                      <p className="text-gray-600 dark:text-gray-300 font-mono">0300-784-8018</p>
                      <p className="text-xs text-gray-500 mt-1">Account Name: Ahmad Rasheed</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="font-medium text-green-800 dark:text-green-200">EasyPaisa</p>
                      <p className="text-gray-600 dark:text-gray-300 font-mono">0345-784-8018</p>
                      <p className="text-xs text-gray-500 mt-1">Account Name: Ahmad Rasheed</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-medium mb-1">How to pay via Mobile Banking:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Open your JazzCash or EasyPaisa app</li>
                      <li>Select "Money Transfer" or "Send Money"</li>
                      <li>Enter the account number shown above</li>
                      <li>Enter the exact amount for your subscription</li>
                      <li>Complete the transaction and save the receipt</li>
                    </ol>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Bank Transfer (UBL)</h3>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><span className="font-medium">Bank Name:</span> United Bank Limited (UBL)</p>
                        <p><span className="font-medium">Account Number:</span> <span className="font-mono">0962-3129-05792</span></p>
                      </div>
                      <div>
                        <p><span className="font-medium">Account Title:</span> Ahmad Rasheed</p>
                        <p><span className="font-medium">IBAN:</span> <span className="font-mono">PK12UBLL0000000000000000</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-medium mb-1">How to pay via Bank Transfer:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                      <li>Login to your online banking app or visit your bank</li>
                      <li>Select "Fund Transfer" or "Inter Bank Transfer"</li>
                      <li>Enter UBL bank details as shown above</li>
                      <li>Enter the exact amount for your subscription</li>
                      <li>Add payment reference: "King Subs - [Your Name]"</li>
                      <li>Complete the transfer and save the transaction ID</li>
                    </ol>
                  </div>
                </div>

                {/* International Payments */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">International Payments</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="font-medium text-green-800 dark:text-green-200">PayPal</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Send to: kingsubscriptionoffical@gmail.com</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                      <p className="font-medium text-orange-800 dark:text-orange-200">Credit/Debit Cards</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Visa, MasterCard, American Express accepted</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <p className="font-medium text-red-800 dark:text-red-200">Cryptocurrency (Bitcoin)</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Contact us for wallet address</p>
                    </div>
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">Complete Payment Process</h4>
                  <ol className="text-sm space-y-2 text-blue-700 dark:text-blue-300">
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                      <span>Choose your preferred payment method from the options above</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                      <span>Transfer the exact amount to any of the accounts shown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                      <span>Take a clear screenshot or photo of the payment confirmation/receipt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                      <span>Send the payment proof via WhatsApp (+92 327 6847960) with your order details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
                      <span>Receive your subscription credentials instantly after verification</span>
                    </li>
                  </ol>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">⚠️ Important Payment Notes</h4>
                  <ul className="text-sm space-y-1 text-yellow-700 dark:text-yellow-300">
                    <li>• Always send payment proof via WhatsApp for instant processing</li>
                    <li>• Include your full name and subscription details in the message</li>
                    <li>• Payments are verified within 1-5 minutes during business hours</li>
                    <li>• All transactions are secure and monitored for your protection</li>
                    <li>• No hidden fees - pay exactly what's shown on the website</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form and FAQ */}
          <div className="space-y-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Get In Touch</CardTitle>
                <CardDescription>Send us a message and we'll respond as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Textarea
                      name="message"
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
                    <Send className="w-4 h-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">How quickly will I receive my subscription?</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    All digital subscriptions are delivered instantly after payment confirmation via WhatsApp.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Are the subscriptions genuine?</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Yes, all our subscriptions are 100% genuine and sourced directly from official providers.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What if my subscription stops working?</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    We provide free replacement guarantee. Contact us on WhatsApp and we will resolve it immediately.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    We offer replacement instead of refunds. If we cannot provide a working replacement, we will discuss refund options.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Can I change my subscription plan later?</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Yes, you can upgrade or change your plan. Contact us on WhatsApp for assistance.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Is my payment information secure?</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Yes, we use secure payment methods and never store your payment information.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Still have questions? We're here to help!</p>
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => window.open('https://wa.me/923276847960', '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
