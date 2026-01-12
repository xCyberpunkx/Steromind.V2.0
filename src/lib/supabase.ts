import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
}

export type Certificate = {
  id: string
  user_id: string
  name: string
  issuer: string | null
  issue_date: string | null
  url: string | null
  created_at: string
}

export type Course = {
  id: string
  user_id: string
  title: string
  platform: string | null
  status: 'enrolled' | 'completed'
  completion_percentage: number
  notes: string | null
  summary: string | null
  tags: string[]
  created_at: string
}

export type Module = {
  id: string
  course_id: string
  title: string
  is_completed: boolean
  notes: string | null
  summary: string | null
  tags: string[]
  created_at: string
}

export type Project = {
  id: string
  user_id: string
  title: string
  description: string | null
  url: string | null
  repo_url: string | null
  image_url: string | null
  notes: string | null
  summary: string | null
  tags: string[]
  created_at: string
}

export type LearningResource = {
  id: string
  user_id: string
  title: string
  url: string
  resource_type: 'link' | 'video' | 'tutorial' | 'document'
  course_id: string | null
  module_id: string | null
  project_id: string | null
  created_at: string
}

export type Skill = {
  id: string
  user_id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  created_at: string
}

export type Goal = {
  id: string
  user_id: string
  title: string
  description: string | null
  deadline: string | null
  status: 'pending' | 'achieved'
  created_at: string
}

export type ProgressLog = {
  id: string
  user_id: string
  date: string
  value: number
  created_at: string
}

export type BacklogItem = {
  id: string
  user_id: string
  title: string
  category: 'course' | 'skill' | 'project' | 'other'
  priority: 'high' | 'medium' | 'low'
  url: string | null
  description: string | null
  status: 'pending' | 'in-progress' | 'completed' | 'archived'
  created_at: string
}
