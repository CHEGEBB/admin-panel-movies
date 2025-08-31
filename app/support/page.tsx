import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support & Help - DjAfro StreamBox',
  description: 'Get help and support for DjAfro StreamBox - FAQ, contact info, and troubleshooting',
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-purple-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎧</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Support & Help</h1>
              <p className="text-purple-100">DjAfro StreamBox</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {/* Quick Help Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Help</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                <span className="text-3xl mb-2 block">🎬</span>
                <h3 className="font-semibold text-blue-800 mb-1">Streaming Issues</h3>
                <p className="text-blue-600 text-sm">Buffering, quality, playback</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <span className="text-3xl mb-2 block">💳</span>
                <h3 className="font-semibold text-green-800 mb-1">Payment Help</h3>
                <p className="text-green-600 text-sm">M-Pesa, subscriptions, billing</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                <span className="text-3xl mb-2 block">👤</span>
                <h3 className="font-semibold text-purple-800 mb-1">Account Issues</h3>
                <p className="text-purple-600 text-sm">Login, profile, settings</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                <span className="text-3xl mb-2 block">📱</span>
                <h3 className="font-semibold text-red-800 mb-1">Technical Problems</h3>
                <p className="text-red-600 text-sm">App crashes, bugs, updates</p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {/* General Questions */}
              <div className="border border-gray-200 rounded-lg">
                <button className="w-full text-left px-6 py-4 font-semibold text-gray-800 bg-gray-50 border-b border-gray-200">
                  🔧 General Questions
                </button>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What is DjAfro StreamBox?</h4>
                    <p className="text-gray-600">
                      DjAfro StreamBox is a streaming app featuring DJ Afro&apos;s narrated movies. We offer both free streaming with ads and premium subscriptions with additional features like downloads and HD quality.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Is the app free to use?</h4>
                    <p className="text-gray-600">
                      Yes! You can stream unlimited movies for free with advertisements. Premium subscriptions (starting at KSH 200/month) remove ads and add features like downloads and HD streaming.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Which devices are supported?</h4>
                    <p className="text-gray-600">
                      DjAfro StreamBox works on Android phones, tablets, smart TVs, and web browsers. We&apos;re working on iOS support coming soon!
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription & Payment */}
              <div className="border border-gray-200 rounded-lg">
                <button className="w-full text-left px-6 py-4 font-semibold text-gray-800 bg-gray-50 border-b border-gray-200">
                  💎 Subscription & Payment
                </button>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How much does Premium cost?</h4>
                    <p className="text-gray-600 mb-2">Our Kenya-friendly pricing:</p>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• Monthly: KSH 200</li>
                      <li>• Annual: KSH 1,800 (save 25%)</li>
                      <li>• Weekly: KSH 60</li>
                      <li>• Student: KSH 150 (with valid ID)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How do I pay with M-Pesa?</h4>
                    <p className="text-gray-600">
                      Select M-Pesa payment, enter your phone number, and approve the STK push on your phone. Payment is processed instantly and your premium features activate immediately.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Can I cancel anytime?</h4>
                    <p className="text-gray-600">
                      Yes! Cancel anytime through the app settings. You&apos;ll keep premium access until your current billing period ends, with no additional charges.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Do you offer refunds?</h4>
                    <p className="text-gray-600">
                      We don&apos;t offer refunds for partial periods, but you can cancel anytime to avoid future charges. Contact support if you have billing issues.
                    </p>
                  </div>
                </div>
              </div>

              {/* Streaming & Technical */}
              <div className="border border-gray-200 rounded-lg">
                <button className="w-full text-left px-6 py-4 font-semibold text-gray-800 bg-gray-50 border-b border-gray-200">
                  🎬 Streaming & Technical
                </button>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Why is my video buffering?</h4>
                    <p className="text-gray-600">
                      Buffering is usually due to slow internet. Try lowering video quality in settings, closing other apps using internet, or switching to a faster Wi-Fi connection.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Can I download movies for offline viewing?</h4>
                    <p className="text-gray-600">
                      Yes, but only with a Premium subscription. Downloaded movies are stored securely on your device and can be watched without internet for 30 days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">What video qualities are available?</h4>
                    <p className="text-gray-600">
                      Free users get standard quality (720p). Premium subscribers enjoy HD (1080p) and select 4K content, plus the ability to choose quality manually.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">The app keeps crashing, what should I do?</h4>
                    <p className="text-gray-600">
                      Try restarting the app, updating to the latest version, clearing app cache, or restarting your device. If problems persist, contact our support team.
                    </p>
                  </div>
                </div>
              </div>

              {/* Account & Features */}
              <div className="border border-gray-200 rounded-lg">
                <button className="w-full text-left px-6 py-4 font-semibold text-gray-800 bg-gray-50 border-b border-gray-200">
                  👤 Account & Features
                </button>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">I forgot my password, how do I reset it?</h4>
                    <p className="text-gray-600">
                      On the login screen, tap &quot;Forgot Password&quot; and enter your email. We&apos;ll send you a secure reset link to create a new password.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Can I use my account on multiple devices?</h4>
                    <p className="text-gray-600">
                      Free users can stream on 1 device. Premium subscribers can stream on up to 3 devices simultaneously and sync their watchlist across all devices.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">How do I delete my account?</h4>
                    <p className="text-gray-600">
                      Go to Profile {'>'} Settings {'>'} Account {'>'} Delete Account. This permanently removes all your data, including watchlist, favorites, and viewing history.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Why am I not getting personalized recommendations?</h4>
                    <p className="text-gray-600">
                      Our AI needs to learn your preferences. Watch a few movies, rate them, and add some to your favorites. Recommendations improve over time!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting Guide */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Troubleshooting Guide</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">🔧 Common Fixes</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">App Won&apos;t Start</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Restart your device</li>
                      <li>2. Update the app from Play Store</li>
                      <li>3. Clear app cache and data</li>
                      <li>4. Reinstall the app</li>
                    </ol>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Video Won&apos;t Play</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Check your internet connection</li>
                      <li>2. Try a different movie</li>
                      <li>3. Lower video quality in settings</li>
                      <li>4. Switch between Wi-Fi and mobile data</li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Login Issues</h4>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Double-check email and password</li>
                      <li>2. Use &quot;Forgot Password&quot; if needed</li>
                      <li>3. Clear app data and try again</li>
                      <li>4. Contact support if account locked</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">📊 System Requirements</h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-3">Minimum Requirements</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Android 6.0 or higher</li>
                    <li>• 2GB RAM minimum</li>
                    <li>• 100MB free storage</li>
                    <li>• Stable internet connection</li>
                    <li>• 1 Mbps for 720p streaming</li>
                    <li>• 3 Mbps for 1080p streaming</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">Recommended</h4>
                  <ul className="text-green-700 space-y-1">
                    <li>• Android 8.0 or higher</li>
                    <li>• 4GB RAM or more</li>
                    <li>• 1GB free storage (for downloads)</li>
                    <li>• Wi-Fi connection</li>
                    <li>• 5 Mbps for best experience</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Support */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">📧 Email Support</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-purple-700">General Support</p>
                    <p className="text-purple-600">support@djafrostreambox.com</p>
                    <p className="text-sm text-purple-500">Response within 24 hours</p>
                  </div>
                  <div>
                    <p className="font-medium text-purple-700">Technical Issues</p>
                    <p className="text-purple-600">tech@djafrostreambox.com</p>
                    <p className="text-sm text-purple-500">Response within 12 hours</p>
                  </div>
                  <div>
                    <p className="font-medium text-purple-700">Billing & Payments</p>
                    <p className="text-purple-600">billing@djafrostreambox.com</p>
                    <p className="text-sm text-purple-500">Response within 6 hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4">📱 Other Ways to Reach Us</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-green-700">WhatsApp Support</p>
                    <p className="text-green-600">+254796562713</p>
                    <p className="text-sm text-green-500">Monday-Friday, 9 AM - 6 PM</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-700">Social Media</p>
                    <p className="text-green-600">email-chegephil24@gmail.com</p>
                    <p className="text-sm text-green-500">Twitter, Facebook, Instagram</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-700">In-App Support</p>
                    <p className="text-green-600">Profile {'>'} Help & Support</p>
                    <p className="text-sm text-green-500">Live chat available</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* When Contacting Support */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">When Contacting Support</h2>
            
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">📝 Please Include This Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-yellow-700 mb-2">Account Information</h4>
                  <ul className="text-yellow-600 space-y-1">
                    <li>• Your registered email address</li>
                    <li>• Subscription status (Free/Premium)</li>
                    <li>• Approximate account creation date</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-700 mb-2">Technical Details</h4>
                  <ul className="text-yellow-600 space-y-1">
                    <li>• Device model and Android version</li>
                    <li>• App version (found in Settings)</li>
                    <li>• Description of the problem</li>
                    <li>• Steps you&apos;ve already tried</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Requests */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature Requests & Feedback</h2>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">💡 Help Us Improve</h3>
              <p className="text-blue-700 mb-4">
                We love hearing from our users! Your feedback helps us make DjAfro StreamBox better for everyone.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Ways to Share Feedback</h4>
                  <ul className="text-blue-600 space-y-1">
                    <li>• In-app rating and reviews</li>
                    <li>• Email: feedback@djafrostreambox.com</li>
                    <li>• Social media mentions</li>
                    <li>• User surveys (when available)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Popular Feature Requests</h4>
                  <ul className="text-blue-600 space-y-1">
                    <li>• iOS app (coming soon!)</li>
                    <li>• Subtitle options</li>
                    <li>• Playlist creation</li>
                    <li>• Social sharing features</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Status Page */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Status</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <span className="text-2xl mb-2 block">✅</span>
                <h3 className="font-semibold text-green-800 mb-1">Streaming Service</h3>
                <p className="text-green-600 text-sm">Operational</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <span className="text-2xl mb-2 block">✅</span>
                <h3 className="font-semibold text-green-800 mb-1">Payment System</h3>
                <p className="text-green-600 text-sm">Operational</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                <span className="text-2xl mb-2 block">✅</span>
                <h3 className="font-semibold text-green-800 mb-1">User Accounts</h3>
                <p className="text-green-600 text-sm">Operational</p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Check real-time status at 
                <span className="text-blue-600 font-medium"> status.djafrostreambox.com</span>
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Still need help? Our support team is here for you 24/7.
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Contact Support
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors">
                  Browse FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}