import { Skill } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"

interface SkillLevelIndicatorProps {
  level: Skill['level']
  showLabel?: boolean
  className?: string
  variant?: 'bar' | 'badge'
}

export function SkillLevelIndicator({
  level,
  showLabel = false,
  className = "",
  variant = 'bar'
}: SkillLevelIndicatorProps) {
  const levels = ['beginner', 'intermediate', 'advanced'] as const
  const currentIndex = levels.indexOf(level)

  if (variant === 'badge') {
    return (
      <Badge
        variant="outline"
        className={`
          capitalize font-bold text-[10px] tracking-wider rounded-lg px-2 py-0.5
          ${level === 'advanced' ? 'text-amber-700 bg-amber-100 border-amber-200' :
            level === 'intermediate' ? 'text-amber-600 bg-amber-50 border-amber-100' :
              'text-gray-500 bg-gray-100 border-gray-200'}
          ${className}
        `}
      >
        {level}
      </Badge>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex gap-1.5 w-16">
        {levels.map((l, i) => (
          <div
            key={l}
            className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-out ${i <= currentIndex
              ? 'bg-amber-600'
              : 'bg-gray-200'
              }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600">
          {level}
        </span>
      )}
    </div>
  )
}
