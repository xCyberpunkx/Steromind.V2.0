"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error during auth callback:", error.message)
      }
      router.push("/")
      router.refresh()
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-zinc-400 text-sm animate-pulse">Verifying your account...</p>
    </div>
  )
}
