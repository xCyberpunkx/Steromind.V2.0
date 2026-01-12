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
  ChevronRight
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
      toast.success('Screenshot uploaded')
    } catch (error) {
      console.error('Error uploading screenshot:', error)
      toast.error('Failed to upload screenshot')
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
        toast.success('Project added successfully')
    } catch (error) {
      console.error('Error adding project:', error)
      toast.error('Failed to add project')
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
      toast.success('Changes saved')
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Failed to save changes')
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      setProjects(projects.filter(p => p.id !== id))
      toast.success('Project deleted')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
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
      className="space-y-10 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Showcase
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Project Gallery</h2>
          <p className="text-muted-foreground font-medium text-lg">Your portfolio of engineering excellence.</p>
        </div>
        <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-2xl gold-gradient text-white font-bold shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95">
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="apple-card border-none max-w-lg p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Add Project</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Document your creation with precision.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddProject)} className="space-y-6 py-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Project Title</label>
                  <Input 
                    {...register("title")}
                    placeholder="e.g. Distributed System Monitor" 
                    className={`h-12 bg-secondary/30 border-border/50 rounded-2xl focus:ring-primary/20 transition-all ${errors.title ? "border-destructive" : ""}`}
                  />
                  {errors.title && <p className="text-xs text-destructive font-medium ml-1">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Screenshot</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-48 border-2 border-dashed border-border/50 rounded-2xl bg-secondary/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden"
                  >
                    {currentImageUrl ? (
                      <>
                        <img src={currentImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <p className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Change Image
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                        {uploading ? (
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        ) : (
                          <>
                            <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center shadow-sm">
                              <Upload className="w-7 h-7" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest">Click to upload screenshot</p>
                          </>
                        )}
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Description</label>
                  <Input 
                    {...register("description")}
                    placeholder="Briefly describe the architectural challenge..." 
                    className={`h-12 bg-secondary/30 border-border/50 rounded-2xl focus:ring-primary/20 transition-all ${errors.description ? "border-destructive" : ""}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Live URL</label>
                    <Input 
                      {...register("url")}
                      placeholder="https://..." 
                      className={`h-12 bg-secondary/30 border-border/50 rounded-2xl focus:ring-primary/20 transition-all ${errors.url ? "border-destructive" : ""}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Repo URL</label>
                    <Input 
                      {...register("repo_url")}
                      placeholder="https://github.com/..." 
                      className={`h-12 bg-secondary/30 border-border/50 rounded-2xl focus:ring-primary/20 transition-all ${errors.repo_url ? "border-destructive" : ""}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Tags</label>
                  <div className="relative group">
                    <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="Press Enter to add tags" 
                      className="h-12 bg-secondary/30 border-border/50 pl-12 rounded-2xl focus:ring-primary/20 transition-all"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 ml-1">
                    <AnimatePresence>
                      {currentTags.map(tag => (
                        <motion.div
                          key={tag}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                        >
                          <Badge className="bg-primary/10 text-primary border-none font-bold gap-2 pl-3 pr-2 py-1.5 rounded-xl">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-lg p-0.5 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsAddingProject(false)} className="h-12 px-6 rounded-2xl font-bold">Cancel</Button>
                <Button type="submit" disabled={uploading} className="h-12 px-8 rounded-2xl gold-gradient text-white font-bold shadow-lg shadow-primary/20 transition-all hover:opacity-90">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search projects or technologies..." 
            className="h-14 bg-card/50 apple-card border-none pl-12 pr-5 rounded-2xl focus:ring-primary/20 transition-all text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 mr-2 text-muted-foreground font-bold text-xs uppercase tracking-widest">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          <AnimatePresence>
            {allTags.map(tag => (
              <motion.div
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge 
                  variant={selectedTag === tag ? "default" : "outline"}
                  className={`cursor-pointer h-9 px-4 rounded-xl border-border/50 font-bold transition-all ${
                    selectedTag === tag 
                      ? 'gold-gradient text-white border-none shadow-md shadow-primary/20' 
                      : 'bg-background/50 backdrop-blur-sm text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Assembling Gallery...</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="apple-card overflow-hidden h-full flex flex-col group border-none">
                  <div className="relative aspect-video overflow-hidden bg-secondary/20">
                    {project.image_url ? (
                      <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30">
                        <Layers className="w-16 h-16 mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">No Preview</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute top-4 right-4 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      {project.repo_url && (
                        <Button size="icon" className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md text-foreground hover:bg-white shadow-xl shadow-black/10 transition-transform hover:scale-110" asChild>
                          <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                            <Github className="w-5 h-5" />
                          </a>
                        </Button>
                      )}
                      {project.url && (
                        <Button size="icon" className="w-10 h-10 rounded-2xl gold-gradient text-white shadow-xl shadow-primary/20 transition-transform hover:scale-110" asChild>
                          <a href={project.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </Button>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 translate-y-[10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      {project.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} className="bg-white/20 backdrop-blur-md text-white border-none text-[10px] font-bold uppercase py-0 px-2 rounded-lg">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold tracking-tight mb-3 group-hover:text-primary transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    
                    <p className="text-muted-foreground font-medium text-sm line-clamp-2 mb-8 flex-1 leading-relaxed">
                      {project.description || "An exploration into advanced software engineering principles and architectural excellence."}
                    </p>
    
                    <div className="pt-6 border-t border-border/50 flex items-center justify-between gap-4">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl font-bold hover:bg-primary/5 hover:text-primary transition-all">
                              <FileText className="w-4 h-4 mr-2" />
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl p-0 overflow-hidden apple-card border-none">
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
                          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="h-10 px-4 text-primary font-bold uppercase tracking-widest text-[10px] hover:bg-primary/5 rounded-xl group/btn" asChild>
                        <a href={project.url || project.repo_url || "#"} target="_blank" rel="noopener noreferrer">
                          Open Project
                          <ChevronRight className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center opacity-50">
          <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
            <Layers className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold">No projects matched your search</h3>
          <p className="font-medium">Create your first masterpiece to see it here.</p>
        </div>
      )}
    </motion.div>
  )
}
