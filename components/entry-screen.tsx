'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface EntryScreenProps {
  onComplete: () => void
  firstCard: {
    title: string
    imageUrl: string
    storyText: string
  }
}

export function EntryScreen({ onComplete, firstCard }: EntryScreenProps) {
  // Pack-Grafik – ersetzbar durch /pack.jpg etc.
  const packImg =
    'card_case.jpg'

  const [isAnimating, setIsAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showInstruction, setShowInstruction] = useState(true)
  const [startX, setStartX] = useState(0)
  const [dx, setDx] = useState(0)
  const THRESHOLD = 110

  const ref = useRef<HTMLDivElement>(null)

  const onDown = (e: React.PointerEvent) => {
    if (isAnimating) return
    setIsDragging(true)
    setStartX(e.clientX)
    setDx(0)
    setShowInstruction(false)
    ref.current?.setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!isDragging || isAnimating) return
    setDx(e.clientX - startX) // nur Tilt/Parallax
  }
  const onUp = (e: React.PointerEvent) => {
    if (!isDragging || isAnimating) return
    setIsDragging(false)
    const deltaX = e.clientX - startX
    if (Math.abs(deltaX) >= THRESHOLD) {
      setIsAnimating(true)
      setTimeout(() => onComplete(), 800)
    } else {
      setDx(0)
      setShowInstruction(true)
    }
    ref.current?.releasePointerCapture(e.pointerId)
  }

  const tilt = (dx >= 0 ? 1 : -1) * Math.min(1, Math.abs(dx) / THRESHOLD) * 4

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div
        ref={ref}
        className="relative w-64 h-96 select-none touch-none cursor-pointer"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          transform: `translate3d(${dx * 0.08}px, 0, 0) rotate(${tilt}deg)`,
          transition: isDragging || isAnimating ? 'none' : 'transform 250ms ease-out',
          willChange: 'transform',
        }}
      >

        {/* Obere Hälfte */}
        <div
          className={`absolute inset-0 z-10 rounded-t-lg shadow-xl ${
            isAnimating ? 'animate-packTopFly' : ''
          }`}
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
            backgroundImage: `url(${packImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Untere Hälfte */}
        <div
          className={`absolute inset-0 z-10 rounded-b-lg shadow-xl ${
            isAnimating ? 'animate-packBottomFly' : ''
          }`}
          style={{
            clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
            backgroundImage: `url(${packImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Shine-Linie beim Rip */}
        {isAnimating && (
          <div className="absolute top-1/2 left-0 w-full h-[2px] overflow-hidden pointer-events-none z-20">
            <div className="absolute w-2/3 h-full animate-tearShine" />
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {isAnimating
            ? 'Opening…'
            : isDragging
            ? 'Keep pulling…'
            : showInstruction
            ? 'Swipe left or right to open the pack'
            : ''}
        </p>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes cardPopKF {
          0% { transform: scale(0.96); opacity: 0; }
          45% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-cardPop {
          animation: cardPopKF 0.8s cubic-bezier(0.22,1,0.36,1) both 0.05s;
        }
        @keyframes packTopFlyKF {
          0% { transform: translate3d(0, 0, 0); opacity: 1; }
          100% { transform: translate3d(0, -60vh, 0); opacity: 0; }
        }
        .animate-packTopFly { animation: packTopFlyKF 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes packBottomFlyKF {
          0% { transform: translate3d(0, 0, 0); opacity: 1; }
          100% { transform: translate3d(0, 60vh, 0); opacity: 0; }
        }
        .animate-packBottomFly { animation: packBottomFlyKF 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes tearShineKF {
          0% { transform: translateX(-60%); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateX(160%); opacity: 0; }
        }
        .animate-tearShine {
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.95), transparent);
          height: 2px; width: 75%; filter: blur(6px);
          animation: tearShineKF 0.7s ease-in-out both;
        }
      `}</style>
    </div>
  )
}
