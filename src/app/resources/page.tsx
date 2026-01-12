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
  MoreVertical,
  Sparkles,
  Zap,
  Bookmark
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
import { motion, AnimatePresence } from "framer-motion"

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
      toast.success('Knowledge fragment secured')
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
      toast.success('Resource purged')
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Library className="w-3.5 h-3.5" />
            Information Repository
          </div>
          <h1 className="text-5xl font-black tracking-tight">Cognitive <span className="gold-text italic">Assets</span></h1>
          <p className="text-muted-foreground font-medium max-w-md">
            Your high-fidelity library of learning materials. Curate the sources that accelerate your evolution.
          </p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-white h-14 px-8 rounded-2xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
              <Plus className="w-5 h-5" />
              Secure Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900/95 border-zinc-800 text-white backdrop-blur-xl sm:max-w-md rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Secure Asset</DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Add a new intelligence stream to your repository.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Asset Title</label>
                <Input 
                  placeholder="e.g. LLM Reasoning Patterns" 
                  className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Source URL</label>
                <Input 
                  placeholder="https://..." 
                  className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Classification</label>
                <select 
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                  className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
                >
                  {RESOURCE_TYPES.filter(t => t.value !== 'all').map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-zinc-400 font-bold">Abort</Button>
              <Button onClick={handleAddResource} className="gold-gradient text-white h-12 px-8 rounded-xl font-black shadow-lg shadow-primary/20">Secure Asset</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search cognitive streams..." 
            className="bg-secondary/10 border-border/40 pl-11 h-14 rounded-2xl focus:ring-primary font-medium text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-secondary/10 p-1 rounded-2xl border border-border/40 w-full lg:w-auto overflow-x-auto custom-scrollbar">
          {RESOURCE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === type.value 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              <type.icon className="w-3.5 h-3.5" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-50">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-sm font-black uppercase tracking-[0.3em] text-primary">Scanning Records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-24 apple-card border-dashed border-border/40 bg-transparent flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-8">
            <Bookmark className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Repository Empty</h3>
          <p className="text-muted-foreground font-medium max-w-xs mt-4">
            No cognitive assets found matching your current filters. Populate your library.
          </p>
          <Button variant="outline" className="mt-10 border-border/40 rounded-xl px-10 h-14 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsAdding(true)}>
            Initialize Asset Record
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((resource) => {
              const TypeIcon = RESOURCE_TYPES.find(t => t.value === resource.resource_type)?.icon || LinkIcon
              return (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="apple-card p-8 group relative overflow-hidden h-full flex flex-col hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/40 hover:border-primary/30">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                        <TypeIcon className="w-5 h-5 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white rounded-xl shadow-2xl">
                          <DropdownMenuItem className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer font-bold gap-2 p-3" onClick={() => handleDeleteResource(resource.id)}>
                            <Trash2 className="w-4 h-4" />
                            Purge Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-2 mb-8 flex-1">
                      <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-[10px] font-mono text-zinc-500 truncate opacity-60">
                        {resource.url}
                      </p>
                    </div>
                    
                    <div className="pt-6 border-t border-border/20 flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                        {resource.resource_type}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-9 rounded-xl text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 gap-2" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          Open Stream <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
