'use client'

import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { Card } from './card'
import { StoryModal } from './story-modal'
import { EntryScreen } from './entry-screen'
import { EndScreen } from './end-screen'
import { cardData } from '@/lib/card-data'

export function CardStack() {
  const [gameState, setGameState] = useState<'entry' | 'playing' | 'ended'>('entry')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [activeCard, setActiveCard] = useState(null)

  const handleEntryComplete = () => {
    setGameState('playing')
  }

  const handleCardClick = (card) => {
    setActiveCard(card)
  }

  const closeModal = () => {
    setActiveCard(null)
  }

  const handleSlideChange = (swiper) => {
    const index = swiper.activeIndex
    setCurrentCardIndex(index)

    if (index === cardData.length - 1) {
      // Letzter Slide → Endscreen anzeigen
      setTimeout(() => setGameState('ended'), 500)
    }
  }

  if (gameState === 'entry') {
    return (
      <EntryScreen
        onComplete={handleEntryComplete}
        firstCard={cardData[0]}
      />
    )
  }

  if (gameState === 'ended') {
    return <EndScreen />
  }

  const currentCard = cardData[currentCardIndex]

  return (
  <>
    <div className="h-screen w-full bg-white overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Wrapper außen um Swiper */}
      <div className="elative w-full max-w-sm mx-auto -mt-15">
        {/* Swiper-Container */}
        <div className="w-full max-w-sm">
          <Swiper
            slidesPerView="auto"
            spaceBetween={20}
            onSlideChange={handleSlideChange}
            className="w-full"
          >
            {cardData.map((card, index) => (
              <SwiperSlide
                key={index}
                className="!w-auto flex justify-center"
              >
                {/* Slide-Inhalt */}
                <div
                  className="w-[320px] max-w-full flex justify-center items-center"
                  onClick={() => handleCardClick(card)}
                >
                  <Card
                    card={card}
                    isInteractive={true}
                    onSwipe={() => {}}
                    onTap={() => {}}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Titel unter der Karte */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          <em>{currentCard.title}</em>
        </p>
      </div>

      {/* Fortschrittsanzeige */}
      <div className="mt-20 text-center bg-gray-100">
        <p className="text-sm text-gray-500">
          {currentCardIndex + 1} of {cardData.length}
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

    {/* Modal */}
    {activeCard && (
      <StoryModal
        card={activeCard}
        onClose={closeModal}
      />
    )}
  </>
)

}
