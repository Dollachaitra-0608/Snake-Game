"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MobileControlsProps {
  gameOver: boolean
  paused: boolean
  direction: { x: number; y: number }
  darkMode: boolean
  onDirectionChange: (newDirection: { x: number; y: number }) => void
  onPause: () => void
  playSound: (soundType: string) => void // Add this line
}

export default function MobileControls({
  gameOver,
  paused,
  direction,
  darkMode,
  onDirectionChange,
  onPause,
  playSound, // Add this line
}: MobileControlsProps) {
  const handleDirectionChange = (newDirection: { x: number; y: number }) => {
    if (gameOver || paused) return

    // Prevent reverse direction
    if (
      (newDirection.x === -direction.x && newDirection.y === -direction.y) ||
      (newDirection.x === direction.x && newDirection.y === direction.y)
    ) {
      return
    }

    // Prevent moving in opposite direction when snake has length > 1
    if ((direction.x !== 0 && newDirection.x !== 0) || (direction.y !== 0 && newDirection.y !== 0)) {
      return
    }

    playSound("button") // Add this line
    onDirectionChange(newDirection)
  }

  const buttonClass = `w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold transition-all duration-200 active:scale-95 ${
    darkMode
      ? "bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
      : "bg-white hover:bg-gray-50 border-gray-300 text-gray-800"
  }`

  const pauseButtonClass = `w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 active:scale-95 ${
    paused
      ? darkMode
        ? "bg-green-600 hover:bg-green-700 text-white"
        : "bg-green-500 hover:bg-green-600 text-white"
      : darkMode
        ? "bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
        : "bg-white hover:bg-gray-50 border-gray-300 text-gray-800"
  }`

  return (
    <div className="block sm:hidden mt-4">
      <Card className={darkMode ? "bg-gray-800 border-gray-700" : "bg-white/90"}>
        <CardContent className="p-4">
          <div className="flex flex-col items-center space-y-3">
            {/* Up button */}
            <Button
              variant="outline"
              className={buttonClass}
              onTouchStart={(e) => {
                e.preventDefault()
                handleDirectionChange({ x: 0, y: -1 })
              }}
              onClick={(e) => {
                e.preventDefault()
                handleDirectionChange({ x: 0, y: -1 })
              }}
              disabled={gameOver}
            >
              ↑
            </Button>

            {/* Left, Pause, Right buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className={buttonClass}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleDirectionChange({ x: -1, y: 0 })
                }}
                onClick={(e) => {
                  e.preventDefault()
                  handleDirectionChange({ x: -1, y: 0 })
                }}
                disabled={gameOver}
              >
                ←
              </Button>

              <Button
                variant={paused ? "default" : "outline"}
                className={pauseButtonClass}
                onTouchStart={(e) => {
                  e.preventDefault()
                  playSound("button") // Add this line
                  onPause()
                }}
                onClick={(e) => {
                  e.preventDefault()
                  playSound("button") // Add this line
                  onPause()
                }}
                disabled={gameOver}
              >
                {paused ? "▶" : "⏸"}
              </Button>

              <Button
                variant="outline"
                className={buttonClass}
                onTouchStart={(e) => {
                  e.preventDefault()
                  handleDirectionChange({ x: 1, y: 0 })
                }}
                onClick={(e) => {
                  e.preventDefault()
                  handleDirectionChange({ x: 1, y: 0 })
                }}
                disabled={gameOver}
              >
                →
              </Button>
            </div>

            {/* Down button */}
            <Button
              variant="outline"
              className={buttonClass}
              onTouchStart={(e) => {
                e.preventDefault()
                handleDirectionChange({ x: 0, y: 1 })
              }}
              onClick={(e) => {
                e.preventDefault()
                handleDirectionChange({ x: 0, y: 1 })
              }}
              disabled={gameOver}
            >
              ↓
            </Button>
          </div>

          <div className={`text-center text-xs mt-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Tap buttons to control snake
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
