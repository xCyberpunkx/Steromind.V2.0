"use client"

import { useState, useEffect, useRef } from "react"
import { 
  FileText, 
  Link as LinkIcon, 
  Video, 
  BookOpen, 
  File, 
  Plus, 
  Trash2, 
  ExternalLink,
  Loader2,
  Tag as TagIcon,
  X,
  Image as ImageIcon,
  Upload
} from "lucide-react"
import { 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase, LearningResource } from "@/lib/supabase"
import { toast } from "sonner"
import { logActivity } from "@/lib/activity"

interface NotesAndResourcesProps {
  title: string
  entityId: string
  entityType: 'course' | 'module' | 'project'
  initialNotes: string
  initialSummary: string
  initialTags?: string[]
  initialImageUrl?: string
  onSave: (notes: string, summary: string, tags: string[], imageUrl?: string) => void
}

const RESOURCE_TYPES = [
  { value: 'link', label: 'Link', icon: LinkIcon },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'tutorial', label: 'Tutorial', icon: BookOpen },
  { value: 'document', label: 'Document', icon: File },
]

export function NotesAndResources({ 
  title, 
  entityId, 
  entityType,
  initialNotes, 
  initialSummary,
  initialTags = [],
  initialImageUrl = "",
  onSave 
}: NotesAndResourcesProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [summary, setSummary] = useState(initialSummary)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)
  const [tagInput, setTagInput] = useState("")
  const [resources, setResources] = useState<LearningResource[]>([])
  const [loading, setLoading] = useState(true)
  const [addingResource, setAddingResource] = useState(false)
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'link' })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  useEffect(() => {
    fetchResources()
  }, [entityId])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const field = entityType === 'course' ? 'course_id' : entityType === 'module' ? 'module_id' : 'project_id'
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq(field, entityId)
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

      setImageUrl(publicUrl)
      toast.success('Screenshot updated')
    } catch (error) {
      console.error('Error uploading screenshot:', error)
      toast.error('Failed to upload screenshot')
    } finally {
      setUploading(false)
    }
  }

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.url) {
      toast.error('Please provide a title and URL')
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      const field = entityType === 'course' ? 'course_id' : entityType === 'module' ? 'module_id' : 'project_id'
      
      const { data, error } = await supabase
        .from('learning_resources')
        .insert([{
          title: newResource.title,
          url: newResource.url,
          resource_type: newResource.type,
          [field]: entityId,
          user_id: userData.user?.id || '00000000-0000-0000-0000-000000000000'
        }])
        .select()
        .single()

      if (error) throw error
      
      if (userData.user) {
        await logActivity(userData.user.id)
      }

      setResources([data, ...resources])
      setNewResource({ title: '', url: '', type: 'link' })
      setAddingResource(false)
      toast.success('Resource added')
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

  return (
    <div className="flex flex-col h-[600px]">
      <div className="px-6 pt-6 pb-2 border-b border-zinc-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Manage: {title}
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Capture notes, summaries, and save learning resources.
        </p>
      </div>

      <Tabs defaultValue="notes" className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
            <TabsList className="bg-zinc-950 border border-zinc-800 p-1">
              <TabsTrigger value="notes" className="data-[state=active]:bg-zinc-800">Notes</TabsTrigger>
              <TabsTrigger value="summary" className="data-[state=active]:bg-zinc-800">Summary</TabsTrigger>
              <TabsTrigger value="tags" className="data-[state=active]:bg-zinc-800">Tags</TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:bg-zinc-800">Resources</TabsTrigger>
              {entityType === 'project' && (
                <TabsTrigger value="screenshot" className="data-[state=active]:bg-zinc-800">Screenshot</TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="notes" className="flex-1 p-6 space-y-4 focus-visible:ring-0">
            <div className="space-y-2 flex flex-col h-full">
              <label className="text-sm font-medium text-zinc-400">Quick Notes</label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down quick thoughts, shortcuts, or key concepts..."
                className="flex-1 min-h-0 bg-zinc-950 border-zinc-800 focus:ring-blue-500 resize-none"
              />
            </div>
          </TabsContent>

          <TabsContent value="summary" className="flex-1 p-6 space-y-4 focus-visible:ring-0">
            <div className="space-y-2 flex flex-col h-full">
              <label className="text-sm font-medium text-zinc-400">Final Summary</label>
              <Textarea 
                value={summary} 
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What are the biggest takeaways from this? Explain it to yourself in 3 sentences."
                className="flex-1 min-h-0 bg-zinc-950 border-zinc-800 focus:ring-blue-500 resize-none"
              />
            </div>
          </TabsContent>

          <TabsContent value="tags" className="flex-1 p-6 space-y-4 focus-visible:ring-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Add Tags</label>
                <div className="relative">
                  <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input 
                    placeholder="Type a tag and press Enter (e.g. Web, C++, Security)" 
                    className="bg-zinc-950 border-zinc-800 pl-10"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Active Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">No tags added yet.</p>
                  ) : (
                    tags.map(tag => (
                      <Badge key={tag} className="bg-blue-600/10 text-blue-400 border-blue-600/20 py-1 pl-3 pr-1 gap-1 group/tag">
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)}
                          className="hover:bg-blue-600/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="screenshot" className="flex-1 p-6 space-y-4 focus-visible:ring-0">
            <div className="space-y-4 flex flex-col h-full">
              <label className="text-sm font-medium text-zinc-400">Project Screenshot</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex-1 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-950 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all overflow-hidden"
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Project Screenshot" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-xs font-medium text-white flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Change Screenshot
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover:text-blue-400">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <p className="text-sm font-medium">Click to upload screenshot</p>
                        <p className="text-xs text-zinc-600">Visuals help track your progress better.</p>
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
          </TabsContent>

        <TabsContent value="resources" className="flex-1 p-6 space-y-4 overflow-y-auto focus-visible:ring-0">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-400">Learning Materials</label>
            {!addingResource && (
              <Button size="sm" variant="outline" className="h-8 border-zinc-800" onClick={() => setAddingResource(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          {addingResource && (
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-4 animate-in fade-in zoom-in-95">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Title</label>
                  <Input 
                    placeholder="E.g. Official Docs" 
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    className="h-8 text-sm bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Type</label>
                  <select 
                    value={newResource.type}
                    onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    className="w-full h-8 text-sm bg-zinc-900 border-zinc-800 rounded-md px-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {RESOURCE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">URL</label>
                <Input 
                  placeholder="https://..." 
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  className="h-8 text-sm bg-zinc-900 border-zinc-800"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setAddingResource(false)}>Cancel</Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleAddResource}>Save Resource</Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : resources.length === 0 && !addingResource ? (
            <div className="text-center py-10 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-sm text-zinc-500">No resources saved yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {resources.map((resource) => {
                const TypeIcon = RESOURCE_TYPES.find(t => t.value === resource.resource_type)?.icon || LinkIcon
                return (
                  <div key={resource.id} className="group flex items-center justify-between p-3 rounded-lg bg-zinc-950/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-medium truncate">{resource.title}</h4>
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 truncate"
                        >
                          {resource.url} <ExternalLink className="w-2 h-2" />
                        </a>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="p-6 border-t border-zinc-800 mt-auto flex gap-2 justify-end bg-zinc-900/50">
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => onSave(notes, summary, tags, imageUrl)}
        >
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
