'use client'

import { useMemo, useState } from 'react'
import { Card } from './card'
import { StoryModal } from './story-modal'
import { EntryScreen } from './entry-screen'
import { cardData } from '@/lib/card-data'

type Dir = 'left' | 'right' | 'up' | 'down'

function sampleIndices(count: number, total: number) {
  const idx = Array.from({ length: total }, (_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx.slice(0, Math.min(count, total))
}

export function CardStack() {
  const [gameState, setGameState] = useState<'entry' | 'playing' | 'ended'>('entry')

  // Ziehe 5 Zufalls-Karten beim Start
  const [stack, setStack] = useState<number[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [flyOutDir, setFlyOutDir] = useState<Dir | null>(null)

  // Modal
  const [activeCard, setActiveCard] = useState<any | null>(null)

  const packCards = useMemo(() => stack.map(i => cardData[i]), [stack])
  const topIndex = stack.length - 1
  const topCard = topIndex >= 0 ? cardData[stack[topIndex]] : null

  const handleEntryComplete = () => {
    const five = sampleIndices(5, cardData.length)
    setStack(five)
    setGameState('playing')
  }

  const handleTopSwipe = (dir: Dir) => {
    if (isAnimating || topIndex < 0) return
    setIsAnimating(true)
    setFlyOutDir(dir)

    // Nach der Fly-Out-Animation Top-Karte entfernen
    window.setTimeout(() => {
      setStack(prev => prev.slice(0, prev.length - 1))
      setIsAnimating(false)
      setFlyOutDir(null)
      if (stack.length - 1 === 0) {
        // Stapel leer → weißer Hintergrund
        setGameState('ended')
      }
    }, 320)
  }

  const handleTopTap = () => {
    if (!topCard || isAnimating) return
    setActiveCard(topCard)
  }
  const closeModal = () => setActiveCard(null)

  // Entry
  if (gameState === 'entry') {
    return (
      <EntryScreen
        onComplete={handleEntryComplete}
        firstCard={cardData[0]}
      />
    )
  }

  // Ende → schlicht weiß (kein EndScreen)
  if (gameState === 'ended') {
    return (
      <div className="h-screen w-full bg-white" />
    )
  }

  // Playing: Kartenstapel
  return (
    <>
      <div className="h-screen w-full bg-white overflow-hidden flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm h-96">
          {/* Karten von unten nach oben rendern */}
          {packCards.map((c, i) => {
            const isTop = i === packCards.length - 1
            const depth = (packCards.length - 1) - i // 0 = top, 1 = eine darunter, ...
            const baseY = depth * 10  // px-Staffelung nach unten
            const baseScale = 1 - depth * 0.03 // leichte Skalierung

            // Fly-out Transform nur für die Top-Karte anwenden
            let fly = ''
            if (isTop && flyOutDir) {
              if (flyOutDir === 'left') fly = ' translate3d(-120vw,0,0)'
              if (flyOutDir === 'right') fly = ' translate3d(120vw,0,0)'
              if (flyOutDir === 'up') fly = ' translate3d(0,-120vh,0)'
              if (flyOutDir === 'down') fly = ' translate3d(0,120vh,0)'
            }

            return (
              <div
                key={`${c.title}-${i}`}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 10 + i }}
              >
                <div
                  className="pointer-events-auto will-change-transform transition-transform duration-300"
                  style={{
                    transform: `translate3d(0, ${baseY}px, 0) scale(${baseScale})${fly}`,
                  }}
                >
                  <Card
                    card={c}
                    isInteractive={isTop && !isAnimating}
                    onSwipe={(d: any) => handleTopSwipe(d)} // d kann up/down enthalten (siehe Patch unten)
                    onTap={handleTopTap}
                  />
                </div>
              </div>
            )
          })}

          {/* Optional: leichte Deckschatten-Illusion */}
          {packCards.length > 0 && (
            <div className="absolute inset-x-6 bottom-4 h-6 rounded-full bg-black/5 blur-md" />
          )}
        </div>
      </div>

      {/* Modal */}
      {activeCard && (
        <StoryModal card={activeCard} onClose={closeModal} />
      )}

      <style>{`
        body {
          overflow-x: hidden;
          overscroll-behavior-x: none;
          touch-action: pan-y;
          background-color: white;
        }
      `}</style>
    </>
  )
}
