"use client"

import { useState, useEffect } from "react"
import { Plus, Trophy, Search, Star, StarOff, Loader2, Tag as TagIcon, X, Sparkles, Filter } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase, Skill } from "@/lib/supabase"
import { toast } from "sonner"
import { logActivity } from "@/lib/activity"
import { SkillLevelIndicator } from "@/components/SkillLevelIndicator"
import { motion, AnimatePresence } from "framer-motion"

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' as Skill['level'], tags: [] as string[] })
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSkills(data || [])
    } catch (error) {
      console.error('Error fetching skills:', error)
      toast.error('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async () => {
    const trimmedName = newSkill.name.trim()
    if (!trimmedName) {
      toast.error('Please provide a skill name')
      return
    }

    if (trimmedName.length > 50) {
      toast.error('Skill name is too long')
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('skills')
        .insert([{
          name: trimmedName,
          level: newSkill.level,
          tags: newSkill.tags,
          user_id: userData.user?.id || '00000000-0000-0000-0000-000000000000'
        }])
        .select()
        .single()

        if (error) throw error
        
        if (userData.user) {
          await logActivity(userData.user.id)
        }
        
        setSkills([data, ...skills])
      setNewSkill({ name: '', level: 'beginner', tags: [] })
      setIsAddingSkill(false)
      toast.success('Skill added successfully')
    } catch (error) {
      console.error('Error adding skill:', error)
      toast.error('Failed to add skill')
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!newSkill.tags.includes(tagInput.trim())) {
        setNewSkill({ ...newSkill, tags: [...newSkill.tags, tagInput.trim()] })
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewSkill({ ...newSkill, tags: newSkill.tags.filter(t => t !== tagToRemove) })
  }

  const allTags = Array.from(new Set(skills.flatMap(s => s.tags || []))).sort()

  const filtered = skills.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchesTag = !selectedTag || s.tags?.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const getLevelProgress = (level: Skill['level']) => {
    switch (level) {
      case 'beginner': return 33
      case 'intermediate': return 66
      case 'advanced': return 100
      default: return 0
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Expertise
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Skills Inventory</h2>
          <p className="text-muted-foreground font-medium text-lg">Your technical toolkit, evolving every day.</p>
        </div>
        <Dialog open={isAddingSkill} onOpenChange={setIsAddingSkill}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-2xl gold-gradient text-white font-bold shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95">
              <Plus className="w-5 h-5 mr-2" />
              Add New Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="apple-card border-none max-w-md p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Add Skill</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Enter a technical skill to track your proficiency.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Skill Name</label>
                <Input 
                  placeholder="e.g. TypeScript, React, System Design" 
                  className="h-12 bg-secondary/30 border-border/50 rounded-2xl focus:ring-primary/20 transition-all"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Current Level</label>
                <Select 
                  value={newSkill.level} 
                  onValueChange={(v: Skill['level']) => setNewSkill({ ...newSkill, level: v })}
                >
                  <SelectTrigger className="h-12 bg-secondary/30 border-border/50 rounded-2xl focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="apple-card border-none rounded-2xl p-2">
                    <SelectItem value="beginner" className="rounded-xl focus:bg-primary/5 focus:text-primary">Beginner</SelectItem>
                    <SelectItem value="intermediate" className="rounded-xl focus:bg-primary/5 focus:text-primary">Intermediate</SelectItem>
                    <SelectItem value="advanced" className="rounded-xl focus:bg-primary/5 focus:text-primary">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Tags</label>
                <div className="relative group">
                  <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Press Enter to add tags" 
                    className="h-12 bg-secondary/30 border-border/50 pl-12 rounded-2xl focus:ring-primary/20 transition-all"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-3 ml-1">
                  <AnimatePresence>
                    {newSkill.tags.map(tag => (
                      <motion.div
                        key={tag}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <Badge className="bg-primary/10 text-primary border-none font-bold gap-2 pl-3 pr-2 py-1.5 rounded-xl">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-lg p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setIsAddingSkill(false)} className="h-12 px-6 rounded-2xl font-bold">Cancel</Button>
              <Button onClick={handleAddSkill} className="h-12 px-8 rounded-2xl gold-gradient text-white font-bold shadow-lg shadow-primary/20 transition-all hover:opacity-90">Create Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search skills or tags..." 
            className="h-14 bg-card/50 apple-card border-none pl-12 pr-5 rounded-2xl focus:ring-primary/20 transition-all text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 mr-2 text-muted-foreground font-bold text-xs uppercase tracking-widest">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          <AnimatePresence>
            {allTags.map(tag => (
              <motion.div
                key={tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge 
                  variant={selectedTag === tag ? "default" : "outline"}
                  className={`cursor-pointer h-9 px-4 rounded-xl border-border/50 font-bold transition-all ${
                    selectedTag === tag 
                      ? 'gold-gradient text-white border-none shadow-md shadow-primary/20' 
                      : 'bg-background/50 backdrop-blur-sm text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
          {selectedTag && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedTag(null)}
              className="h-9 px-3 text-destructive font-bold hover:bg-destructive/5 hover:text-destructive transition-colors rounded-xl"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Synchronizing Repository...</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((skill) => (
              <motion.div
                key={skill.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="apple-card p-6 group cursor-default h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-300">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <SkillLevelIndicator level={skill.level} variant="badge" />
                    </div>
                    
                    <h3 className="font-extrabold text-xl tracking-tight mb-3 group-hover:text-primary transition-colors">{skill.name}</h3>
                    
                    <div className="flex flex-wrap gap-1.5 mb-8">
                      {skill.tags?.map(tag => (
                        <span key={tag} className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest bg-secondary/30 px-2 py-0.5 rounded-lg border border-border/10">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/10">
                    <div className="flex items-center justify-between">
                      <SkillLevelIndicator level={skill.level} showLabel variant="bar" />
                      <span className="text-primary font-black text-sm">{getLevelProgress(skill.level)}%</span>
                    </div>
                    <Progress value={getLevelProgress(skill.level)} className="h-2 bg-secondary/30" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!loading && filtered.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center opacity-50"
        >
          <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
            <Search className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold">No skills matched your search</h3>
          <p className="font-medium">Try a different keyword or filter.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
