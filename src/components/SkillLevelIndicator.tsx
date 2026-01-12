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
          ${level === 'advanced' ? 'text-primary border-primary/30 bg-primary/10' : 
            level === 'intermediate' ? 'text-primary/80 border-primary/20 bg-primary/5' : 
            'text-muted-foreground border-border bg-secondary/30'}
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
            className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-out ${
              i <= currentIndex
                ? 'gold-gradient shadow-[0_1px_4px_rgba(212,175,55,0.3)]'
                : 'bg-secondary border border-border/10'
            }`}
          />
        ))}
      </div>
      {showLabel && (
        <span className={`text-[10px] uppercase tracking-widest font-black ${
          i <= currentIndex ? 'text-primary' : 'text-muted-foreground'
        }`}>
          {level}
        </span>
      )}
    </div>
  )
}
