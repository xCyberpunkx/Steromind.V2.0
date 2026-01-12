"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Code2, 
  Brain, 
  Target, 
  Library,
  ClipboardList,
  LogOut
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'Certificates', href: '/certificates', icon: Award },
  { name: 'Projects', href: '/projects', icon: Code2 },
  { name: 'Resources', href: '/resources', icon: Library },
  { name: 'Skills', href: '/skills', icon: Brain },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Backlog', href: '/backlog', icon: ClipboardList },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border w-64 glass">
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 gold-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="gold-text text-xl tracking-tighter">Stero Mind</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                  : "hover:bg-primary/5 hover:text-primary/80 text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "text-primary scale-110" : "group-hover:text-primary")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-6">
        <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-destructive/5 hover:text-destructive w-full transition-all duration-300 text-muted-foreground group">
          <LogOut className="w-5 h-5 group-hover:text-destructive transition-colors" />
          Logout
        </button>
      </div>
    </div>
  )
}
