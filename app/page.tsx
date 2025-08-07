'use client'

import { useState, useRef } from 'react'
import { CardStack } from '@/components/card-stack'

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <CardStack />
    </main>
  )
}
