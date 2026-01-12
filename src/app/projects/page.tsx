"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Plus, 
  Code2, 
  ExternalLink, 
  Github, 
  Search, 
  Filter, 
  FileText, 
  Loader2, 
  Tag as TagIcon, 
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Box
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
import { supabase, Project } from "@/lib/supabase"
import { NotesAndResources } from "@/components/NotesAndResources"
import { toast } from "sonner"
import { logActivity } from "@/lib/activity"
import { motion, AnimatePresence } from "framer-motion"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  url: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
  repo_url: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
  tags: z.array(z.string()),
  image_url: z.string().optional()
})

type ProjectFormValues = z.infer<typeof projectSchema>

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      repo_url: '',
      tags: [],
      image_url: ''
    }
  })

  const currentTags = watch("tags")
  const currentImageUrl = watch("image_url")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id || 'public'
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('project-screenshots')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('project-screenshots')
        .getPublicUrl(fileName)

      setValue("image_url", publicUrl)
      toast.success('Asset captured successfully')
    } catch (error) {
      console.error('Error uploading screenshot:', error)
      toast.error('Failed to capture asset')
    } finally {
      setUploading(false)
    }
  }

  const handleAddProject = async (data: ProjectFormValues) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data: insertedData, error } = await supabase
        .from('projects')
        .insert([{
          title: data.title,
          description: data.description,
          url: data.url,
          repo_url: data.repo_url,
          tags: data.tags,
          image_url: data.image_url,
          user_id: userData.user?.id || '00000000-0000-0000-0000-000000000000'
        }])
        .select()
        .single()

        if (error) throw error
        
        if (userData.user) {
          await logActivity(userData.user.id)
        }
        
        setProjects([insertedData, ...projects])
        reset()
        setIsAddingProject(false)
        toast.success('New artifact deployed')
    } catch (error) {
      console.error('Error adding project:', error)
      toast.error('Deployment failed')
    }
  }

  const handleSaveNotes = async (projectId: string, notes: string, summary: string, tags: string[], image_url?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const updateData: any = { notes, summary, tags }
      if (image_url !== undefined) {
        updateData.image_url = image_url
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)

      if (error) throw error

      if (userData.user) {
        await logActivity(userData.user.id)
      }

      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updateData } : p))
      toast.success('Cognitive data synchronized')
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Synchronization failed')
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      setProjects(projects.filter(p => p.id !== id))
      toast.success('Artifact deconstructed')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Deconstruction failed')
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (!currentTags.includes(newTag)) {
        setValue("tags", [...currentTags, newTag])
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setValue("tags", currentTags.filter(t => t !== tagToRemove))
  }

  const allTags = Array.from(new Set(projects.flatMap(p => p.tags || []))).sort()

  const filtered = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
      (p.description?.toLowerCase() || "").includes(search.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchesTag = !selectedTag || p.tags?.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Box className="w-3.5 h-3.5" />
            Artifact Repository
          </div>
          <h1 className="text-5xl font-black tracking-tight">Engineering <span className="gold-text italic">Manifest</span></h1>
          <p className="text-muted-foreground font-medium max-w-md">
            The documentation of your architectural evolution. High-fidelity systems built through focused synthesis.
          </p>
        </div>
        
        <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-white h-14 px-8 rounded-2xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
              <Plus className="w-5 h-5" />
              Deploy Artifact
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900/95 border-zinc-800 text-white backdrop-blur-xl sm:max-w-md rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Deploy Artifact</DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Record your creation in the neural database.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddProject)} className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Artifact Title</label>
                <Input 
                  {...register("title")}
                  placeholder="e.g. Neural Link Interface" 
                  className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                />
                {errors.title && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Visual Asset</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-40 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-950 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden"
                >
                  {currentImageUrl ? (
                    <>
                      <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Update Asset
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-zinc-700 group-hover:text-primary transition-colors">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      ) : (
                        <>
                          <ImageIcon className="w-10 h-10" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Capture Visual</p>
                        </>
                      )}
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Specification</label>
                <Input 
                  {...register("description")}
                  placeholder="Brief architectural overview..." 
                  className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Live Node</label>
                  <Input 
                    {...register("url")}
                    placeholder="https://..." 
                    className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Source Logic</label>
                  <Input 
                    {...register("repo_url")}
                    placeholder="GitHub URL..." 
                    className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsAddingProject(false)} className="text-zinc-400 font-bold">Abort</Button>
                <Button type="submit" disabled={uploading} className="gold-gradient text-white h-12 px-8 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search artifact parameters..." 
            className="bg-secondary/10 border-border/40 pl-11 h-14 rounded-2xl focus:ring-primary font-medium text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-secondary/10 p-1 rounded-2xl border border-border/40 w-full lg:w-auto overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 px-4 text-muted-foreground font-black text-[10px] uppercase tracking-widest border-r border-border/20 mr-2">
            <Filter className="w-3.5 h-3.5" />
            Logic:
          </div>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedTag === tag 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-50">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-sm font-black uppercase tracking-[0.3em] text-primary">Analyzing Repository...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="apple-card overflow-hidden h-full flex flex-col group border-border/40 hover:border-primary/30">
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950 border-b border-border/20">
                    {project.image_url ? (
                      <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-800">
                        <Layers className="w-16 h-16 mb-4 opacity-20" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Artifact Null</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      {project.repo_url && (
                        <Button size="icon" className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 shadow-2xl transition-all" asChild>
                          <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4.5 h-4.5" />
                          </a>
                        </Button>
                      )}
                      {project.url && (
                        <Button size="icon" className="w-9 h-9 rounded-xl gold-gradient text-white shadow-2xl transition-all" asChild>
                          <a href={project.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4.5 h-4.5" />
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                      {project.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} className="bg-primary/20 backdrop-blur-md text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12" />
                    <h3 className="text-2xl font-black tracking-tight mb-3 group-hover:text-primary transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground font-medium text-sm line-clamp-2 mb-8 flex-1 leading-relaxed">
                      {project.description || "An exploration into advanced software engineering principles and architectural excellence."}
                    </p>
    
                    <div className="pt-6 border-t border-border/20 flex items-center justify-between gap-4">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 text-primary transition-all">
                              <FileText className="w-3.5 h-3.5 mr-2" />
                              Specifications
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-zinc-900 border-zinc-800 backdrop-blur-2xl rounded-[2.5rem]">
                            <NotesAndResources 
                              title={project.title}
                              entityId={project.id}
                              entityType="project"
                              initialNotes={project.notes || ""}
                              initialSummary={project.summary || ""}
                              initialTags={project.tags || []}
                              onSave={(notes, summary, tags) => handleSaveNotes(project.id, notes, summary, tags)}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="h-9 rounded-xl text-primary font-black uppercase tracking-[0.2em] text-[9px] hover:bg-primary/5 gap-2 group/btn" asChild>
                        <a href={project.url || project.repo_url || "#"} target="_blank" rel="noopener noreferrer">
                          Execute Artifact <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="p-32 apple-card border-dashed border-border/40 bg-transparent flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-8">
            <Layers className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Repository Query Null</h3>
          <p className="text-muted-foreground font-medium max-w-xs mt-4">
            No engineering artifacts matched your current parameters.
          </p>
          <Button variant="outline" className="mt-10 border-border/40 rounded-xl px-10 h-14 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsAddingProject(true)}>
            Initialize Deployment
          </Button>
        </Card>
      )}
    </motion.div>
  )
}
