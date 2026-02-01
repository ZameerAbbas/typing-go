'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface Invader {
  id: number
  word: string
  y: number
  speed: number
  alive: boolean
}

interface InvadersProps {
  onBack: () => void
}

const WORD_LIST = [
  'keyboard', 'programming', 'javascript', 'typescript', 'react', 'component', 'function', 'variable',
  'algorithm', 'database', 'interface', 'development', 'performance', 'optimization', 'framework',
  'library', 'module', 'package', 'repository', 'terminal', 'command', 'server', 'client',
  'request', 'response', 'handler', 'middleware', 'authentication', 'validation', 'security',
  'pointer', 'memory', 'compiler', 'debugger', 'router', 'buffer', 'cache', 'syntax',
  'method', 'property', 'instance', 'object', 'array', 'string', 'number', 'boolean'
]

export default function Invaders({ onBack }: InvadersProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [invaders, setInvaders] = useState<Invader[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [wave, setWave] = useState(1)
  const [combo, setCombo] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const invaderIdRef = useRef(0)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const spawnRateRef = useRef(2000)
  const timeRef = useRef(0)

  // Spawn new invaders
  useEffect(() => {
    if (!gameStarted || gameEnded) return

    const spawnInterval = setInterval(() => {
      const newInvader: Invader = {
        id: invaderIdRef.current++,
        word: WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)],
        y: 0,
        speed: 0.5 + wave * 0.1,
        alive: true
      }
      setInvaders(prev => [...prev, newInvader])

      // Increase difficulty every 10 seconds
      spawnRateRef.current = Math.max(800, 2000 - wave * 200)
    }, spawnRateRef.current)

    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameEnded, wave])

  // Game loop for moving invaders
  useEffect(() => {
    if (!gameStarted || gameEnded) return

    gameLoopRef.current = setInterval(() => {
      timeRef.current += 20

      // Increase wave every 30 seconds
      if (timeRef.current % 30000 === 0) {
        setWave(prev => prev + 1)
      }

      setInvaders(prev => {
        const updated = prev.map(invader => ({
          ...invader,
          y: invader.y + invader.speed
        }))

        // Check for invaders reaching bottom (loss of life)
        const reachedBottom = updated.filter(inv => inv.y > 100 && inv.alive)
        if (reachedBottom.length > 0) {
          setLives(currentLives => {
            const newLives = currentLives - reachedBottom.length
            if (newLives <= 0) {
              setGameEnded(true)
            }
            return Math.max(0, newLives)
          })
        }

        return updated.filter(inv => inv.y <= 100 || !inv.alive)
      })
    }, 20)

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameStarted, gameEnded])

  const handleStart = () => {
    setGameStarted(true)
    setGameEnded(false)
    setInvaders([])
    setCurrentInput('')
    setScore(0)
    setLives(3)
    setWave(1)
    setCombo(0)
    timeRef.current = 0
    invaderIdRef.current = 0
    inputRef.current?.focus()
  }

  const handleReset = () => {
    setGameStarted(false)
    setGameEnded(false)
    setInvaders([])
    setCurrentInput('')
    setScore(0)
    setLives(3)
    setWave(1)
    setCombo(0)
    timeRef.current = 0
    invaderIdRef.current = 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim()
    setCurrentInput(value)

    // Check if typed word matches any invader
    const matchedInvader = invaders.find(
      inv => inv.alive && inv.word.toLowerCase() === value
    )

    if (matchedInvader) {
      // Kill the invader
      setInvaders(prev =>
        prev.map(inv =>
          inv.id === matchedInvader.id ? { ...inv, alive: false } : inv
        )
      )

      // Update score with combo bonus
      const bonusScore = 10 + combo * 2
      setScore(prev => prev + bonusScore)
      setCombo(prev => prev + 1)

      // Clear input for next word
      setCurrentInput('')
    }
  }

  const handleStart2 = () => {
    handleStart()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          size="icon"
          className="h-12 w-12 bg-transparent"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center border-primary/50 bg-primary/5">
          <div className="text-sm text-muted-foreground">Score</div>
          <div className="text-3xl font-bold text-primary">{score}</div>
        </Card>
        <Card className="p-4 text-center border-secondary/50 bg-secondary/5">
          <div className="text-sm text-muted-foreground">Lives</div>
          <div className="text-3xl font-bold text-secondary">{lives}</div>
        </Card>
        <Card className="p-4 text-center border-accent/50 bg-accent/5">
          <div className="text-sm text-muted-foreground">Wave</div>
          <div className="text-3xl font-bold text-accent">{wave}</div>
        </Card>
        <Card className="p-4 text-center border-border">
          <div className="text-sm text-muted-foreground">Combo</div>
          <div className="text-3xl font-bold">{combo}x</div>
        </Card>
      </div>

      {/* Game Arena */}
      <Card className="p-8 bg-gradient-to-b from-background to-primary/5 border-primary/20 relative overflow-hidden">
        <div className="space-y-2 min-h-96">
          {/* Falling Words */}
          {invaders.map(invader => {
            if (!invader.alive) return null
            return (
              <div
                key={invader.id}
                className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-75"
                style={{ top: `${invader.y}%` }}
              >
                <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold whitespace-nowrap shadow-lg animate-pulse">
                  {invader.word}
                </div>
              </div>
            )
          })}

          {/* Game Status Message */}
          {!gameStarted && !gameEnded && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-4">Type to Destroy!</div>
                <p className="text-muted-foreground text-lg mb-6">
                  Words are falling from the top. Type them to destroy before they reach the bottom!
                </p>
              </div>
            </div>
          )}

          {gameEnded && (
            <div className="flex items-center justify-center h-96 bg-destructive/10 rounded-lg border-2 border-destructive">
              <div className="text-center">
                <div className="text-5xl font-bold text-destructive mb-4">Game Over!</div>
                <p className="text-muted-foreground text-lg mb-4">
                  You survived {wave} waves with a score of {score}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Final Score</div>
                    <div className="text-3xl font-bold text-primary">{score}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Max Combo</div>
                    <div className="text-3xl font-bold text-secondary">{combo}x</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {gameStarted && !gameEnded && (
          <div className="mt-8 relative">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              placeholder="Type the falling words..."
              className="w-full px-6 py-4 rounded-lg border-2 border-primary bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-semibold"
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
            <div className="mt-2 text-sm text-muted-foreground">
              Press Enter or type the complete word and continue typing
            </div>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        {!gameStarted && !gameEnded ? (
          <Button
            onClick={handleStart2}
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground px-8 font-semibold"
          >
            Launch Attack
          </Button>
        ) : gameEnded ? (
          <Button
            onClick={handleStart2}
            size="lg"
            className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 font-semibold"
          >
            Try Again
          </Button>
        ) : null}
      </div>
    </div>
  )
}
