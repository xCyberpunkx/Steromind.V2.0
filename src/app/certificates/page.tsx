"use client"

import { useState, useEffect } from "react"
import { Plus, Award, ExternalLink, Calendar, Search, Download, Loader2, FileUp, X, Sparkles, Medal } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase, type Certificate } from "@/lib/supabase"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

export default function CertificatesPage() {
  const [search, setSearch] = useState("")
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [issuer, setIssuer] = useState("")
  const [date, setDate] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  async function fetchCertificates() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCertificates(data || [])
    } catch (error) {
      console.error('Error fetching certificates:', error)
      toast.error('Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !name || !issuer || !date) {
      toast.error("Please fill in all fields and select a file")
      return
    }

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to upload")
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath)

      const { error: insertError } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          name,
          issuer,
          issue_date: date,
          url: publicUrl
        })

      if (insertError) throw insertError

      toast.success("Excellence recorded successfully!")
      setIsOpen(false)
      resetForm()
      fetchCertificates()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || "Failed to record excellence")
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setIssuer("")
    setDate("")
    setFile(null)
  }

  const filtered = certificates.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.issuer?.toLowerCase() || "").includes(search.toLowerCase())
  )

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Medal className="w-3.5 h-3.5" />
            Accreditation Vault
          </div>
          <h1 className="text-5xl font-black tracking-tight">Proof of <span className="gold-text italic">Mastery</span></h1>
          <p className="text-muted-foreground font-medium max-w-md">
            Document your cognitive ascendancy. Every certificate is a testament to your specialized intelligence.
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-white h-14 px-8 rounded-2xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
              <Plus className="w-5 h-5" />
              Log Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900/95 border-zinc-800 text-white backdrop-blur-xl sm:max-w-md rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Record Excellence</DialogTitle>
              <DialogDescription className="text-zinc-400 font-medium">
                Upload your credentials to the neural vault.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-primary">Certificate Title</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Senior Neural Architect"
                  className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issuer" className="text-[10px] font-black uppercase tracking-widest text-primary">Issuing Entity</Label>
                  <Input 
                    id="issuer" 
                    value={issuer} 
                    onChange={(e) => setIssuer(e.target.value)} 
                    placeholder="e.g. Stanford AI Lab"
                    className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-primary">Timestamp</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="bg-zinc-950 border-zinc-800 h-12 rounded-xl focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Credential Asset</Label>
                <div 
                  className={`group relative h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    file ? 'border-primary bg-primary/5' : 'border-zinc-800 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileUp className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-xs font-black truncate max-w-[200px]">{file.name}</p>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[10px] font-bold text-red-500 hover:underline mt-1">Remove Asset</button>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-10 h-10 text-zinc-700 group-hover:text-primary transition-colors" />
                      <p className="text-xs font-bold text-zinc-500 mt-3">Drag & drop or <span className="text-primary">browse</span></p>
                      <p className="text-[9px] text-zinc-600 mt-1 uppercase tracking-widest font-black">PDF, PNG, JPG (MAX 10MB)</p>
                    </>
                  )}
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full h-14 rounded-2xl gold-gradient text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Synchronizing...
                    </>
                  ) : "Seal Achievement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search neural accreditation records..." 
            className="bg-secondary/10 border-border/40 pl-11 h-14 rounded-2xl focus:ring-primary font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="apple-card p-8 h-[240px] animate-pulse border-border/20 bg-secondary/5">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-xl bg-secondary/20"></div>
                <div className="w-20 h-6 bg-secondary/20 rounded-full"></div>
              </div>
              <div className="mt-8 space-y-3">
                <div className="h-8 bg-secondary/20 rounded-xl w-3/4"></div>
                <div className="h-4 bg-secondary/20 rounded-lg w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((cert) => (
              <motion.div
                key={cert.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="apple-card p-8 group relative overflow-hidden h-full flex flex-col hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/40 hover:border-primary/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-2xl shadow-primary/10 group-hover:scale-110 transition-transform duration-500">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                      Level Verified
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-8">
                    <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight">{cert.name}</h3>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70 italic">{cert.issuer}</p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-border/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'FUTURE'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary transition-all" asChild title="Download Asset">
                        <a href={cert.url || '#'} target="_blank" rel="noopener noreferrer" download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary transition-all" asChild title="View Neural Record">
                        <a href={cert.url || '#'} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="p-24 apple-card border-dashed border-border/40 bg-transparent flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-8">
             <Medal className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Accreditation Null</h3>
          <p className="text-muted-foreground font-medium max-w-xs mt-4">
            No professional milestones detected in the current sector. Initialize your first record.
          </p>
          <Button onClick={() => setIsOpen(true)} className="mt-10 gold-gradient text-white h-14 px-10 rounded-2xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            Initialize Records
          </Button>
        </Card>
      )}
    </div>
  )
}
