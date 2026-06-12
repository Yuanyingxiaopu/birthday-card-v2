export const THEMES = [
  {
    id: 'pink', name: '粉色浪漫',
    bg: 'linear-gradient(135deg, #fff0f3, #fff8f0, #ffe0e8)',
    card: 'linear-gradient(180deg, #fff5f8 0%, #fff0e8 50%, #ffe8f0 100%)',
    primary: '#ff6b9d',
    primaryLight: '#ffb3cc',
    text: '#c44d7a',
    border: '#ffb3cc',
  },
  {
    id: 'blue', name: '星空蓝',
    bg: 'linear-gradient(135deg, #eef4ff, #f0f4ff, #dce8ff)',
    card: 'linear-gradient(180deg, #eef4ff 0%, #e0ecff 50%, #d8e8ff 100%)',
    primary: '#4a90d9',
    primaryLight: '#8ab8f0',
    text: '#2d5f8a',
    border: '#8ab8f0',
  },
  {
    id: 'gold', name: '金色华诞',
    bg: 'linear-gradient(135deg, #fffef5, #fffbf0, #fff0d0)',
    card: 'linear-gradient(180deg, #fffef5 0%, #fff8e0 50%, #fff3d0 100%)',
    primary: '#d4a017',
    primaryLight: '#f0d060',
    text: '#8a6a10',
    border: '#f0d060',
  },
  {
    id: 'green', name: '清新绿意',
    bg: 'linear-gradient(135deg, #f0fff5, #f5fff8, #d5f2dd)',
    card: 'linear-gradient(180deg, #f0fff5 0%, #e0f8e8 50%, #d5f2dd 100%)',
    primary: '#34a853',
    primaryLight: '#70d090',
    text: '#1a6b30',
    border: '#70d090',
  },
  {
    id: 'purple', name: '梦幻紫',
    bg: 'linear-gradient(135deg, #f8f0ff, #f5f0ff, #e5d5ff)',
    card: 'linear-gradient(180deg, #f8f0ff 0%, #ede0ff 50%, #e5d5ff 100%)',
    primary: '#8b5cf6',
    primaryLight: '#b794f6',
    text: '#5b3ba0',
    border: '#b794f6',
  },
]

export function getTheme(id) {
  return THEMES.find(t => t.id === (id || 'pink')) || THEMES[0]
}

export function saveTheme(id) {
  sessionStorage.setItem('card_theme', id)
}

export function loadTheme() {
  return sessionStorage.getItem('card_theme') || 'pink'
}
