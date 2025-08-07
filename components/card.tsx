'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface CardProps {
  card: {
    title: string
    imageUrl?: string
    videoUrl?: string
    storyText: string
  }
  onSwipe: (direction: 'left' | 'right') => void
  onTap: () => void
  isInteractive: boolean
}

export function Card({ card, onSwipe, onTap, isInteractive }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [currentX, setCurrentX] = useState(0)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isInteractive) return
    
    setIsDragging(true)
    setStartX(e.clientX)
    setStartY(e.clientY)
    setCurrentX(0)
    
    if (cardRef.current) {
      cardRef.current.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !isInteractive) return
    
    const deltaX = e.clientX - startX
    setCurrentX(deltaX)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !isInteractive) return
    
    setIsDragging(false)
    
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // If minimal movement, treat as tap
    if (distance < 10) {
      onTap()
    } 
    // If significant horizontal movement, treat as swipe
    else if (Math.abs(deltaX) > 50) {
      // Swipe left = next card, Swipe right = previous card
      if (deltaX < 0) {
        onSwipe('left') // Swiped left, go to next card
      } else {
        onSwipe('right') // Swiped right, go to previous card
      }
    }
    
    // Reset position
    setCurrentX(0)
    
    if (cardRef.current) {
      cardRef.current.releasePointerCapture(e.pointerId)
    }
  }

  return (
      <div
        ref={cardRef}
        className={`
          relative w-64 h-96 rounded-lg overflow-hidden shadow-lg select-none cursor-pointer
          ${isInteractive ? 'touch-none' : 'pointer-events-none'}
        `}
        style={{
          transform: `translate3d(${currentX}px, 0, 0) ${isDragging ? 'scale(1.00)' : ''}`,
          willChange: 'transform',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          {/* === Video or Image Background === */}
          {card.videoUrl ? (
            <video
              src={card.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          ) : card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt={card.title}
              fill
              className="object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-sm text-gray-500 z-10">
              No media
            </div>
          )}
        </div>
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Image
            src="https://lh3.googleusercontent.com/d/1ftr-kaNhCRloRNVU9EqHbueZqxKMCrCI"
            alt="Card Overlay"
            className="w-full h-full object-contain"
            width={256}
            height={384}
            draggable={false}
          />
        </div>
      </div>
  )
}
