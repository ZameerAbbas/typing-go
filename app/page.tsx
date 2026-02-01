'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import GameMode from '@/components/GameMode'
import TypingGame from '@/components/TypingGame'
import Leaderboard from '@/components/Leaderboard'
import Header from '@/components/Header'
import Invaders from '@/components/Invaders'

export default function Home() {
  const [currentMode, setCurrentMode] = useState<'menu' | 'game' | 'leaderboard' | 'invaders'>('menu')
  const [gameType, setGameType] = useState<'words' | 'sentences' | 'practice' | 'invaders'>('words')

  const handleStartGame = (type: 'words' | 'sentences' | 'practice' | 'invaders') => {
    setGameType(type)
    if (type === 'invaders') {
      setCurrentMode('invaders')
    } else {
      setCurrentMode('game')
    }
  }

  const handleBack = () => {
    setCurrentMode('menu')
  }

  const handleViewLeaderboard = () => {
    setCurrentMode('leaderboard')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <Header onLeaderboard={() => setCurrentMode('leaderboard')} currentMode={currentMode} />
      
      <div className="container mx-auto px-4 py-12">
        {currentMode === 'menu' && (
          <GameMode onStartGame={handleStartGame} />
        )}
        
        {currentMode === 'game' && (
          <TypingGame gameType={gameType} onBack={handleBack} />
        )}

        {currentMode === 'invaders' && (
          <Invaders onBack={handleBack} />
        )}
        
        {currentMode === 'leaderboard' && (
          <Leaderboard onBack={handleBack} />
        )}
      </div>
    </main>
  )
}
