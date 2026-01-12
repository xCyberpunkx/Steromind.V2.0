import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useStreak() {
  const [streak, setStreak] = useState(0)
  const [hasLoggedToday, setHasLoggedToday] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function calculateStreak() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: logs, error } = await supabase
        .from('progress_logs')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching logs for streak:', error)
        setLoading(false)
        return
      }

      if (!logs || logs.length === 0) {
        setStreak(0)
        setHasLoggedToday(false)
        setLoading(false)
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      
      const logDates = new Set(logs.map(l => l.date))
      
      let currentStreak = 0
      let checkDate = new Date()
      
      // Check if logged today
      if (logDates.has(today)) {
        setHasLoggedToday(true)
      }

      // Calculate streak
      // If no log today, check if streak continued from yesterday
      if (!logDates.has(today) && !logDates.has(yesterday)) {
        setStreak(0)
        setLoading(false)
        return
      }

      // Start from today or yesterday
      let dateToStart = logDates.has(today) ? new Date() : new Date(Date.now() - 86400000)
      
      while (true) {
        const dateStr = dateToStart.toISOString().split('T')[0]
        if (logDates.has(dateStr)) {
          currentStreak++
          dateToStart.setDate(dateToStart.getDate() - 1)
        } else {
          break
        }
      }

      setStreak(currentStreak)
      setLoading(false)
    }

    calculateStreak()
  }, [])

  return { streak, hasLoggedToday, loading }
}
