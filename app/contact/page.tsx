'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Mail, Phone, MapPin, MessageCircle, Clock, 
  Users, HeadphonesIcon, Zap, AlertCircle,
  CheckCircle, Send, ExternalLink
} from "lucide-react"

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'normal'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
    
    // Reset form after success
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        priority: 'normal'
      })
    }, 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@aimagica.com',
      response: '24 hours',
      color: 'bg-[#d4a574]'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our team',
      contact: 'Available on website',
      response: 'Immediate',
      color: 'bg-[#8b7355]'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us directly',
      contact: '+1 (555) 123-4567',
      response: 'Business hours',
      color: 'bg-[#2d3e2d]'
    }
  ]

  const departments = [
    {
      name: 'General Support',
      email: 'support@aimagica.com',
      description: 'Account issues, billing, and general questions'
    },
    {
      name: 'Technical Support',
      email: 'tech@aimagica.com',
      description: 'API issues, bugs, and technical problems'
    },
    {
      name: 'Business Inquiries',
      email: 'business@aimagica.com',
      description: 'Partnerships, enterprise sales, and collaborations'
    },
    {
      name: 'Press & Media',
      email: 'press@aimagica.com',
      description: 'Media inquiries, interviews, and press releases'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-white to-[#e8f4f1] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-xl mb-8">
          <CardHeader className="text-center bg-gradient-to-r from-[#d4a574] to-[#8b7355] text-white">
            <CardTitle className="text-4xl font-bold mb-2">Contact Us</CardTitle>
            <p className="text-lg opacity-90">We're here to help! Get in touch with our team</p>
          </CardHeader>
        </Card>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {contactMethods.map((method, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-gray-300 shadow-lg transition-all hover:shadow-xl">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${method.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2d3e2d] mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-3">{method.description}</p>
                <p className="font-semibold text-[#2d3e2d] mb-1">{method.contact}</p>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <Clock className="w-3 h-3 mr-1" />
                  {method.response}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#d4a574] shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#2d3e2d] flex items-center">
                <Send className="w-6 h-6 mr-3 text-[#d4a574]" />
                Send us a Message
              </CardTitle>
              <p className="text-gray-600">Fill out the form below and we'll get back to you soon</p>
            </CardHeader>
            
            <CardContent className="p-6">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-700 mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2d3e2d] mb-2">
                        Your Name *
                      </label>
                      <Input
                        required
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="border-2 border-gray-200 focus:border-[#d4a574]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d3e2d] mb-2">
                        Email Address *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="border-2 border-gray-200 focus:border-[#d4a574]"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2d3e2d] mb-2">
                        Category *
                      </label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="border-2 border-gray-200 focus:border-[#d4a574]">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Support</SelectItem>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="business">Business Inquiry</SelectItem>
                          <SelectItem value="bug">Bug Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2d3e2d] mb-2">
                        Priority
                      </label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger className="border-2 border-gray-200 focus:border-[#d4a574]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2d3e2d] mb-2">
                      Subject *
                    </label>
                    <Input
                      required
                      placeholder="Brief description of your inquiry"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="border-2 border-gray-200 focus:border-[#d4a574]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2d3e2d] mb-2">
                      Message *
                    </label>
                    <Textarea
                      required
                      rows={6}
                      placeholder="Please provide details about your inquiry..."
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="border-2 border-gray-200 focus:border-[#d4a574]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-[#d4a574] hover:bg-[#d4a574]/90 text-white py-3 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Office Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#2d3e2d] flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-[#8b7355]" />
                  Our Office
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#2d3e2d] mb-1">Headquarters</h3>
                    <p className="text-gray-700">
                      123 Innovation Drive<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2d3e2d] mb-1">Business Hours</h3>
                    <p className="text-gray-700">
                      Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                      Saturday: 10:00 AM - 4:00 PM PST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Departments */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#2d3e2d] shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#2d3e2d] flex items-center">
                  <Users className="w-5 h-5 mr-3 text-[#2d3e2d]" />
                  Department Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {departments.map((dept, index) => (
                    <div key={index} className="border-l-4 border-[#d4a574] pl-4">
                      <h3 className="font-semibold text-[#2d3e2d] mb-1">{dept.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{dept.description}</p>
                      <a href={`mailto:${dept.email}`} className="text-[#d4a574] hover:underline text-sm">
                        {dept.email}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Support */}
            <Card className="bg-red-50 border-2 border-red-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-red-800 mb-2">Emergency Support</h3>
                    <p className="text-red-700 text-sm mb-3">
                      For critical issues that affect your business operations, please contact our emergency support line.
                    </p>
                    <div className="space-y-1">
                      <p className="text-red-800 font-semibold">📞 +1 (555) 911-HELP</p>
                      <p className="text-red-600 text-sm">Available 24/7 for enterprise customers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Link */}
        <Card className="bg-gradient-to-r from-[#d4a574] to-[#8b7355] text-white shadow-xl mt-8">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Before You Contact Us</h2>
            <p className="text-lg opacity-90 mb-6">
              Check our comprehensive Help Center for instant answers to common questions
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <HeadphonesIcon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-bold mb-1">Help Center</h3>
                <p className="text-sm opacity-80">FAQs and tutorials</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-bold mb-1">Quick Fixes</h3>
                <p className="text-sm opacity-80">Common solutions</p>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-bold mb-1">Community</h3>
                <p className="text-sm opacity-80">Ask other users</p>
              </div>
            </div>
            <Button className="mt-6 bg-white text-[#2d3e2d] hover:bg-gray-100">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Help Center
            </Button>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-[#8b7355] shadow-lg mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-[#2d3e2d] mb-4">Follow Us</h3>
            <p className="text-gray-600 mb-4">Stay updated with the latest news and features</p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                🐦 Twitter
              </a>
              <a href="#" className="text-blue-800 hover:text-blue-900 transition-colors">
                💼 LinkedIn
              </a>
              <a href="#" className="text-gray-800 hover:text-gray-900 transition-colors">
                📘 Facebook
              </a>
              <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
                💬 Discord
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 