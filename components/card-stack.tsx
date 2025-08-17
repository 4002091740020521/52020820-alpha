'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from './card'
import { EntryScreen } from './entry-screen'
import { EndScreen } from './end-screen'
import { cardData } from '@/lib/card-data'

type Dir = 'left' | 'right' | 'up' | 'down'

function sampleIndices(count: number, total: number) {
  const arr = Array.from({ length: total }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, Math.min(count, total))
}

export function CardStack() {
  const [gameState, setGameState] = useState<'entry' | 'playing' | 'ended'>('entry')
  const [stack, setStack] = useState<number[]>([])

  // Reveal beim Start eines Packs
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealGo, setRevealGo] = useState(false)

  const packCards = useMemo(() => stack.map(i => cardData[i]), [stack])
  const packSectionRef = useRef<HTMLDivElement>(null)

  const scrollToPack = () => {
    packSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const startNewPack = () => {
    const five = sampleIndices(5, cardData.length)
    setStack(five)
    setIsRevealing(true)
    setRevealGo(false)
    setGameState('playing')
    requestAnimationFrame(scrollToPack)
  }

  const restartToEntry = () => {
    setStack([])
    setIsRevealing(false)
    setRevealGo(false)
    setGameState('entry')
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  
  useEffect(() => {
    if (gameState === 'playing' && isRevealing) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setRevealGo(true))
      })
      return () => cancelAnimationFrame(id)
    }
  }, [gameState, isRevealing])

  const handleDismissTop = (_dir: Dir) => {
    setStack(prev => {
      const next = prev.slice(0, -1)
      if (next.length === 0) setGameState('ended')
      return next
    })
  }

  return (
    <div className="w-full bg-white text-gray-900">
      {/* ===== Intro bleibt immer oben ===== */}
      <section className="relative min-h-[100svh] w-full flex flex-col items-center">
        {/* Header-Bild volle Breite */}
        <div className="w-full">
          <Image
            src="/header.jpg"   /* /public/header.jpg */
            alt="Header"
            width={360}
            height={720}
            priority
            className="w-full h-auto select-none pointer-events-none"
          />
        </div>

        {/* Einleitung ~70 Wörter */}
        <div className="max-w-md w-full px-6 mt-6 text-justify">

          <p className="text-base text-gray-600 leading-relaxed">
            Einer meiner schönsten Erinnerungen aus diesem Sommer sind die Tage am Anfang der Ferien als wir noch in Mannheim waren. Also als wir zum See gegangen sind, in die kleine Stadt gefahren sind oder frozen yoghurt in Heidelberg gegessen haben. Aber was irgendwie dabei richtig in meinem Kopf geblieben ist, ist dass wir voll oft Karten gespielt haben. </p>
          <p className="text-base text-gray-600 leading-relaxed pt-6">
            Als ich die CLO Karten gesehen habe, habe ich direkt daran gedacht und die Idee bekommen, eigene, mit unseren Bildern zu machen. Aber weil du bald ziemlich lange auf Reisen bist, wäre es nicht sehr sinnvoll gewesen einen fetten Block Karten auszudrucken, die du nirgends mitnehmen könntest. Deswegen dachte ich es wäre cool, die einfach digital zu machen. Sie sind unten auf der Seite in fünferpacks verpackt. Du kannst runterscrollen, das Paket "aufreißen" und durch die 5 Karten swipen, die du "gezogen" hast. Wenn du ein Bild siehst und nicht mehr genau weißt, was es mit dem Bild auf sich hast, kannst du einfach draufdrücken und auf der Rückseite die Story dazu lesen.
          </p>
          <p className="text-base text-gray-600 leading-relaxed pt-6">
            Ich hoffe wir werden noch viele solche Sommer erleben, aber wünsche dir erstmal ein schönes Auslandssemester mit vielen neuen Erfahrungen. 
          </p>
          <p className="text-base text-gray-600 leading-relaxed pt-8">
            Dein
          </p>
          <Image
            src="/bottomer.jpg"   /* /public/header.jpg */
            alt="Header"
            width={360}
            height={720}
            priority
            className="w-full h-auto select-none pointer-events-none"
          />
        </div>
        <div>
            <button
            onClick={scrollToPack}
            className="items-center justify-center text-2xl animate-bounce pt-0"
            aria-label="Nach unten scrollen"
          >↓</button>
        </div>

        {/*       
        <button
          onClick={scrollToPack}
          className="inline-flex items-center justify-center text-2xl animate-bounce"
          aria-label="Nach unten scrollen"
        >
          ↓
        </button> */}
      </section>

      {/* ===== Stage: Pack / Stack / Ende ===== */}
      <section
        ref={packSectionRef}
        className="min-h-[100svh] w-full flex items-center justify-center px-4 py-12"
      >
        {gameState === 'entry' && (
          <EntryScreen
            onComplete={startNewPack}
            firstCard={cardData[0]}
          />
        )}

        {gameState === 'playing' && (
          <div className="relative w-full max-w-sm h-[28rem]">
            {packCards.map((c, i) => {
              const isTop = i === packCards.length - 1
              const depth = (packCards.length - 1) - i
              const baseY = depth * 10
              const baseScale = 1 - depth * 0.03

              const fromY = baseY + 40
              const fromScale = baseScale * 0.92
              const toY = baseY
              const toScale = baseScale
              const delayMs = i * 90

              return (
                <div
                  key={`${c.title}-${i}`}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ zIndex: 10 + i }}
                >
                  <div
                    className="will-change-transform"
                    style={{
                      transform: `translate3d(0, ${revealGo ? toY : fromY}px, 0) scale(${revealGo ? toScale : fromScale})`,
                      opacity: revealGo ? 1 : 0,
                      transitionProperty: 'transform, opacity',
                      transitionDuration: '520ms',
                      transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
                      transitionDelay: isRevealing ? `${delayMs}ms` : '0ms',
                    }}
                    onTransitionEnd={() => {
                      if (isTop && revealGo) setIsRevealing(false)
                    }}
                  >
                    <Card
                      card={c}
                      isInteractive={isTop && !isRevealing}
                      onDismiss={handleDismissTop}
                    />
                  </div>
                </div>
              )
            })}

            {packCards.length > 0 && (
              <div className="absolute inset-x-8 bottom-4 h-6 rounded-full bg-black/10 blur-md" />
            )}
          </div>
        )}

        {gameState === 'ended' && <EndScreen onRestart={restartToEntry} />}
      </section>
    </div>
  )
}
