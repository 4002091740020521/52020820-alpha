'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

type Dir = 'left' | 'right' | 'up' | 'down'

interface CardProps {
  card: {
    title: string
    imageUrl?: string
    videoUrl?: string
    storyText: string
  }
  isInteractive: boolean
  onDismiss: (direction: Dir) => void
  onDragChange?: (dragging: boolean) => void
}

export function Card({ card, isInteractive, onDismiss, onDragChange }: CardProps) {
  const outerRef = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const [flying, setFlying] = useState<null | Dir>(null)
  const [flipped, setFlipped] = useState(false)

  // NEU: Achsen-Lock („x“ | „y“ | null)
  const [axis, setAxis] = useState<null | 'x' | 'y'>(null)

  const TAP = 10
  const AXIS_LOCK_AT = 8
  const DISMISS_X = 120
  const DISMISS_Y = 120

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isInteractive || flying) return
    setDragging(true)
    onDragChange?.(true) // Scroll sperren
    setAxis(null)
    setStartX(e.clientX)
    setStartY(e.clientY)
    setDx(0); setDy(0)
    outerRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !isInteractive || flying) return
    // wichtig für iOS/Safari: Default-Scroll unterdrücken
    if (typeof e.preventDefault === 'function') e.preventDefault()

    const rawDx = e.clientX - startX
    const rawDy = e.clientY - startY

    // Achse bestimmen
    if (!axis) {
      if (Math.abs(rawDx) > AXIS_LOCK_AT || Math.abs(rawDy) > AXIS_LOCK_AT) {
        setAxis(Math.abs(rawDx) >= Math.abs(rawDy) ? 'x' : 'y')
      }
    }

    // Andere Achse dämpfen (fühlt sich "klebrig" an, verhindert zufälliges Scroll)
    if (axis === 'x') {
      setDx(rawDx)
      setDy(rawDy * 0.15)  // nur minimal vertikal mitgehen
    } else if (axis === 'y') {
      setDx(rawDx * 0.15)  // nur minimal horizontal mitgehen
      setDy(rawDy)
    } else {
      setDx(rawDx)
      setDy(rawDy)
    }
  }

  const toDir = (x: number, y: number): Dir => {
    const ax = Math.abs(x), ay = Math.abs(y)
    return ax >= ay ? (x < 0 ? 'left' : 'right') : (y < 0 ? 'up' : 'down')
  }

  const finishDrag = () => {
    setDragging(false)
    setAxis(null)
    onDragChange?.(false) // Scroll wieder freigeben
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging || !isInteractive) return
    finishDrag()
    outerRef.current?.releasePointerCapture(e.pointerId)

    const rawDx = e.clientX - startX
    const rawDy = e.clientY - startY
    const dist = Math.hypot(rawDx, rawDy)

    // Tap => Flip
    if (dist < TAP) {
      setFlipped(v => !v)
      setDx(0); setDy(0)
      return
    }

    // Dismiss abhängig von gelockter Achse
    const passX = Math.abs(rawDx) >= DISMISS_X
    const passY = Math.abs(rawDy) >= DISMISS_Y
    const shouldDismiss = axis === 'x' ? passX : axis === 'y' ? passY : (passX || passY)

    if (shouldDismiss) {
      const dir = toDir(rawDx, rawDy)
      setFlying(dir)

      const vw = typeof window !== 'undefined' ? window.innerWidth : 1000
      const vh = typeof window !== 'undefined' ? window.innerHeight : 1000
      const offX = dir === 'left' ? -vw * 1.2 : dir === 'right' ? vw * 1.2 : 0
      const offY = dir === 'up' ? -vh * 1.2 : dir === 'down' ? vh * 1.2 : 0

      setDx(offX || dx)
      setDy(offY || dy)

      setTimeout(() => {
        onDismiss(dir)
        setDx(0); setDy(0); setFlying(null); setFlipped(false)
      }, 300)
    } else {
      // Snap back
      setDx(0); setDy(0)
    }
  }

  const onPointerCancel = (e: React.PointerEvent) => {
    if (!dragging) return
    finishDrag()
    outerRef.current?.releasePointerCapture(e.pointerId)
    setDx(0); setDy(0)
  }

  // leichte Drehung nur aus X-Bewegung
  const angle = dx * 0.05

  return (
    <div
      ref={outerRef}
      className="relative w-64 h-96"
      style={{ perspective: '1200px', WebkitPerspective: '1200px' as any }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* Drag-Wrapper */}
      <div
        className={`
          w-full h-full rounded-xl overflow-hidden shadow-xl select-none
          ${isInteractive ? 'touch-none cursor-grab active:cursor-grabbing' : 'pointer-events-none'}
        `}
        style={{
          transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${angle}deg)`,
          transition: dragging ? 'none' : 'transform 300ms cubic-bezier(0.22,1,0.36,1)',
          willChange: 'transform',
        }}
      >
        {/* Flip-Wrapper */}
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d' as any,
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 420ms cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' as any, transform: 'translateZ(1px)' }}
          >
            {card.videoUrl ? (
              <video
                src={card.videoUrl}
                className="w-full h-full object-cover"
                autoPlay muted loop playsInline preload="auto"
              />
            ) : card.imageUrl ? (
              <Image src={card.imageUrl} alt={card.title} fill className="object-cover" draggable={false} priority />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">No media</div>
            )}
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: 'rotateY(180deg) translateZ(1px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden' as any,
              backgroundImage: 'url(/card_backside.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <span className="px-3 py-1 rounded-md text-white backdrop-blur-sm text-sm w-40 text-xs text-justify">
              {card.storyText}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
