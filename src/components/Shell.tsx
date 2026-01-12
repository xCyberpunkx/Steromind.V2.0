"use client"

import { Navigation } from "./Navigation"
import { Search, Bell, User, LogOut, Loader2 } from "lucide-react"
import { StreakIndicator } from "./StreakIndicator"
import { useAuth } from "@/hooks/useAuth"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
    const isAuthPage = pathname?.startsWith('/auth')
    const isLandingPage = pathname === '/'
  
    useEffect(() => {
      if (!loading && !user && !isAuthPage && !isLandingPage) {
        router.push('/auth/login')
      }
    }, [user, loading, isAuthPage, isLandingPage, router])
  
    if (loading) {
      return (
        <div className="h-screen bg-background flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 gold-gradient rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <p className="gold-text text-lg animate-pulse tracking-tighter text-black">Stero Mind</p>
        </div>
      )
    }
  
    if (!user && !isAuthPage && !isLandingPage) {
      return null
    }
  
    if (isAuthPage || (isLandingPage && !user)) {
      return <div className="min-h-screen bg-background">{children}</div>
    }


  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Navigation />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-10 glass sticky top-0 z-50">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder="Search your mind..." 
                className="w-full bg-secondary/30 border border-border/40 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:bg-background transition-all duration-300 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <StreakIndicator />
            <button className="p-3 text-muted-foreground hover:text-primary transition-all relative rounded-2xl hover:bg-primary/5 active:scale-95">
              <Bell className="w-5.5 h-5.5" />
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background shadow-lg shadow-primary/40"></span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-11 h-11 rounded-2xl gold-gradient flex items-center justify-center cursor-pointer border border-primary/20 shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95">
                  <User className="w-6 h-6 text-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card/80 backdrop-blur-2xl border-border/40 text-foreground w-72 p-2.5 rounded-3xl mt-2" align="end">
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-bold tracking-tight">My Profile</p>
                    <p className="text-xs leading-none text-muted-foreground truncate font-medium">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40 my-2" />
                <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary cursor-pointer rounded-2xl p-3.5 font-medium transition-colors">
                  Settings & Privacy
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="focus:bg-destructive/10 focus:text-destructive text-destructive cursor-pointer rounded-2xl p-3.5 font-medium transition-colors"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4.5 h-4.5 mr-2.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth bg-secondary/10">
          <div className="max-w-7xl mx-auto space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
