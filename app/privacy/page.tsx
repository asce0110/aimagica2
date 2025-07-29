import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-white to-[#e8f4f1] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-[#d4a574] to-[#8b7355] text-white">
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-sm opacity-90">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">1. Information We Collect</h2>
              <div className="space-y-3 text-gray-700">
                <h3 className="text-lg font-semibold text-[#2d3e2d]">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email address and name when you create an account</li>
                  <li>Authentication information from third-party providers (Google, etc.)</li>
                  <li>Payment information when you purchase premium features</li>
                  <li>Profile information you choose to provide</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-[#2d3e2d] mt-4">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Images you generate, upload, or edit using our platform</li>
                  <li>Prompts and descriptions you provide for image generation</li>
                  <li>Usage patterns and preferences</li>
                  <li>Technical information such as IP address, browser type, and device information</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To provide and improve our AI image generation services</li>
                <li>To process payments and manage your account</li>
                <li>To communicate with you about our services</li>
                <li>To ensure platform security and prevent misuse</li>
                <li>To analyze usage patterns and improve our algorithms</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">3. Information Sharing</h2>
              <div className="text-gray-700 space-y-3">
                <p>We do not sell your personal information. We may share information in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Providers:</strong> With trusted third-party providers who help us operate our platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                  <li><strong>Public Content:</strong> Images you choose to make public in our gallery</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">4. Data Security</h2>
              <div className="text-gray-700 space-y-3">
                <p>We implement industry-standard security measures to protect your information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication systems</li>
                  <li>Secure cloud infrastructure</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">5. Your Rights</h2>
              <div className="text-gray-700 space-y-3">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request transfer of your data</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">6. Cookies and Tracking</h2>
              <div className="text-gray-700 space-y-3">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate your account</li>
                  <li>Analyze website traffic and usage</li>
                  <li>Provide personalized content</li>
                </ul>
                <p>You can control cookies through your browser settings.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">7. Data Retention</h2>
              <p className="text-gray-700">
                We retain your information for as long as necessary to provide our services and comply with legal obligations. 
                Generated images are stored according to your account settings and may be deleted upon request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">8. International Transfers</h2>
              <p className="text-gray-700">
                Your information may be processed in countries other than your own. We ensure appropriate safeguards 
                are in place to protect your information during such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of significant changes 
                through our platform or via email.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d3e2d] mb-4">10. Contact Us</h2>
              <div className="text-gray-700">
                <p>If you have questions about this privacy policy, please contact us:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Email: privacy@aimagica.com</li>
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