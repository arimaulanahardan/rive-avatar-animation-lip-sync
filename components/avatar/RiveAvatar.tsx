'use client'

import { useEffect, useRef } from 'react'
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas'

type AvatarState = 'idle' | 'talking' | 'thinking'

interface RiveAvatarProps {
  state: AvatarState
  className?: string
}

export default function RiveAvatar({ state, className = '' }: RiveAvatarProps) {
  const { RiveComponent, rive } = useRive({
    src: '/avatar.riv',
    artboard: 'Avatar',
    stateMachines: 'State Machine 1',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  })

  // Try to get state machine inputs — names may vary per .riv file
  const talkInput = useStateMachineInput(rive, 'State Machine 1', 'talk')
  const thinkInput = useStateMachineInput(rive, 'State Machine 1', 'think')
  const idleInput = useStateMachineInput(rive, 'State Machine 1', 'idle')

  useEffect(() => {
    if (!rive) return

    if (state === 'talking') {
      if (talkInput) talkInput.value = true
      if (thinkInput) thinkInput.value = false
      if (idleInput) idleInput.value = false
      // Fallback: try playing animation directly
      try { rive.play('talk') } catch {}
      try { rive.play('Mouth Shapes') } catch {}
    } else if (state === 'thinking') {
      if (talkInput) talkInput.value = false
      if (thinkInput) thinkInput.value = true
      if (idleInput) idleInput.value = false
      try { rive.play('think') } catch {}
    } else {
      // idle
      if (talkInput) talkInput.value = false
      if (thinkInput) thinkInput.value = false
      if (idleInput) idleInput.value = true
      try { rive.play('idle') } catch {}
      // Reset to first animation if nothing else matches
      try {
        const animations = rive.animationNames
        if (animations && animations.length > 0) {
          rive.play(animations[0])
        }
      } catch {}
    }
  }, [state, rive, talkInput, thinkInput, idleInput])

  return (
    <div className={`relative ${className}`}>
      {/* Glow behind avatar based on state */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 ${
          state === 'talking'
            ? 'bg-accent/20 scale-110'
            : state === 'thinking'
            ? 'bg-blue-500/15 scale-105'
            : 'bg-white/5 scale-100'
        }`}
      />
      <div
        className={`relative transition-transform duration-500 ${
          state === 'talking' ? 'animate-avatar-bounce' : ''
        }`}
      >
        <RiveComponent />
      </div>
    </div>
  )
}
