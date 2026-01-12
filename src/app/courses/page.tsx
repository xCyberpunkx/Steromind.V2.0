"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Loader2, 
  BookOpen, 
  Trash2, 
  MoreVertical,
  ExternalLink,
  GraduationCap,
  Layout,
  Clock,
  CheckCircle2,
  Settings2,
  ArrowUpRight,
  TrendingUp,
  Award
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { motion, AnimatePresence } from "framer-motion"
import { NotesAndResources } from "@/components/NotesAndResources"

type Course = {
  id: string
  title: string
  platform: string
  status: string
  completion_percentage: number
  created_at: string
  notes?: string
  summary?: string
  tags?: string[]
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [newCourse, setNewCourse] = useState({ 
    title: '', 
    platform: '', 
    status: 'in-progress', 
    completion_percentage: 0 
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async () => {
    if (!newCourse.title) {
      toast.error('Please provide a title')
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          ...newCourse,
          user_id: userData.user?.id || '00000000-0000-0000-0000-000000000000'
        }])
        .select()
        .single()

      if (error) throw error
      
      if (userData.user) {
        await logActivity(userData.user.id)
      }

      setCourses([data, ...courses])
      setNewCourse({ title: '', platform: '', status: 'in-progress', completion_percentage: 0 })
      setIsAddingCourse(false)
      toast.success('New cognitive node initialized')
    } catch (error) {
      console.error('Error adding course:', error)
      toast.error('Failed to add course')
    }
  }

  const handleDeleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCourses(courses.filter(c => c.id !== id))
      toast.success('Node deconstructed')
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to remove course')
    }
  }

  const handleUpdateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCourses(courses.map(c => c.id === id ? data : c))
      toast.success('Node synchronized')
    } catch (error) {
      console.error('Error updating course:', error)
      toast.error('Failed to update course')
    }
  }

  const handleSaveNotesAndResources = async (id: string, notes: string, summary: string, tags: string[]) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ notes, summary, tags })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCourses(courses.map(c => c.id === id ? data : c))
      setEditingCourse(null)
      toast.success('Deep knowledge synthesized')
    } catch (error) {
      console.error('Error saving notes:', error)
      toast.error('Failed to save notes')
    }
  }

  const filtered = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                         course.platform?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: courses.length,
    completed: courses.filter(c => c.status === 'completed').length,
    inProgress: courses.filter(c => c.status === 'in-progress').length,
    averageProgress: courses.length > 0 
      ? Math.round(courses.reduce((acc, c) => acc + (c.completion_percentage || 0), 0) / courses.length) 
      : 0
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <GraduationCap className="w-3.5 h-3.5" />
            Academic Node Controller
          </div>
          <h1 className="text-5xl font-black tracking-tight">Cognitive <span className="gold-text italic">Nodes</span></h1>
          <p className="text-muted-foreground font-medium max-w-md">
            Synthesize knowledge through structured learning nodes. Track your evolution from novice to expert.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-white h-14 px-8 rounded-2xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                <Plus className="w-5 h-5" />
                Initialize Node
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900/95 border-zinc-800 text-white backdrop-blur-xl sm:max-w-md rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">New Cognitive Node</DialogTitle>
                <DialogDescription className="text-zinc-400 font-medium">
                  Define the parameters for your new learning trajectory.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Node Title</label>
                  <Input 
                    placeholder="e.g. Quantum Computing Fundamentals" 
                    className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Source Platform</label>
                    <Input 
                      placeholder="e.g. Coursera, MIT" 
                      className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                      value={newCourse.platform}
                      onChange={(e) => setNewCourse({ ...newCourse, platform: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Initial Status</label>
                    <Select 
                      value={newCourse.status} 
                      onValueChange={(v) => setNewCourse({ ...newCourse, status: v })}
                    >
                      <SelectTrigger className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="backlog">Backlog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddingCourse(false)} className="text-zinc-400 font-bold">Abort</Button>
                <Button onClick={handleAddCourse} className="gold-gradient text-white h-12 px-6 rounded-xl font-black shadow-lg shadow-primary/20">Initialize</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Nodes', value: stats.total, icon: Layout },
          { label: 'Synthesized', value: stats.completed, icon: CheckCircle2 },
          { label: 'In Synthesis', value: stats.inProgress, icon: Clock },
          { label: 'Avg Intensity', value: `${stats.averageProgress}%`, icon: TrendingUp },
        ].map((stat, i) => (
          <Card key={i} className="p-6 apple-card border-border/40 bg-secondary/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search neural frequencies..." 
            className="bg-secondary/10 border-border/40 pl-11 h-14 rounded-2xl focus:ring-primary font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-secondary/10 p-1 rounded-2xl border border-border/40 w-full sm:w-auto">
          {['all', 'in-progress', 'completed', 'backlog'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === status 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              {status === 'all' ? 'All Nodes' : status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-50">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-sm font-black uppercase tracking-[0.3em] text-primary">Synchronizing...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-20 apple-card border-dashed border-border/40 bg-transparent flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-8">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Focus Field Empty</h3>
          <p className="text-muted-foreground font-medium max-w-xs mt-4">
            No cognitive nodes found matching your current parameters.
          </p>
          <Button variant="outline" className="mt-10 border-border/40 rounded-xl px-8 h-12 font-bold" onClick={() => setIsAddingCourse(true)}>
            Initialize New Node
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="apple-card p-8 group relative overflow-hidden h-full flex flex-col hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/40 hover:border-primary/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                         <Badge className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                           course.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                           course.status === 'in-progress' ? 'bg-primary/10 text-primary border-primary/20' :
                           'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                         }`}>
                           {course.status.replace('-', ' ')}
                         </Badge>
                         {course.platform && (
                           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                             • {course.platform}
                           </span>
                         )}
                      </div>
                      <h4 className="text-xl font-black leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => setEditingCourse(course)}>
                        {course.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/10 text-primary" onClick={() => setEditingCourse(course)}>
                        <Settings2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-red-500" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-muted-foreground">Synthesis Level</span>
                       <span className="text-primary">{course.completion_percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.completion_percentage}%` }}
                        className="h-full gold-gradient rounded-full"
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-border/20 flex items-center justify-between">
                    <div className="flex gap-1">
                       {(course.tags || []).slice(0, 2).map((tag, i) => (
                         <span key={i} className="text-[9px] font-bold text-muted-foreground bg-secondary/20 px-2 py-0.5 rounded-md">
                           {tag}
                         </span>
                       ))}
                       {(course.tags || []).length > 2 && (
                         <span className="text-[9px] font-bold text-muted-foreground bg-secondary/20 px-2 py-0.5 rounded-md">
                           +{(course.tags || []).length - 2}
                         </span>
                       )}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 flex items-center gap-1.5" onClick={() => setEditingCourse(course)}>
                      Expand <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit/Manage Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="bg-zinc-900/95 border-zinc-800 text-white backdrop-blur-2xl sm:max-w-4xl p-0 overflow-hidden rounded-[2.5rem]">
          {editingCourse && (
            <div className="flex flex-col md:flex-row h-[700px]">
              <div className="w-full md:w-1/3 p-8 border-r border-zinc-800/50 bg-secondary/5 space-y-8 overflow-y-auto">
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Core Parameters</h3>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Title</label>
                          <Input 
                            value={editingCourse.title}
                            onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                            className="bg-zinc-950 border-zinc-800 h-10 rounded-xl focus:ring-primary"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Source</label>
                          <Input 
                            value={editingCourse.platform}
                            onChange={(e) => setEditingCourse({ ...editingCourse, platform: e.target.value })}
                            className="bg-zinc-950 border-zinc-800 h-10 rounded-xl focus:ring-primary"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</label>
                          <Select 
                            value={editingCourse.status} 
                            onValueChange={(v) => handleUpdateCourse(editingCourse.id, { status: v })}
                          >
                            <SelectTrigger className="bg-zinc-950 border-zinc-800 h-10 rounded-xl focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="backlog">Backlog</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Synthesis</label>
                             <span className="text-xs font-black text-primary">{editingCourse.completion_percentage}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={editingCourse.completion_percentage}
                            onChange={(e) => setEditingCourse({ ...editingCourse, completion_percentage: parseInt(e.target.value) })}
                            onMouseUp={() => handleUpdateCourse(editingCourse.id, { completion_percentage: editingCourse.completion_percentage })}
                            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-zinc-800/50">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 text-center">
                          <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Created</p>
                          <p className="text-xs font-black">{new Date(editingCourse.created_at).toLocaleDateString()}</p>
                       </div>
                       <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800 text-center">
                          <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">Rank</p>
                          <p className="text-xs font-black text-primary flex items-center justify-center gap-1">
                            <Award className="w-3 h-3" />
                            {editingCourse.completion_percentage > 90 ? 'Lvl 5' : 'Lvl 1'}
                          </p>
                       </div>
                    </div>
                 </div>

                 <Button 
                   className="w-full h-12 rounded-xl gold-gradient text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                   onClick={() => handleUpdateCourse(editingCourse.id, { 
                     title: editingCourse.title, 
                     platform: editingCourse.platform,
                     completion_percentage: editingCourse.completion_percentage
                   })}
                 >
                   Sync Changes
                 </Button>
              </div>

              <div className="flex-1 bg-zinc-950 overflow-hidden flex flex-col">
                 <NotesAndResources 
                    title={editingCourse.title}
                    entityId={editingCourse.id}
                    entityType="course"
                    initialNotes={editingCourse.notes || ""}
                    initialSummary={editingCourse.summary || ""}
                    initialTags={editingCourse.tags || []}
                    onSave={(notes, summary, tags) => handleSaveNotesAndResources(editingCourse.id, notes, summary, tags)}
                 />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
