'use client';

import React from 'react'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

interface HeaderProps {
  onLeaderboard: () => void
  currentMode: string
}

export default function Header({ onLeaderboard, currentMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TypeRush
          </h1>
        </div>
        
        {currentMode === 'menu' && (
          <Button
            onClick={onLeaderboard}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            🏆 Leaderboard
          </Button>
        )}
      </div>
    </header>
  )
}
