'use client'

import { useState, useEffect } from 'react'

export function EndScreen() {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Generate random heart positions
    const heartArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Percentage
      y: 20 + Math.random() * 60, // Keep hearts in middle area
      delay: Math.random() * 500, // Stagger within first 0.5 seconds
    }))
    
    setHearts(heartArray)

    // Show both hearts and message together after a brief delay
    const contentTimer = setTimeout(() => {
      setShowContent(true)
    }, 300)

    return () => clearTimeout(contentTimer)
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Hearts - appear with message */}
      {showContent && hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-2xl animate-[heartFloat_3s_ease-out_both] pointer-events-none"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            animationDelay: `${heart.delay}ms`,
          }}
        >
          ❤️
        </div>
      ))}

      {/* End Message - appears with hearts */}
      <div 
        className={`
          text-center max-w-md transition-all duration-1000 z-10
          ${showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}
        `}
      >
        <h2 className="text-3xl font-light text-gray-800 mb-4">
          Journey Complete
        </h2>
        <p className="text-gray-600 leading-relaxed">
          You've explored all 55 cards in this mystical deck. Each story you've discovered 
          is now part of your own journey. Thank you for taking this path with us.
        </p>
      </div>

      <style jsx>{`
        @keyframes heartFloat {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          15% {
            transform: translateY(-10px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-150px) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
