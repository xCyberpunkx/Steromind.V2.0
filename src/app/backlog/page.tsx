"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Loader2, 
  ClipboardList, 
  Trash2, 
  Play, 
  MoreVertical,
  BookOpen,
  Code2,
  Trophy,
  ExternalLink,
  Tag
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { logActivity } from "@/lib/activity"

type BacklogItem = {
  id: string
  title: string
  category: string
  priority: string
  url?: string
  description?: string
  status: string
  created_at: string
}

export default function BacklogPage() {
  const [items, setItems] = useState<BacklogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({ 
    title: '', 
    category: 'course', 
    priority: 'medium', 
    url: '', 
    description: '' 
  })

  useEffect(() => {
    fetchBacklog()
  }, [])

  const fetchBacklog = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('backlog')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching backlog:', error)
      toast.error('Failed to load backlog items')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.title) {
      toast.error('Please provide a title')
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('backlog')
        .insert([{
          ...newItem,
          user_id: userData.user?.id || '00000000-0000-0000-0000-000000000000'
        }])
        .select()
        .single()

      if (error) throw error
      
      if (userData.user) {
        await logActivity(userData.user.id)
      }

      setItems([data, ...items])
      setNewItem({ title: '', category: 'course', priority: 'medium', url: '', description: '' })
      setIsAddingItem(false)
      toast.success('Added to backlog')
    } catch (error) {
      console.error('Error adding to backlog:', error)
      toast.error('Failed to add item')
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('backlog')
        .delete()
        .eq('id', id)

      if (error) throw error
      setItems(items.filter(item => item.id !== id))
      toast.success('Removed from backlog')
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to remove item')
    }
  }

  const handleStartItem = async (item: BacklogItem) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id || '00000000-0000-0000-0000-000000000000'

      // Move to respective table
      let table = ''
      let payload = {}

      if (item.category === 'course') {
        table = 'courses'
        payload = { title: item.title, platform: 'Unknown', status: 'in-progress', completion_percentage: 0 }
      } else if (item.category === 'skill') {
        table = 'skills'
        payload = { name: item.title, level: 'beginner' }
      } else if (item.category === 'project') {
        table = 'projects'
        payload = { title: item.title, description: item.description, url: item.url }
      }

      if (table) {
        const { error: insertError } = await supabase
          .from(table)
          .insert([{ ...payload, user_id: userId }])

        if (insertError) throw insertError
      }

      // Mark as started in backlog or delete
      const { error: deleteError } = await supabase
        .from('backlog')
        .delete()
        .eq('id', item.id)

      if (deleteError) throw deleteError

      if (userData.user) {
        await logActivity(userData.user.id)
      }

      setItems(items.filter(i => i.id !== item.id))
      toast.success(`Started ${item.category}: ${item.title}`)
    } catch (error) {
      console.error('Error starting item:', error)
      toast.error('Failed to start item')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'course': return <BookOpen className="w-4 h-4" />
      case 'skill': return <Trophy className="w-4 h-4" />
      case 'project': return <Code2 className="w-4 h-4" />
      default: return <Tag className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'
    }
  }

  const filtered = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Wishlist & Backlog</h2>
          <p className="text-zinc-400">Plan your future learning and projects.</p>
        </div>
        <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add to Backlog
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Add to Wishlist</DialogTitle>
              <DialogDescription className="text-zinc-400">
                What do you want to learn or build next?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  placeholder="e.g. Advanced Rust Patterns" 
                  className="bg-zinc-950 border-zinc-800"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={newItem.category} 
                    onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                  >
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="skill">Skill</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={newItem.priority} 
                    onValueChange={(v) => setNewItem({ ...newItem, priority: v })}
                  >
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Link (Optional)</label>
                <Input 
                  placeholder="https://..." 
                  className="bg-zinc-950 border-zinc-800"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                  placeholder="Why do you want to learn this?" 
                  className="bg-zinc-950 border-zinc-800"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddingItem(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</Button>
              <Button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700">Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search backlog..." 
            className="bg-zinc-900 border-zinc-800 pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-zinc-400">Loading your backlog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 border-dashed border-zinc-800 bg-transparent flex flex-col items-center justify-center text-center">
          <ClipboardList className="w-12 h-12 text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium text-zinc-300">Your backlog is empty</h3>
          <p className="text-zinc-500 max-w-sm mt-2">
            Start adding courses, skills, or projects you're interested in to plan your journey.
          </p>
          <Button variant="outline" className="mt-6 border-zinc-800" onClick={() => setIsAddingItem(true)}>
            Add your first item
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="p-5 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800 text-blue-500">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-200">{item.title}</h4>
                    <p className="text-xs text-zinc-500 capitalize">{item.category}</p>
                  </div>
                </div>
                <Badge className={`text-[10px] uppercase tracking-wider ${getPriorityColor(item.priority)}`}>
                  {item.priority}
                </Badge>
              </div>

              {item.description && (
                <p className="text-sm text-zinc-400 line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 px-2 text-zinc-500 hover:text-green-500 hover:bg-green-500/10"
                    onClick={() => handleStartItem(item)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                  {item.url && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-zinc-500 hover:text-blue-500" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
