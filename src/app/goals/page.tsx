"use client"

import { useState } from "react"
import { Plus, Target, Calendar, CheckCircle2, Clock, MoreVertical, AlertCircle } from "lucide-react"
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

const initialGoals = [
  { 
    id: "1", 
    title: "Master Next.js 15", 
    description: "Learn App Router, Server Actions, and PPR in depth.", 
    deadline: "2025-06-15", 
    progress: 65, 
    status: "In Progress",
    priority: "High"
  },
  { 
    id: "2", 
    title: "AWS Cloud Practitioner", 
    description: "Get certified in AWS fundamentals.", 
    deadline: "2025-07-20", 
    progress: 30, 
    status: "In Progress",
    priority: "Medium"
  },
  { 
    id: "3", 
    title: "Portfolio 3.0", 
    description: "Rebuild personal portfolio with high performance and 3D elements.", 
    deadline: "2025-06-30", 
    progress: 85, 
    status: "In Progress",
    priority: "High"
  },
  { 
    id: "4", 
    title: "Open Source Contribution", 
    description: "Make at least 3 significant PRs to popular React libraries.", 
    deadline: "2025-12-31", 
    progress: 10, 
    status: "In Progress",
    priority: "Low"
  }
]

export default function GoalsPage() {
  const [goals, setGoals] = useState(initialGoals)

  const toggleStatus = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const isCompleted = g.status === "Completed"
        return { 
          ...g, 
          status: isCompleted ? "In Progress" : "Completed",
          progress: isCompleted ? 85 : 100
        }
      }
      return g
    }))
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Learning Goals</h2>
          <p className="text-zinc-400">Set targets and track your long-term milestones.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Set New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="bg-zinc-900 border-zinc-800 p-6 flex flex-col hover:border-zinc-700 transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${goal.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${goal.status === 'Completed' ? 'line-through text-zinc-500' : ''}`}>
                    {goal.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{goal.description}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem className="text-zinc-400 focus:text-white focus:bg-zinc-800 cursor-pointer">
                    Edit Goal
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-zinc-400 focus:text-white focus:bg-zinc-800 cursor-pointer"
                    onClick={() => toggleStatus(goal.id)}
                  >
                    Mark as {goal.status === 'Completed' ? 'In Progress' : 'Completed'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                    Delete Goal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Calendar className="w-3 h-3" />
                    Deadline: {goal.deadline}
                  </span>
                  <Badge variant="outline" className={`
                    ${goal.priority === 'High' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                      goal.priority === 'Medium' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' : 
                      'text-blue-500 border-blue-500/20 bg-blue-500/5'}
                  `}>
                    {goal.priority} Priority
                  </Badge>
                </div>
                <span className="font-bold text-zinc-300">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className={`h-2 ${goal.status === 'Completed' ? 'bg-green-900/20' : 'bg-zinc-800'}`}>
                <div 
                  className={`h-full transition-all duration-500 ${goal.status === 'Completed' ? 'bg-green-500' : 'bg-blue-600'}`} 
                  style={{ width: `${goal.progress}%` }} 
                />
              </Progress>
            </div>

            <div className="mt-auto pt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {goal.status === 'Completed' ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    In Progress
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-zinc-500 hover:text-white"
                onClick={() => toggleStatus(goal.id)}
              >
                {goal.status === 'Completed' ? 'Reset Progress' : 'Quick Complete'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
