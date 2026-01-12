"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion"
import { 
  Brain, 
  ChevronRight, 
  Sparkles, 
  Zap, 
  Target, 
  Trophy, 
  Code2, 
  BookOpen,
  ArrowRight,
  Menu,
  X,
  Cpu,
  Globe,
  Activity,
  Layers,
  Search,
  Lock,
  ZapIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

const features = [
  {
    icon: Cpu,
    title: "Neural Architecture",
    description: "Map your cognitive nodes with surgical precision. Our system visualizes your learning path as a high-performance neural network.",
    color: "from-amber-200 to-yellow-500"
  },
  {
    icon: Target,
    title: "Velocity Tracking",
    description: "Measure your evolution in real-time. Track skill acquisition velocity and project manifestation cycles.",
    color: "from-yellow-400 to-amber-600"
  },
  {
    icon: BookOpen,
    title: "Synthesized Logic",
    description: "Bridge the gap between theoretical knowledge and practical execution. Log courses, modules, and implementation logs.",
    color: "from-amber-100 to-yellow-400"
  },
  {
    icon: Trophy,
    title: "Proven Intelligence",
    description: "Build a verifiable proof of mastery. Centralize certificates and high-impact projects in an elite showcase.",
    color: "from-yellow-500 to-amber-700"
  }
]

export default function LandingPage() {
  const { user } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.8])
  const heroRotate = useTransform(smoothProgress, [0, 0.2], [0, -5])
  const backgroundY = useTransform(smoothProgress, [0, 1], [0, -200])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FBFBFB] text-[#1D1D1F] selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden font-sans">
      {/* Dynamic Navigation */}
      <nav 
        className={`fixed top-0 w-full z-[100] transition-all duration-700 border-b ${
          isScrolled 
            ? "bg-white/70 backdrop-blur-3xl border-black/5 py-4 translate-y-0" 
            : "bg-transparent border-transparent py-8"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="w-12 h-12 gold-gradient rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-200/50"
            >
              <Brain className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex flex-col -space-y-1">
              <span className="text-2xl font-black tracking-tighter gold-text leading-none">STERO MIND</span>
              <span className="text-[10px] font-black tracking-[0.4em] text-black/20 uppercase">Neural Ecosystem</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-12">
            {['Nexus', 'Synthesis', 'Velocity', 'Network'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="group relative text-[11px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-black transition-colors"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 gold-gradient transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <Button asChild className="h-12 px-8 rounded-full gold-gradient text-white border-0 shadow-xl shadow-amber-200/40 font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                <Link href="/dashboard">
                  Enter Nexus <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-8">
                <Link href="/auth/login" className="hidden sm:block text-[11px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-black transition-colors">
                  Login
                </Link>
                <Button asChild className="h-12 px-10 rounded-full bg-black text-white hover:bg-black/90 font-black text-xs uppercase tracking-widest shadow-2xl shadow-black/20">
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            )}
            <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[110] bg-white/95 backdrop-blur-3xl p-10 flex flex-col"
          >
            <div className="flex justify-end">
              <button onClick={() => setMobileMenuOpen(false)} className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center">
                <X className="w-8 h-8" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-12">
              {['Nexus', 'Synthesis', 'Velocity', 'Network'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="text-6xl font-black tracking-tighter hover:gold-text transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-6 w-full max-w-sm pt-10">
                <Button asChild variant="outline" className="h-20 text-xl font-black rounded-3xl border-2">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild className="h-20 text-xl font-black rounded-3xl gold-gradient text-white border-0 shadow-2xl shadow-amber-200/50">
                  <Link href="/auth/signup">Join the Elite</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Cinematic Hero */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          <motion.div 
            style={{ opacity: heroOpacity, scale: heroScale, rotate: heroRotate }}
            className="relative z-10 text-center space-y-12 max-w-[1200px] px-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "circOut" }}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 font-black text-[11px] uppercase tracking-[0.3em] shadow-sm"
            >
              <Activity className="w-4 h-4 animate-pulse" />
              Intelligence Synchronization Active
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
              className="text-8xl md:text-[160px] font-black tracking-[-0.07em] leading-[0.85] text-black"
            >
              Architect Your <br />
              <span className="gold-text italic tracking-[-0.05em]">Superiority</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "circOut" }}
              className="text-2xl md:text-3xl text-black/50 max-w-3xl mx-auto font-medium leading-[1.4] tracking-tight"
            >
              Stero Mind is the elite neural operating system for high-performance engineers. Synthesize complexity, visualize evolution, and manifest absolute mastery.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: "circOut" }}
              className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-10"
            >
              <Button asChild className="h-24 px-16 text-2xl font-black rounded-[2.5rem] gold-gradient text-white border-0 shadow-[0_30px_60px_-15px_rgba(251,191,36,0.6)] hover:scale-110 active:scale-95 transition-all duration-500">
                <Link href="/auth/signup">Initialize Nexus</Link>
              </Button>
              <Link href="#nexus" className="group flex items-center gap-4 text-xl font-black uppercase tracking-widest text-black/30 hover:text-black transition-all">
                The Manifesto
                <div className="w-16 h-0.5 bg-black/10 group-hover:bg-amber-400 group-hover:w-24 transition-all duration-500" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Abstract Neural Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div 
              style={{ y: backgroundY }}
              className="absolute inset-0"
            >
              <div className="absolute top-1/4 left-1/4 w-[1000px] h-[1000px] bg-amber-100/40 rounded-full blur-[160px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-amber-200/20 rounded-full blur-[140px]" />
              <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100">
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" fill="black" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </motion.div>
          </div>

          <motion.div 
            animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
          >
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Begin Descent</span>
             <div className="w-1 h-20 bg-gradient-to-b from-amber-400 to-transparent rounded-full" />
          </motion.div>
        </section>

        {/* The Nexus (Philosophy) */}
        <section id="nexus" className="py-60 bg-white relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
                className="space-y-16"
              >
                <div className="space-y-6">
                  <div className="h-1 w-24 gold-gradient rounded-full" />
                  <h2 className="text-[12px] font-black uppercase tracking-[0.5em] gold-text">01 // The Nexus</h2>
                  <h3 className="text-7xl md:text-8xl font-black tracking-[-0.06em] leading-[0.9]">
                    Spherical <br />
                    <span className="gold-text italic">Evolution</span>
                  </h3>
                </div>
                <p className="text-2xl text-black/50 leading-relaxed font-medium max-w-xl">
                  Linear progress is an illusion of the static mind. In the Stero Ecosystem, every skill acquired, every system built, and every milestone reached creates a new synapse in your personal neural nexus.
                </p>
                <div className="grid grid-cols-2 gap-16">
                  <div className="space-y-4">
                    <p className="text-6xl font-black tracking-tighter italic">99.9%</p>
                    <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.3em]">Neural Retention</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-6xl font-black tracking-tighter italic">∞</p>
                    <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.3em]">Synaptic Scale</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, type: "spring" }}
                className="relative aspect-square"
              >
                <div className="absolute inset-0 gold-gradient rounded-[5rem] opacity-5 blur-[100px] animate-pulse" />
                <div className="relative z-10 w-full h-full bg-amber-50 rounded-[5rem] border border-amber-100 flex items-center justify-center overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
                  <div className="relative group">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
                      transition={{ duration: 20, repeat: Infinity }}
                      className="w-[500px] h-[500px] border border-amber-200/30 rounded-full flex items-center justify-center"
                    >
                      <div className="w-[400px] h-[400px] border border-amber-300/20 rounded-full flex items-center justify-center">
                        <div className="w-[300px] h-[300px] border border-amber-400/10 rounded-full" />
                      </div>
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 gold-gradient rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-amber-300/60 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                        <Cpu className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Metrics */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }} 
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -top-10 -right-10 p-8 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-black/5"
                >
                  <Activity className="w-8 h-8 text-amber-500 mb-4" />
                  <p className="text-3xl font-black tracking-tighter">Syncing...</p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Uptime: Optimal</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Synthesis (Features) */}
        <section id="synthesis" className="py-60 bg-[#FBFBFB]">
          <div className="max-w-[1400px] mx-auto px-10">
            <div className="text-center space-y-8 mb-32">
              <h2 className="text-[12px] font-black uppercase tracking-[0.5em] gold-text">02 // Synthesis</h2>
              <h3 className="text-7xl font-black tracking-[-0.06em]">Mastery Protocols</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="group relative p-12 bg-white rounded-[4rem] border border-black/5 hover:border-amber-200/50 hover:shadow-[0_40px_80px_-20px_rgba(251,191,36,0.15)] transition-all duration-700"
                >
                  <div className={`w-20 h-20 rounded-[2rem] gold-gradient flex items-center justify-center mb-12 shadow-2xl shadow-amber-200/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-2xl font-black tracking-tighter mb-6">{feature.title}</h4>
                  <p className="text-black/40 leading-relaxed font-semibold text-sm">
                    {feature.description}
                  </p>
                  <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform duration-700">
                     <ArrowRight className="w-8 h-8 text-amber-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Velocity (Growth Data) */}
        <section id="velocity" className="py-40">
          <div className="max-w-[1400px] mx-auto px-10">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="relative p-24 bg-black text-white rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]"
            >
              <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-amber-500/10 rounded-full blur-[200px] -mr-[500px] -mt-[500px]" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] -ml-40 -mb-40" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-32">
                <div className="flex-1 space-y-16">
                  <div className="space-y-6">
                    <h2 className="text-[12px] font-black uppercase tracking-[0.5em] gold-text">03 // Velocity</h2>
                    <h3 className="text-7xl md:text-8xl font-black tracking-[-0.06em] leading-[0.9]">
                      Visualize <br />
                      <span className="gold-text italic">Performance</span>
                    </h3>
                  </div>
                  <p className="text-2xl text-white/40 leading-relaxed font-medium max-w-xl">
                    Our high-resolution data engines process your growth metrics with surgical precision. Don't just learn—witness your cognitive capacity expand in real-time.
                  </p>
                  <Button asChild className="h-20 px-12 text-xl font-black rounded-3xl bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10 active:scale-95 transition-all">
                    <Link href="/auth/signup">Launch Intelligence Hub</Link>
                  </Button>
                </div>

                <div className="flex-1 w-full max-w-2xl bg-white/[0.03] backdrop-blur-3xl rounded-[4rem] border border-white/10 p-16 space-y-12 shadow-2xl relative">
                  <div className="absolute top-8 left-8 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Metric Core v4.8</p>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <div className="space-y-10">
                    {[
                      { label: "Neural Efficiency", value: 96 },
                      { label: "Knowledge Synthesis", value: 84 },
                      { label: "Execution Velocity", value: 91 }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex justify-between text-lg font-black tracking-tighter">
                          <span>{stat.label}</span>
                          <span className="gold-text italic">{stat.value}%</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${stat.value}%` }}
                            transition={{ duration: 2, delay: i * 0.3, ease: "circOut" }}
                            className="h-full gold-gradient shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-10 border-t border-white/5 grid grid-cols-3 gap-8">
                     {[
                       { l: "Nodes", v: "256" },
                       { l: "Syncs", v: "14.2k" },
                       { l: "Latency", v: "0ms" }
                     ].map((x, i) => (
                       <div key={i} className="text-center space-y-2">
                          <p className="text-4xl font-black tracking-tighter italic">{x.v}</p>
                          <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">{x.l}</p>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Network (CTA) */}
        <section id="network" className="py-80 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 text-center space-y-20 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <h2 className="text-[12px] font-black uppercase tracking-[0.5em] gold-text">04 // Network</h2>
              <h2 className="text-9xl md:text-[180px] font-black tracking-[-0.08em] leading-[0.75] text-black">
                Join the <br />
                <span className="gold-text italic">Elite</span>
              </h2>
              <p className="text-3xl text-black/30 font-semibold max-w-2xl mx-auto">
                The future is not for the static. It is for the synchronized.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-12"
            >
              <Button asChild className="h-32 px-24 text-4xl font-black rounded-[3rem] gold-gradient text-white border-0 shadow-[0_40px_80px_-20px_rgba(251,191,36,0.6)] hover:scale-110 active:scale-95 transition-all duration-700">
                <Link href="/auth/signup">Initialize Legacy</Link>
              </Button>
              <div className="flex items-center gap-6">
                <span className="h-0.5 w-12 bg-black/10" />
                <p className="text-xs font-black text-black/20 uppercase tracking-[0.4em]">Zero Latency Synchronization</p>
                <span className="h-0.5 w-12 bg-black/10" />
              </div>
            </motion.div>
          </div>

          {/* Background Synapses */}
          <div className="absolute inset-0 z-0 opacity-[0.05]">
             <svg className="w-full h-full" viewBox="0 0 1000 1000">
                <circle cx="500" cy="500" r="400" fill="none" stroke="black" strokeWidth="1" strokeDasharray="10 10" />
                <circle cx="500" cy="500" r="300" fill="none" stroke="black" strokeWidth="0.5" strokeDasharray="5 5" />
                <circle cx="500" cy="500" r="200" fill="none" stroke="black" strokeWidth="0.2" />
             </svg>
          </div>
        </section>
      </main>

      {/* Luxury Footer */}
      <footer className="py-32 border-t border-black/5 bg-white">
        <div className="max-w-[1400px] mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-24">
            <div className="col-span-1 md:col-span-2 space-y-10">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="w-16 h-16 gold-gradient rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-amber-200/50">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="flex flex-col -space-y-1">
                  <span className="text-3xl font-black tracking-tighter gold-text leading-none">STERO MIND</span>
                  <span className="text-[10px] font-black tracking-[0.4em] text-black/20 uppercase">Neural Ecosystem</span>
                </div>
              </Link>
              <p className="text-xl text-black/40 font-medium max-w-md">
                Defying cognitive stagnation through high-performance architecture and neural synchronization.
              </p>
            </div>
            
            <div className="space-y-8">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Protocols</p>
              <ul className="space-y-4">
                 {['Neural Nexus', 'Knowledge Synthesis', 'Velocity Engine', 'Elite Network'].map(x => (
                   <li key={x}><a href="#" className="text-sm font-bold text-black/60 hover:text-black transition-colors">{x}</a></li>
                 ))}
              </ul>
            </div>

            <div className="space-y-8">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">Connect</p>
              <ul className="space-y-4">
                 {['Synapse (X)', 'Nexus (GitHub)', 'Intelligence (Discord)', 'The Manifesto'].map(x => (
                   <li key={x}><a href="#" className="text-sm font-bold text-black/60 hover:text-black transition-colors">{x}</a></li>
                 ))}
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-10">
            <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.2em]">
              © 2025 Stero Mind Neural Ecosystem. All rights reserved. Built for the high-performance era.
            </p>
            <div className="flex gap-8">
               <a href="#" className="text-[10px] font-black uppercase tracking-widest text-black/20 hover:text-black transition-colors">Privacy</a>
               <a href="#" className="text-[10px] font-black uppercase tracking-widest text-black/20 hover:text-black transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
