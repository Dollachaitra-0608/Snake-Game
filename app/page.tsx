"use client"

import { useState } from "react"
import LandingPage from "./components/landing-page"
import SnakeGame from "./components/snake-game"
import Leaderboard from "./components/leaderboard"

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "game" | "leaderboard">("landing")
  const [playerName, setPlayerName] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
      {currentView === "landing" && (
        <LandingPage
          onStartGame={(name) => {
            setPlayerName(name)
            setCurrentView("game")
          }}
          onShowLeaderboard={() => setCurrentView("leaderboard")}
        />
      )}
      {currentView === "game" && <SnakeGame playerName={playerName} onBackToMenu={() => setCurrentView("landing")} />}
      {currentView === "leaderboard" && <Leaderboard onBackToMenu={() => setCurrentView("landing")} />}
    </div>
  )
}
