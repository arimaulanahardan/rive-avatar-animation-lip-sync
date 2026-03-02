'use client'

import dynamic from 'next/dynamic'

type AvatarState = 'idle' | 'talking' | 'thinking'

const RiveAvatar = dynamic(() => import('./RiveAvatar'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />
    </div>
  ),
})

export default function AvatarContainer({ state }: { state: AvatarState }) {
  return (
    <div className="relative w-full h-full">
      <RiveAvatar state={state} className="w-full h-full" />

      {/* State label pill */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
            state === 'talking'
              ? 'bg-accent text-white shadow-lg shadow-accent/30'
              : state === 'thinking'
              ? 'bg-blue-500/80 text-white'
              : 'bg-white/10 text-white/50'
          }`}
        >
          {state === 'talking' ? '● Responding' : state === 'thinking' ? '◌ Thinking...' : '○ Idle'}
        </div>
      </div>
    </div>
  )
}
