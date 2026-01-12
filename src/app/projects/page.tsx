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
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Project Gallery</h2>
          <p className="text-gray-500 font-medium">Your portfolio of engineering excellence.</p>
        </div>
        <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg p-6 bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add Project</DialogTitle>
              <DialogDescription className="text-gray-500">
                Document your creation with precision.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddProject)} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Project Title</label>
                  <Input
                    {...register("title")}
                    placeholder="e.g. Distributed System Monitor"
                    className={`bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500 ${errors.title ? "border-red-500" : ""}`}
                  />
                  {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Screenshot</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-48 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all overflow-hidden"
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
                      <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-amber-600 transition-colors">
                        {uploading ? (
                          <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-medium uppercase tracking-widest">Click to upload screenshot</p>
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
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Input
                    {...register("description")}
                    placeholder="Briefly describe the architectural challenge..."
                    className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Live URL</label>
                    <Input
                      {...register("url")}
                      placeholder="https://..."
                      className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Repo URL</label>
                    <Input
                      {...register("repo_url")}
                      placeholder="https://github.com/..."
                      className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tags</label>
                  <div className="relative group">
                    <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                    <Input
                      placeholder="Press Enter to add tags"
                      className="bg-white border-gray-200 pl-10 focus:border-amber-500 focus:ring-amber-500"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <AnimatePresence>
                      {currentTags.map(tag => (
                        <motion.div
                          key={tag}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                        >
                          <Badge className="bg-amber-100 text-amber-800 border-none font-medium gap-1 pl-2.5 pr-1.5 py-1">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:bg-amber-200 rounded p-0.5 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddingProject(false)}>Cancel</Button>
                <Button type="submit" disabled={uploading} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
          <Input
            placeholder="Search projects or technologies..."
            className="h-10 bg-white border-gray-200 pl-10 rounded-md focus:border-amber-500 focus:ring-amber-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 mr-2 text-gray-500 font-medium text-xs uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          <AnimatePresence>
            {allTags.map(tag => (
              <motion.div
                key={tag}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Badge
                  variant={selectedTag === tag ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1 rounded-md font-medium transition-all ${selectedTag === tag
                    ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
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
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-gray-500 font-medium text-sm">Loading projects...</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="overflow-hidden h-full flex flex-col group border-gray-200 bg-white hover:shadow-md transition-shadow">
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Layers className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-xs font-medium uppercase tracking-wider">No Preview</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      {project.repo_url && (
                        <Button size="icon" variant="secondary" className="rounded-full bg-white text-gray-900 hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75" asChild>
                          <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {project.url && (
                        <Button size="icon" className="rounded-full bg-amber-600 text-white hover:bg-amber-700 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100" asChild>
                          <a href={project.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold tracking-tight mb-2 text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {project.title}
                    </h3>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {project.description || "No description provided."}
                    </p>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                              <FileText className="w-4 h-4 mr-2" />
                              <span className="text-xs">Notes</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white">
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
                          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <Button variant="ghost" size="sm" className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 group/btn" asChild>
                        <a href={project.url || project.repo_url || "#"} target="_blank" rel="noopener noreferrer">
                          <span className="text-xs font-medium">Open</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
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
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No projects matched</h3>
          <p>Create your first masterpiece to see it here.</p>
        </div>
      )}
    </motion.div>
  )
}
