'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface Invader {
  id: number
  word: string
  x: number
  y: number
  vx: number
  vy: number
  alive: boolean
  type: 'normal' | 'boss'
  health: number
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
  'method', 'property', 'instance', 'object', 'array', 'string', 'number', 'boolean',
  'design', 'pattern', 'loop', 'conditional', 'boolean', 'data', 'type', 'class'
]

const BOSS_WORDS = ['destroyer', 'sentinel', 'interceptor', 'invader', 'phantom', 'wraith', 'specter', 'hunter']

export default function Invaders({ onBack }: InvadersProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [invaders, setInvaders] = useState<Invader[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(5)
  const [wave, setWave] = useState(1)
  const [combo, setCombo] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; life: number }>>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const invaderIdRef = useRef(0)
  const particleIdRef = useRef(0)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const timeRef = useRef(0)

  // Calculate current difficulty based on elapsed time
  const calculateDifficulty = () => {
    const secondsElapsed = timeRef.current / 1000
    // Start at 0.05, gradually increase to maximum of 0.5 over 5 minutes
    return Math.min(0.5, 0.05 + (secondsElapsed / 300) * 0.45)
  }

  // Spawn new invaders
  useEffect(() => {
    if (!gameStarted || gameEnded) return

    const spawnInterval = setInterval(() => {
      const isBoss = wave > 0 && Math.random() < (wave > 5 ? 0.3 : 0.1)
      const difficulty = calculateDifficulty()
      const newInvader: Invader = {
        id: invaderIdRef.current++,
        word: isBoss ? BOSS_WORDS[Math.floor(Math.random() * BOSS_WORDS.length)] : WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)],
        x: Math.random() * 80 + 10,
        y: -10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: difficulty,
        alive: true,
        type: isBoss ? 'boss' : 'normal',
        health: isBoss ? 3 : 1
      }
      setInvaders(prev => [...prev, newInvader])
    }, Math.max(500, 2000 - wave * 150))

    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameEnded, wave])

  // Game loop for moving invaders and particles
  useEffect(() => {
    if (!gameStarted || gameEnded) return

    gameLoopRef.current = setInterval(() => {
      timeRef.current += 30

      // Increase wave every 60 seconds
      if (timeRef.current % 60000 === 0 && timeRef.current > 0) {
        setWave(prev => prev + 1)
      }

      setInvaders(prev => {
        const updated = prev.map(invader => ({
          ...invader,
          y: invader.y + invader.vy,
          x: invader.x + invader.vx
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

      // Update particles
      setParticles(prev =>
        prev
          .map(p => ({ ...p, life: p.life - 1 }))
          .filter(p => p.life > 0)
      )
    }, 30)

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameStarted, gameEnded])

  const spawnParticles = (x: number, y: number, count: number = 8) => {
    const newParticles = Array(count).fill(0).map(() => ({
      id: particleIdRef.current++,
      x,
      y,
      life: 20
    }))
    setParticles(prev => [...prev, ...newParticles])
  }

  const handleStart = () => {
    setGameStarted(true)
    setGameEnded(false)
    setInvaders([])
    setCurrentInput('')
    setScore(0)
    setLives(5)
    setWave(1)
    setCombo(0)
    setParticles([])
    timeRef.current = 0
    invaderIdRef.current = 0
    particleIdRef.current = 0
    inputRef.current?.focus()
  }

  const handleReset = () => {
    setGameStarted(false)
    setGameEnded(false)
    setInvaders([])
    setCurrentInput('')
    setScore(0)
    setLives(5)
    setWave(1)
    setCombo(0)
    setParticles([])
    timeRef.current = 0
    invaderIdRef.current = 0
    particleIdRef.current = 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim()
    setCurrentInput(value)

    // Check if typed word matches any invader
    const matchedInvader = invaders.find(
      inv => inv.alive && inv.word.toLowerCase() === value
    )

    if (matchedInvader) {
      // Damage the invader
      const updatedHealth = matchedInvader.health - 1
      
      if (updatedHealth <= 0) {
        // Kill the invader
        setInvaders(prev =>
          prev.map(inv =>
            inv.id === matchedInvader.id ? { ...inv, alive: false } : inv
          )
        )
        
        // Spawn particles
        spawnParticles(matchedInvader.x, matchedInvader.y, matchedInvader.type === 'boss' ? 15 : 8)

        // Update score with combo bonus
        const bonusScore = (matchedInvader.type === 'boss' ? 50 : 10) + combo * 2
        setScore(prev => prev + bonusScore)
        setCombo(prev => prev + 1)
      } else {
        // Damage boss
        setInvaders(prev =>
          prev.map(inv =>
            inv.id === matchedInvader.id ? { ...inv, health: updatedHealth } : inv
          )
        )
        spawnParticles(matchedInvader.x, matchedInvader.y, 5)
      }

      // Clear input for next word
      setCurrentInput('')
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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

        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">TYPE TO DESTROY</h1>
          <p className="text-sm text-muted-foreground">Arcade Typing Game</p>
        </div>

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
      <div className="grid grid-cols-5 gap-3">
        <Card className="p-3 text-center border-primary/50 bg-primary/5">
          <div className="text-xs text-muted-foreground">SCORE</div>
          <div className="text-2xl font-bold text-primary">{score}</div>
        </Card>
        <Card className="p-3 text-center border-secondary/50 bg-secondary/5">
          <div className="text-xs text-muted-foreground">LIVES</div>
          <div className="text-2xl font-bold text-secondary">{'❤️'.repeat(lives)}</div>
        </Card>
        <Card className="p-3 text-center border-accent/50 bg-accent/5">
          <div className="text-xs text-muted-foreground">WAVE</div>
          <div className="text-2xl font-bold text-accent">{wave}</div>
        </Card>
        <Card className="p-3 text-center border-yellow-500/50 bg-yellow-500/5">
          <div className="text-xs text-muted-foreground">COMBO</div>
          <div className="text-2xl font-bold text-yellow-500">{combo}x</div>
        </Card>
        <Card className="p-3 text-center border-border">
          <div className="text-xs text-muted-foreground">ENEMIES</div>
          <div className="text-2xl font-bold">{invaders.length}</div>
        </Card>
      </div>

      {/* Game Arena */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 aspect-video">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Falling Words/Enemies */}
        <div className="absolute inset-0 pointer-events-none">
          {invaders.map(invader => {
            if (!invader.alive) return null
            const isHit = currentInput.toLowerCase() === invader.word.toLowerCase()
            return (
              <div
                key={invader.id}
                className={`absolute transition-all duration-75 ${isHit ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}
                style={{ 
                  left: `${Math.max(0, Math.min(100, invader.x))}%`,
                  top: `${invader.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className={`px-3 py-1 rounded font-mono font-bold whitespace-nowrap shadow-xl ${
                  invader.type === 'boss' 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-2 border-yellow-300 text-sm animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border border-cyan-300 text-xs'
                }`}>
                  {invader.word}
                  {invader.type === 'boss' && invader.health > 1 && (
                    <span className="ml-2 text-yellow-300">[{invader.health}]</span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Particles */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                opacity: particle.life / 20,
                transform: `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px)`
              }}
            />
          ))}
        </div>

        {/* Game Status Message */}
        {!gameStarted && !gameEnded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
            <div className="text-center space-y-4">
              <div className="text-5xl font-black text-cyan-400 animate-pulse" style={{ textShadow: '0 0 10px rgba(34, 211, 238, 0.8)' }}>
                TYPE TO DESTROY!
              </div>
              <p className="text-cyan-300/80 text-lg max-w-sm">
                Enemies fall from above. Type the words to destroy them before they reach the bottom. Survive the waves!
              </p>
            </div>
          </div>
        )}

        {gameEnded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center space-y-4 p-8">
              <div className="text-5xl font-black text-red-500 animate-pulse" style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.8)' }}>
                GAME OVER
              </div>
              <p className="text-red-300/80 text-xl mb-4">
                You survived {wave} waves
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8 bg-white/5 p-6 rounded-lg border border-white/10">
                <div>
                  <div className="text-sm text-cyan-300">FINAL SCORE</div>
                  <div className="text-4xl font-bold text-cyan-400">{score}</div>
                </div>
                <div>
                  <div className="text-sm text-yellow-300">MAX COMBO</div>
                  <div className="text-4xl font-bold text-yellow-400">{combo}x</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        {gameStarted && !gameEnded && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              placeholder="Type the falling words..."
              className="w-full px-4 py-3 rounded bg-slate-800 border-2 border-cyan-500 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono font-semibold text-lg"
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        {!gameStarted && !gameEnded ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 font-bold text-lg"
          >
            LAUNCH ATTACK ⚡
          </Button>
        ) : gameEnded ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="gap-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-8 font-bold text-lg"
          >
            TRY AGAIN 🔥
          </Button>
        ) : null}
      </div>

      {/* Tips */}
      {!gameStarted && (
        <Card className="p-4 bg-slate-900/50 border-cyan-500/30">
          <p className="text-sm text-cyan-300/80 text-center">
            💡 <strong>Tips:</strong> Type complete words to destroy enemies. Boss enemies (red) take 3 hits. Build combos for bonus points!
          </p>
        </Card>
      )}
    </div>
  )
}
