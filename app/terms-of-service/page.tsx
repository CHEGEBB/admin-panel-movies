import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - DjAfro StreamBox',
  description: 'Terms of Service for DjAfro StreamBox - User agreement and app usage terms',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
              <p className="text-blue-100">DjAfro StreamBox</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="prose max-w-none">
            <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-sm text-blue-800">
                <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Please read these Terms of Service carefully before using DjAfro StreamBox.
              </p>
            </div>

            {/* Agreement to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By downloading, installing, or using DjAfro StreamBox (&quot;the App&quot;, &quot;our Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use our Service.
              </p>
              <p className="text-gray-700">
                These Terms apply to all users of the App, including both free and premium subscribers.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h2>
              <p className="text-gray-700 mb-4">
                DjAfro StreamBox is a mobile application that provides access to DJ Afro&apos;s narrated movies and entertainment content. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Streaming access to curated movie content</li>
                <li>Free tier with advertisements</li>
                <li>Premium subscription with additional features</li>
                <li>Content recommendations and search functionality</li>
                <li>User account management and preferences</li>
              </ul>
            </section>

            {/* Account Requirements */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Requirements</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Eligibility</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You must be at least 13 years old to use our Service</li>
                <li>Users under 18 must have parental consent</li>
                <li>You must provide accurate account information</li>
                <li>One account per person</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Account Security</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You are responsible for maintaining account security</li>
                <li>Keep your login credentials confidential</li>
                <li>Notify us immediately of unauthorized access</li>
                <li>You are liable for all activities under your account</li>
              </ul>
            </section>

            {/* Subscription Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Terms</h2>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">🆓 Free Tier</h3>
                <ul className="text-green-700 space-y-1">
                  <li>• Unlimited streaming with advertisements</li>
                  <li>• Standard quality (720p) streaming</li>
                  <li>• Limited concurrent streams (1 device)</li>
                  <li>• Access to full movie catalog</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">💎 Premium Subscription</h3>
                <ul className="text-blue-700 space-y-1">
                  <li>• Ad-free streaming experience</li>
                  <li>• HD and 4K quality streaming</li>
                  <li>• Multiple device streaming (up to 3 devices)</li>
                  <li>• Download for offline viewing</li>
                  <li>• Early access to new content</li>
                  <li>• Enhanced AI recommendations</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Pricing & Billing</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Monthly:</strong> KSH 200 per month</li>
                <li><strong>Annual:</strong> KSH 1,800 per year (save 25%)</li>
                <li><strong>Weekly:</strong> KSH 60 per week</li>
                <li><strong>Student:</strong> KSH 150 per month (with valid student ID)</li>
                <li>Payments processed via M-Pesa or Stripe</li>
                <li>Automatic renewal unless cancelled</li>
                <li>No refunds for partial periods</li>
              </ul>
            </section>

            {/* Content Usage Rules */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Usage Rules</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Allowed</h3>
                  <ul className="text-green-700 space-y-2">
                    <li>• Personal, non-commercial viewing</li>
                    <li>• Streaming on authorized devices</li>
                    <li>• Download for offline viewing (Premium)</li>
                    <li>• Share recommendations with friends</li>
                    <li>• Rate and review content</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">❌ Prohibited</h3>
                  <ul className="text-red-700 space-y-2">
                    <li>• Recording or screen capturing content</li>
                    <li>• Sharing account credentials</li>
                    <li>• Commercial use or public display</li>
                    <li>• Reverse engineering the app</li>
                    <li>• Circumventing technical measures</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">
                  <strong>Important:</strong> Content is provided for personal entertainment only. All movies and content remain the property of their respective owners and licensors.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The DjAfro StreamBox app, including its design, functionality, and user interface, is owned by us and protected by intellectual property laws. The content available through our Service is owned by DJ Afro and respective content creators.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You may not copy, modify, or distribute the app</li>
                <li>Content is licensed for personal viewing only</li>
                <li>DJ Afro retains all rights to narrated content</li>
                <li>Trademarks and logos are protected properties</li>
              </ul>
            </section>

            {/* User Conduct */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Conduct</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Use the Service for illegal purposes</li>
                <li>Attempt to hack, disrupt, or damage the Service</li>
                <li>Create fake accounts or impersonate others</li>
                <li>Share inappropriate content in reviews or comments</li>
                <li>Abuse or harass other users or our support team</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Use automated tools to access the Service</li>
              </ul>
            </section>

            {/* Privacy and Data */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy and Data</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800">
                  📖 <strong>Read our full Privacy Policy:</strong> 
                  <a href="/privacy-policy" className="text-blue-600 underline ml-1">
                    /privacy-policy
                  </a>
                </p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 mb-4">Our Service integrates with third-party services:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Content Delivery:</strong> Bunny CDN, Dailymotion, YouTube</li>
                <li><strong>Payments:</strong> M-Pesa, Stripe payment processors</li>
                <li><strong>Advertising:</strong> Google AdMob (free users only)</li>
                <li><strong>Analytics:</strong> App performance and usage analytics</li>
                <li><strong>AI Features:</strong> Google Gemini for recommendations</li>
              </ul>
              <p className="text-gray-700 mt-4">
                These third-party services have their own terms and privacy policies. We are not responsible for their practices or content.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Disclaimers</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Availability</h3>
                  <p className="text-gray-700">
                    We strive for 99.9% uptime but cannot guarantee uninterrupted service. Maintenance, technical issues, or force majeure events may cause temporary unavailability.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Accuracy</h3>
                  <p className="text-gray-700">
                    While we curate quality content, we make no warranties about the accuracy, completeness, or suitability of any content for your purposes.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">&quot;As-Is&quot; Service</h3>
                  <p className="text-gray-700">
                    The Service is provided &quot;as-is&quot; without warranties of any kind, either express or implied, including but not limited to merchantability and fitness for a particular purpose.
                  </p>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, DjAfro StreamBox and its operators shall not be liable for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Service interruptions or technical difficulties</li>
                <li>Third-party content or services</li>
                <li>Unauthorized access to your account</li>
              </ul>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
                <p className="text-red-800">
                  <strong>Maximum Liability:</strong> Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Termination by You</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Cancel your subscription anytime through the app</li>
                <li>Delete your account and all associated data</li>
                <li>No refunds for unused subscription periods</li>
                <li>Access continues until subscription expires</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Termination by Us</h3>
              <p className="text-gray-700 mb-4">We may terminate or suspend your account if:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You violate these Terms of Service</li>
                <li>You engage in fraudulent activity</li>
                <li>You abuse the Service or other users</li>
                <li>Required by law or legal process</li>
                <li>We discontinue the Service</li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes through:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>In-app notifications</li>
                <li>Email notifications to registered users</li>
                <li>Updates on this page with new effective date</li>
                <li>Push notifications for significant changes</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-700">
                These Terms are governed by the laws of Kenya. Any disputes arising from these Terms or the Service shall be resolved in the courts of Kenya. If you are located outside Kenya, you agree to submit to the jurisdiction of Kenyan courts for any legal proceedings.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Legal Inquiries:</strong> legal@djafrostreambox.com</p>
                  <p><strong>General Support:</strong> support@djafrostreambox.com</p>
                  <p><strong>Business Address:</strong> Nairobi, Kenya</p>
                  <p><strong>Response Time:</strong> Within 48 hours for legal matters</p>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500 text-center">
                These Terms of Service are effective as of {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} and apply to all users of DjAfro StreamBox.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}