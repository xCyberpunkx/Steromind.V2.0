"use client"

import { useState, useEffect } from "react"
import { Plus, Target, Calendar, CheckCircle2, Clock, MoreVertical, Trash2, Pencil } from "lucide-react"
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
import { supabase, Goal } from "@/lib/supabase"
import { toast } from "sonner"
import { logActivity } from "@/lib/activity"

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    status: "pending" as 'pending' | 'achieved'
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast.error("Failed to load goals")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      deadline: "",
      status: "pending"
    })
    setEditingGoal(null)
    setIsAdding(false)
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required")
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      if (editingGoal) {
        // Update
        const { error } = await supabase
          .from('goals')
          .update({
            title: formData.title,
            description: formData.description || null,
            deadline: formData.deadline || null,
            status: formData.status
          })
          .eq('id', editingGoal.id)

        if (error) throw error
        toast.success("Goal updated successfully")

        // Log activity if completed
        if (formData.status === 'achieved' && editingGoal.status !== 'achieved') {
          await logActivity(user.id)
        }
      } else {
        // Create
        const { error } = await supabase
          .from('goals')
          .insert([{
            user_id: user.id,
            title: formData.title,
            description: formData.description || null,
            deadline: formData.deadline || null,
            status: 'pending'
          }])

        if (error) throw error
        toast.success("New goal set successfully")
        await logActivity(user.id)
      }

      fetchGoals()
      resetForm()
    } catch (error) {
      console.error('Error saving goal:', error)
      toast.error("Failed to save goal")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success("Goal deleted")
      fetchGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error("Failed to delete goal")
    }
  }

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || "",
      deadline: goal.deadline || "",
      status: goal.status as 'pending' | 'achieved'
    })
    setIsAdding(true)
  }

  const toggleStatus = async (goal: Goal) => {
    try {
      const newStatus = goal.status === 'achieved' ? 'pending' : 'achieved'
      const { error } = await supabase
        .from('goals')
        .update({ status: newStatus })
        .eq('id', goal.id)

      if (error) throw error

      setGoals(goals.map(g => g.id === goal.id ? { ...g, status: newStatus } : g))

      if (newStatus === 'achieved') {
        toast.success("Goal achieved! 🎉")
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await logActivity(user.id)
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Learning Goals</h2>
          <p className="text-gray-500">Set targets and track your long-term milestones.</p>
        </div>

        <Dialog open={isAdding} onOpenChange={(open) => {
          if (!open) resetForm()
          setIsAdding(open)
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Set New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingGoal ? 'Edit Goal' : 'Set New Goal'}</DialogTitle>
              <DialogDescription className="text-gray-500">
                Define what you want to achieve and by when.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Goal Title</label>
                <Input
                  placeholder="e.g. Master Next.js 14"
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Deadline</label>
                <Input
                  type="date"
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  placeholder="Details about your goal..."
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              {editingGoal && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "pending" | "achieved" })}
                  >
                    <option value="pending">In Progress</option>
                    <option value="achieved">Achieved</option>
                  </select>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white">
                {editingGoal ? 'Update Goal' : 'Set Goal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-10">
            <p className="text-gray-500">Loading goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-full text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No goals yet</h3>
            <p className="text-gray-500 mt-2 mb-6 max-w-sm mx-auto">Start setting clear targets for your learning journey.</p>
            <Button variant="outline" onClick={() => setIsAdding(true)}>Create your first goal</Button>
          </div>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id} className="bg-white border-gray-200 p-6 flex flex-col hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${goal.status === 'achieved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold text-gray-900 ${goal.status === 'achieved' ? 'line-through text-gray-400' : ''}`}>
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{goal.description}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 group-hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-gray-200">
                    <DropdownMenuItem onClick={() => toggleStatus(goal)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as {goal.status === 'achieved' ? 'In Progress' : 'Achieved'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => startEdit(goal)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Goal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}
                  </div>
                  <Badge variant="outline" className={`${goal.status === 'achieved'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {goal.status === 'achieved' ? 'Achieved' : 'In Progress'}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Progress</span>
                    <span>{goal.status === 'achieved' ? '100%' : '50%'}</span>
                  </div>
                  <Progress value={goal.status === 'achieved' ? 100 : 50} className="h-2 bg-gray-100" indicatorClassName={goal.status === 'achieved' ? 'bg-green-500' : 'bg-amber-500'} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
