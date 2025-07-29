"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Crown, 
  Sparkles, 
  Zap, 
  Star, 
  Check, 
  ArrowRight, 
  Heart,
  Download,
  Wand2,
  Palette,
  ImageIcon,
  Users,
  Mail,
  CreditCard,
  Gift,
  ChevronLeft
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Head from "next/head"

interface PricingPlan {
  id: string
  name: string
  emoji: string
  price: number
  period: string
  originalPrice?: number
  description: string
  features: string[]
  isPopular?: boolean
  isPremium?: boolean
  color: string
  bgColor: string
  borderColor: string
  buttonColor: string
  rotation: number
}

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Magic Starter",
    emoji: "✨",
    price: 0,
    period: "Forever",
    description: "Perfect for trying AIMAGICA magic!",
    features: [
      "5 AI images per day",
      "Basic art styles",
      "Standard resolution (512x512)",
      "Community gallery access",
      "Basic sketch tools",
      "Mobile app access"
    ],
    color: "#8b7355",
    bgColor: "#f5f1e8",
    borderColor: "#8b7355",
    buttonColor: "#8b7355",
    rotation: -1
  },
  {
    id: "pro",
    name: "Magic Pro",
    emoji: "🚀",
    price: 9.99,
    period: "month",
    originalPrice: 19.99,
    description: "For serious AIMAGICA wizards!",
    features: [
      "Unlimited AI images",
      "All premium art styles",
      "Ultra HD resolution (2048x2048)",
      "Priority processing",
      "Advanced editing tools",
      "Batch processing",
      "Commercial license",
      "No watermarks",
      "Premium support"
    ],
    isPopular: true,
    color: "#d4a574",
    bgColor: "#f5f1e8",
    borderColor: "#d4a574",
    buttonColor: "#2d3e2d",
    rotation: 0
  },
  {
    id: "wizard",
    name: "Magic Wizard",
    emoji: "🧙‍♂️",
    price: 29.99,
    period: "month",
    originalPrice: 49.99,
    description: "Ultimate AIMAGICA experience!",
    features: [
      "Everything in Pro",
      "4K Ultra resolution (4096x4096)",
      "Custom AI model training",
      "API access",
      "White-label options",
      "Dedicated account manager",
      "Custom integrations",
      "Early access to new features",
      "1-on-1 magic consultations"
    ],
    isPremium: true,
    color: "#2d3e2d",
    bgColor: "#f5f1e8",
    borderColor: "#2d3e2d",
    buttonColor: "#d4a574",
    rotation: 1
  }
]

const features = [
  {
    icon: "🎨",
    title: "50+ Art Styles",
    description: "From anime to oil painting, cyberpunk to watercolor!"
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    description: "Generate stunning art in just 30 seconds!"
  },
  {
    icon: "📱",
    title: "Mobile Ready",
    description: "Create magic on any device, anywhere!"
  },
  {
    icon: "🌟",
    title: "HD Quality",
    description: "Crystal clear, professional-grade results!"
  },
  {
    icon: "🤝",
    title: "Community",
    description: "Join millions of AIMAGICA artists worldwide!"
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description: "Your creations are safe with enterprise security!"
  }
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Digital Artist",
    avatar: "SC",
    content: "AIMAGICA transformed my creative process! I can bring ideas to life in seconds!",
    rating: 5
  },
  {
    name: "Mike Johnson",
    role: "Content Creator",
    avatar: "MJ",
    content: "The quality is incredible! My social media engagement skyrocketed!",
    rating: 5
  },
  {
    name: "Emma Wilson",
    role: "Marketing Manager",
    avatar: "EW",
    content: "Best investment for our creative team. Saves hours and produces amazing results!",
    rating: 5
  }
]

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 生成固定的装饰元素避免hydration问题
  const [decorativeElements] = useState(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 20 + 10,
      rotation: Math.random() * 360,
      delay: Math.random() * 2
    }))
  })

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    // 这里可以添加支付逻辑
    console.log(`Selected plan: ${planId}`)
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] relative overflow-hidden">
      {/* SEO优化的元数据 */}
      <Head>
        <title>AIMAGICA Pricing - Choose Your Magic Plan | AI Art Generator</title>
        <meta
          name="description"
          content="Choose the perfect AIMAGICA plan for your needs. From free magic starter to wizard-level features. Transform your sketches into stunning art!"
        />
        <meta name="keywords" content="AIMAGICA pricing, AI art plans, subscription, magic plans, digital art tools" />
        <meta property="og:title" content="AIMAGICA Pricing - Choose Your Magic Plan" />
        <meta property="og:description" content="Transform your sketches into stunning art with AIMAGICA. Choose from our magical pricing plans!" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://aimagica.com/pricing" />
      </Head>

      {/* 装饰背景元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-[#8b7355]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-[#2d3e2d]/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#d4a574]/20 rounded-full blur-xl"></div>
        
        {/* 浮动魔法元素 */}
        {isMounted && decorativeElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
            }}
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 6 + element.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div 
              className="w-full h-full bg-gradient-to-br from-[#d4a574]/30 to-[#8b7355]/30 rounded-full"
              style={{ transform: `rotate(${element.rotation}deg)` }}
            />
          </motion.div>
        ))}
      </div>

      {/* 导航栏 */}
      <header className="relative z-10 p-4 md:p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            {/* 返回按钮和Logo */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="text-[#2d3e2d] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-black rounded-2xl transform hover:scale-105 transition-all font-magic"
                
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Magic! 🏠
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#2d3e2d] rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                  <Sparkles className="w-6 h-6 text-[#f5f1e8]" />
                </div>
                <div>
                  <h1
                    className="text-2xl font-black text-[#2d3e2d] transform -rotate-1"
                    
                  >
                    AIMAGICA
                  </h1>
                  <p
                    className="text-sm font-bold text-[#8b7355] transform rotate-1 font-magic"
                    
                  >
                    Pricing Magic ✨
                  </p>
                </div>
              </div>
            </div>

            {/* 联系按钮 */}
            <Button
              className="bg-[#2d3e2d] hover:bg-[#1a2a1a] text-[#f5f1e8] font-black px-6 py-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all font-magic"
              
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Magic! 📞
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 container mx-auto px-4 md:px-6 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-black text-[#2d3e2d] mb-6 transform -rotate-1"
              
            >
              Choose Your Magic! 🪄
            </h1>
            <p
              className="text-xl md:text-2xl font-bold text-[#8b7355] max-w-4xl mx-auto mb-8 font-magic"
              
            >
              From free magic to wizard-level powers - find the perfect plan to unleash your creativity! ✨
            </p>

            {/* 年付/月付切换 */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span
                className={`font-bold text-lg ${!isAnnual ? 'text-[#2d3e2d]' : 'text-[#8b7355]'}`}
                
              >
                Monthly 📅
              </span>
              <Button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-16 h-8 rounded-full transition-all ${
                  isAnnual ? 'bg-[#d4a574]' : 'bg-[#8b7355]'
                }`}
              >
                <div
                  className={`absolute w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${
                    isAnnual ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </Button>
              <span
                className={`font-bold text-lg ${isAnnual ? 'text-[#2d3e2d]' : 'text-[#8b7355]'}`}
                
              >
                Annual 🎯
              </span>
              {isAnnual && (
                <Badge className="bg-[#d4a574] text-[#2d3e2d] font-black">
                  Save 50%! 💰
                </Badge>
              )}
            </div>
          </motion.div>
        </div>

        {/* 定价卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative transform hover:scale-105 transition-all duration-300 ${
                plan.isPopular ? 'md:scale-110 z-10' : ''
              }`}
              style={{ transform: `rotate(${plan.rotation}deg)` }}
              whileHover={{ rotate: 0 }}
            >
              {/* 热门标签 */}
              {plan.isPopular && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge 
                    className="bg-[#d4a574] text-[#2d3e2d] font-black px-4 py-2 text-sm rounded-2xl shadow-xl border-2 border-[#2d3e2d] font-magic"
                    
                  >
                    <Star className="w-4 h-4 mr-1" />
                    MOST POPULAR! 🔥
                  </Badge>
                </div>
              )}

              {/* 高级标签 */}
              {plan.isPremium && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge 
                    className="bg-[#2d3e2d] text-[#f5f1e8] font-black px-4 py-2 text-sm rounded-2xl shadow-xl border-2 border-[#d4a574] font-magic"
                    
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    ULTIMATE! 👑
                  </Badge>
                </div>
              )}

              <div 
                className={`bg-white rounded-3xl shadow-2xl overflow-hidden border-4 h-full relative`}
                style={{ borderColor: plan.borderColor }}
              >
                {/* 装饰元素 */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full" style={{ backgroundColor: plan.color }}></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full" style={{ backgroundColor: plan.borderColor, opacity: 0.7 }}></div>

                {/* 计划头部 */}
                <div 
                  className="p-6 text-center relative"
                  style={{ backgroundColor: plan.color }}
                >
                  <div className="text-6xl mb-4">{plan.emoji}</div>
                  <h3
                    className="text-2xl font-black text-[#f5f1e8] mb-2 transform -rotate-1"
                    
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="text-[#f5f1e8] font-bold opacity-90 font-magic"
                    
                  >
                    {plan.description}
                  </p>
                </div>

                {/* 价格部分 */}
                <div className="p-6 text-center border-b-2" style={{ borderColor: `${plan.borderColor}40` }}>
                  <div className="mb-4">
                    {plan.originalPrice && (
                      <span
                        className="text-2xl text-[#8b7355] line-through font-bold mr-2 font-magic"
                        
                      >
                        ${isAnnual ? (plan.originalPrice * 12 * 0.5).toFixed(0) : plan.originalPrice}
                      </span>
                    )}
                    <span
                      className="text-5xl font-black"
                      
                    >
                      ${plan.price === 0 ? '0' : isAnnual ? (plan.price * 12 * 0.5).toFixed(0) : plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span
                        className="text-lg text-[#8b7355] font-bold ml-1 font-magic"
                        
                      >
                        /{isAnnual ? 'year' : plan.period}
                      </span>
                    )}
                  </div>
                  {plan.price === 0 && (
                    <p
                      className="text-[#8b7355] font-bold font-magic"
                      
                    >
                      {plan.period}
                    </p>
                  )}
                </div>

                {/* 功能列表 */}
                <div className="p-6 flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span
                          className="text-[#2d3e2d] font-bold text-sm font-magic"
                          
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 选择按钮 */}
                <div className="p-6 pt-0">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full font-black py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all text-lg`}
                    
                  >
                    {plan.price === 0 ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Start Free Magic! ✨
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Get {plan.name}! 🚀
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 功能亮点 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2
              className="text-4xl md:text-5xl font-black text-[#2d3e2d] mb-6 transform rotate-1"
              
            >
              Why Choose AIMAGICA? 🌟
            </h2>
            <p
              className="text-xl font-bold text-[#8b7355] max-w-3xl mx-auto font-magic"
              
            >
              Join millions of creators who trust AIMAGICA for their magical art journey!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl border-4 border-[#8b7355] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: `rotate(${(index % 3 - 1) * 0.5}deg)` }}
                whileHover={{ rotate: 0 }}
              >
                <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                <h3
                  className="text-xl font-black text-[#2d3e2d] mb-3 text-center"
                  
                >
                  {feature.title}
                </h3>
                <p
                  className="text-[#8b7355] font-bold text-center font-magic"
                  
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 用户评价 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2
              className="text-4xl md:text-5xl font-black text-[#2d3e2d] mb-6 transform -rotate-1"
              
            >
              What Magic Users Say! 💬
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl border-4 border-[#d4a574] p-6 shadow-xl transform hover:scale-105 transition-all"
                style={{ transform: `rotate(${(index % 3 - 1) * 1}deg)` }}
                whileHover={{ rotate: 0 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#d4a574] to-[#8b7355] rounded-full flex items-center justify-center text-white font-black mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4
                      className="font-black text-[#2d3e2d] font-magic"
                      
                    >
                      {testimonial.name}
                    </h4>
                    <p
                      className="text-[#8b7355] font-bold text-sm font-magic"
                      
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                <p
                  className="text-[#2d3e2d] font-bold italic font-magic"
                  
                >
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA部分 */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-[#2d3e2d] via-[#8b7355] to-[#d4a574] rounded-3xl border-4 border-[#2d3e2d] p-12 shadow-2xl relative overflow-hidden"
          >
            {/* 装饰元素 */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#f5f1e8] rounded-full opacity-80"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#f5f1e8] rounded-full opacity-60"></div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-6">🎉</div>
              <h2
                className="text-4xl md:text-5xl font-black text-[#f5f1e8] mb-6 transform rotate-1"
                
              >
                Ready to Create Magic? ✨
              </h2>
              <p
                className="text-xl font-bold text-[#f5f1e8] mb-8 max-w-2xl mx-auto opacity-90 font-magic"
                
              >
                Join millions of artists who've discovered the magic of AIMAGICA! Start your creative journey today! 🚀
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={() => handleSelectPlan('free')}
                  className="bg-[#f5f1e8] hover:bg-[#d4a574] text-[#2d3e2d] font-black px-8 py-4 rounded-2xl shadow-xl transform hover:scale-110 transition-all text-lg font-magic"
                  
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Start Free! 🎁
                </Button>
                
                <Button
                  onClick={() => handleSelectPlan('pro')}
                  className="bg-[#d4a574] hover:bg-[#c19660] text-[#2d3e2d] font-black px-8 py-4 rounded-2xl shadow-xl transform hover:scale-110 transition-all text-lg border-2 border-[#f5f1e8] font-magic"
                  
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Go Pro! 👑
                </Button>
              </div>
              
              <p
                className="text-[#f5f1e8] font-bold mt-6 opacity-80 font-magic"
                
              >
                No credit card required for free plan! Cancel anytime! 🔒
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="relative z-10 bg-[#2d3e2d] text-[#f5f1e8] py-12 mt-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-[#d4a574] rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 mr-4">
              <Sparkles className="w-6 h-6 text-[#2d3e2d]" />
            </div>
            <h3
              className="text-2xl font-black transform -rotate-1"
              
            >
              AIMAGICA
            </h3>
          </div>
          
          <p
            className="text-[#d4a574] font-bold mb-6 font-magic"
            
          >
            Creating magic, one sketch at a time! ✨
          </p>
          
          <div className="flex justify-center space-x-6 mb-6">
            <Button
              variant="ghost"
              className="text-[#f5f1e8] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-bold font-magic"
              
            >
              Terms 📋
            </Button>
            <Button
              variant="ghost"
              className="text-[#f5f1e8] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-bold font-magic"
              
            >
              Privacy 🔒
            </Button>
            <Button
              variant="ghost"
              className="text-[#f5f1e8] hover:bg-[#d4a574] hover:text-[#2d3e2d] font-bold font-magic"
              
            >
              Support 💪
            </Button>
          </div>
          
          <p
            className="text-[#8b7355] font-bold text-sm font-magic"
            
          >
            © 2024 AIMAGICA. All magical rights reserved! 🪄
          </p>
        </div>
      </footer>
    </div>
  )
} 