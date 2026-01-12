"use client"

import { Flame } from "lucide-react"
import { useStreak } from "@/hooks/useStreak"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function StreakIndicator() {
  const { streak, hasLoggedToday, loading } = useStreak()

  if (loading) return <div className="w-8 h-8 rounded-full bg-zinc-900 animate-pulse" />

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-help group">
            <Flame className={`w-4 h-4 transition-colors ${hasLoggedToday ? 'text-orange-500 fill-orange-500' : 'text-zinc-500'}`} />
            <span className={`text-sm font-bold ${hasLoggedToday ? 'text-white' : 'text-zinc-400'}`}>
              {streak}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-900 border-zinc-800 text-white p-3 max-w-xs">
          <div className="space-y-1">
            <p className="font-bold text-sm">Learning Streak: {streak} days</p>
            <p className="text-xs text-zinc-400">
              {hasLoggedToday 
                ? "You've logged activity today! Keep it up tomorrow to maintain your streak."
                : "You haven't logged any activity today yet. Complete a task or add a resource to keep your streak alive!"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
