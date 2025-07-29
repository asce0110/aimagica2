"use client"

import { useState, useEffect } from "react"
import { useSessionCompat as useSession } from "@/components/session-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Search, Copy, Heart, Star, Filter, Plus, Upload, Edit, Trash2, Eye, ThumbsUp, ThumbsDown, User } from "lucide-react"

interface PromptsCommunityProps {
  onBack?: () => void
  onUsePrompt?: (prompt: string) => void
}

interface UserPrompt {
  id: number
  prompt: string
  title: string
  description: string
  category: string
  tags: string[]
  likes_count: number
  uses_count: number
  status: 'pending' | 'approved' | 'rejected'
  is_featured: boolean
  created_at: string
  updated_at: string
  user_id: string
  isLikedByUser?: boolean
  users: {
    id: string
    name: string
    email: string
    image: string
  }
}

const categories = [
  { id: "all", name: "All", emoji: "🎨" },
  { id: "fantasy", name: "Fantasy", emoji: "🧙‍♂️" },
  { id: "anime", name: "Anime", emoji: "🌸" },
  { id: "cyberpunk", name: "Cyberpunk", emoji: "🌃" },
  { id: "nature", name: "Nature", emoji: "🌿" },
  { id: "portrait", name: "Portrait", emoji: "👤" },
  { id: "abstract", name: "Abstract", emoji: "🎭" },
  { id: "cute", name: "Cute", emoji: "🐱" },
  { id: "general", name: "General", emoji: "✨" },
]

export default function PromptsCommunity({ onBack, onUsePrompt }: PromptsCommunityProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [prompts, setPrompts] = useState<UserPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'community' | 'my-prompts'>('community')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<UserPrompt | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 新提示词表单状态
  const [newPrompt, setNewPrompt] = useState({
    title: "",
    prompt: "",
    description: "",
    category: "general",
    tags: ""
  })

  // 获取提示词列表
  const fetchPrompts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        category: selectedCategory !== 'all' ? selectedCategory : '',
        search: searchTerm,
        sortBy: 'created_at',
        sortOrder: 'desc'
      })

      if (view === 'my-prompts' && session?.user?.id) {
        params.append('userId', session.user.id)
        params.set('status', 'all') // 显示用户自己的所有状态提示词
      }

      const response = await fetch(`/api/user-prompts?${params}`)
      const data = await response.json()

      if (response.ok) {
        if (reset || pageNum === 1) {
          setPrompts(data.prompts)
        } else {
          setPrompts(prev => [...prev, ...data.prompts])
        }
        setHasMore(pageNum < data.pagination.totalPages)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch prompts",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
      toast({
        title: "Error",
        description: "Failed to fetch prompts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 初始加载和搜索变化时重新加载
  useEffect(() => {
    setPage(1)
    fetchPrompts(1, true)
  }, [selectedCategory, searchTerm, view, session])

  // 创建新提示词
  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast({
        title: "Please login",
        description: "You need to login to upload prompts",
        variant: "destructive"
      })
      return
    }

    try {
      const tagsArray = newPrompt.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      const response = await fetch('/api/user-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newPrompt,
          tags: tagsArray
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your prompt has been submitted for review",
        })
        setIsUploadDialogOpen(false)
        setNewPrompt({
          title: "",
          prompt: "",
          description: "",
          category: "general",
          tags: ""
        })
        // 如果在我的提示词页面，刷新列表
        if (view === 'my-prompts') {
          fetchPrompts(1, true)
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create prompt",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating prompt:', error)
      toast({
        title: "Error",
        description: "Failed to create prompt",
        variant: "destructive"
      })
    }
  }

  // 点赞/取消点赞
  const handleLike = async (promptId: number, isCurrentlyLiked: boolean) => {
    if (!session) {
      toast({
        title: "Please login",
        description: "You need to login to like prompts",
        variant: "destructive"
      })
      return
    }

    try {
      const method = isCurrentlyLiked ? 'DELETE' : 'POST'
      const response = await fetch(`/api/user-prompts/${promptId}/like`, {
        method
      })

      const data = await response.json()

      if (response.ok) {
        // 更新本地状态
        setPrompts(prev => prev.map(prompt => 
          prompt.id === promptId 
            ? { 
                ...prompt, 
                isLikedByUser: !isCurrentlyLiked,
                likes_count: data.likesCount
              }
            : prompt
        ))
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to like prompt",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error liking prompt:', error)
      toast({
        title: "Error",
        description: "Failed to like prompt",
        variant: "destructive"
      })
    }
  }

  // 使用提示词
  const handleUsePrompt = async (prompt: UserPrompt) => {
    // 记录使用
    if (session) {
      try {
        await fetch(`/api/user-prompts/${prompt.id}/use`, {
          method: 'POST'
        })
        // 更新使用次数
        setPrompts(prev => prev.map(p => 
          p.id === prompt.id 
            ? { ...p, uses_count: p.uses_count + 1 }
            : p
        ))
      } catch (error) {
        console.error('Error recording usage:', error)
      }
    }

    if (onUsePrompt) {
      onUsePrompt(prompt.prompt)
    }
    if (onBack) {
      onBack()
    }
  }

  // 复制提示词
  const handleCopyPrompt = (prompt: string, id: number) => {
    navigator.clipboard.writeText(prompt)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // 删除提示词
  const handleDeletePrompt = async (promptId: number) => {
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return
    }

    try {
      const response = await fetch(`/api/user-prompts/${promptId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Prompt deleted successfully"
        })
        setPrompts(prev => prev.filter(p => p.id !== promptId))
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete prompt",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive"
      })
    }
  }

  // 加载更多
  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPrompts(nextPage, false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] p-4 md:p-6 flex justify-center">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              variant="ghost"
              className="bg-white border-2 border-[#8b7355] text-[#2d3e2d] hover:bg-[#8b7355] hover:text-white font-black rounded-2xl transform hover:scale-105 transition-all"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1
                className="text-3xl md:text-4xl font-black text-[#2d3e2d] transform -rotate-1"
                style={{
                  fontFamily: "Fredoka One, Arial Black, sans-serif",
                  textShadow: "2px 2px 0px #d4a574",
                }}
              >
                MAGIC PROMPTS! ✨
              </h1>
              <p
                className="text-lg font-bold text-[#8b7355]"
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                Discover and share amazing prompts!
              </p>
            </div>
          </div>

          {/* 上传和视图切换按钮 */}
          <div className="flex items-center space-x-3">
            {session && (
              <>
                <Button
                  onClick={() => setView(view === 'community' ? 'my-prompts' : 'community')}
                  variant="outline"
                  className="bg-white border-2 border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355] hover:text-white font-black rounded-2xl"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  <User className="w-4 h-4 mr-2" />
                  {view === 'community' ? 'My Prompts' : 'Community'}
                </Button>

                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-[#d4a574] border-2 border-[#2d3e2d] text-[#2d3e2d] hover:bg-[#c19660] font-black rounded-2xl transform hover:scale-105 transition-all"
                      style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Prompt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle 
                        className="text-2xl font-black text-[#2d3e2d]"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        Upload New Prompt ✨
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreatePrompt} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newPrompt.title}
                          onChange={(e) => setNewPrompt(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Give your prompt a catchy title..."
                          required
                          maxLength={100}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="prompt">Prompt</Label>
                        <Textarea
                          id="prompt"
                          value={newPrompt.prompt}
                          onChange={(e) => setNewPrompt(prev => ({ ...prev, prompt: e.target.value }))}
                          placeholder="Write your amazing prompt here..."
                          required
                          minLength={10}
                          maxLength={1000}
                          rows={4}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {newPrompt.prompt.length}/1000 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          value={newPrompt.description}
                          onChange={(e) => setNewPrompt(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe what this prompt is good for..."
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newPrompt.category}
                          onValueChange={(value) => setNewPrompt(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c.id !== 'all').map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.emoji} {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                          id="tags"
                          value={newPrompt.tags}
                          onChange={(e) => setNewPrompt(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="fantasy, dragon, epic, magical..."
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsUploadDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-[#d4a574] border-2 border-[#2d3e2d] text-[#2d3e2d] font-black"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Prompt
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b7355] w-5 h-5" />
            <Input
              placeholder="Search prompts or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-2 border-[#8b7355] rounded-2xl font-bold text-[#2d3e2d] placeholder:text-[#8b7355]"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`font-black rounded-2xl transform hover:scale-105 transition-all ${
                  selectedCategory === category.id
                    ? "bg-[#d4a574] border-2 border-[#2d3e2d] text-[#2d3e2d]"
                    : "bg-white border-2 border-[#8b7355] text-[#8b7355] hover:bg-[#8b7355] hover:text-white"
                }`}
                style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
              >
                {category.emoji} {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Prompts Grid */}
        {loading && prompts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔄</div>
            <h3
              className="text-2xl font-black text-[#2d3e2d]"
              style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
            >
              Loading amazing prompts...
            </h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prompts.map((prompt) => (
                <Card
                  key={prompt.id}
                  className="bg-white border-4 border-[#8b7355] hover:border-[#2d3e2d] transition-all cursor-pointer rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="bg-[#f5f1e8] border-2 border-[#8b7355] text-[#2d3e2d] font-black px-2 py-1 rounded-xl text-xs transform rotate-1"
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          >
                            {categories.find(c => c.id === prompt.category)?.emoji} {categories.find(c => c.id === prompt.category)?.name}
                          </div>
                          {prompt.is_featured && (
                            <div className="bg-[#d4a574] border-2 border-[#2d3e2d] text-[#2d3e2d] rounded-full w-6 h-6 flex items-center justify-center transform rotate-12">
                              <Star className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        {view === 'my-prompts' && (
                          <div className="flex items-center space-x-1">
                            {getStatusBadge(prompt.status)}
                            {prompt.user_id === session?.user?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeletePrompt(prompt.id)}
                                className="h-6 w-6 p-0 hover:bg-red-100"
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="font-black text-[#2d3e2d] text-lg leading-tight"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                      >
                        {prompt.title}
                      </h3>

                      {/* Prompt Text */}
                      <div
                        className="p-3 bg-[#f5f1e8] rounded-xl border-2 border-dashed border-[#8b7355] text-[#2d3e2d] text-sm line-clamp-3"
                        style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        title={prompt.prompt}
                      >
                        "{prompt.prompt}"
                      </div>

                      {/* Description */}
                      {prompt.description && (
                        <p className="text-xs text-[#8b7355] italic">
                          {prompt.description}
                        </p>
                      )}

                      {/* Tags */}
                      {prompt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {prompt.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {prompt.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{prompt.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center space-x-3 text-xs text-[#8b7355] font-bold"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <span className="flex items-center">
                            <Heart className={`w-3 h-3 mr-1 ${prompt.isLikedByUser ? 'text-red-500 fill-current' : 'text-red-500'}`} />
                            {prompt.likes_count}
                          </span>
                          <span className="flex items-center">
                            <Copy className="w-3 h-3 mr-1 text-blue-500" />
                            {prompt.uses_count}
                          </span>
                        </div>
                        <p className="text-xs text-[#8b7355] font-bold" style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}>
                          by {prompt.users.name || 'Anonymous'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleCopyPrompt(prompt.prompt, prompt.id)}
                          size="sm"
                          className="flex-1 bg-[#f5f1e8] border-2 border-[#8b7355] text-[#2d3e2d] font-black rounded-xl hover:bg-[#8b7355] hover:text-white transform hover:rotate-1 transition-all"
                          style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {copiedId === prompt.id ? "Copied!" : "Copy"}
                        </Button>
                        
                        {session && prompt.status === 'approved' && (
                          <Button
                            onClick={() => handleLike(prompt.id, prompt.isLikedByUser || false)}
                            size="sm"
                            className={`bg-white border-2 border-red-300 font-black rounded-xl transform hover:rotate-1 transition-all ${
                              prompt.isLikedByUser 
                                ? 'text-red-600 bg-red-50' 
                                : 'text-red-400 hover:bg-red-50'
                            }`}
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          >
                            <Heart className={`w-3 h-3 ${prompt.isLikedByUser ? 'fill-current' : ''}`} />
                          </Button>
                        )}
                        
                        {prompt.status === 'approved' && (
                          <Button
                            onClick={() => handleUsePrompt(prompt)}
                            size="sm"
                            className="flex-1 bg-[#d4a574] border-2 border-[#2d3e2d] text-[#2d3e2d] font-black rounded-xl hover:bg-[#c19660] transform hover:rotate-1 transition-all"
                            style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                          >
                            Use Now! ✨
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-[#d4a574] border-2 border-[#2d3e2d] text-[#2d3e2d] font-black rounded-2xl hover:bg-[#c19660] transform hover:scale-105 transition-all"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  {loading ? "Loading..." : "Load More Prompts ✨"}
                </Button>
              </div>
            )}

            {/* No Results */}
            {prompts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3
                  className="text-2xl font-black text-[#2d3e2d] mb-2"
                  style={{
                    fontFamily: "Fredoka One, Arial Black, sans-serif",
                    textShadow: "1px 1px 0px #d4a574",
                  }}
                >
                  {view === 'my-prompts' ? 'No prompts yet!' : 'No prompts found!'}
                </h3>
                <p
                  className="text-lg font-bold text-[#8b7355]"
                  style={{ fontFamily: "Fredoka One, Arial Black, sans-serif" }}
                >
                  {view === 'my-prompts' 
                    ? 'Start by uploading your first amazing prompt!' 
                    : 'Try different keywords or categories'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
