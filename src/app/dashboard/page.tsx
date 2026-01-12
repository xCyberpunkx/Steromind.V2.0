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
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { SkillLevelIndicator } from "@/components/SkillLevelIndicator"
import { motion, AnimatePresence } from "framer-motion"

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
        { name: 'Courses', value: (coursesCount || 0).toString(), icon: BookOpen, trend: 'Initial' },
        { name: 'Projects', value: (projectsCount || 0).toString(), icon: Code2, trend: 'Initial' },
        { name: 'Certificates', value: (certsCount || 0).toString(), icon: Award, trend: 'None' },
        { name: 'Active Goals', value: (goalsCount || 0).toString(), icon: Target, trend: 'Syncing' },
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-16"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden p-12 rounded-[2.5rem] bg-card/30 border border-border/40 backdrop-blur-3xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5" />
              My Dashboard
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
              Track Your <span className="gold-text italic">Growth</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-lg">
              Monitor your progress, manage your projects, and achieve your goals.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="p-6 apple-card bg-white/40 text-center space-y-2 min-w-[140px]">
              <Zap className="w-6 h-6 text-primary mx-auto" />
              <p className="text-3xl font-black">{streak}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Day Streak</p>
            </div>
            <div className="p-6 apple-card bg-white/40 text-center space-y-2 min-w-[140px]">
              <Star className="w-6 h-6 text-primary mx-auto" />
              <p className="text-3xl font-black">{streak > 10 ? 'Pro' : 'Starter'}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.name} variants={itemVariants}>
            <Card className="p-8 apple-card group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2.5 py-1 rounded-full">{stat.trend}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">{stat.name}</p>
                <div className="text-4xl font-black tracking-tighter">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : stat.value}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="p-10 apple-card h-full relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Study Activity</h3>
                <p className="text-muted-foreground font-medium">Hours spent learning over the past week</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="h-10 px-4 rounded-xl border-border/50 bg-secondary/10 text-xs font-bold uppercase tracking-widest">Updated Live</Badge>
              </div>
            </div>
            <div className="h-[380px] w-full">
              {progressData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.8 0.1 85)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="oklch(0.8 0.1 85)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.02)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(0,0,0,0.2)" 
                      fontSize={10} 
                      fontWeight={800}
                      tickLine={false} 
                      axisLine={false} 
                      dy={20}
                      tickFormatter={(value) => value.toUpperCase()}
                    />
                    <YAxis 
                      stroke="rgba(0,0,0,0.2)" 
                      fontSize={10} 
                      fontWeight={800}
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}h`}
                      dx={-15}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.9)', 
                        backdropFilter: 'blur(32px)',
                        border: '1px solid rgba(0,0,0,0.05)', 
                        borderRadius: '24px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                        padding: '16px'
                      }}
                      cursor={{ stroke: 'oklch(0.8 0.1 85)', strokeWidth: 2, strokeDasharray: '6 6' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="oklch(0.8 0.1 85)" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorHours)" 
                      animationDuration={2500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30">
                  <Activity className="w-16 h-16" />
                  <div>
                    <p className="font-black text-xl tracking-tight uppercase">No Activity Yet</p>
                    <p className="text-sm font-bold">Log your progress to see it here.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Goals & Targets */}
        <motion.div variants={itemVariants}>
          <Card className="p-10 apple-card h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold tracking-tight">My Goals</h3>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="space-y-8 flex-1">
              {loading ? (
                 [1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-secondary/30 animate-pulse rounded-2xl" />)
              ) : upcomingGoals.length > 0 ? (
                upcomingGoals.map((goal, i) => (
                  <div key={i} className="space-y-3 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{goal.title}</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">{goal.deadline ? new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Soon'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.floor(Math.random() * 60) + 30}%` }}
                        transition={{ duration: 1.5, delay: i * 0.2 }}
                        className="h-full gold-gradient"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-10 opacity-30">
                  <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                    <Target className="w-10 h-10" />
                  </div>
                  <p className="font-bold text-lg">No active goals</p>
                  <p className="text-sm font-medium">Set a new goal to get started.</p>
                </div>
              )}
            </div>
            <Link href="/goals" className="mt-12 apple-button bg-secondary/40 hover:bg-secondary/60 flex items-center justify-center gap-3 group border border-border/30">
              <span className="text-sm font-black uppercase tracking-widest">View All Goals</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Recent Nodes */}
        <motion.div variants={itemVariants}>
          <Card className="p-10 apple-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold tracking-tight">Recent Courses</h3>
              <Link href="/courses" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity">See All</Link>
            </div>
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-24 bg-secondary/30 animate-pulse rounded-[2rem]" />)
              ) : recentCourses.length > 0 ? (
                recentCourses.map((course, i) => (
                  <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-secondary/10 border border-border/30 group hover:bg-secondary/20 transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] gold-gradient flex items-center justify-center shadow-2xl shadow-primary/10 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-black leading-tight group-hover:text-primary transition-colors">{course.title}</p>
                        <p className="text-[10px] font-black text-muted-foreground mt-2 uppercase tracking-[0.15em]">{course.platform}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-black tracking-tighter text-primary">{course.completion_percentage}%</div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{course.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-secondary/10 rounded-[2.5rem] border-2 border-dashed border-border/50">
                  <p className="text-muted-foreground font-bold italic tracking-tight">No courses started yet</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Neural Network (Skills) */}
        <motion.div variants={itemVariants}>
          <Card className="p-10 apple-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold tracking-tight">Skill Levels</h3>
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-16 bg-secondary/30 animate-pulse rounded-2xl" />)
              ) : topSkills.length > 0 ? (
                topSkills.map((skill, i) => (
                  <div key={i} className="p-5 rounded-[1.5rem] bg-secondary/15 border border-border/40 space-y-3 hover:bg-secondary/25 transition-all cursor-default group">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black tracking-tight uppercase">{skill.name}</span>
                      <div className="w-2 h-2 rounded-full gold-gradient shadow-[0_0_10px_rgba(200,160,80,0.5)]" />
                    </div>
                    <SkillLevelIndicator level={skill.level} showLabel={false} className="mt-0" />
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-20 flex flex-col items-center justify-center text-center opacity-30">
                  <TrendingUp className="w-12 h-12 mb-4" />
                  <p className="font-bold text-lg">No skills added yet</p>
                </div>
              )}
            </div>
            {topSkills.length > 0 && (
              <div className="mt-10 pt-8 border-t border-border/40 flex items-center justify-between">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Overall Skill Progress: Great</p>
                <Link href="/skills" className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70">Expand Skills</Link>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
