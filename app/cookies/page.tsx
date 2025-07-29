import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-white to-[#e8f4f1] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-[#d4a574] to-[#8b7355] text-white">
            <CardTitle className="text-3xl font-bold">Cookie Policy</CardTitle>
            <p className="text-sm opacity-90">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">What Are Cookies?</h2>
              <p className="text-gray-700">
                Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                analyzing how you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-[#d4a574] pl-4">
                  <h3 className="text-lg font-semibold text-[#2d3e2d] mb-2">Essential Cookies</h3>
                  <p className="text-gray-700 mb-2">These cookies are necessary for our website to function properly:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Authentication and login sessions</li>
                    <li>Security and fraud prevention</li>
                    <li>Basic website functionality</li>
                    <li>Shopping cart and payment processing</li>
                  </ul>
                </div>

                <div className="border-l-4 border-[#8b7355] pl-4">
                  <h3 className="text-lg font-semibold text-[#2d3e2d] mb-2">Functional Cookies</h3>
                  <p className="text-gray-700 mb-2">These cookies enhance your experience by remembering your choices:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Language and region preferences</li>
                    <li>Theme and display settings</li>
                    <li>Recently used features</li>
                    <li>Accessibility settings</li>
                  </ul>
                </div>

                <div className="border-l-4 border-[#2d3e2d] pl-4">
                  <h3 className="text-lg font-semibold text-[#2d3e2d] mb-2">Analytics Cookies</h3>
                  <p className="text-gray-700 mb-2">These cookies help us understand how you use our platform:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Page views and navigation patterns</li>
                    <li>Feature usage statistics</li>
                    <li>Performance monitoring</li>
                    <li>Error tracking and debugging</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-semibold text-[#2d3e2d] mb-2">Marketing Cookies</h3>
                  <p className="text-gray-700 mb-2">These cookies help us deliver relevant content and advertisements:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Personalized content recommendations</li>
                    <li>Social media integration</li>
                    <li>Campaign effectiveness tracking</li>
                    <li>Interest-based advertising</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">Third-Party Cookies</h2>
              <div className="text-gray-700 space-y-3">
                <p>We may use services from third parties that set their own cookies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google Analytics:</strong> For website traffic analysis</li>
                  <li><strong>Authentication Providers:</strong> For Google, Facebook login</li>
                  <li><strong>Payment Processors:</strong> For secure payment handling</li>
                  <li><strong>CDN Services:</strong> For improved website performance</li>
                  <li><strong>Customer Support:</strong> For chat and help desk functionality</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">How We Use Cookies</h2>
              <div className="text-gray-700 space-y-3">
                <p>We use cookies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Keep you logged in to your account</li>
                  <li>Remember your preferences and settings</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Analyze website performance and user behavior</li>
                  <li>Prevent fraud and enhance security</li>
                  <li>Display relevant advertisements</li>
                  <li>Enable social media features</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">Managing Your Cookie Preferences</h2>
              <div className="text-gray-700 space-y-4">
                <div className="bg-[#f5f1e8] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#2d3e2d] mb-2">Browser Settings</h3>
                  <p>You can control cookies through your browser settings:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete existing cookies</li>
                    <li>Receive notifications when cookies are set</li>
                  </ul>
                </div>

                <div className="bg-[#e8f4f1] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#2d3e2d] mb-2">Platform Settings</h3>
                  <p>You can manage your cookie preferences in your account settings:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Analytics and performance cookies</li>
                    <li>Marketing and advertising cookies</li>
                    <li>Social media integration</li>
                    <li>Personalization features</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">Cookie Retention</h2>
              <div className="text-gray-700 space-y-3">
                <p>Different types of cookies are stored for different periods:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> Stored for a specific period (typically 30 days to 2 years)</li>
                  <li><strong>Authentication Cookies:</strong> Remain until you log out or expire</li>
                  <li><strong>Preference Cookies:</strong> Stored until you change them or clear your browser</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">Impact of Disabling Cookies</h2>
              <div className="text-gray-700 space-y-3">
                <p>Disabling cookies may affect your experience:</p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <ul className="list-disc pl-6 space-y-1">
                    <li>You may need to log in repeatedly</li>
                    <li>Your preferences won't be saved</li>
                    <li>Some features may not work properly</li>
                    <li>Content may not be personalized</li>
                    <li>Performance may be reduced</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy to reflect changes in our practices or for legal, 
                operational, or regulatory reasons. We will notify you of significant changes through 
                our platform or via email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">Contact Us</h2>
              <div className="text-gray-700">
                <p>If you have questions about our use of cookies, please contact us:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Email: privacy@aimagica.com</li>
                  <li>Contact Form: Available in our Help Center</li>
                </ul>
              </div>
            </section>

            <section className="bg-[#f5f1e8] p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#2d3e2d] mb-3">Your Consent</h2>
              <p className="text-gray-700">
                By continuing to use our website, you consent to our use of cookies as described in this policy. 
                You can withdraw your consent at any time by adjusting your browser settings or contacting us.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 