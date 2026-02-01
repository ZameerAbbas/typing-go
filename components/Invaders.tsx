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

interface LevelConfig {
  wordCount: number
  speed: number
  spawnRate: number
  bossChance: number
}

const BOSS_WORDS = ['destroyer', 'sentinel', 'interceptor', 'invader', 'phantom', 'wraith', 'specter', 'hunter']

// Level configurations - progressively harder
const LEVEL_CONFIG: Record<number, LevelConfig> = {
  1: { wordCount: 10, speed: 0.08, spawnRate: 1500, bossChance: 0 },
  2: { wordCount: 15, speed: 0.12, spawnRate: 1200, bossChance: 0.05 },
  3: { wordCount: 20, speed: 0.16, spawnRate: 1000, bossChance: 0.08 },
  4: { wordCount: 25, speed: 0.22, spawnRate: 800, bossChance: 0.12 },
  5: { wordCount: 30, speed: 0.28, spawnRate: 600, bossChance: 0.15 },
  6: { wordCount: 35, speed: 0.35, spawnRate: 500, bossChance: 0.2 },
  7: { wordCount: 40, speed: 0.42, spawnRate: 400, bossChance: 0.25 },
}

export default function Invaders({ onBack }: InvadersProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [invaders, setInvaders] = useState<Invader[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(5)
  const [level, setLevel] = useState(1)
  const [levelWords, setLevelWords] = useState<string[]>([])
  const [destroyedInLevel, setDestroyedInLevel] = useState(0)
  const [combo, setCombo] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; life: number }>>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const invaderIdRef = useRef(0)
  const particleIdRef = useRef(0)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  const getLevelConfig = () => {
    return LEVEL_CONFIG[Math.min(level, 7)] || LEVEL_CONFIG[7]
  }

  // Fetch words from open source API
  const fetchLevelWords = async (count: number) => {
    try {
      const response = await fetch(`https://random-word-api.herokuapp.com/all`)
      const allWords = await response.json()
      // Filter words between 4-10 characters for gameplay variety
      const filtered = allWords.filter((w: string) => w.length >= 4 && w.length <= 10)
      const shuffled = filtered.sort(() => Math.random() - 0.5)
      setLevelWords(shuffled.slice(0, count))
    } catch (error) {
      console.log('[v0] Error fetching words, using fallback')
      // Fallback words if API fails
      const fallback = ['keyboard', 'programming', 'javascript', 'typescript', 'react', 'component', 'function', 'variable',
        'algorithm', 'database', 'interface', 'development', 'performance', 'optimization', 'framework',
        'library', 'module', 'package', 'repository', 'terminal', 'command', 'server', 'client',
        'request', 'response', 'handler', 'middleware', 'authentication', 'validation', 'security',
        'pointer', 'memory', 'compiler', 'debugger', 'router', 'buffer', 'cache', 'syntax',
        'method', 'property', 'instance', 'object', 'array', 'string', 'number', 'boolean',
        'design', 'pattern', 'loop', 'conditional', 'data', 'type', 'class']
      const shuffled = fallback.sort(() => Math.random() - 0.5)
      setLevelWords(shuffled.slice(0, count))
    }
  }

  // Load words when level changes
  useEffect(() => {
    const config = getLevelConfig()
    fetchLevelWords(config.wordCount)
  }, [level])

  // Spawn new invaders based on level
  useEffect(() => {
    if (!gameStarted || gameEnded || levelWords.length === 0) return

    const config = getLevelConfig()
    const spawnInterval = setInterval(() => {
      const isBoss = Math.random() < config.bossChance
      const newInvader: Invader = {
        id: invaderIdRef.current++,
        word: isBoss ? BOSS_WORDS[Math.floor(Math.random() * BOSS_WORDS.length)] : levelWords[Math.floor(Math.random() * levelWords.length)],
        x: Math.random() * 80 + 10,
        y: -10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: config.speed,
        alive: true,
        type: isBoss ? 'boss' : 'normal',
        health: isBoss ? 3 : 1
      }
      setInvaders(prev => [...prev, newInvader])
    }, config.spawnRate)

    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameEnded, level, levelWords])

  // Game loop for moving invaders and particles
  useEffect(() => {
    if (!gameStarted || gameEnded) return

    gameLoopRef.current = setInterval(() => {
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
    setLevel(1)
    setDestroyedInLevel(0)
    setCombo(0)
    setParticles([])
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
    setLevel(1)
    setDestroyedInLevel(0)
    setCombo(0)
    setParticles([])
    invaderIdRef.current = 0
    particleIdRef.current = 0
  }

  const handleLevelUp = () => {
    setLevel(prev => prev + 1)
    setDestroyedInLevel(0)
    setInvaders([])
    setCurrentInput('')
    // Keep combo bonus for advancing levels
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

        // Check level progression
        const newDestroyed = destroyedInLevel + 1
        const config = getLevelConfig()
        setDestroyedInLevel(newDestroyed)

        if (newDestroyed >= config.wordCount) {
          handleLevelUp()
        }
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
          <div className="text-xs text-muted-foreground">LEVEL</div>
          <div className="text-2xl font-bold text-accent">{level}</div>
        </Card>
        <Card className="p-3 text-center border-yellow-500/50 bg-yellow-500/5">
          <div className="text-xs text-muted-foreground">COMBO</div>
          <div className="text-2xl font-bold text-yellow-500">{combo}x</div>
        </Card>
        <Card className="p-3 text-center border-border">
          <div className="text-xs text-muted-foreground">PROGRESS</div>
          <div className="text-2xl font-bold">{destroyedInLevel}/{getLevelConfig().wordCount}</div>
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
                You reached level {level}
              </p>
              <div className="grid grid-cols-3 gap-6 mb-8 bg-white/5 p-6 rounded-lg border border-white/10">
                <div>
                  <div className="text-sm text-cyan-300">FINAL SCORE</div>
                  <div className="text-4xl font-bold text-cyan-400">{score}</div>
                </div>
                <div>
                  <div className="text-sm text-purple-300">MAX LEVEL</div>
                  <div className="text-4xl font-bold text-purple-400">{level}</div>
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
            <strong>Level System:</strong> Each level has unique words and increases in difficulty. Level 1 starts with 10 words at slow speed. Higher levels have more words and faster enemies. Destroy all words in a level to advance!
          </p>
        </Card>
      )}
    </div>
  )
}
