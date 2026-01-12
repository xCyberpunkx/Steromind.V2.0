import { supabase } from './supabase'

export async function logActivity(userId: string) {
  const today = new Date().toISOString().split('T')[0]

  try {
    // Check if entry exists for today
    const { data, error } = await supabase
      .from('progress_logs')
      .select('id, value')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching progress log:', error)
      return
    }

    if (data) {
      // Update existing entry
      await supabase
        .from('progress_logs')
        .update({ value: data.value + 1 })
        .eq('id', data.id)
    } else {
      // Create new entry
      await supabase
        .from('progress_logs')
        .insert({
          user_id: userId,
          date: today,
          value: 1
        })
    }
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}
