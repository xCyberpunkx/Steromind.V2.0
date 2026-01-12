"use client"
import { useState, useEffect } from "react"
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Loader2,
  Trash2,
  Pencil,
  FileText
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
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

type Course = {
  id: string
  user_id?: string
  title: string
  platform: string
  status: 'backlog' | 'in-progress' | 'completed' | 'enrolled'
  completion_percentage: number
  summary?: string
  url?: string
  tags?: string[]
  created_at: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    status: 'enrolled',
    completion_percentage: 0,
    summary: '',
    url: '',
    tags: ''
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      setLoading(true)
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

  const resetForm = () => {
    setFormData({
      title: '',
      platform: '',
      status: 'enrolled',
      completion_percentage: 0,
      summary: '',
      url: '',
      tags: ''
    })
    setEditingCourse(null)
    setIsAddingCourse(false)
  }

  const handleSaveCourse = async () => {
    if (!formData.title) {
      toast.error('Please enter a course title')
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        toast.error('You must be logged in to save a course')
        return
      }

      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)

      const payload = {
        title: formData.title,
        platform: formData.platform,
        status: formData.status,
        completion_percentage: Number(formData.completion_percentage),
        summary: formData.summary,
        url: formData.url,
        tags: tagsArray,
        notes: '' // defaulting notes to empty string as it might be required or just good practice
      }

      if (editingCourse) {
        // Update
        const { error } = await supabase
          .from('courses')
          .update(payload)
          .eq('id', editingCourse.id)

        if (error) throw error

        setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...payload, id: editingCourse.id, created_at: editingCourse.created_at, user_id: editingCourse.user_id } as Course : c))
        toast.success('Course updated')
      } else {
        // Create
        const { data, error } = await supabase
          .from('courses')
          .insert([{
            ...payload,
            user_id: userData.user.id
          }])
          .select()
          .single()

        if (error) throw error

        await logActivity(userData.user.id)

        setCourses([data, ...courses])
        toast.success('Course added')
      }
      resetForm()
    } catch (error) {
      console.error('Error saving course:', error)
      toast.error('Failed to save course')
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCourses(courses.filter(c => c.id !== id))
      toast.success('Course deleted')
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course')
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      platform: course.platform || '',
      status: course.status as any,
      completion_percentage: course.completion_percentage,
      summary: course.summary || '',
      url: course.url || '',
      tags: course.tags ? course.tags.join(', ') : ''
    })
    setIsAddingCourse(true)
  }

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true
    return course.status === filter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'enrolled': return <Clock className="w-4 h-4 text-primary" />
      case 'in-progress': return <Clock className="w-4 h-4 text-primary" />
      case 'backlog': return <AlertCircle className="w-4 h-4 text-muted-foreground" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Courses</h1>
          <p className="text-gray-500">Track your learning progress and upcoming subjects.</p>
        </div>
        <Dialog open={isAddingCourse} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsAddingCourse(open)
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
              <DialogDescription className="text-gray-500">
                Track a new course or tutorial you're taking.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Course Title</label>
                <Input
                  placeholder="e.g. Ultimate React Course"
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Platform</label>
                  <Input
                    placeholder="e.g. Udemy, YouTube"
                    className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger className="bg-white border-gray-200 focus:ring-amber-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="enrolled">Enrolled (In Progress)</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">Completion ({formData.completion_percentage}%)</label>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  className="cursor-pointer"
                  value={formData.completion_percentage}
                  onChange={(e) => setFormData({ ...formData, completion_percentage: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">URL (Optional)</label>
                <Input
                  placeholder="https://..."
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tags (comma separated)</label>
                <Input
                  placeholder="react, frontend, design"
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Summary/Notes</label>
                <Input
                  placeholder="Brief summary..."
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSaveCourse} className="bg-amber-600 hover:bg-amber-700 text-white">
                {editingCourse ? 'Update Course' : 'Add Course'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['all', 'in-progress', 'completed', 'backlog'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${filter === f
              ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            {f.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-6 h-full flex flex-col bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{course.title}</h3>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">{course.platform}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="px-2.5 py-0.5 rounded-full border-gray-200 bg-gray-50 text-xs font-medium text-gray-600 flex items-center gap-1.5 capitalize">
                      {getStatusIcon(course.status)}
                      {course.status.replace('-', ' ')}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-6">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {course.summary || "No description provided for this course yet."}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-500">Progress</span>
                        <span className="font-bold text-amber-600">{course.completion_percentage}%</span>
                      </div>
                      <Progress value={course.completion_percentage} className="h-2 bg-gray-100" />
                    </div>

                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag: string) => (
                          <span key={tag} className="px-2.5 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Added {new Date(course.created_at).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-600" onClick={() => handleEdit(course)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDeleteCourse(course.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {course.url && (
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50" asChild>
                          <a href={course.url} target="_blank" rel="noopener noreferrer">
                            Continue <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">Try changing your filter or add a new course.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddingCourse(true)}>
            Add Course
          </Button>
        </div>
      )}
    </div>
  )
}
