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
      // 1. Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to upload")
        return
      }

      // 2. Upload file to Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath)

      // 4. Save to Database
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
          <p className="text-zinc-400">Your professional achievements and certifications.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Certificate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Certificate Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">Issuer</Label>
                <Input 
                  id="issuer" 
                  value={issuer} 
                  onChange={(e) => setIssuer(e.target.value)} 
                  placeholder="e.g. Amazon Web Services"
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Issue Date</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="bg-zinc-800 border-zinc-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Certificate File (PDF or Image)</Label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${file ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 hover:border-zinc-600'}`}>
                  <div className="space-y-1 text-center">
                    {file ? (
                      <div className="flex flex-col items-center">
                        <FileUp className="mx-auto h-12 w-12 text-blue-500" />
                        <div className="flex text-sm text-zinc-400 mt-2">
                          <span className="font-medium text-white">{file.name}</span>
                          <button type="button" onClick={() => setFile(null)} className="ml-2 text-zinc-500 hover:text-red-500">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FileUp className="mx-auto h-12 w-12 text-zinc-500" />
                        <div className="flex text-sm text-zinc-400">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400">
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
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-zinc-500">PDF, PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : "Save Certificate"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search certificates..." 
            className="bg-zinc-900 border-zinc-800 pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800 p-6 h-[200px] animate-pulse">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-lg bg-zinc-800 w-12 h-12"></div>
                <div className="bg-zinc-800 w-16 h-6 rounded"></div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-6 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cert) => (
            <Card key={cert.id} className="bg-zinc-900 border-zinc-800 p-6 group hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-lg bg-blue-600/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6" />
                </div>
                {/* We don't have category in DB yet, but we could add it. For now, just label it as Achievement */}
                <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-400">
                  Certification
                </Badge>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-bold line-clamp-1">{cert.name}</h3>
                <p className="text-sm text-zinc-400 mt-1">{cert.issuer}</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar className="w-3 h-3" />
                  {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" asChild>
                    <a href={cert.url || '#'} target="_blank" rel="noopener noreferrer" download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" asChild>
                    <a href={cert.url || '#'} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 border-dashed border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center text-center">
          <Award className="w-12 h-12 text-zinc-700 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No certificates found</h3>
          <p className="text-zinc-500 mb-6 max-w-sm">
            You haven't uploaded any certificates yet. Add your achievements to showcase your progress.
          </p>
          <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            Upload Your First Certificate
          </Button>
        </Card>
      )}
    </div>
  )
}
