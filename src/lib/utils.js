export function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const segments = [8, 4, 4]
  return segments.map(len =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  ).join('-')
}

export function generatePassword(birthday) {
  const date = new Date(birthday)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return month + day
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Encode card data into URL-safe string (for sharing without database)
export function encodeCardData(card) {
  try {
    const minimal = {
      n: card.name,
      b: card.solar_birthday,
      s: card.sender || '',
      bl: card.blessing || '',
      p: card.photo_url || '',
      pw: card.password || generatePassword(card.solar_birthday),
      th: card.theme || 'pink',
    }
    const json = JSON.stringify(minimal)
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  } catch {
    return ''
  }
}

export function decodeCardData(encoded) {
  try {
    const base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    const json = decodeURIComponent(escape(atob(padded)))
    const data = JSON.parse(json)
    return {
      name: data.n || '',
      solar_birthday: data.b || '',
      sender: data.s || '',
      blessing: data.bl || '',
      photo_url: data.p || '',
      password: data.pw || '',
      theme: data.th || 'pink',
      id: 'shared',
    }
  } catch {
    return null
  }
}

// Draft box: save/load form drafts from localStorage, max 5
const DRAFT_KEY = 'birthday_card_drafts'

export function saveDraft(form) {
  const drafts = loadDrafts()
  const draft = {
    id: Date.now(),
    savedAt: new Date().toLocaleString('zh-CN'),
    name: form.name,
    birthday: form.birthday,
    sender: form.sender,
    blessing: form.blessing,
  }
  drafts.unshift(draft)
  // Keep max 5
  const trimmed = drafts.slice(0, 5)
  localStorage.setItem(DRAFT_KEY, JSON.stringify(trimmed))
  return draft
}

export function loadDrafts() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function loadLatestDraft() {
  const drafts = loadDrafts()
  return drafts.length > 0 ? drafts[0] : null
}

export function deleteDraft(id) {
  const drafts = loadDrafts().filter(d => d.id !== id)
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
  return drafts
}

export function clearDrafts() {
  localStorage.removeItem(DRAFT_KEY)
}
