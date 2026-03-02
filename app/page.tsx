'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Message, AvatarState } from '@/lib/types'

const AvatarContainer = dynamic(() => import('@/components/avatar/AvatarContainer'), { ssr: false })

const MODELS = ['llama3', 'llama3.2', 'mistral', 'gemma2', 'phi3', 'qwen2.5']

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-slide-in-left">
      <div className="flex gap-1.5 bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-accent thinking-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-end gap-2 message-enter ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed rounded-2xl transition-all ${
          isUser
            ? 'bg-accent text-white rounded-br-sm shadow-lg shadow-accent/20'
            : 'bg-white/8 text-white/90 border border-white/10 rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-white/60 text-right' : 'text-white/30'}`}>
          {message.createdAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'こんにちは！何でも聞いてください。',
      createdAt: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState('llama3')
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [input])

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    setError(null)
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      createdAt: new Date(),
    }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    setAvatarState('thinking')
    setStreamingContent('')

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, model }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Request failed')
      }

      // Switch to talking when first token arrives
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let firstToken = true

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const { token } = JSON.parse(data)
            if (token) {
              if (firstToken) {
                setAvatarState('talking')
                firstToken = false
              }
              fullContent += token
              setStreamingContent(fullContent)
            }
          } catch { /* skip */ }
        }
      }

      // Finalize message
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent,
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
      setStreamingContent('')
      setAvatarState('idle')
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      setAvatarState('idle')
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, model])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setIsLoading(false)
    setAvatarState('idle')
    if (streamingContent) {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: streamingContent, createdAt: new Date() },
      ])
      setStreamingContent('')
    }
  }

  return (
    <div className="grain fixed inset-0 flex bg-ink overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      {/* LEFT — Avatar panel */}
      <div className="relative flex-shrink-0 w-[320px] flex flex-col items-center justify-center border-r border-white/6 bg-white/[0.02]">
        {/* Top label */}
        <div className="absolute top-6 left-0 right-0 flex justify-center">
          <span className="font-display text-white/20 text-sm tracking-widest uppercase">Avatar</span>
        </div>

        {/* Avatar */}
        <div
          className={`w-64 h-80 transition-all duration-700 ${
            avatarState === 'talking'
              ? 'drop-shadow-[0_0_40px_rgba(255,107,53,0.4)]'
              : avatarState === 'thinking'
              ? 'drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]'
              : 'drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]'
          }`}
        >
          <AvatarContainer state={avatarState} />
        </div>

        {/* Waveform bars — animate when talking */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1 items-end h-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${
                avatarState === 'talking' ? 'bg-accent' : 'bg-white/15'
              }`}
              style={{
                height: avatarState === 'talking'
                  ? `${Math.sin((Date.now() / 200 + i) % (Math.PI * 2)) * 12 + 14}px`
                  : '4px',
                animation: avatarState === 'talking'
                  ? `waveBar ${0.5 + (i % 4) * 0.1}s ease-in-out infinite alternate`
                  : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* RIGHT — Chat panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-white/[0.02] flex-shrink-0">
          <div>
            <h1 className="font-display text-xl text-white">Chat</h1>
            <p className="text-xs text-white/30 mt-0.5">Powered by Ollama · local</p>
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">Model</span>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              disabled={isLoading}
              className="bg-white/8 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:border-accent/50 transition disabled:opacity-40 cursor-pointer"
            >
              {MODELS.map(m => (
                <option key={m} value={m} className="bg-ink">{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Streaming message */}
          {streamingContent && (
            <div className="flex items-end gap-2 animate-slide-in-left">
              <div className="max-w-[75%] px-4 py-3 text-sm leading-relaxed rounded-2xl rounded-bl-sm bg-white/8 border border-accent/20 text-white/90">
                <p className="whitespace-pre-wrap break-words">{streamingContent}</p>
                <span className="inline-block w-0.5 h-3.5 bg-accent animate-pulse ml-0.5 align-middle" />
              </div>
            </div>
          )}

          {/* Thinking indicator */}
          {isLoading && !streamingContent && <TypingIndicator />}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 animate-fade-in">
              <div className="px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <p className="font-medium mb-0.5">Error</p>
                <p className="text-red-300/70 text-xs whitespace-pre-line">{error}</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-white/6 bg-white/[0.02]">
          <div className={`flex items-end gap-3 bg-white/6 border rounded-2xl px-4 py-3 transition-all duration-200 ${
            isLoading ? 'border-accent/30' : 'border-white/10 focus-within:border-white/25'
          }`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="メッセージを入力… (Enter で送信)"
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/25 resize-none outline-none leading-relaxed disabled:opacity-50 max-h-[140px]"
            />

            {isLoading ? (
              <button
                onClick={handleStop}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-all duration-200 text-white"
                title="Stop"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="2" y="2" width="8" height="8" rx="1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-accent hover:bg-accent-soft disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-95"
                title="Send"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 8L2 2l3 6-3 6 12-6z" fill="white" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-[11px] text-white/20 mt-2 text-center">
            Shift+Enter で改行 · Ollama が localhost:11434 で起動している必要があります
          </p>
        </div>
      </div>

      {/* Waveform CSS animation */}
      <style>{`
        @keyframes waveBar {
          0% { height: 4px; }
          100% { height: 24px; }
        }
      `}</style>
    </div>
  )
}
