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
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Certificates</h1>
          <p className="text-gray-500 font-medium">Your professional achievements and certifications.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Upload Certificate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-500">Certificate Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="bg-white border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer" className="text-xs font-bold uppercase tracking-wider text-gray-500">Issuer</Label>
                <Input
                  id="issuer"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services"
                  className="bg-white border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-gray-500">Issue Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white border-gray-200 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file" className="text-xs font-bold uppercase tracking-wider text-gray-500">Certificate File (PDF or Image)</Label>
                <div className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-lg transition-all ${file ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'}`}>
                  <div className="space-y-2 text-center">
                    {file ? (
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                          <FileUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-700">{file.name}</span>
                          <button type="button" onClick={() => setFile(null)} className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                          <FileUp className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex text-sm">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-amber-600 hover:text-amber-500 transition-colors">
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
                          <p className="pl-1 text-gray-500">or drag and drop</p>
                        </div>
                        <p className="text-xs font-medium text-gray-400">PDF, PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search certificates..."
            className="bg-white border-gray-200 pl-10 h-10 rounded-md focus:ring-amber-500 focus:border-amber-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[200px] rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-6 h-full flex flex-col border border-gray-200 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <Badge variant="outline" className="bg-gray-50 border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Certification
                    </Badge>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{cert.name}</h3>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">{cert.issuer}</p>
                  </div>

                  <div className="mt-8 flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50" asChild>
                        <a href={cert.url || '#'} target="_blank" rel="noopener noreferrer" download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50" asChild>
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
        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Award className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No certificates found</h3>
          <p className="text-gray-500 mb-6">Add your achievements to showcase your progress.</p>
          <Button onClick={() => setIsOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Your First Certificate
          </Button>
        </div>
      )}
    </div>
  )
}
