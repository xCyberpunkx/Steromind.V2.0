"use client"

import { useState, useEffect } from "react"
import { 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Link as LinkIcon, 
  Video, 
  BookOpen, 
  File, 
  Loader2,
  Library,
  MoreVertical
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase, LearningResource } from "@/lib/supabase"
import { toast } from "sonner"

const RESOURCE_TYPES = [
  { value: 'all', label: 'All Resources', icon: Library },
  { value: 'link', label: 'Links', icon: LinkIcon },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'tutorial', label: 'Tutorials', icon: BookOpen },
  { value: 'document', label: 'Documents', icon: File },
]

export default function ResourcesPage() {
  const [resources, setResources] = useState<LearningResource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [isAdding, setIsAdding] = useState(false)
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'link' })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.url) {
      toast.error('Please provide a title and URL')
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('learning_resources')
        .insert([{
          title: newResource.title,
          url: newResource.url,
          resource_type: newResource.type,
          user_id: userData.user?.id || '00000000-0000-0000-0000-000000000000'
        }])
        .select()
        .single()

      if (error) throw error
      
      setResources([data, ...resources])
      setNewResource({ title: '', url: '', type: 'link' })
      setIsAdding(false)
      toast.success('Resource added successfully')
    } catch (error) {
      console.error('Error adding resource:', error)
      toast.error('Failed to add resource')
    }
  }

  const handleDeleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('learning_resources')
        .delete()
        .eq('id', id)

      if (error) throw error
      setResources(resources.filter(r => r.id !== id))
      toast.success('Resource deleted')
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Failed to delete resource')
    }
  }

  const filtered = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.url.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || r.resource_type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resources</h2>
          <p className="text-zinc-400">Your curated library of learning materials.</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Save a link, video, or document for later reference.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource Title</label>
                <Input 
                  placeholder="e.g. React Documentation" 
                  className="bg-zinc-950 border-zinc-800"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource URL</label>
                <Input 
                  placeholder="https://..." 
                  className="bg-zinc-950 border-zinc-800"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select 
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                  className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-md px-3 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {RESOURCE_TYPES.filter(t => t.value !== 'all').map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</Button>
              <Button onClick={handleAddResource} className="bg-blue-600 hover:bg-blue-700">Add to Library</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search your library..." 
            className="bg-zinc-900 border-zinc-800 pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {RESOURCE_TYPES.map((type) => (
            <Button
              key={type.value}
              variant={filter === type.value ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilter(type.value)}
              className={filter === type.value ? "bg-blue-600/20 text-blue-400 border-blue-600/30" : "border-zinc-800 bg-zinc-900"}
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-zinc-400">Organizing your library...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <Library className="w-12 h-12 text-zinc-800 mb-4" />
          <p className="text-zinc-400 text-lg font-medium">No resources found</p>
          <p className="text-zinc-500 text-sm">Try a different search or add a new resource.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resource) => {
            const TypeIcon = RESOURCE_TYPES.find(t => t.value === resource.resource_type)?.icon || LinkIcon
            return (
              <Card key={resource.id} className="bg-zinc-900 border-zinc-800 group hover:border-zinc-700 transition-all duration-300 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                        <DropdownMenuItem className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer" onClick={() => handleDeleteResource(resource.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1 truncate group-hover:text-blue-400 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mb-4 truncate font-mono">
                    {resource.url}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <Badge variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-400 text-[10px] capitalize">
                      {resource.resource_type}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        Open <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
