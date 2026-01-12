"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  Code2,
  Award,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
  Zap,
  Star,
  Activity
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { SkillLevelIndicator } from "@/components/SkillLevelIndicator"
import { motion, Variants } from "framer-motion"
import { Progress } from "@radix-ui/react-progress"

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState([
    { name: 'Courses', value: '0', icon: BookOpen, trend: '0%' },
    { name: 'Projects', value: '0', icon: Code2, trend: '0%' },
    { name: 'Certificates', value: '0', icon: Award, trend: '-' },
    { name: 'Active Goals', value: '0', icon: Target, trend: '-' },
  ])
  const [recentCourses, setRecentCourses] = useState<any[]>([])
  const [topSkills, setTopSkills] = useState<any[]>([])
  const [upcomingGoals, setUpcomingGoals] = useState<any[]>([])
  const [progressData, setProgressData] = useState<any[]>([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { count: coursesCount },
        { count: projectsCount },
        { count: certsCount },
        { count: goalsCount },
        { data: courses },
        { data: skills },
        { data: goals },
        { data: logs }
      ] = await Promise.all([
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
        supabase.from('goals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('courses').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('skills').select('*').order('level', { ascending: false }).limit(6),
        supabase.from('goals').select('*').eq('status', 'pending').order('deadline', { ascending: true }).limit(4),
        supabase.from('progress_logs').select('*').order('date', { ascending: true }).limit(7)
      ])

      setStats([
        { name: 'Courses', value: (coursesCount || 0).toString(), icon: BookOpen, trend: 'Total' },
        { name: 'Projects', value: (projectsCount || 0).toString(), icon: Code2, trend: 'Total' },
        { name: 'Certificates', value: (certsCount || 0).toString(), icon: Award, trend: 'Earned' },
        { name: 'Active Goals', value: (goalsCount || 0).toString(), icon: Target, trend: 'Pending' },
      ])

      setRecentCourses(courses || [])
      setTopSkills(skills || [])
      setUpcomingGoals(goals || [])

      if (logs && logs.length > 0) {
        setProgressData(logs.map(log => ({
          name: new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' }),
          hours: log.value
        })))
        setStreak(logs.length)
      } else {
        setProgressData([])
        setStreak(0)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-gray-50 p-6 md:p-12 space-y-8 pb-16"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, <span className="text-amber-600">Learner</span>
          </h1>
          <p className="text-gray-500 max-w-lg">
            Track your progress and stay on top of your goals.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 text-center min-w-[120px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Streak</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{streak} Days</p>
          </div>
          <div className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-100 text-center min-w-[120px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{streak > 10 ? 'Pro' : 'Starter'}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.name} variants={itemVariants}>
            <Card className="p-6 border-gray-200 shadow-sm bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">{stat.trend}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : stat.value}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-6 border-gray-200 shadow-sm bg-white h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Study Activity</h3>
                <p className="text-sm text-gray-500">Hours spent learning over the past week</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {progressData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}h`}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                      cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#d97706"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorHours)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">No Activity Yet</p>
                    <p className="text-sm text-gray-500">Log your progress to see it here.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Goals & Targets */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-gray-200 shadow-sm bg-white h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Goals</h3>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />)
              ) : upcomingGoals.length > 0 ? (
                upcomingGoals.map((goal, i) => (
                  <div key={i} className="group cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 text-sm">{goal.title}</span>
                      <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {goal.deadline ? new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                      </span>
                    </div>
                    <Progress value={Math.floor(Math.random() * 60) + 20} className="h-1.5" />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
                  <p className="font-medium text-gray-900">No active goals</p>
                  <p className="text-sm text-gray-500 mt-1">Set a new goal to get started.</p>
                </div>
              )}
            </div>
            <Button asChild variant="outline" className="w-full mt-6 border-gray-200 hover:bg-gray-50 hover:text-gray-900">
              <Link href="/goals" className="flex items-center justify-center gap-2">
                View All Goals <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Courses */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-gray-200 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Courses</h3>
              <Link href="/courses" className="text-sm font-medium text-amber-600 hover:text-amber-700">View All</Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />)
              ) : recentCourses.length > 0 ? (
                recentCourses.map((course, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                        <BookOpen className="w-6 h-6 text-gray-500 group-hover:text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{course.title}</p>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{course.platform}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-amber-600">{course.completion_percentage}%</span>
                      <span className="text-xs text-gray-400 capitalize">{course.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 font-medium">No courses started yet</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Skills */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 border-gray-200 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Skills</h3>
              <Link href="/skills" className="text-sm font-medium text-amber-600 hover:text-amber-700">View All</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {loading ? (
                [1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)
              ) : topSkills.length > 0 ? (
                topSkills.map((skill, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 text-sm">{skill.name}</span>
                      <div className={`w-2 h-2 rounded-full ${skill.level >= 8 ? 'bg-green-500' : skill.level >= 5 ? 'bg-amber-500' : 'bg-gray-300'}`} />
                    </div>
                    <SkillLevelIndicator level={skill.level} showLabel={false} className="mt-0" />
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 font-medium">No skills added yet</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
