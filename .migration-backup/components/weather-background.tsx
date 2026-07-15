"use client"

import { useEffect, useState } from "react"

interface WeatherBackgroundProps {
  condition: string
}

export function WeatherBackground({ condition }: WeatherBackgroundProps) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Determine gradient based on weather condition
  const getGradient = () => {
    const lowerCondition = condition.toLowerCase()
    if (lowerCondition.includes("rain")) {
      return "from-slate-900 via-slate-800 to-background"
    } else if (lowerCondition.includes("cloud")) {
      return "from-slate-800 via-slate-900 to-background"
    } else if (lowerCondition.includes("clear") || lowerCondition.includes("sunny")) {
      return "from-blue-950 via-slate-900 to-background"
    }
    return "from-slate-900 via-background to-background"
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${getGradient()} transition-all duration-1000`}
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />

      {/* Neon grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
    </div>
  )
}
