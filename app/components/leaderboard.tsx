"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LeaderboardProps {
  onBackToMenu: () => void
}

interface Score {
  id: number
  name: string
  score: number
  date: string
}

const playButtonSound = () => {
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

export default function Leaderboard({ onBackToMenu }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([])

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem("snakeScores") || "[]")
    setScores(savedScores)
  }, [])

  const clearScores = () => {
    localStorage.removeItem("snakeScores")
    setScores([])
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl backdrop-blur-sm bg-white/90 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            🏆 Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No scores yet! Play a game to see your results here.</div>
          ) : (
            <div className="space-y-2">
              {scores.map((score, index) => (
                <div
                  key={score.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0
                      ? "bg-yellow-100 border-2 border-yellow-300"
                      : index === 1
                        ? "bg-gray-100 border-2 border-gray-300"
                        : index === 2
                          ? "bg-orange-100 border-2 border-orange-300"
                          : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-white"
                          : index === 1
                            ? "bg-gray-500 text-white"
                            : index === 2
                              ? "bg-orange-500 text-white"
                              : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{score.name}</div>
                      <div className="text-sm text-gray-500">{new Date(score.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-600">{score.score}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => {
                playButtonSound() // Add this line
                onBackToMenu()
              }}
              className="flex-1"
            >
              Back to Menu
            </Button>
            {scores.length > 0 && (
              <Button
                onClick={() => {
                  playButtonSound() // Add this line
                  clearScores()
                }}
                variant="outline"
              >
                Clear Scores
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
