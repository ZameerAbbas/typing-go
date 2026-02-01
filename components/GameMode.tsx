'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Zap, BookOpen, RefreshCw, Zap as Zap2 } from 'lucide-react'

interface GameModeProps {
  onStartGame: (type: 'words' | 'sentences' | 'practice' | 'invaders') => void
}

export default function GameMode({ onStartGame }: GameModeProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {/* Words Mode */}
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 p-8 text-center cursor-pointer border-2 border-primary/20 hover:border-primary/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Words Challenge</h2>
            <p className="text-muted-foreground text-sm">
              Type random words as fast as you can. Build muscle memory and speed.
            </p>
          </div>
          
          <div className="w-full pt-4">
            <div className="text-3xl font-bold text-primary mb-2">60s</div>
            <Button
              onClick={() => onStartGame('words')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
            >
              Start Challenge →
            </Button>
          </div>
        </div>
      </Card>

      {/* Sentences Mode */}
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 p-8 text-center cursor-pointer border-2 border-secondary/20 hover:border-secondary/50">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-secondary-foreground" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Story Mode</h2>
            <p className="text-muted-foreground text-sm">
              Type full sentences and paragraphs. Test accuracy and rhythm.
            </p>
          </div>
          
          <div className="w-full pt-4">
            <div className="text-3xl font-bold text-secondary mb-2">120s</div>
            <Button
              onClick={() => onStartGame('sentences')}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
              size="lg"
            >
              Start Challenge →
            </Button>
          </div>
        </div>
      </Card>

      {/* Practice Mode */}
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 p-8 text-center cursor-pointer border-2 border-accent/20 hover:border-accent/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-accent-foreground" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Practice Mode</h2>
            <p className="text-muted-foreground text-sm">
              Unlimited typing practice with no timer. Focus on perfection.
            </p>
          </div>
          
          <div className="w-full pt-4">
            <div className="text-3xl font-bold text-accent mb-2">∞</div>
            <Button
              onClick={() => onStartGame('practice')}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              size="lg"
            >
              Start Practice →
            </Button>
          </div>
        </div>
      </Card>

      {/* Invaders Mode */}
      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 p-8 text-center cursor-pointer border-2 border-destructive/20 hover:border-destructive/50 md:col-span-2 lg:col-span-1">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-destructive to-destructive/50 flex items-center justify-center">
            <Zap2 className="w-8 h-8 text-destructive-foreground" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Invaders Attack</h2>
            <p className="text-muted-foreground text-sm">
              Type falling words to destroy them before they reach the bottom. Action-packed arcade typing!
            </p>
          </div>
          
          <div className="w-full pt-4">
            <div className="text-3xl font-bold text-destructive mb-2">∞ Waves</div>
            <Button
              onClick={() => onStartGame('invaders')}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
              size="lg"
            >
              Launch Attack →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
