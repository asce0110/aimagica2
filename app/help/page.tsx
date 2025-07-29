'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, HelpCircle, Book, Video, MessageCircle, 
  ChevronDown, ChevronRight, Zap, Settings, 
  CreditCard, Image, Users, Shield 
} from "lucide-react"

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle, color: 'bg-gray-500' },
    { id: 'getting-started', name: 'Getting Started', icon: Zap, color: 'bg-[#d4a574]' },
    { id: 'account', name: 'Account & Settings', icon: Settings, color: 'bg-[#8b7355]' },
    { id: 'billing', name: 'Billing & Plans', icon: CreditCard, color: 'bg-[#2d3e2d]' },
    { id: 'creation', name: 'Image Creation', icon: Image, color: 'bg-purple-500' },
    { id: 'community', name: 'Community', icon: Users, color: 'bg-blue-500' },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield, color: 'bg-green-500' }
  ]

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I create my first AI image?',
      answer: 'Simply describe what you want to see in the text prompt box and click "Generate Image". Our AI will create a unique image based on your description. You can choose different AI models and styles to get different results.'
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'What AI models are available?',
      answer: 'We offer multiple state-of-the-art AI models including DALL-E, Stable Diffusion, and our proprietary Flux Kontext models (Pro and Max versions). Each model has different strengths and specialties.'
    },
    {
      id: 3,
      category: 'account',
      question: 'How do I upgrade to a premium plan?',
      answer: 'Go to the Pricing page or click on your profile menu and select "Upgrade Plan". Choose the plan that fits your needs and follow the secure checkout process.'
    },
    {
      id: 4,
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and other secure payment methods. All transactions are processed securely through industry-standard payment processors.'
    },
    {
      id: 5,
      category: 'creation',
      question: 'How can I improve my image generation results?',
      answer: 'Use detailed, specific descriptions. Include style keywords like "photorealistic", "digital art", or "watercolor". Specify lighting, composition, and mood. Experiment with different AI models for different styles.'
    },
    {
      id: 6,
      category: 'creation',
      question: 'Can I use generated images commercially?',
      answer: 'Yes! Images you generate are yours to use for personal and commercial purposes. However, we cannot guarantee uniqueness as similar prompts may generate similar results for different users.'
    },
    {
      id: 7,
      category: 'community',
      question: 'How do I share my images in the gallery?',
      answer: 'After generating an image, you can choose to make it public in the community gallery. Click the "Share" button and select "Make Public" to showcase your creation to other users.'
    },
    {
      id: 8,
      category: 'privacy',
      question: 'Is my data secure and private?',
      answer: 'Yes, we take privacy seriously. Your personal information is encrypted and protected. You control the visibility of your generated images - they remain private unless you choose to share them publicly.'
    },
    {
      id: 9,
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'You can delete your account from your account settings page. Please note that this action is irreversible and will permanently delete all your data and generated images.'
    },
    {
      id: 10,
      category: 'billing',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Your access to premium features will continue until the end of your current billing period.'
    }
  ]

  const tutorials = [
    {
      title: 'Getting Started with AI Image Generation',
      description: 'Learn the basics of creating stunning AI images',
      duration: '5 min read',
      category: 'Beginner'
    },
    {
      title: 'Advanced Prompting Techniques',
      description: 'Master the art of writing effective prompts',
      duration: '8 min read',
      category: 'Advanced'
    },
    {
      title: 'Using Different AI Models',
      description: 'Choose the right model for your creative needs',
      duration: '6 min read',
      category: 'Intermediate'
    },
    {
      title: 'Style Guide and Best Practices',
      description: 'Tips for consistent and professional results',
      duration: '10 min read',
      category: 'Advanced'
    }
  ]

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs.filter(faq => faq.category === selectedCategory && 
                        (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())))

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-white to-[#e8f4f1] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-xl mb-8">
          <CardHeader className="text-center bg-gradient-to-r from-[#d4a574] to-[#8b7355] text-white">
            <CardTitle className="text-4xl font-bold mb-2">Help Center</CardTitle>
            <p className="text-lg opacity-90">Find answers, tutorials, and get support</p>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search for help articles, tutorials, or FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg border-2 border-[#8b7355]/30 rounded-xl focus:border-[#d4a574]"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-[#d4a574]/30 hover:border-[#d4a574] transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Book className="w-12 h-12 text-[#d4a574] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#2d3e2d] mb-2">Tutorials</h3>
                  <p className="text-gray-700">Step-by-step guides and best practices</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-[#8b7355]/30 hover:border-[#8b7355] transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Video className="w-12 h-12 text-[#8b7355] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#2d3e2d] mb-2">Video Guides</h3>
                  <p className="text-gray-700">Watch and learn with visual tutorials</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-[#2d3e2d]/30 hover:border-[#2d3e2d] transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-[#2d3e2d] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#2d3e2d] mb-2">Contact Support</h3>
                  <p className="text-gray-700">Get personalized help from our team</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-lg sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#2d3e2d]">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-[#d4a574] text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <category.icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tutorials Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#d4a574] shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#2d3e2d] flex items-center">
                  <Book className="w-6 h-6 mr-3 text-[#d4a574]" />
                  Featured Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {tutorials.map((tutorial, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-[#d4a574] transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-[#d4a574]/20 text-[#d4a574] border-[#d4a574]">
                          {tutorial.category}
                        </Badge>
                        <span className="text-sm text-gray-500">{tutorial.duration}</span>
                      </div>
                      <h3 className="font-bold text-[#2d3e2d] mb-2">{tutorial.title}</h3>
                      <p className="text-gray-700 text-sm">{tutorial.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#2d3e2d] flex items-center">
                  <HelpCircle className="w-6 h-6 mr-3 text-[#8b7355]" />
                  Frequently Asked Questions
                </CardTitle>
                <p className="text-gray-600">
                  {selectedCategory === 'all' ? 'All questions' : categories.find(c => c.id === selectedCategory)?.name}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredFaqs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No FAQs found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredFaqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-[#2d3e2d]">{faq.question}</span>
                          {expandedFaq === faq.id ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {expandedFaq === faq.id && (
                          <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <p className="text-gray-700">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#2d3e2d] shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#2d3e2d] flex items-center">
                  <MessageCircle className="w-6 h-6 mr-3 text-[#2d3e2d]" />
                  Still Need Help?
                </CardTitle>
                <p className="text-gray-600">Send us a message and we'll get back to you within 24 hours</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2d3e2d] mb-2">Your Name</label>
                      <Input placeholder="Enter your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d3e2d] mb-2">Email Address</label>
                      <Input placeholder="Enter your email" type="email" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2d3e2d] mb-2">Subject</label>
                    <Input placeholder="What's your question about?" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2d3e2d] mb-2">Message</label>
                    <Textarea 
                      placeholder="Please describe your issue or question in detail..."
                      rows={5}
                    />
                  </div>
                  <Button className="w-full bg-[#2d3e2d] hover:bg-[#2d3e2d]/90 text-white">
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Info */}
        <Card className="bg-gradient-to-r from-[#d4a574] to-[#8b7355] text-white shadow-xl mt-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Other Ways to Reach Us</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold mb-2">📧 Email Support</h3>
                <p className="text-sm opacity-90">support@aimagica.com</p>
                <p className="text-xs opacity-80">Response within 24 hours</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">💬 Live Chat</h3>
                <p className="text-sm opacity-90">Available on our website</p>
                <p className="text-xs opacity-80">Mon-Fri, 9 AM - 6 PM PST</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">📱 Community Forum</h3>
                <p className="text-sm opacity-90">Join our Discord server</p>
                <p className="text-xs opacity-80">Get help from other users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 