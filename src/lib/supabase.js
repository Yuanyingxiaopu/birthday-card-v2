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

// === 激活码（服务端验证，跨设备同步）===

// 后台批量生成：把 code 插入数据库（未激活状态）
export async function createAccessCodes(codes) {
  if (!supabase) return codes
  const rows = codes.map(code => ({ code, activated_at: null, expires_at: null }))
  const { error } = await supabase.from('access_codes').insert(rows)
  if (error) throw error
  return codes
}

// 查询单个激活码状态
async function fetchAccessCode(code) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('access_codes')
    .select('code, activated_at, expires_at')
    .eq('code', code)
    .maybeSingle()
  if (error) {
    console.warn('查询激活码失败:', error)
    return null
  }
  return data
}

// 是否存在（用于后台判断码是否已被生成过）
export async function isCodeExists(code) {
  const entry = await fetchAccessCode(code)
  return !!entry
}

// 是否已激活（用户首次访问时被设置 activated_at）
export async function isCodeActivated(code) {
  const entry = await fetchAccessCode(code)
  return !!(entry && entry.activated_at)
}

// 是否有效（已激活且未过期）
export async function isCodeValid(code) {
  const entry = await fetchAccessCode(code)
  if (!entry || !entry.activated_at || !entry.expires_at) return false
  return new Date(entry.expires_at).getTime() > Date.now()
}

// 剩余天数
export async function getCodeRemainingDays(code) {
  const entry = await fetchAccessCode(code)
  if (!entry || !entry.expires_at) return 0
  const remaining = new Date(entry.expires_at).getTime() - Date.now()
  return remaining > 0 ? Math.ceil(remaining / (24 * 60 * 60 * 1000)) : 0
}

// 激活（首次访问时调用，写入 activated_at 和 expires_at）
export async function activateCode(code) {
  if (!supabase) return
  const entry = await fetchAccessCode(code)
  if (!entry) {
    // 数据库里没这个码，激活失败
    return false
  }
  if (entry.activated_at) {
    // 已激活过，幂等返回
    return true
  }
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  const { error } = await supabase
    .from('access_codes')
    .update({ activated_at: now.toISOString(), expires_at: expiresAt.toISOString() })
    .eq('code', code)
  if (error) throw error
  return true
}
