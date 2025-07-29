import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-white to-[#e8f4f1] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-[#d4a574] to-[#8b7355] text-white">
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            <p className="text-sm opacity-90">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using Aimagica's AI image generation platform, you accept and agree to be bound by 
                these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">2. Description of Service</h2>
              <div className="text-gray-700 space-y-3">
                <p>Aimagica provides AI-powered image generation services that allow users to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Generate images from text prompts using various AI models</li>
                  <li>Edit and enhance images using AI tools</li>
                  <li>Share and discover content in our community gallery</li>
                  <li>Access premium features through subscription plans</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">3. User Accounts</h2>
              <div className="text-gray-700 space-y-3">
                <p>To access certain features, you must create an account. You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly update any changes to your information</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of unauthorized use</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">4. Acceptable Use Policy</h2>
              <div className="text-gray-700 space-y-3">
                <p>You agree NOT to use our service to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Generate illegal, harmful, or offensive content</li>
                  <li>Create content that violates intellectual property rights</li>
                  <li>Generate images of real people without consent</li>
                  <li>Create content for spam, harassment, or malicious purposes</li>
                  <li>Attempt to reverse engineer or exploit our AI models</li>
                  <li>Share or distribute content that violates laws or regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">5. Content Ownership and License</h2>
              <div className="text-gray-700 space-y-3">
                <h3 className="text-lg font-semibold text-[#2d3e2d]">Your Content</h3>
                <p>You retain ownership of content you create, but grant us a license to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Store and process your content to provide our services</li>
                  <li>Display publicly shared content in our gallery</li>
                  <li>Use aggregated, anonymized data to improve our services</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-[#2d3e2d] mt-4">Generated Images</h3>
                <p>AI-generated images are subject to these conditions:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may use generated images for personal and commercial purposes</li>
                  <li>We cannot guarantee uniqueness of AI-generated content</li>
                  <li>Similar images may be generated for other users</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">6. Payment and Subscriptions</h2>
              <div className="text-gray-700 space-y-3">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscription fees are billed in advance and are non-refundable</li>
                  <li>We may change pricing with 30 days notice</li>
                  <li>You can cancel your subscription at any time</li>
                  <li>Access continues until the end of your billing period</li>
                  <li>All payments are processed securely through third-party providers</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">7. Intellectual Property</h2>
              <div className="text-gray-700 space-y-3">
                <p>Our platform, including software, algorithms, and design, is protected by intellectual property laws. You may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Copy, modify, or distribute our proprietary technology</li>
                  <li>Create derivative works based on our platform</li>
                  <li>Remove or modify copyright or trademark notices</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                use, and protect your information. By using our service, you consent to our privacy practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">9. Service Availability</h2>
              <div className="text-gray-700 space-y-3">
                <p>We strive to provide reliable service, but cannot guarantee:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>100% uptime or uninterrupted access</li>
                  <li>Immediate processing of all requests</li>
                  <li>Availability of all features at all times</li>
                  <li>Compatibility with all devices or browsers</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-700">
                To the fullest extent permitted by law, Aimagica shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including lost profits, data, or goodwill.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">11. Termination</h2>
              <div className="text-gray-700 space-y-3">
                <p>We may terminate or suspend your account if you:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate these terms or our policies</li>
                  <li>Engage in harmful or illegal activities</li>
                  <li>Fail to pay applicable fees</li>
                </ul>
                <p>You may terminate your account at any time through your account settings.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these terms from time to time. Significant changes will be communicated through 
                our platform or via email. Continued use of our service constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">13. Contact Information</h2>
              <div className="text-gray-700">
                <p>For questions about these terms, please contact us:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Email: legal@aimagica.com</li>
                  <li>Contact Form: Available in our Help Center</li>
                </ul>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 