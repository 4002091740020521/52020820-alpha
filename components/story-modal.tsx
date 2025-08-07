'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface StoryModalProps {
  card: {
    title: string
    imageUrl: string
    storyText: string
  }
  onClose: () => void
}

export function StoryModal({ card, onClose }: StoryModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  // Escape zum Schließen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Scroll-Lock
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200) // Dauer muss mit Animation übereinstimmen
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 ${isClosing ? 'fade-out' : 'fade-in'}`}
      />

      {/* Modal content */}
      <div
        className={`relative bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto ${isClosing ? 'scale-out' : 'scale-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-medium mb-4 pr-12">
            {card.title}
          </h2>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {card.storyText}
            </p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .fade-out {
          animation: fadeOut 0.2s ease-in forwards;
        }
        .scale-in {
          animation: scaleIn 0.3s ease-out forwards;
        }
        .scale-out {
          animation: scaleOut 0.2s ease-in forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes scaleOut {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.95); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
