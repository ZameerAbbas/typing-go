'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Trophy } from 'lucide-react'

interface LeaderboardProps {
  onBack: () => void
}

// Mock leaderboard data
const LEADERBOARD_DATA = [
  { rank: 1, name: 'TypeMaster', wpm: 178, accuracy: 98, mode: 'Words' },
  { rank: 2, name: 'SpeedDemon', wpm: 165, accuracy: 96, mode: 'Sentences' },
  { rank: 3, name: 'KeyboardPro', wpm: 152, accuracy: 97, mode: 'Words' },
  { rank: 4, name: 'TypingNinja', wpm: 148, accuracy: 95, mode: 'Words' },
  { rank: 5, name: 'FlashFinger', wpm: 142, accuracy: 99, mode: 'Sentences' },
  { rank: 6, name: 'RapidKeys', wpm: 138, accuracy: 94, mode: 'Words' },
  { rank: 7, name: 'LightningBolt', wpm: 135, accuracy: 96, mode: 'Sentences' },
  { rank: 8, name: 'FingerBlur', wpm: 128, accuracy: 93, mode: 'Words' },
  { rank: 9, name: 'SpaceBar', wpm: 125, accuracy: 95, mode: 'Sentences' },
  { rank: 10, name: 'TypeZone', wpm: 120, accuracy: 92, mode: 'Words' },
]

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'words' | 'sentences'>('all')

  const filteredData = filterMode === 'all' 
    ? LEADERBOARD_DATA 
    : LEADERBOARD_DATA.filter(entry => entry.mode.toLowerCase() === filterMode)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-secondary" />
          <h2 className="text-4xl font-bold">Global Leaderboard</h2>
        </div>
        
        <div className="w-[140px]"></div> {/* Spacer for alignment */}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={() => setFilterMode('all')}
          variant={filterMode === 'all' ? 'default' : 'outline'}
          className={filterMode === 'all' ? 'bg-primary text-primary-foreground' : ''}
        >
          All Modes
        </Button>
        <Button
          onClick={() => setFilterMode('words')}
          variant={filterMode === 'words' ? 'default' : 'outline'}
          className={filterMode === 'words' ? 'bg-primary text-primary-foreground' : ''}
        >
          Words Challenge
        </Button>
        <Button
          onClick={() => setFilterMode('sentences')}
          variant={filterMode === 'sentences' ? 'default' : 'outline'}
          className={filterMode === 'sentences' ? 'bg-primary text-primary-foreground' : ''}
        >
          Story Mode
        </Button>
      </div>

      {/* Leaderboard Table */}
      <Card className="overflow-hidden border-primary/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-primary/10">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Player</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">WPM</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Accuracy</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((entry, idx) => (
                <tr
                  key={entry.rank}
                  className="hover:bg-accent/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {entry.rank <= 3 && (
                        <span className="text-2xl">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <span className="font-bold text-lg text-primary">#{entry.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{entry.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold text-lg">
                        {entry.wpm}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-semibold text-accent">{entry.accuracy}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-medium">
                      {entry.mode}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 text-center border-primary/50 bg-primary/5">
          <div className="text-sm text-muted-foreground mb-2">Average WPM</div>
          <div className="text-4xl font-bold text-primary">
            {Math.round(LEADERBOARD_DATA.reduce((sum, entry) => sum + entry.wpm, 0) / LEADERBOARD_DATA.length)}
          </div>
        </Card>
        <Card className="p-6 text-center border-secondary/50 bg-secondary/5">
          <div className="text-sm text-muted-foreground mb-2">Highest WPM</div>
          <div className="text-4xl font-bold text-secondary">
            {Math.max(...LEADERBOARD_DATA.map(entry => entry.wpm))}
          </div>
        </Card>
        <Card className="p-6 text-center border-accent/50 bg-accent/5">
          <div className="text-sm text-muted-foreground mb-2">Avg Accuracy</div>
          <div className="text-4xl font-bold text-accent">
            {Math.round(LEADERBOARD_DATA.reduce((sum, entry) => sum + entry.accuracy, 0) / LEADERBOARD_DATA.length)}%
          </div>
        </Card>
      </div>

      {/* Challenge Banner */}
      <Card className="p-8 text-center border-primary/50 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h3 className="text-2xl font-bold mb-2">Can you make it to the top 10? 🚀</h3>
        <p className="text-muted-foreground mb-4">
          Start typing and earn your spot on the global leaderboard!
        </p>
        <Button
          onClick={onBack}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
        >
          Start Playing Now
        </Button>
      </Card>
    </div>
  )
}
