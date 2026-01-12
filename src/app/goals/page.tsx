"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  AlertCircle,
  Loader2,
  Trash2,
  Settings2,
  Zap,
  TrendingUp,
  Target as TargetIcon,
  Flag
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { logActivity } from "@/lib/activity"
import { motion, AnimatePresence } from "framer-motion"

type Goal = {
  id: string
  title: string
  description?: string
  deadline?: string
  status: string
  priority: string
  progress: number
  created_at: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    progress: 0,
    status: 'pending'
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error('Failed to load objectives')
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.title) {
      toast.error('Please provide a title')
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          ...newGoal,
          user_id: userData.user?.id || '00000000-0000-0000-0000-000000000000'
        }])
        .select()
        .single()

      if (error) throw error
      
      setGoals([data, ...goals])
      setNewGoal({ title: '', description: '', deadline: '', priority: 'medium', progress: 0, status: 'pending' })
      setIsAdding(false)
      toast.success('Objective locked in')
    } catch (error) {
      console.error('Error adding goal:', error)
      toast.error('Failed to set objective')
    }
  }

  const handleDeleteGoal = async (id: string) => {
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
      setGoals(goals.filter(g => g.id !== id))
      toast.success('Objective purged')
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error('Failed to purge')
    }
  }

  const toggleStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'completed' ? 'pending' : 'completed'
    const newProgress = newStatus === 'completed' ? 100 : 50

    try {
      const { data, error } = await supabase
        .from('goals')
        .update({ status: newStatus, progress: newProgress })
        .eq('id', goal.id)
        .select()
        .single()

      if (error) throw error
      setGoals(goals.map(g => g.id === goal.id ? data : g))
      toast.success(newStatus === 'completed' ? 'Objective achieved!' : 'Objective reactivated')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Synchronization failed')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'medium': return 'text-primary bg-primary/10 border-primary/20'
      case 'low': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <TargetIcon className="w-3.5 h-3.5" />
            Strategic Objectives
          </div>
          <h1 className="text-5xl font-black tracking-tight">Mission <span className="gold-text italic">Critical</span></h1>
          <p className="text-muted-foreground font-medium max-w-md">
            Define your cognitive milestones. Track your trajectory toward architectural dominance.
          </p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-white h-14 px-8 rounded-2xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
              <Plus className="w-5 h-5" />
              Set Objective
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900/95 border-zinc-800 text-white backdrop-blur-xl sm:max-w-md rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Define Objective</DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Establish a new milestone in your neural evolution.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Objective Title</label>
                <Input 
                  placeholder="e.g. Master Low-Level Graphics" 
                  className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Context</label>
                <Input 
                  placeholder="Why is this milestone necessary?" 
                  className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Deadline</label>
                  <Input 
                    type="date"
                    className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Priority Level</label>
                  <select 
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                    className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 focus:ring-2 focus:ring-primary outline-none text-sm font-medium"
                  >
                    <option value="high">High Intensity</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Passive Growth</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-zinc-400 font-bold">Abort</Button>
              <Button onClick={handleAddGoal} className="gold-gradient text-white h-12 px-8 rounded-xl font-black shadow-lg shadow-primary/20">Lock In</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-50">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-sm font-black uppercase tracking-[0.3em] text-primary">Synchronizing Targets...</p>
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-24 apple-card border-dashed border-border/40 bg-transparent flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-8">
            <Flag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Zero Objectives</h3>
          <p className="text-muted-foreground font-medium max-w-xs mt-4">
            No strategic milestones defined. Evolutionary stagnation detected. Set a target.
          </p>
          <Button variant="outline" className="mt-10 border-border/40 rounded-xl px-10 h-14 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsAdding(true)}>
            Initialize Objective
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="apple-card p-8 group relative overflow-hidden h-full flex flex-col hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/40 hover:border-primary/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-start gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 ${
                        goal.status === 'completed' ? 'bg-green-500/10 text-green-500 shadow-green-500/10' : 'bg-primary/10 text-primary shadow-primary/10'
                      }`}>
                        <Target className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h3 className={`text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors ${
                          goal.status === 'completed' ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {goal.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium line-clamp-2 max-w-sm">
                          {goal.description || "Synthesizing advanced logic systems through focused cognitive iteration."}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white rounded-xl shadow-2xl">
                        <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer font-bold gap-2 p-3" onClick={() => toggleStatus(goal)}>
                          {goal.status === 'completed' ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          {goal.status === 'completed' ? 'Mark as In Progress' : 'Mark as Completed'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer font-bold gap-2 p-3" onClick={() => handleDeleteGoal(goal.id)}>
                          <Trash2 className="w-4 h-4" />
                          Purge Objective
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5 text-primary opacity-60" />
                          {goal.deadline ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'FUTURE'}
                        </div>
                        <Badge className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${getPriorityColor(goal.priority)}`}>
                          {goal.priority} Intensity
                        </Badge>
                      </div>
                      <span className="text-xs font-black text-primary uppercase tracking-widest">{goal.progress}% SYNCHRONIZED</span>
                    </div>
                    
                    <div className="relative h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        className={`h-full rounded-full ${goal.status === 'completed' ? 'bg-green-500' : 'gold-gradient'}`}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {goal.status === 'completed' ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full">
                            Objective Cleared
                          </Badge>
                        ) : (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full animate-pulse">
                            Node Active
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 px-4 rounded-xl text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-[9px] transition-all"
                        onClick={() => toggleStatus(goal)}
                      >
                        {goal.status === 'completed' ? 'Revert Protocol' : 'Quick Synthesis'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
