import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null

export async function createCard(data) {
  if (!supabase) return { id: 'local-' + Date.now(), ...data }
  const { data: card, error } = await supabase
    .from('cards')
    .insert([data])
    .select()
    .single()
  if (error) throw error
  return card
}

export async function getCardByToken(token) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('token', token)
    .single()
  if (error) return null
  return data
}

export async function getCardById(id) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function updateCard(id, updates) {
  if (!supabase) return
  const { error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

export async function uploadPhoto(file, cardId) {
  if (!supabase) return URL.createObjectURL(file)
  const ext = file.name.split('.').pop()
  const path = `photos/${cardId}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('birthday-photos')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data: { publicUrl } } = supabase.storage
    .from('birthday-photos')
    .getPublicUrl(path)
  return publicUrl
}
