"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LandingPageProps {
  onStartGame: (playerName: string) => void
  onShowLeaderboard: () => void
}

export default function LandingPage({ onStartGame, onShowLeaderboard }: LandingPageProps) {
  const [playerName, setPlayerName] = useState("")

  const playButtonSound = () => {
    // Simple button click sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.type = "square"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      // Silently fail if audio context is not available
    }
  }

  const handleStartGame = () => {
    if (playerName.trim()) {
      onStartGame(playerName.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md z-10 backdrop-blur-sm bg-white/90 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🐍 Snake Master
          </CardTitle>
          <p className="text-gray-600 mt-2">The Ultimate Snake Experience</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="playerName" className="text-sm font-medium">
              Enter Your Name
            </label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Player Name"
              onKeyPress={(e) => e.key === "Enter" && handleStartGame()}
            />
          </div>

          <Button
            onClick={() => {
              playButtonSound() // Add this line
              handleStartGame()
            }}
            disabled={!playerName.trim()}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            🎮 Start Game
          </Button>

          <Button
            onClick={() => {
              playButtonSound() // Add this line
              onShowLeaderboard()
            }}
            variant="outline"
            className="w-full"
          >
            🏆 Leaderboard
          </Button>

          <div className="text-sm text-gray-600 space-y-2">
            <h3 className="font-semibold">How to Play:</h3>
            <ul className="space-y-1 text-xs">
              <li>• Use WASD or Arrow keys to move</li>
              <li>• Eat food to grow and score points</li>
              <li>• Avoid walls and your own tail</li>
              <li>• Press SPACE to pause</li>
              <li>• Press C for dark mode, T for classic mode</li>
              <li>• Press O for obstacles, P for power-ups</li>
            </ul>
          </div>

          <div className="text-center text-xs text-gray-500">&copy; Copy Rights Reserved 2025.</div>
        </CardContent>
      </Card>
    </div>
  )
}
