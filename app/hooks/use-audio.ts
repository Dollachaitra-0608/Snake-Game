"use client"

import { useCallback, useRef, useEffect } from "react"

interface AudioHook {
  playSound: (soundType: string) => void
  playMusic: () => void
  stopMusic: () => void
  setMusicEnabled: (enabled: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
}

export function useAudio(musicEnabled: boolean, soundEnabled: boolean): AudioHook {
  const audioContextRef = useRef<AudioContext | null>(null)
  const musicRef = useRef<HTMLAudioElement | null>(null)
  const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
    }

    // Initialize on user interaction
    const handleUserInteraction = () => {
      initAudio()
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }

    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)

    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }
  }, [])

  // Generate sound using Web Audio API
  const generateSound = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.1) => {
      if (!audioContextRef.current || !soundEnabled) return

      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
      oscillator.type = type

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration)

      oscillator.start(audioContextRef.current.currentTime)
      oscillator.stop(audioContextRef.current.currentTime + duration)
    },
    [soundEnabled],
  )

  // Generate complex sound effects
  const playComplexSound = useCallback(
    (soundType: string) => {
      if (!audioContextRef.current || !soundEnabled) return

      switch (soundType) {
        case "powerUp":
          // Ascending arpeggio
          setTimeout(() => generateSound(523, 0.1, "square", 0.15), 0) // C5
          setTimeout(() => generateSound(659, 0.1, "square", 0.15), 50) // E5
          setTimeout(() => generateSound(784, 0.1, "square", 0.15), 100) // G5
          setTimeout(() => generateSound(1047, 0.2, "square", 0.15), 150) // C6
          break

        case "gameOver":
          // Descending dramatic sound
          setTimeout(() => generateSound(440, 0.3, "sawtooth", 0.2), 0) // A4
          setTimeout(() => generateSound(370, 0.3, "sawtooth", 0.2), 150) // F#4
          setTimeout(() => generateSound(294, 0.3, "sawtooth", 0.2), 300) // D4
          setTimeout(() => generateSound(220, 0.5, "sawtooth", 0.2), 450) // A3
          break

        case "bonus":
          // Sparkly bonus sound
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              generateSound(800 + Math.random() * 400, 0.1, "sine", 0.1)
            }, i * 30)
          }
          break

        case "freeze":
          // Crystalline freeze sound
          setTimeout(() => generateSound(1200, 0.15, "triangle", 0.12), 0)
          setTimeout(() => generateSound(1000, 0.15, "triangle", 0.12), 75)
          setTimeout(() => generateSound(800, 0.2, "triangle", 0.12), 150)
          break

        case "poison":
          // Bubbling poison sound
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              generateSound(150 + Math.random() * 100, 0.2, "sawtooth", 0.08)
            }, i * 100)
          }
          break
      }
    },
    [generateSound, soundEnabled],
  )

  const playSound = useCallback(
    (soundType: string) => {
      if (!soundEnabled) return

      switch (soundType) {
        case "move":
          generateSound(200, 0.05, "square", 0.05)
          break
        case "eat":
          generateSound(440, 0.1, "sine", 0.1)
          setTimeout(() => generateSound(550, 0.1, "sine", 0.1), 50)
          break
        case "button":
          generateSound(800, 0.08, "square", 0.08)
          break
        case "pause":
          generateSound(600, 0.15, "triangle", 0.1)
          break
        case "resume":
          generateSound(600, 0.1, "triangle", 0.1)
          setTimeout(() => generateSound(800, 0.1, "triangle", 0.1), 100)
          break
        case "collision":
          generateSound(150, 0.3, "sawtooth", 0.15)
          break
        case "speedBoost":
          playComplexSound("powerUp")
          break
        case "gameOver":
          playComplexSound("gameOver")
          break
        case "bonus":
          playComplexSound("bonus")
          break
        case "freeze":
          playComplexSound("freeze")
          break
        case "poison":
          playComplexSound("poison")
          break
        case "newGame":
          setTimeout(() => generateSound(523, 0.1, "sine", 0.1), 0) // C5
          setTimeout(() => generateSound(659, 0.1, "sine", 0.1), 100) // E5
          setTimeout(() => generateSound(784, 0.2, "sine", 0.1), 200) // G5
          break
        default:
          generateSound(440, 0.1, "sine", 0.1)
      }
    },
    [generateSound, playComplexSound, soundEnabled],
  )

  const playMusic = useCallback(() => {
    if (!musicEnabled) return

    // Create a simple background music loop using Web Audio API
    if (!audioContextRef.current) return

    const playMelodyNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContextRef.current!.createOscillator()
      const gainNode = audioContextRef.current!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current!.destination)

      oscillator.frequency.setValueAtTime(frequency, startTime)
      oscillator.type = "triangle"

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.03, startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }

    // Simple melody pattern
    const melody = [
      { freq: 523, duration: 0.4 }, // C5
      { freq: 587, duration: 0.4 }, // D5
      { freq: 659, duration: 0.4 }, // E5
      { freq: 523, duration: 0.4 }, // C5
      { freq: 659, duration: 0.4 }, // E5
      { freq: 523, duration: 0.4 }, // C5
      { freq: 587, duration: 0.8 }, // D5
    ]

    const currentTime = audioContextRef.current.currentTime
    let noteTime = currentTime

    melody.forEach((note) => {
      playMelodyNote(note.freq, noteTime, note.duration)
      noteTime += note.duration
    })

    // Schedule next loop
    setTimeout(
      () => {
        if (musicEnabled) playMusic()
      },
      melody.reduce((sum, note) => sum + note.duration, 0) * 1000,
    )
  }, [musicEnabled])

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause()
      musicRef.current.currentTime = 0
    }
  }, [])

  const setMusicEnabled = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        playMusic()
      } else {
        stopMusic()
      }
    },
    [playMusic, stopMusic],
  )

  const setSoundEnabled = useCallback(() => {
    // Sound enabling is handled by the soundEnabled parameter
  }, [])

  return {
    playSound,
    playMusic,
    stopMusic,
    setMusicEnabled,
    setSoundEnabled,
  }
}
