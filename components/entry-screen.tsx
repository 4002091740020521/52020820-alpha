'use client'

import { useState, useRef } from 'react'
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
  const [isAnimating, setIsAnimating] = useState(false)
  const [showInstruction, setShowInstruction] = useState(true)
  const packRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimating) return
    
    setIsDragging(true)
    setStartX(e.clientX)
    setShowInstruction(false)
    
    if (packRef.current) {
      packRef.current.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isAnimating) return
    // Visual feedback could be added here if desired
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || isAnimating) return
    
    setIsDragging(false)
    
    const deltaX = e.clientX - startX
    
    // Check if swipe distance is sufficient (at least 80px)
    if (Math.abs(deltaX) > 80) {
      startPackAnimation()
    } else {
      setShowInstruction(true)
    }
    
    if (packRef.current) {
      packRef.current.releasePointerCapture(e.pointerId)
    }
  }

  const startPackAnimation = () => {
    setIsAnimating(true)
    
    // Complete the animation after 1.5 seconds
    setTimeout(() => {
      onComplete()
    }, 1500)
  }

  return (
    <div className="h-screen w-full bg-white overflow-hidden flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-sm mx-auto -mt-15">
        {/* Pack Container - Same size as cards (w-64 h-96) */}
        <div 
          ref={packRef}
          className="relative w-64 h-96 mx-auto select-none touch-none cursor-pointer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* First Card (revealed underneath) */}
          <div className={`
              absolute inset-0 w-64 h-96 bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-700 ease-out
              ${isAnimating ? 'transform scale-100 opacity-100 delay-300' : 'transform scale-95 opacity-0'}
            `}
            >
          
            <Image
              src={firstCard.imageUrl || "/placeholder.svg"}
              alt={firstCard.title}
              fill
              className="object-cover"
              draggable={false}
            />
          </div>

          {/* Complete Pack (visible initially, fades when animation starts) */}
          <div className={`absolute inset-0 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <div className="w-full h-full overflow-hidden transform scale-[1.05]">
              <Image
                src="https://lh3.googleusercontent.com/d/1ljYqL0tFBLoycbkmBCdAtaXomW7EgHK4"
                alt="Mystic Card Pack"
                fill
                className="object-cover"
                draggable={false}
              />
            </div>
          </div>

          {/* Top Half of Pack (for tearing animation) */}
          <div
            className={`
              absolute inset-0 overflow-hidden transition-all duration-700 ease-in-out z-10
              ${isAnimating ? 'transform -translate-y-40 -rotate-6 scale-105 opacity-0 delay-300' : 'opacity-100'} transform scale-[1.05]
            `}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
            }}
          >
            <div className="w-full h-full rounded-t-lg overflow-hidden shadow-2xl ">
              <Image
                src="https://lh3.googleusercontent.com/d/1ljYqL0tFBLoycbkmBCdAtaXomW7EgHK4"
                alt="Pack Top Half"
                fill
                className="object-cover"
                draggable={false}
              />
            </div>
          </div>

          {/* Bottom Half of Pack (for tearing animation) */}
          <div
            className={`
              absolute inset-0 overflow-hidden transition-all duration-700 ease-in-out z-10
              ${isAnimating ? 'transform translate-y-40 rotate-3 scale-105 opacity-0 delay-300' : 'opacity-100'}
              transform scale-[1.05]
            `}
            style={{
              clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
            }}
          >
            <div className="w-full h-full rounded-b-lg overflow-hidden shadow-2xl">
              <Image
                src="https://lh3.googleusercontent.com/d/1ljYqL0tFBLoycbkmBCdAtaXomW7EgHK4"
                alt="Pack Bottom Half"
                fill
                className="object-cover"
                draggable={false}
              />
            </div>
          </div>

          {/* Tearing Effect Line (appears during animation) */}
          {isAnimating && (
          <>
            {/* Shine Line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] overflow-hidden pointer-events-none z-20">
              <div
                className="absolute w-2/3 h-full transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.95), transparent)',
                  animation: 'shineMove 0.7s ease-in-out',
                  animationDelay: '-0.3s',
                  opacity: 0,
                  filter: 'blur(10px)',
                  mixBlendMode: 'screen' // Startet sichtbar durch Animation, faded automatisch raus
                }}
              />
            </div>

            {/* Keyframes inline */}
            <style>{`
              @keyframes shineMove {
                0% {
                  transform: translateX(-100%);
                  opacity: 1;
                }
                100% {
                  transform: translateX(100%);
                  opacity: 0;
                }
              }
            `}</style>
          </>
        )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
             
          </p>
        </div>

        {/* Progress/Instruction text - Same position as "X of 55" */}
        <div className="mt-30 text-center">
          <p className="text-sm text-gray-500">
            {isAnimating ? "Opening..." : "Swipe to open pack"}
          </p>
        </div>
      </div>

      {/* Remove the bottom instruction since it's now in the progress area */}
    </div>
  )
}
