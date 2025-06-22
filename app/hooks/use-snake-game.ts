"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAudio } from "./use-audio"

interface Position {
  x: number
  y: number
}

interface Food extends Position {
  type: "normal" | "bonus" | "freeze" | "poison"
}

interface GameSettings {
  darkMode: boolean
  classicMode: boolean
  obstacles: boolean
  powerUps: boolean
  music: boolean
  sound: boolean
}

interface SurpriseEvent extends Position {
  type: "bonus" | "trap"
  duration: number
}

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }
const INITIAL_FOOD: Food[] = [{ x: 15, y: 15, type: "normal" }]

export function useSnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Food[]>(INITIAL_FOOD)
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION)
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(150)
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    darkMode: false,
    classicMode: false,
    obstacles: false,
    powerUps: true,
    music: false,
    sound: false,
  })
  const [obstacles, setObstacles] = useState<Position[]>([])
  const [powerUps, setPowerUps] = useState<Position[]>([])
  const [surpriseEvents, setSurpriseEvents] = useState<SurpriseEvent[]>([])
  const [speedBoost, setSpeedBoost] = useState(0)
  const [freezeEffect, setFreezeEffect] = useState(0)

  const gameLoopRef = useRef<NodeJS.Timeout>()
  const eventLoopRef = useRef<NodeJS.Timeout>()

  const { playSound, playMusic, stopMusic, setMusicEnabled } = useAudio(gameSettings.music, gameSettings.sound)

  const generateRandomPosition = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  }, [])

  const generateFood = useCallback((): Food => {
    const position = generateRandomPosition()
    const foodTypes: Food["type"][] = ["normal", "normal", "normal", "bonus", "freeze", "poison"]
    const type = gameSettings.powerUps ? foodTypes[Math.floor(Math.random() * foodTypes.length)] : "normal"

    return { ...position, type }
  }, [generateRandomPosition, gameSettings.powerUps])

  const generateObstacles = useCallback(() => {
    if (!gameSettings.obstacles) return []

    const obstacleCount = Math.floor(Math.random() * 5) + 3
    const newObstacles: Position[] = []

    for (let i = 0; i < obstacleCount; i++) {
      newObstacles.push(generateRandomPosition())
    }

    return newObstacles
  }, [generateRandomPosition, gameSettings.obstacles])

  const checkCollision = useCallback(
    (head: Position, body: Position[]): boolean => {
      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true
      }

      // Self collision
      if (body.some((segment) => segment.x === head.x && segment.y === head.y)) {
        return true
      }

      // Obstacle collision
      if (obstacles.some((obstacle) => obstacle.x === head.x && obstacle.y === head.y)) {
        return true
      }

      // Trap collision
      if (surpriseEvents.some((event) => event.type === "trap" && event.x === head.x && event.y === head.y)) {
        return true
      }

      return false
    },
    [obstacles, surpriseEvents],
  )

  const moveSnake = useCallback(() => {
    if (gameOver || paused) return

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      head.x += direction.x
      head.y += direction.y

      if (checkCollision(head, newSnake)) {
        setGameOver(true)
        playSound("gameOver")
        return currentSnake
      }

      newSnake.unshift(head)

      // Check food collision
      const eatenFoodIndex = food.findIndex((f) => f.x === head.x && f.y === head.y)
      if (eatenFoodIndex !== -1) {
        const eatenFood = food[eatenFoodIndex]

        // Handle different food types
        switch (eatenFood.type) {
          case "normal":
            setScore((prev) => prev + 1)
            playSound("eat")
            break
          case "bonus":
            setScore((prev) => prev + 3)
            setSpeedBoost(100)
            playSound("speedBoost")
            break
          case "freeze":
            setFreezeEffect(50)
            playSound("freeze")
            break
          case "poison":
            setScore((prev) => Math.max(0, prev - 1))
            if (newSnake.length > 1) {
              newSnake.pop()
            }
            playSound("poison")
            break
        }

        // Remove eaten food and generate new food
        setFood((currentFood) => {
          const newFood = [...currentFood]
          newFood.splice(eatenFoodIndex, 1)
          newFood.push(generateFood())
          return newFood
        })

        // Increase speed gradually
        setSpeed((prev) => Math.max(50, prev - 2))
      } else {
        newSnake.pop()
      }

      // Check surprise event collision
      const bonusEventIndex = surpriseEvents.findIndex(
        (event) => event.type === "bonus" && event.x === head.x && event.y === head.y,
      )
      if (bonusEventIndex !== -1) {
        setScore((prev) => prev + 5)
        playSound("bonus")
        setSurpriseEvents((prev) => prev.filter((_, index) => index !== bonusEventIndex))
      }

      return newSnake
    })
  }, [direction, gameOver, paused, food, checkCollision, generateFood, surpriseEvents, playSound])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver || paused) return

      const key = e.key.toLowerCase()

      switch (key) {
        case "arrowup":
        case "w":
          if (direction.y === 0) setDirection({ x: 0, y: -1 })
          break
        case "arrowdown":
        case "s":
          if (direction.y === 0) setDirection({ x: 0, y: 1 })
          break
        case "arrowleft":
        case "a":
          if (direction.x === 0) setDirection({ x: -1, y: 0 })
          break
        case "arrowright":
        case "d":
          if (direction.x === 0) setDirection({ x: 1, y: 0 })
          break
      }
    },
    [direction, gameOver, paused],
  )

  const startGame = useCallback(() => {
    setGameOver(false)
    setPaused(false)
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setFood([generateFood()])
    setScore(0)
    setSpeed(150)
    setObstacles(generateObstacles())
    setSurpriseEvents([])
    setSpeedBoost(0)
    setFreezeEffect(0)
    playSound("newGame")
  }, [generateFood, generateObstacles, playSound])

  const pauseGame = useCallback(() => {
    setPaused((prev) => {
      const newPaused = !prev
      playSound(newPaused ? "pause" : "resume")
      return newPaused
    })
  }, [playSound])

  const resetGame = useCallback(() => {
    startGame()
  }, [startGame])

  const toggleSetting = useCallback(
    (setting: keyof GameSettings) => {
      playSound("button")
      setGameSettings((prev) => {
        const newSettings = {
          ...prev,
          [setting]: !prev[setting],
        }

        // Handle music toggle
        if (setting === "music") {
          if (newSettings.music) {
            playMusic()
          } else {
            stopMusic()
          }
        }

        return newSettings
      })
    },
    [playSound, playMusic, stopMusic],
  )

  // Game loop
  useEffect(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
    }

    if (!gameOver && !paused) {
      const currentSpeed = speedBoost > 0 ? speed / 2 : freezeEffect > 0 ? speed * 2 : speed
      gameLoopRef.current = setInterval(moveSnake, currentSpeed)
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [moveSnake, gameOver, paused, speed, speedBoost, freezeEffect])

  // Effect timers
  useEffect(() => {
    if (speedBoost > 0) {
      const timer = setTimeout(() => setSpeedBoost((prev) => prev - 1), 100)
      return () => clearTimeout(timer)
    }
  }, [speedBoost])

  useEffect(() => {
    if (freezeEffect > 0) {
      const timer = setTimeout(() => setFreezeEffect((prev) => prev - 1), 100)
      return () => clearTimeout(timer)
    }
  }, [freezeEffect])

  // Surprise events
  useEffect(() => {
    if (eventLoopRef.current) {
      clearInterval(eventLoopRef.current)
    }

    if (!gameOver && !paused) {
      eventLoopRef.current = setInterval(() => {
        // Random chance to spawn surprise events
        if (Math.random() < 0.1) {
          // 10% chance every 5 seconds
          const eventType = Math.random() < 0.7 ? "bonus" : "trap"
          const newEvent: SurpriseEvent = {
            ...generateRandomPosition(),
            type: eventType,
            duration: eventType === "bonus" ? 30 : 50, // 3 or 5 seconds
          }

          setSurpriseEvents((prev) => [...prev, newEvent])
        }

        // Remove expired events
        setSurpriseEvents((prev) =>
          prev.map((event) => ({ ...event, duration: event.duration - 1 })).filter((event) => event.duration > 0),
        )
      }, 5000)
    }

    return () => {
      if (eventLoopRef.current) {
        clearInterval(eventLoopRef.current)
      }
    }
  }, [gameOver, paused, generateRandomPosition])

  // Keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  // Initialize game
  useEffect(() => {
    startGame()
  }, [])

  return {
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
    playSound,
  }
}
