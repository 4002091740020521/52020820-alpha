'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from './card'
import { StoryModal } from './story-modal'
import { EntryScreen } from './entry-screen'
import { EndScreen } from './end-screen'
import { cardData } from '@/lib/card-data'

export function CardStack() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [gameState, setGameState] = useState<'entry' | 'playing' | 'ended'>('entry')
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  const [nextCardIndex, setNextCardIndex] = useState<number | null>(null)
  const [nextCardVisible, setNextCardVisible] = useState(false)
  const [displayedCardIndex, setDisplayedCardIndex] = useState(0)

  const currentCard = cardData[displayedCardIndex]

  const handleEntryComplete = () => {
    setGameState('playing')
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || gameState !== 'playing') return

    const isFirst = currentCardIndex === 0
    const isLast = currentCardIndex === cardData.length - 1

    const targetIndex = direction === 'left'
      ? currentCardIndex + 1
      : currentCardIndex - 1

    if ((direction === 'left' && isLast) || (direction === 'right' && isFirst)) {
      return
    }

    setSwipeDirection(direction)
    setNextCardIndex(targetIndex)
    setIsAnimating(true)

    setCurrentCardIndex(targetIndex)

    setTimeout(() => {
      setDisplayedCardIndex(targetIndex)
      setNextCardIndex(null)
      setIsAnimating(false)
    }, 300)
  }

  const handleTap = () => {
    if (isAnimating || gameState !== 'playing') return
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  useEffect(() => {
    const preloadImage = (url: string) => {
      const img = new Image()
      img.src = url
    }

    if (cardData[currentCardIndex + 1]) {
      preloadImage(cardData[currentCardIndex + 1].imageUrl)
    }
  }, [currentCardIndex])

  useEffect(() => {
    if (nextCardIndex !== null) {
      requestAnimationFrame(() => {
        setNextCardVisible(true)
      })
    } else {
      setNextCardVisible(false)
    }
  }, [nextCardIndex])

  // Entry screen
  if (gameState === 'entry') {
    return (
      <EntryScreen 
        onComplete={handleEntryComplete}
        firstCard={cardData[0]}
      />
    )
  }

  // End screen
  if (gameState === 'ended') {
    return <EndScreen />
  }

  // Main game
  return (
    <>
      <div className="h-screen w-full bg-white overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Card stack container */}
        <div className="relative h-96 w-full max-w-sm overflow-hidden flex items-center justify-center -mt-15">
          {/* Alte Karte: gleitet raus */}
          {isAnimating && nextCardIndex !== null && (
            <div
              className={`absolute transition-transform duration-300 z-20 ${
                swipeDirection === 'left'
                  ? 'translate-x-full opacity-0'
                  : '-translate-x-full opacity-0'
              }`}
            >
              <Card
                card={cardData[currentCardIndex]} // 👈 zeigt das aktuelle Bild (noch nicht geupdated!)
                onSwipe={handleSwipe}
                onTap={handleTap}
                isInteractive={false}
              />
            </div>
          )}

          {/* Neue Karte: gleitet rein */}
          {nextCardIndex !== null && (
            <div
              className={`absolute transition-transform duration-300 z-10`}
              style={{
                transform: nextCardVisible
                  ? 'translateX(0%)'
                  : swipeDirection === 'left'
                    ? 'translateX(100%)'
                    : 'translateX(-100%)',
                opacity: 1,
              }}
            >
              <Card
                card={cardData[nextCardIndex]} // 👈 zeigt das neue Bild
                onSwipe={handleSwipe}
                onTap={handleTap}
                isInteractive={false}
              />
            </div>
          )}

          {/* Wenn keine Animation: zeige aktuelle Karte */}
          {!isAnimating && (
            <div className="absolute transition-transform duration-300 translate-x-0 opacity-100 z-30">
              <Card
                card={cardData[currentCardIndex]} // 👈 zeigt korrektes Bild
                onSwipe={handleSwipe}
                onTap={handleTap}
                isInteractive={true}
              />
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <em>{currentCard.title}</em>
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mt-20 text-center">
          <p className="text-sm text-gray-500">
            {displayedCardIndex + 1} of {cardData.length}
          </p>
        </div>
      </div>

      <style>{`
        body {
          overflow-x: hidden;
          overscroll-behavior-x: none;
          touch-action: pan-y;
          background-color: white;
        }
      `}</style>

      {/* Story Modal */}
      {showModal && (
        <StoryModal
          card={currentCard}
          onClose={closeModal}
        />
      )}
    </>
  )
}
