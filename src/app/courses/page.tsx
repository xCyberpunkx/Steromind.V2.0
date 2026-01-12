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
import { Button } from "@/components/ui/button"
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
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Courses</h1>
          <p className="text-gray-500">Track your learning progress and upcoming subjects.</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
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
                    <button className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1">
                      Continue <ExternalLink className="w-3.5 h-3.5" />
                    </button>
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
        </div>
      )}
    </div>
  )
}
