'use client'

import { useState, useEffect } from 'react'

export function EndScreen({ onRestart }: { onRestart?: () => void }) {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const heartArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 20 + Math.random() * 60,
      delay: Math.random() * 500,
    }))
    setHearts(heartArray)
    const t = setTimeout(() => setShowContent(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="mt-8 min-h-screen bg-white flex items-start justify-center p-4 relative overflow-hidden">
      {showContent && hearts.map((h) => (
        <div
          key={h.id}
          className="absolute text-2xl animate-[heartFloat_3s_ease-out_both] pointer-events-none"
          style={{ left: `${h.x}%`, top: `${h.y}%`, animationDelay: `${h.delay}ms` }}
        >
          ⭐️
        </div>
      ))}

      <div className={`mt-8 text-center max-w-md transition-all duration-1000 z-10 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h2 className="text-3xl font-light text-gray-800 mb-3">Pack complete</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Du hast alle 5 Karten aufgedeckt. Möchtest du noch ein Pack öffnen?
        </p>

        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 bg-black text-white text-sm font-medium hover:bg-black/90 active:scale-[0.99] transition"
        >
          Noch ein Pack öffnen
        </button>
      </div>

      <style jsx>{`
        @keyframes heartFloat {
          0%   { transform: translateY(0) scale(0.5); opacity: 0; }
          15%  { transform: translateY(-10px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-150px) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
