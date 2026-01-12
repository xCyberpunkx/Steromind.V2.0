"use client"

import { useState, useEffect } from "react"
import { Plus, Trophy, Search, Star, StarOff, Loader2, Tag as TagIcon, X, Filter, MoreVertical, Trash2 } from "lucide-react"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

  const handleDeleteSkill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSkills(skills.filter(s => s.id !== id))
      toast.success('Skill deleted')
    } catch (error) {
      console.error('Error deleting skill:', error)
      toast.error('Failed to delete skill')
    }
  }

  const handleUpdateLevel = async (skill: Skill, newLevel: Skill['level']) => {
    try {
      const { error } = await supabase
        .from('skills')
        .update({ level: newLevel })
        .eq('id', skill.id)

      if (error) throw error

      setSkills(skills.map(s => s.id === skill.id ? { ...s, level: newLevel } : s))
      toast.success('Skill level updated')
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user && newLevel === 'advanced') {
        await logActivity(userData.user.id)
      }
    } catch (error) {
      console.error('Error updating skill level:', error)
      toast.error('Failed to update skill level')
    }
  }

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
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Skills Inventory</h2>
          <p className="text-gray-500 font-medium">Your technical toolkit, evolving every day.</p>
        </div>
        <Dialog open={isAddingSkill} onOpenChange={setIsAddingSkill}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add New Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add Skill</DialogTitle>
              <DialogDescription className="text-gray-500">
                Enter a technical skill to track your proficiency.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Skill Name</label>
                <Input
                  placeholder="e.g. TypeScript, React, System Design"
                  className="bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Current Level</label>
                <Select
                  value={newSkill.level}
                  onValueChange={(v: Skill['level']) => setNewSkill({ ...newSkill, level: v })}
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:ring-amber-500">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="beginner" className="focus:bg-amber-50 focus:text-amber-900">Beginner</SelectItem>
                    <SelectItem value="intermediate" className="focus:bg-amber-50 focus:text-amber-900">Intermediate</SelectItem>
                    <SelectItem value="advanced" className="focus:bg-amber-50 focus:text-amber-900">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <div className="relative group">
                  <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                  <Input
                    placeholder="Press Enter to add tags"
                    className="bg-white border-gray-200 pl-10 focus:border-amber-500 focus:ring-amber-500"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <AnimatePresence>
                    {newSkill.tags.map(tag => (
                      <motion.div
                        key={tag}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <Badge className="bg-amber-100 text-amber-800 border-none font-medium gap-1 pl-2 pr-1 py-1">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:bg-amber-200 rounded p-0.5 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsAddingSkill(false)}>Cancel</Button>
              <Button onClick={handleAddSkill} className="bg-amber-600 hover:bg-amber-700 text-white">Create Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
          <Input
            placeholder="Search skills or tags..."
            className="h-10 bg-white border-gray-200 pl-10 rounded-md focus:border-amber-500 focus:ring-amber-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 mr-2 text-gray-500 font-medium text-xs uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </div>
          <AnimatePresence>
            {allTags.map(tag => (
              <motion.div
                key={tag}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Badge
                  variant={selectedTag === tag ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1 rounded-md font-medium transition-all ${selectedTag === tag
                    ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
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
              className="h-8 px-2 text-red-600 font-medium hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <p className="text-gray-500 font-medium text-sm">Synchronizing Repository...</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                <Card className="p-6 group cursor-default h-full flex flex-col justify-between bg-white border-gray-200 hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Trophy className="w-5 h-5 text-gray-600" />
                      </div>

                      <div className="flex items-center gap-2">
                        <SkillLevelIndicator level={skill.level} variant="badge" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border-gray-200 min-w-[200px]">
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Update Level</div>
                            <DropdownMenuItem
                              className={skill.level === 'beginner' ? 'bg-amber-50 text-amber-900' : ''}
                              onClick={() => handleUpdateLevel(skill, 'beginner')}
                            >
                              Beginner (33%)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={skill.level === 'intermediate' ? 'bg-amber-50 text-amber-900' : ''}
                              onClick={() => handleUpdateLevel(skill, 'intermediate')}
                            >
                              Intermediate (66%)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={skill.level === 'advanced' ? 'bg-amber-50 text-amber-900' : ''}
                              onClick={() => handleUpdateLevel(skill, 'advanced')}
                            >
                              Advanced (100%)
                            </DropdownMenuItem>
                            <div className="h-px bg-gray-100 my-1" />
                            <DropdownMenuItem
                              className="text-red-600 focus:bg-red-50 focus:text-red-700"
                              onClick={() => handleDeleteSkill(skill.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Skill
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg tracking-tight mb-2 text-gray-900 group-hover:text-amber-600 transition-colors">{skill.name}</h3>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {skill.tags?.map(tag => (
                        <span key={tag} className="text-[10px] font-medium text-gray-500 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded border border-gray-100">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <SkillLevelIndicator level={skill.level} showLabel variant="bar" />
                      <span className="text-amber-600 font-bold text-sm">{getLevelProgress(skill.level)}%</span>
                    </div>
                    <Progress value={getLevelProgress(skill.level)} className="h-1.5 bg-gray-100" />
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
          className="flex flex-col items-center justify-center py-20 text-center text-gray-500"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No skills matched</h3>
          <p>Try a different keyword or filter.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
