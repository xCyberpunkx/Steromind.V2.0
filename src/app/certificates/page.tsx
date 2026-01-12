"use client"

import { useState, useEffect } from "react"
import { Plus, Award, ExternalLink, Calendar, Search, Download, Loader2, FileUp, X } from "lucide-react"
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

  const [name, setName] = useState("")
  const [issuer, setIssuer] = useState("")
  const [date, setDate] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  async function fetchCertificates() {
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

      toast.success("Certificate uploaded successfully!")
      setIsOpen(false)
      resetForm()
      fetchCertificates()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || "Failed to upload certificate")
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
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Certificates</h1>
          <p className="text-muted-foreground font-medium">Your professional achievements and certifications.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="apple-button gold-gradient text-white flex items-center justify-center gap-2 px-6">
              <Plus className="w-4 h-4" />
              <span className="font-bold">Add Certificate</span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/40 text-foreground sm:max-w-[425px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Upload Certificate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Certificate Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="bg-secondary/10 border-border/30 rounded-xl focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Issuer</Label>
                <Input 
                  id="issuer" 
                  value={issuer} 
                  onChange={(e) => setIssuer(e.target.value)} 
                  placeholder="e.g. Amazon Web Services"
                  className="bg-secondary/10 border-border/30 rounded-xl focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Issue Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="bg-secondary/10 border-border/30 rounded-xl focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Certificate File (PDF or Image)</Label>
                <div className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-[1.5rem] transition-all ${file ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/50'}`}>
                  <div className="space-y-2 text-center">
                    {file ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mb-4">
                          <FileUp className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{file.name}</span>
                          <button type="button" onClick={() => setFile(null)} className="p-1 rounded-full hover:bg-secondary/20 text-muted-foreground hover:text-destructive transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                          <FileUp className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex text-sm">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-primary hover:opacity-80 transition-opacity">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              className="sr-only" 
                              accept=".pdf,image/*"
                              onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                          </label>
                          <p className="pl-1 text-muted-foreground">or drag and drop</p>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PDF, PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button type="submit" className="apple-button gold-gradient text-white w-full py-4" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Uploading...
                    </>
                  ) : "Save Certificate"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search certificates..." 
            className="bg-card border-border/40 pl-12 h-12 rounded-2xl focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[280px] rounded-[2.5rem] bg-secondary/10 animate-pulse border border-border/30" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filtered.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="apple-card p-8 group relative overflow-hidden h-full flex flex-col border border-border/30">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-xl shadow-primary/10 group-hover:scale-110 transition-transform duration-500">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant="outline" className="bg-secondary/10 border-border/20 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Certification
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-black group-hover:text-primary transition-colors line-clamp-2">{cert.name}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">{cert.issuer}</p>
                  </div>

                  <div className="mt-10 flex items-center justify-between pt-6 border-t border-border/20">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5" />
                      {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="p-2 rounded-xl bg-secondary/10 text-muted-foreground hover:text-primary transition-colors" asChild>
                        <a href={cert.url || '#'} target="_blank" rel="noopener noreferrer" download>
                          <Download className="w-4 h-4" />
                        </a>
                      </button>
                      <button className="p-2 rounded-xl bg-secondary/10 text-muted-foreground hover:text-primary transition-colors" asChild>
                        <a href={cert.url || '#'} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-40 bg-card/30 rounded-[2.5rem] border-2 border-dashed border-border/40">
          <Award className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
          <h3 className="text-xl font-black mb-2">No certificates found</h3>
          <p className="text-muted-foreground font-medium mb-8">Add your achievements to showcase your progress.</p>
          <button onClick={() => setIsOpen(true)} className="apple-button gold-gradient text-white px-8">
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Your First Certificate
          </button>
        </div>
      )}
    </div>
  )
}
