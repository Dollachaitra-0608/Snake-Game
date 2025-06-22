"use client"

import { useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSnakeGame } from "../hooks/use-snake-game"
import MobileControls from "./mobile-controls"

interface SnakeGameProps {
  playerName: string
  onBackToMenu: () => void
}

export default function SnakeGame({ playerName, onBackToMenu }: SnakeGameProps) {
  const {
    snake,
    food,
    score,
    gameOver,
    paused,
    direction,
    gameSettings,
    powerUps,
    obstacles,
    surpriseEvents,
    startGame,
    pauseGame,
    resetGame,
    toggleSetting,
    setDirection,
    playSound, // Add this line
  } = useSnakeGame()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const GRID_SIZE = 20
  const CANVAS_SIZE = 400

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = gameSettings.darkMode ? "#1a1a1a" : "#f0f9ff"
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw grid if classic mode
    if (gameSettings.classicMode) {
      ctx.strokeStyle = gameSettings.darkMode ? "#333" : "#e5e7eb"
      ctx.lineWidth = 1
      for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, CANVAS_SIZE)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(CANVAS_SIZE, i)
        ctx.stroke()
      }
    }

    // Draw obstacles
    if (gameSettings.obstacles && obstacles.length > 0) {
      ctx.fillStyle = "#8b5cf6"
      obstacles.forEach((obstacle) => {
        ctx.fillRect(obstacle.x * GRID_SIZE, obstacle.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1)
      })
    }

    // Draw surprise events
    surpriseEvents.forEach((event) => {
      if (event.type === "trap") {
        ctx.fillStyle = "#ef4444"
        ctx.fillRect(event.x * GRID_SIZE, event.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1)
      } else if (event.type === "bonus") {
        ctx.fillStyle = "#fbbf24"
        ctx.fillRect(event.x * GRID_SIZE, event.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1)
      }
    })

    // Draw food
    food.forEach((f) => {
      let color = "#22c55e" // normal food
      if (f.type === "bonus") color = "#f59e0b"
      else if (f.type === "freeze") color = "#3b82f6"
      else if (f.type === "poison") color = "#ef4444"

      ctx.fillStyle = color
      if (gameSettings.classicMode) {
        ctx.fillRect(f.x * GRID_SIZE, f.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1)
      } else {
        ctx.beginPath()
        ctx.arc(f.x * GRID_SIZE + GRID_SIZE / 2, f.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2 - 1, 0, 2 * Math.PI)
        ctx.fill()
      }
    })

    // Draw snake
    snake.forEach((segment, index) => {
      const isHead = index === 0
      ctx.fillStyle = isHead
        ? gameSettings.darkMode
          ? "#10b981"
          : "#059669"
        : gameSettings.darkMode
          ? "#34d399"
          : "#10b981"

      if (gameSettings.classicMode) {
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1)
      } else {
        ctx.beginPath()
        ctx.roundRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4)
        ctx.fill()
      }
    })
  }, [snake, food, obstacles, surpriseEvents, gameSettings])

  useEffect(() => {
    drawGame()
  }, [drawGame])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault()

      // Game controls
      if (e.code === "Space") {
        pauseGame()
        return
      }

      // Settings toggles
      if (e.key.toLowerCase() === "c") {
        toggleSetting("darkMode")
        return
      }
      if (e.key.toLowerCase() === "t") {
        toggleSetting("classicMode")
        return
      }
      if (e.key.toLowerCase() === "o") {
        toggleSetting("obstacles")
        return
      }
      if (e.key.toLowerCase() === "p") {
        toggleSetting("powerUps")
        return
      }
      if (e.key.toLowerCase() === "m") {
        toggleSetting("music")
        return
      }
      if (e.key.toLowerCase() === "s") {
        toggleSetting("sound")
        return
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [pauseGame, toggleSetting])

  const handleGameOver = () => {
    const scores = JSON.parse(localStorage.getItem("snakeScores") || "[]")
    const newScore = {
      name: playerName,
      score,
      date: new Date().toISOString(),
      id: Date.now(),
    }
    scores.push(newScore)
    scores.sort((a: any, b: any) => b.score - a.score)
    localStorage.setItem("snakeScores", JSON.stringify(scores.slice(0, 10)))
  }

  useEffect(() => {
    if (gameOver && score > 0) {
      handleGameOver()
    }
  }, [gameOver, score, playerName])

  return (
    <div
      className={`min-h-screen p-4 transition-colors duration-300 ${
        gameSettings.darkMode ? "bg-gray-900" : "bg-gradient-to-br from-green-400 via-blue-500 to-purple-600"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Canvas */}
          <Card className={`flex-1 ${gameSettings.darkMode ? "bg-gray-800 border-gray-700" : "bg-white/90"}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <h2 className={`text-2xl font-bold ${gameSettings.darkMode ? "text-white" : "text-gray-800"}`}>
                    Snake Master
                  </h2>
                  <p className={`text-sm ${gameSettings.darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Player: {playerName}
                  </p>
                </div>
                <div className={`text-right ${gameSettings.darkMode ? "text-white" : "text-gray-800"}`}>
                  <div className="text-2xl font-bold">Score: {score}</div>
                  <div className="text-sm">Length: {snake.length}</div>
                </div>
              </div>

              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className="border-2 border-gray-300 rounded-lg mx-auto block"
                />

                {paused && !gameOver && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Card className="p-4">
                      <CardContent className="text-center">
                        <h3 className="text-xl font-bold mb-2">Game Paused</h3>
                        <p className="text-sm text-gray-600 mb-4">Press SPACE to resume</p>
                        <Button
                          onClick={() => {
                            playSound("button") // Add this line
                            pauseGame()
                          }}
                        >
                          Resume
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {gameOver && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <Card className="p-4">
                      <CardContent className="text-center">
                        <h3 className="text-xl font-bold mb-2">Game Over!</h3>
                        <p className="text-lg mb-2">Final Score: {score}</p>
                        <p className="text-sm text-gray-600 mb-4">Snake Length: {snake.length}</p>
                        <div className="space-x-2">
                          <Button
                            onClick={() => {
                              playSound("button") // Add this line
                              resetGame()
                            }}
                          >
                            Play Again
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              playSound("button") // Add this line
                              onBackToMenu()
                            }}
                          >
                            Menu
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <Button
                  size="sm"
                  variant={paused ? "default" : "outline"}
                  onClick={() => {
                    playSound("button") // Add this line
                    pauseGame()
                  }}
                  disabled={gameOver}
                >
                  {paused ? "Resume" : "Pause"} (Space)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    playSound("button") // Add this line
                    resetGame()
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    playSound("button") // Add this line
                    onBackToMenu()
                  }}
                >
                  Menu
                </Button>
              </div>
            </CardContent>
          </Card>

          <MobileControls
            gameOver={gameOver}
            paused={paused}
            direction={direction}
            darkMode={gameSettings.darkMode}
            onDirectionChange={(newDirection) => {
              if (!gameOver && !paused) {
                // Prevent reverse direction
                if (
                  (newDirection.x === -direction.x && newDirection.y === -direction.y) ||
                  (newDirection.x === direction.x && newDirection.y === direction.y)
                ) {
                  return
                }

                // Prevent moving in opposite direction
                if ((direction.x !== 0 && newDirection.x !== 0) || (direction.y !== 0 && newDirection.y !== 0)) {
                  return
                }

                setDirection(newDirection)
              }
            }}
            onPause={pauseGame}
            playSound={playSound} // Add this line
          />

          {/* Controls & Settings */}
          <div className="lg:w-80 space-y-4">
            <Card className={gameSettings.darkMode ? "bg-gray-800 border-gray-700" : "bg-white/90"}>
              <CardContent className="p-4">
                <h3 className={`font-bold mb-3 ${gameSettings.darkMode ? "text-white" : "text-gray-800"}`}>Settings</h3>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant={gameSettings.darkMode ? "default" : "outline"}
                    onClick={() => toggleSetting("darkMode")}
                    className="w-full justify-start"
                  >
                    🌙 Dark Mode (C)
                  </Button>
                  <Button
                    size="sm"
                    variant={gameSettings.classicMode ? "default" : "outline"}
                    onClick={() => toggleSetting("classicMode")}
                    className="w-full justify-start"
                  >
                    🎮 Classic Mode (T)
                  </Button>
                  <Button
                    size="sm"
                    variant={gameSettings.obstacles ? "default" : "outline"}
                    onClick={() => toggleSetting("obstacles")}
                    className="w-full justify-start"
                  >
                    🧱 Obstacles (O)
                  </Button>
                  <Button
                    size="sm"
                    variant={gameSettings.powerUps ? "default" : "outline"}
                    onClick={() => toggleSetting("powerUps")}
                    className="w-full justify-start"
                  >
                    ⚡ Power-ups (P)
                  </Button>
                  <Button
                    size="sm"
                    variant={gameSettings.music ? "default" : "outline"}
                    onClick={() => toggleSetting("music")}
                    className="w-full justify-start"
                  >
                    🎵 Music (M)
                  </Button>
                  <Button
                    size="sm"
                    variant={gameSettings.sound ? "default" : "outline"}
                    onClick={() => toggleSetting("sound")}
                    className="w-full justify-start"
                  >
                    🔊 Sound (S)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={gameSettings.darkMode ? "bg-gray-800 border-gray-700" : "bg-white/90"}>
              <CardContent className="p-4">
                <h3 className={`font-bold mb-3 ${gameSettings.darkMode ? "text-white" : "text-gray-800"}`}>
                  Food Types
                </h3>
                <div className={`space-y-2 text-sm ${gameSettings.darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Normal: +1 length, +1 score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Bonus: +3 score, speed boost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Freeze: slow down snake</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Poison: -1 score, shrink</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={gameSettings.darkMode ? "bg-gray-800 border-gray-700" : "bg-white/90"}>
              <CardContent className="p-4">
                <h3 className={`font-bold mb-3 ${gameSettings.darkMode ? "text-white" : "text-gray-800"}`}>Controls</h3>
                <div className={`space-y-1 text-sm ${gameSettings.darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  <div>WASD / Arrow Keys: Move</div>
                  <div>Space: Pause/Resume</div>
                  <div>C: Toggle Dark Mode</div>
                  <div>T: Toggle Classic Mode</div>
                  <div>O: Toggle Obstacles</div>
                  <div>P: Toggle Power-ups</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
