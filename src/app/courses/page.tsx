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
  Loader2
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true
    return course.status === filter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'in-progress': return <Clock className="w-4 h-4 text-primary" />
      case 'backlog': return <AlertCircle className="w-4 h-4 text-muted-foreground" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">My Courses</h1>
          <p className="text-muted-foreground font-medium">Track your learning progress and upcoming subjects.</p>
        </div>
        <button className="apple-button gold-gradient text-white flex items-center justify-center gap-2 px-6">
          <Plus className="w-4 h-4" />
          <span className="font-bold">Add Course</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {['all', 'in-progress', 'completed', 'backlog'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
              filter === f 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-card border-border/40 text-muted-foreground hover:border-primary/50'
            }`}
          >
            {f.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="apple-card p-8 group relative overflow-hidden h-full flex flex-col">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-xl shadow-primary/10">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{course.platform}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 rounded-full border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                      {getStatusIcon(course.status)}
                      {course.status.replace('-', ' ')}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-6">
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      {course.summary || "No description provided for this course yet."}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Completion Progress</span>
                        <span className="text-sm font-black text-primary">{course.completion_percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${course.completion_percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full gold-gradient shadow-[0_0_10px_rgba(200,160,80,0.3)]"
                        />
                      </div>
                    </div>

                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag: string) => (
                          <span key={tag} className="px-3 py-1 rounded-lg bg-secondary/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-border/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border/30 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground">Added {new Date(course.created_at).toLocaleDateString()}</p>
                    <button className="text-primary hover:opacity-70 transition-opacity flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest">Continue</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-40 bg-card/30 rounded-[2.5rem] border-2 border-dashed border-border/40">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
          <h3 className="text-xl font-black mb-2">No courses found</h3>
          <p className="text-muted-foreground font-medium">Try changing your filter or add a new course.</p>
        </div>
      )}
    </div>
  )
}
