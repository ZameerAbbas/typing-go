'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface TypingGameProps {
  gameType: 'words' | 'sentences' | 'practice'
  onBack: () => void
}

const WORD_LIST = [
  'keyboard', 'programming', 'javascript', 'typescript', 'react', 'component', 'function', 'variable',
  'algorithm', 'database', 'interface', 'development', 'performance', 'optimization', 'framework',
  'library', 'module', 'package', 'repository', 'terminal', 'command', 'server', 'client',
  'request', 'response', 'handler', 'middleware', 'authentication', 'validation', 'security'
]

const SENTENCES = [
  'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.',
  'In the world of web development, typing speed matters more than you might think.',
  'Practice makes perfect. The more you type, the faster and more accurate you become.',
  'Code is poetry. Every line written is a step towards mastery and excellence.',
  'Technology is constantly evolving. Stay updated with the latest trends and tools.'
]

export default function TypingGame({ gameType, onBack }: TypingGameProps) {
  const [gameStarted, setGameStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(gameType === 'words' ? 60 : gameType === 'sentences' ? 120 : 0)
  const [currentText, setCurrentText] = useState('')
  const [typedText, setTypedText] = useState('')
  const [score, setScore] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [gameEnded, setGameEnded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef<number>(0)

  // Initialize game text
  useEffect(() => {
    if (gameType === 'practice') {
      setCurrentText(SENTENCES[0])
    } else if (gameType === 'words') {
      const words = Array(30).fill(0).map(() => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)])
      setCurrentText(words.join(' '))
    } else {
      setCurrentText(SENTENCES[Math.floor(Math.random() * SENTENCES.length)])
    }
  }, [gameType])

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameEnded || (gameType !== 'practice' && timeLeft === 0)) return

    const timer = setTimeout(() => {
      setTimeLeft(prev => {
        if (prev <= 1 && gameType !== 'practice') {
          setGameEnded(true)
          return 0
        }
        return Math.max(prev - 1, 0)
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [gameStarted, timeLeft, gameEnded, gameType])

  // Calculate stats
  useEffect(() => {
    if (!gameStarted || typedText.length === 0) return

    const elapsed = (Date.now() - startTimeRef.current) / 60000 // minutes
    const words = typedText.trim().split(/\s+/).length
    const newWpm = Math.round(words / elapsed) || 0
    setWpm(newWpm)

    // Calculate accuracy
    let correct = 0
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === currentText[i]) correct++
    }
    const newAccuracy = currentText.length > 0 ? Math.round((correct / currentText.length) * 100) : 100
    setAccuracy(Math.min(newAccuracy, 100))
    setScore(correct)
  }, [typedText, currentText, gameStarted])

  const handleStart = () => {
    setGameStarted(true)
    startTimeRef.current = Date.now()
    inputRef.current?.focus()
  }

  const handleReset = () => {
    setGameStarted(false)
    setTypedText('')
    setScore(0)
    setWpm(0)
    setAccuracy(100)
    setGameEnded(false)
    setTimeLeft(gameType === 'words' ? 60 : gameType === 'sentences' ? 120 : 0)
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameEnded && gameType !== 'practice') return
    setTypedText(e.target.value)
  }

  const displayedText = currentText.split('').map((char, idx) => {
    let className = 'text-muted-foreground'
    
    if (idx < typedText.length) {
      className = typedText[idx] === char ? 'text-primary font-semibold' : 'text-destructive bg-destructive/20'
    }
    
    return (
      <span key={idx} className={className}>
        {char}
      </span>
    )
  })

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
        
        <div className="flex items-center gap-8">
          {gameType !== 'practice' && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Time</div>
              <div className={`text-4xl font-bold ${timeLeft <= 10 && gameStarted ? 'text-destructive' : 'text-primary'}`}>
                {timeLeft}s
              </div>
            </div>
          )}
          
          <Button
            onClick={handleReset}
            variant="outline"
            size="icon"
            className="h-12 w-12 bg-transparent"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center border-primary/50 bg-primary/5">
          <div className="text-sm text-muted-foreground">WPM</div>
          <div className="text-3xl font-bold text-primary">{wpm}</div>
        </Card>
        <Card className="p-4 text-center border-secondary/50 bg-secondary/5">
          <div className="text-sm text-muted-foreground">Score</div>
          <div className="text-3xl font-bold text-secondary">{score}</div>
        </Card>
        <Card className="p-4 text-center border-accent/50 bg-accent/5">
          <div className="text-sm text-muted-foreground">Accuracy</div>
          <div className="text-3xl font-bold text-accent">{accuracy}%</div>
        </Card>
        <Card className="p-4 text-center border-border">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="text-2xl font-bold">
            {!gameStarted ? '🎯' : gameEnded && gameType !== 'practice' ? '✅' : '⚡'}
          </div>
        </Card>
      </div>

      {/* Text Display */}
      <Card className="p-8 bg-card/50 border-primary/20">
        <div className="text-center text-xl leading-relaxed font-mono text-pretty mb-8 min-h-24">
          {displayedText}
          <span className={`inline-block w-1 ml-1 animate-pulse ${gameStarted ? 'bg-primary' : 'bg-muted'}`}>
            |
          </span>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={handleTyping}
          placeholder={gameStarted ? 'Start typing...' : 'Click Start to begin...'}
          disabled={!gameStarted || (gameEnded && gameType !== 'practice')}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          autoComplete="off"
          spellCheck="false"
        />
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        {!gameStarted ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground px-8"
          >
            🚀 Start Game
          </Button>
        ) : gameEnded && gameType !== 'practice' ? (
          <Button
            onClick={handleReset}
            size="lg"
            className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8"
          >
            Try Again
          </Button>
        ) : null}
      </div>

      {/* Results */}
      {gameEnded && gameType !== 'practice' && (
        <Card className="p-8 text-center border-primary/50 bg-primary/5">
          <h3 className="text-2xl font-bold mb-4">Game Complete! 🎉</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-sm text-muted-foreground">Final WPM</div>
              <div className="text-4xl font-bold text-primary">{wpm}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Final Score</div>
              <div className="text-4xl font-bold text-secondary">{score}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
              <div className="text-4xl font-bold text-accent">{accuracy}%</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
