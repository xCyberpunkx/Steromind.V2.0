"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { LogIn, Loader2, Mail, Lock, ArrowRight, Brain, Sparkles } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion } from "framer-motion"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      toast.success("Welcome back to Stero Mind!")
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -ml-20 -mb-20" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 rounded-[2rem] gold-gradient flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/20"
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-5xl font-black tracking-tighter mb-4">Stero Mind</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground font-semibold">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Resynchronize your consciousness</span>
          </div>
        </div>

        <Card className="p-10 apple-card border-none relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.06)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">Neural Identity</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="name@example.com"
                  className={`h-14 bg-secondary/30 border-border/40 pl-14 rounded-[1.25rem] focus:ring-primary/10 focus:bg-background transition-all text-base ${errors.email ? "border-destructive focus:ring-destructive/5" : ""}`}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive font-bold mt-2 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Access Key</label>
                <Link href="#" className="text-xs text-primary hover:opacity-70 font-black uppercase tracking-widest">Lost Key?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className={`h-14 bg-secondary/30 border-border/40 pl-14 rounded-[1.25rem] focus:ring-primary/10 focus:bg-background transition-all text-base ${errors.password ? "border-destructive focus:ring-destructive/5" : ""}`}
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-bold mt-2 ml-1">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full gold-gradient hover:opacity-90 h-14 rounded-[1.25rem] text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-3">
                  Initiate Link <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-10 border-t border-border/40 text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">New to the network?</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 text-primary hover:opacity-70 font-black uppercase tracking-[0.2em] text-xs transition-all">
              Create Neural Node
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
