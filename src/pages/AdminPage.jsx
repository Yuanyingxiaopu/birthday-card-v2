import { useState, useEffect } from 'react'
import { generateAccessCode, generateAccessUrl } from '../lib/utils'

const ADMIN_PASSWORD = 'huangjia2026'
const ADMIN_KEY = 'admin_codes'
const BASE_URL = 'https://birthday-card-v2.pages.dev'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState('')
  const [count, setCount] = useState(5)
  const [codes, setCodes] = useState([])
  const [copiedIdx, setCopiedIdx] = useState(-1)

  useEffect(() => {
    if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true)
    const saved = localStorage.getItem(ADMIN_KEY)
    if (saved) setCodes(JSON.parse(saved))
  }, [])

  const handleLogin = () => {
    if (pwInput === ADMIN_PASSWORD) {
      setAuthed(true)
      sessionStorage.setItem('admin_authed', 'true')
      setPwError('')
    } else {
      setPwError('密码错误')
    }
  }

  const handleGenerate = () => {
    const n = Math.min(Math.max(count, 1), 50)
    const newCodes = []
    for (let i = 0; i < n; i++) {
      const code = generateAccessCode()
      newCodes.push({ code, url: generateAccessUrl(BASE_URL, code), createdAt: new Date().toLocaleString('zh-CN') })
    }
    const updated = [...newCodes, ...codes]
    setCodes(updated)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(updated))
  }

  const handleCopy = async (url, idx) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(-1), 1500)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(-1), 1500)
    }
  }

  const handleCopyAll = async () => {
    const text = codes.map((c, i) => `链接${i + 1}: ${c.url}\n验证码: ${c.code}`).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiedIdx(-2)
    setTimeout(() => setCopiedIdx(-1), 1500)
  }

  const handleCopyCode = async (code, idx) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedIdx(idx + 100)
      setTimeout(() => setCopiedIdx(-1), 1500)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedIdx(idx + 100)
      setTimeout(() => setCopiedIdx(-1), 1500)
    }
  }

  if (!authed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1 className="text-xl font-bold text-gray-700 mb-6">管理后台</h1>
        <div className="w-full max-w-xs space-y-3">
          <input type="password" value={pwInput} onChange={e => { setPwInput(e.target.value); setPwError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="请输入管理密码" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-pink-300 text-sm" />
          {pwError && <p className="text-xs text-red-400">{pwError}</p>}
          <button onClick={handleLogin} className="w-full py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">登录</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 px-5 py-8 max-w-lg mx-auto w-full">
      <h1 className="text-xl font-bold text-gray-700 mb-6">验证码管理</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-gray-600 whitespace-nowrap">生成数量</label>
          <input type="number" min="1" max="50" value={count} onChange={e => setCount(Number(e.target.value))}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none" />
          <button onClick={handleGenerate}
            className="px-4 py-2 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors whitespace-nowrap">
            生成
          </button>
        </div>
        <p className="text-xs text-gray-400">链接格式：{BASE_URL}/?code=XXXXXX</p>
        <p className="text-xs text-gray-400">有效期：用户首次验证后60天</p>
      </div>

      {codes.length > 0 && (
        <div className="flex justify-end mb-3">
          <button onClick={handleCopyAll}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors">
            {copiedIdx === -2 ? '已复制全部' : '复制全部链接+验证码'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {codes.map((c, i) => (
          <div key={c.code} className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400">#{i + 1} · {c.createdAt}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">验证码:</span>
              <code className="text-sm font-mono font-bold text-pink-600 tracking-wider">{c.code}</code>
              <button onClick={() => handleCopyCode(c.code, i)}
                className="text-xs text-gray-400 hover:text-pink-500 ml-auto whitespace-nowrap">
                {copiedIdx === i + 100 ? '已复制' : '复制验证码'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">链接:</span>
              <span className="text-xs text-gray-600 truncate flex-1">{c.url}</span>
              <button onClick={() => handleCopy(c.url, i)}
                className="text-xs text-gray-400 hover:text-pink-500 whitespace-nowrap">
                {copiedIdx === i ? '已复制' : '复制链接'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {codes.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-8">还没有生成验证码</p>
      )}
    </div>
  )
}
