import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Safety - DjAfro StreamBox',
  description: 'Data Safety information for DjAfro StreamBox - How we protect your data',
}

export default function DataSafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Data Safety</h1>
              <p className="text-green-100">DjAfro StreamBox</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <div className="prose max-w-none">
            <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-400 rounded">
              <p className="text-sm text-green-800">
                <strong>Your data safety is our priority.</strong> This page outlines how DjAfro StreamBox collects, uses, and protects your personal information.
              </p>
            </div>

            {/* Data Collection Overview */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Collection Overview</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">✅</span>
                    <h3 className="text-lg font-semibold text-blue-800">We Collect</h3>
                  </div>
                  <ul className="text-blue-700 space-y-2">
                    <li>• Email address for account creation</li>
                    <li>• Display name (your choice)</li>
                    <li>• Phone number (for payments only)</li>
                    <li>• Movie viewing preferences</li>
                    <li>• App usage analytics</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">❌</span>
                    <h3 className="text-lg font-semibold text-red-800">We Don&apos;t Collect</h3>
                  </div>
                  <ul className="text-red-700 space-y-2">
                    <li>• Contacts or address book</li>
                    <li>• Location data</li>
                    <li>• Camera or microphone access</li>
                    <li>• SMS or call logs</li>
                    <li>• Files outside our app folder</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Detailed Data Types */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Types We Collect</h2>
              
              {/* Personal Info */}
              <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="text-blue-600 mr-2">👤</span>
                    Personal Information
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Account Data</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Email address</li>
                        <li>• Display name</li>
                        <li>• Profile preferences</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Payment Data</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Phone number (M-Pesa)</li>
                        <li>• Subscription status</li>
                        <li>• Payment history</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Purpose</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Account management</li>
                        <li>• Payment processing</li>
                        <li>• Customer support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Activity */}
              <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="text-purple-600 mr-2">📱</span>
                    App Activity
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Viewing Data</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Movies watched</li>
                        <li>• Watch duration</li>
                        <li>• Viewing history</li>
                        <li>• Favorites & watchlist</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Usage Patterns</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Search queries</li>
                        <li>• App interactions</li>
                        <li>• Feature usage</li>
                        <li>• Time spent in app</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Purpose</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Personalized recommendations</li>
                        <li>• Improve user experience</li>
                        <li>• Content optimization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Info */}
              <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="text-green-600 mr-2">📊</span>
                    App Performance
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Technical Data</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Device type & OS</li>
                        <li>• App version</li>
                        <li>• Network connectivity</li>
                        <li>• Performance metrics</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Diagnostics</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Crash reports</li>
                        <li>• Error logs</li>
                        <li>• Performance issues</li>
                        <li>• Feature usage stats</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Purpose</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Bug fixes</li>
                        <li>• Performance optimization</li>
                        <li>• Feature improvements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security Measures */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Measures</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <span className="mr-2">🔐</span>
                    Data Protection
                  </h3>
                  <ul className="text-green-700 space-y-2">
                    <li>• End-to-end encryption</li>
                    <li>• Secure data transmission (HTTPS)</li>
                    <li>• Encrypted data storage</li>
                    <li>• Regular security audits</li>
                    <li>• Access control mechanisms</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <span className="mr-2">🛡️</span>
                    Privacy Controls
                  </h3>
                  <ul className="text-blue-700 space-y-2">
                    <li>• Data anonymization</li>
                    <li>• Opt-out of data collection</li>
                    <li>• Account deletion options</li>
                    <li>• Data export capabilities</li>
                    <li>• Minimal data retention</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Third Party Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Data Sharing</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Service Providers</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Limited Sharing</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Partners</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Appwrite (Backend services)</li>
                        <li>• M-Pesa/Stripe (Payments)</li>
                        <li>• Google AdMob (Advertising)</li>
                        <li>• Content delivery networks</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Data Shared</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Account information (minimal)</li>
                        <li>• Payment processing data</li>
                        <li>• Anonymized usage analytics</li>
                        <li>• Technical diagnostics</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">No Data Selling</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Protected</span>
                  </div>
                  <p className="text-gray-600">
                    We <strong>never sell</strong> your personal data to third parties. Any data sharing is strictly limited to essential service providers and is governed by strict data protection agreements.
                  </p>
                </div>
              </div>
            </section>

            {/* User Controls */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Data Controls</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">In-App Controls</h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-green-600 mr-3">✓</span>
                      <span className="text-gray-700">Delete account and all data</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-green-600 mr-3">✓</span>
                      <span className="text-gray-700">Export your data</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-green-600 mr-3">✓</span>
                      <span className="text-gray-700">Opt out of personalized ads</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-green-600 mr-3">✓</span>
                      <span className="text-gray-700">Clear viewing history</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Contact Options</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-blue-800 mb-3">
                      <strong>Data Protection Officer</strong>
                    </p>
                    <div className="space-y-2 text-blue-700">
                      <p>📧 privacy@djafrostreambox.com</p>
                      <p>📧 support@djafrostreambox.com</p>
                      <p>⏱️ Response within 48 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance & Standards</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-3xl mb-2 block">🇪🇺</span>
                  <h3 className="font-semibold text-purple-800 mb-2">GDPR</h3>
                  <p className="text-purple-600 text-sm">EU data protection compliance</p>
                </div>
                <div className="text-center p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                  <span className="text-3xl mb-2 block">🇺🇸</span>
                  <h3 className="font-semibold text-indigo-800 mb-2">CCPA</h3>
                  <p className="text-indigo-600 text-sm">California privacy rights</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-3xl mb-2 block">🔒</span>
                  <h3 className="font-semibold text-green-800 mb-2">SOC 2</h3>
                  <p className="text-green-600 text-sm">Security standards</p>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Questions about data safety?</strong> Contact our privacy team at privacy@djafrostreambox.com. We&apos;re committed to transparency and protecting your privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}