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
  Tag,
  Pencil
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
  const [editingItem, setEditingItem] = useState<BacklogItem | null>(null)
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

  const resetForm = () => {
    setNewItem({ title: '', category: 'course', priority: 'medium', url: '', description: '' })
    setEditingItem(null)
    setIsAddingItem(false)
  }

  const handleSaveItem = async () => {
    if (!newItem.title) {
      toast.error('Please provide a title')
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id || '00000000-0000-0000-0000-000000000000'

      if (editingItem) {
        // Update
        const { error } = await supabase
          .from('backlog')
          .update({
            title: newItem.title,
            category: newItem.category,
            priority: newItem.priority,
            url: newItem.url || null,
            description: newItem.description || null
          })
          .eq('id', editingItem.id)

        if (error) throw error

        setItems(items.map(i => i.id === editingItem.id ? { ...i, ...newItem } : i))
        toast.success('Item updated')
      } else {
        // Create
        const { data, error } = await supabase
          .from('backlog')
          .insert([{
            ...newItem,
            user_id: userId,
            status: 'pending'
          }])
          .select()
          .single()

        if (error) throw error

        if (userData.user) {
          await logActivity(userData.user.id)
        }
        setItems([data, ...items])
        toast.success('Added to backlog')
      }

      resetForm()
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save item')
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

  const handleEdit = (item: BacklogItem) => {
    setEditingItem(item)
    setNewItem({
      title: item.title,
      category: item.category,
      priority: item.priority,
      url: item.url || '',
      description: item.description || ''
    })
    setIsAddingItem(true)
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
      case 'high': return 'text-red-700 bg-red-50 border-red-200'
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200'
      case 'low': return 'text-sky-700 bg-sky-50 border-sky-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
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
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Wishlist & Backlog</h2>
          <p className="text-gray-500">Plan your future learning and projects.</p>
        </div>
        <Dialog open={isAddingItem} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsAddingItem(open)
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add to Backlog
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingItem ? 'Edit Item' : 'Add to Wishlist'}</DialogTitle>
              <DialogDescription className="text-gray-500">
                What do you want to learn or build next?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  placeholder="e.g. Advanced Rust Patterns"
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select
                    value={newItem.category}
                    onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                  >
                    <SelectTrigger className="bg-white border-gray-200 focus:ring-amber-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 text-gray-900">
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="skill">Skill</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <Select
                    value={newItem.priority}
                    onValueChange={(v) => setNewItem({ ...newItem, priority: v })}
                  >
                    <SelectTrigger className="bg-white border-gray-200 focus:ring-amber-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 text-gray-900">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Link (Optional)</label>
                <Input
                  placeholder="https://..."
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  placeholder="Why do you want to learn this?"
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSaveItem} className="bg-amber-600 hover:bg-amber-700 text-white">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search backlog..."
            className="bg-white border-gray-200 pl-10 focus:border-amber-500 focus:ring-amber-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-gray-500">Loading your backlog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Your backlog is empty</h3>
          <p className="text-gray-500 max-w-sm mt-2">
            Start adding courses, skills, or projects you're interested in to plan your journey.
          </p>
          <Button variant="outline" className="mt-6 border-gray-200 bg-white hover:bg-gray-50 text-gray-900" onClick={() => setIsAddingItem(true)}>
            Add your first item
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="p-5 bg-white border-gray-200 hover:shadow-md transition-all flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{item.title}</h4>
                    <p className="text-xs text-gray-500 capitalize font-medium">{item.category}</p>
                  </div>
                </div>
                <Badge className={`text-[10px] uppercase tracking-wider font-bold ${getPriorityColor(item.priority)}`}>
                  {item.priority}
                </Badge>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-gray-500 hover:text-green-600 hover:bg-green-50"
                    onClick={() => handleStartItem(item)}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                  {item.url && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-amber-600 hover:bg-amber-50" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
