import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Users, Rocket, Heart, Star } from "lucide-react"

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-white to-[#e8f4f1] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-xl mb-8">
          <CardHeader className="text-center bg-gradient-to-r from-[#d4a574] to-[#8b7355] text-white">
            <CardTitle className="text-4xl font-bold mb-2">About Aimagica</CardTitle>
            <p className="text-lg opacity-90">Bringing Your Imagination to Life with AI</p>
          </CardHeader>
          
          <CardContent className="p-8 text-center">
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                Aimagica is a cutting-edge AI-powered platform that transforms your creative ideas into stunning visual reality. 
                We believe that everyone should have the power to create beautiful, professional-quality images, 
                regardless of their artistic background or technical expertise.
              </p>
              <div className="flex justify-center space-x-4">
                <Badge className="bg-[#d4a574] text-white px-4 py-2 text-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered
                </Badge>
                <Badge className="bg-[#8b7355] text-white px-4 py-2 text-sm">
                  <Heart className="w-4 h-4 mr-2" />
                  User-Friendly
                </Badge>
                <Badge className="bg-[#2d3e2d] text-white px-4 py-2 text-sm">
                  <Rocket className="w-4 h-4 mr-2" />
                  Innovative
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#d4a574] shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#d4a574]/20 to-[#d4a574]/10">
              <CardTitle className="text-2xl font-bold text-[#2d3e2d] flex items-center">
                <Rocket className="w-6 h-6 mr-3 text-[#d4a574]" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                To democratize creativity by making professional-quality AI image generation accessible to everyone. 
                We strive to break down the barriers between imagination and creation, empowering users to bring 
                their wildest ideas to life with just a few words.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#8b7355]/20 to-[#8b7355]/10">
              <CardTitle className="text-2xl font-bold text-[#2d3e2d] flex items-center">
                <Star className="w-6 h-6 mr-3 text-[#8b7355]" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                To become the world's leading platform for AI-powered creativity, where millions of users can 
                express themselves, collaborate, and push the boundaries of what's possible in digital art and design. 
                We envision a future where creativity knows no limits.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#2d3e2d] shadow-xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#2d3e2d] mb-4">What Makes Us Special</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-[#f5f1e8] to-white rounded-xl border border-[#d4a574]/30">
                <Zap className="w-12 h-12 text-[#d4a574] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#2d3e2d] mb-3">Lightning Fast</h3>
                <p className="text-gray-700">
                  Generate high-quality images in seconds with our optimized AI models and cloud infrastructure.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-[#e8f4f1] to-white rounded-xl border border-[#8b7355]/30">
                <Users className="w-12 h-12 text-[#8b7355] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#2d3e2d] mb-3">Community Driven</h3>
                <p className="text-gray-700">
                  Join a vibrant community of creators, share your work, and get inspired by others' creations.
                </p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-[#f0f8ff] to-white rounded-xl border border-[#2d3e2d]/30">
                <Sparkles className="w-12 h-12 text-[#2d3e2d] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#2d3e2d] mb-3">Multiple AI Models</h3>
                <p className="text-gray-700">
                  Access cutting-edge AI models including DALL-E, Stable Diffusion, and our proprietary Flux Kontext.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#2d3e2d] mb-4">Our Team</CardTitle>
            <p className="text-gray-600">Passionate innovators dedicated to revolutionizing creativity</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-[#d4a574] to-[#8b7355] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                  A
                </div>
                <h3 className="text-xl font-bold text-[#2d3e2d] mb-2">Alex Chen</h3>
                <p className="text-[#d4a574] font-semibold mb-2">CEO & Co-Founder</p>
                <p className="text-gray-700 text-sm">
                  Former Google AI researcher with 10+ years experience in machine learning and computer vision.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-[#8b7355] to-[#2d3e2d] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                  S
                </div>
                <h3 className="text-xl font-bold text-[#2d3e2d] mb-2">Sarah Kim</h3>
                <p className="text-[#8b7355] font-semibold mb-2">CTO & Co-Founder</p>
                <p className="text-gray-700 text-sm">
                  Former Tesla engineer specializing in AI infrastructure and scalable cloud architectures.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-[#2d3e2d] to-[#d4a574] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                  M
                </div>
                <h3 className="text-xl font-bold text-[#2d3e2d] mb-2">Marcus Rodriguez</h3>
                <p className="text-[#2d3e2d] font-semibold mb-2">Head of Design</p>
                <p className="text-gray-700 text-sm">
                  Award-winning designer from Adobe with expertise in user experience and creative tools.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#d4a574] shadow-xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#2d3e2d] mb-4">Our Values</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#d4a574] rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="font-bold text-[#2d3e2d] mb-1">Innovation</h3>
                    <p className="text-gray-700 text-sm">Continuously pushing the boundaries of what's possible with AI technology.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#8b7355] rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="font-bold text-[#2d3e2d] mb-1">Accessibility</h3>
                    <p className="text-gray-700 text-sm">Making powerful creative tools available to everyone, regardless of skill level.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#2d3e2d] rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="font-bold text-[#2d3e2d] mb-1">Quality</h3>
                    <p className="text-gray-700 text-sm">Delivering exceptional results that exceed expectations every time.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="font-bold text-[#2d3e2d] mb-1">Community</h3>
                    <p className="text-gray-700 text-sm">Building a supportive ecosystem where creators can thrive and collaborate.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="font-bold text-[#2d3e2d] mb-1">Ethics</h3>
                    <p className="text-gray-700 text-sm">Responsible AI development with respect for privacy, rights, and society.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h3 className="font-bold text-[#2d3e2d] mb-1">Transparency</h3>
                    <p className="text-gray-700 text-sm">Open communication about our processes, capabilities, and limitations.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-[#d4a574] to-[#8b7355] text-white shadow-xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Something Amazing?</h2>
            <p className="text-lg opacity-90 mb-6">
              Join thousands of creators who are already using Aimagica to bring their ideas to life.
            </p>
            <div className="space-y-2">
              <p className="text-sm opacity-80">Have questions? We'd love to hear from you!</p>
              <p className="text-sm">📧 hello@aimagica.com | 🌐 Visit our Help Center</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 