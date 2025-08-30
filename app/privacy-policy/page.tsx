import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - DjAfro StreamBox',
  description: 'Privacy Policy for DjAfro StreamBox - Your privacy matters to us',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-red-600">DJ</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">DjAfro StreamBox</h1>
              <p className="text-red-100">Privacy Policy</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="prose max-w-none">
            <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-sm text-blue-800">
                <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to DjAfro StreamBox (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our mobile application and related services 
                (collectively, the &quot;Service&quot;).
              </p>
              <p className="text-gray-700">
                By using our Service, you agree to the collection and use of information in accordance with this policy. 
                We are committed to protecting your privacy and ensuring you have a positive experience on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Email address (for account creation and login)</li>
                <li>Display name (chosen by you)</li>
                <li>Phone number (for M-Pesa payments in Kenya)</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Usage Information</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Movies watched and viewing history</li>
                <li>Search queries and app interactions</li>
                <li>Device information (type, operating system, app version)</li>
                <li>App usage patterns and preferences</li>
                <li>Watch time and viewing completion rates</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Technical Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>IP address (anonymized)</li>
                <li>Device identifiers</li>
                <li>App performance and crash reports</li>
                <li>Network connectivity information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide and maintain our streaming service</li>
                <li>Process payments and manage subscriptions</li>
                <li>Personalize your movie recommendations using AI</li>
                <li>Send notifications about new content and app updates</li>
                <li>Improve app performance and user experience</li>
                <li>Provide customer support</li>
                <li>Analyze usage patterns to enhance our service</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> Appwrite (backend services), payment processors (M-Pesa, Stripe), advertising networks (AdMob)</li>
                <li><strong>AI Services:</strong> Google Gemini for personalized recommendations (anonymized data only)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Video Content</h3>
              <p className="text-gray-700 mb-4">
                Our app streams content from Bunny CDN, Dailymotion, and YouTube. These services may collect information 
                according to their own privacy policies.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Advertising</h3>
              <p className="text-gray-700 mb-4">
                Free users will see ads provided by Google AdMob. AdMob may collect and use data for ad personalization. 
                You can opt out of personalized ads in your device settings.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Analytics</h3>
              <p className="text-gray-700">
                We use analytics to understand app usage and improve our service. All analytics data is anonymized and aggregated.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication through Appwrite</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal data by our team</li>
                <li>Secure payment processing through certified providers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a structured format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, contact us at privacy@djafrostreambox.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Children&apos;s Privacy</h2>
              <p className="text-gray-700">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13. If you are a parent or guardian and believe your child has provided 
                us with personal information, please contact us so we can delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">International Users</h2>
              <p className="text-gray-700">
                If you are accessing our Service from outside Kenya, please be aware that your information may be 
                transferred to, stored, and processed in Kenya and other countries where our service providers operate. 
                By using our Service, you consent to such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this 
                Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong>chegephil24@gmail.com</p>
                  <p><strong>Support:</strong> chegephil24@gmail.com</p>
                  <p><strong>Address:</strong> Nairobi, Kenya</p>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500 text-center">
                This privacy policy is effective as of {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} and applies to all users of DjAfro StreamBox.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}