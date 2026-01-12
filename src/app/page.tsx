"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Brain, 
  Target, 
  BookOpen,
  ArrowRight,
  Menu,
  X,
  Cpu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function LandingPage() {
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-yellow-100 selection:text-yellow-900">
      {/* Simple Navigation */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-100 py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Stero Mind</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <Button asChild variant="default" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">Sign in</Link>
                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-6">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white p-6 flex flex-col md:hidden">
          <div className="flex justify-between items-center mb-12">
            <span className="text-xl font-bold">Stero Mind</span>
            <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
          </div>
          <div className="flex flex-col gap-8 text-3xl font-bold">
            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
            <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="text-yellow-500">Get Started</Link>
          </div>
        </div>
      )}

      <main>
        {/* Simple Hero */}
        <section className="pt-40 pb-24 md:pt-56 md:pb-40 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-10">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black tracking-tight text-slate-900"
            >
              Master your <br />
              <span className="text-yellow-500">evolution.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-slate-500 leading-relaxed font-medium"
            >
              The minimal tracker for your skills, projects, and learning.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-4"
            >
              <Button asChild size="lg" className="h-16 px-10 text-xl bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl shadow-slate-200">
                <Link href="/auth/signup">Start Tracking Now</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid - Minimalist */}
        <section className="py-32 bg-slate-50/30 border-y border-slate-100">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {[
                { title: "Skills", desc: "Map your technical stack and see your proficiency grow.", icon: Target },
                { title: "Projects", desc: "Keep all your work in one place, from side projects to pro work.", icon: Cpu },
                { title: "Learning", desc: "Log every course and book to build a lifelong knowledge base.", icon: BookOpen }
              ].map((f, i) => (
                <div key={i} className="space-y-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200">
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Simplified About */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Focus on progress, <br />not the process.</h2>
              <p className="text-lg text-slate-500">
                Stero Mind is designed to be invisible. Log your daily wins in seconds and get back to what you do best: building great software.
              </p>
              <div className="space-y-4">
                {["Skill tree visualization", "Project velocity tracking", "Learning logs"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 font-semibold text-slate-800">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full max-w-sm">
              <div className="bg-yellow-500 rounded-[2.5rem] p-1 shadow-2xl shadow-yellow-200">
                <div className="bg-white rounded-[2.2rem] p-10 space-y-8">
                  <div className="space-y-2">
                    <div className="text-sm font-bold uppercase tracking-wider text-slate-400">Current Focus</div>
                    <div className="text-2xl font-bold">Frontend Mastery</div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-3/4" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-slate-500 font-medium">Monthly Progress</div>
                    <div className="text-yellow-500 font-bold text-xl">+24%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Clean CTA */}
        <section className="pb-40 px-6">
          <div className="max-w-4xl mx-auto bg-yellow-500 rounded-[3rem] p-16 md:p-24 text-center text-white space-y-10 shadow-2xl shadow-yellow-100">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none">Ready to start?</h2>
            <p className="text-yellow-50 text-xl font-medium max-w-lg mx-auto opacity-90">
              Join the new generation of developers tracking their growth with precision.
            </p>
            <Button asChild size="lg" className="h-16 px-12 text-xl bg-white text-yellow-600 hover:bg-yellow-50 rounded-full shadow-xl">
              <Link href="/auth/signup">Get Started Free <ArrowRight className="ml-2 w-6 h-6" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded-md flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Stero Mind</span>
          </div>
          <p className="text-slate-400 text-xs font-medium">
            © 2025 Stero Mind. Built for developers.
          </p>
        </div>
      </footer>
    </div>
  )
}
