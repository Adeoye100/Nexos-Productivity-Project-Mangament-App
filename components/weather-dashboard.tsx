"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Cloud, Droplets, Wind, Sun, Moon, Eye, Sparkles, Search, Thermometer, Loader2 } from "lucide-react"
import { WeatherCard } from "./weather-card"
import { WeeklyForecast } from "./weekly-forecast"

interface WeatherData {
  temp: number
  condition: string
  humidity: number
  windSpeed: number
  visibility: number
  sunrise: string
  sunset: string
  location: string
  feelsLike: number
  pressure: number
}

type Unit = "F" | "C"

export function WeatherDashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [userName, setUserName] = useState("User")
  const [greeting, setGreeting] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [unit, setUnit] = useState<Unit>("F")

  useEffect(() => {
    // Get user name from localStorage or use default
    const storedName = localStorage.getItem("userName") || "User"
    setUserName(storedName)

    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good Morning")
    else if (hour < 18) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")

    fetchWeatherData()
  }, [])

  const fetchWeatherData = async (query?: string) => {
    try {
      setLoading(true)
      setError(null)

      let url = "/api/weather"

      if (query) {
        url += `?q=${encodeURIComponent(query)}`
      } else {
        // Get user's location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        const { latitude, longitude } = position.coords
        url += `?lat=${latitude}&lon=${longitude}`
      }

      // Fetch weather data from our API route
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data = await response.json()

      // Convert sunrise/sunset from Unix timestamp to readable time
      const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })

      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        visibility: Math.round(data.visibility / 1609.34), // Convert meters to miles
        sunrise: sunriseTime,
        sunset: sunsetTime,
        location: `${data.name}, ${data.sys.country}`,
        feelsLike: Math.round(data.main.feels_like),
        pressure: data.main.pressure,
      })
    } catch (err) {
      console.error("[v0] Weather fetch error:", err)
      setError("Unable to fetch weather data. Try searching for a city.")

      // Only fallback if not a manual search
      if (!query) {
        // Fallback to a default location (San Francisco)
        try {
          const response = await fetch(`/api/weather?q=San Francisco`)
          const data = await response.json()

          const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })

          setWeather({
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed),
            visibility: Math.round(data.visibility / 1609.34),
            sunrise: sunriseTime,
            sunset: sunsetTime,
            location: `${data.name}, ${data.sys.country}`,
            feelsLike: Math.round(data.main.feels_like),
            pressure: data.main.pressure,
          })
        } catch (fallbackErr) {
          console.error("[v0] Fallback weather fetch error:", fallbackErr)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      fetchWeatherData(searchQuery)
    }
  }

  const toggleUnit = () => {
    setUnit(prev => prev === "F" ? "C" : "F")
  }

  const convertTemp = (tempF: number) => {
    if (unit === "C") {
      return Math.round((tempF - 32) * 5 / 9)
    }
    return tempF
  }

  const convertSpeed = (speedMph: number) => {
    if (unit === "C") { // Use metric for wind/visibility too if C is selected
      return Math.round(speedMph * 1.60934)
    }
    return speedMph
  }

  const convertDistance = (distMiles: number) => {
    if (unit === "C") {
      return Math.round(distMiles * 1.60934)
    }
    return distMiles
  }

  if (loading && !weather) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 animate-pulse"></div>
            <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-muted-foreground animate-pulse text-lg font-medium">Fetching weather data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 relative z-10">
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-slide-in-up"
        >
          {/* Greeting Section */}
          <div>
            <h1 className="text-5xl font-bold mb-3 neon-text tracking-tight">
              {greeting}, {userName}
            </h1>
            {weather && (
              <p className="text-muted-foreground text-xl">
                {weather.location} • {weather.condition}
              </p>
            )}
            {error && <p className="text-yellow-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/30 border-primary/20 backdrop-blur-sm"
              />
            </form>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleUnit}
              className="bg-background/30 border-primary/20 hover:bg-primary/20"
            >
              <span className="font-bold text-primary">{unit}</span>
            </Button>
          </div>
        </div>

        {weather && (
          <div className="animate-fade-in">
            {/* Main Weather Display */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Temperature Card */}
              <Card className="glass-card p-8 col-span-1 lg:col-span-2 border-primary/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground mb-3 text-sm uppercase tracking-wider">Current Temperature</p>
                    <div className="flex items-baseline gap-3">
                      <span
                        className="text-8xl font-bold neon-text tracking-tight transition-all duration-300"
                      >
                        {convertTemp(weather.temp)}°
                      </span>
                      <span className="text-3xl text-muted-foreground font-light">{unit}</span>
                    </div>
                    <p className="text-2xl text-foreground mt-6 font-medium">{weather.condition}</p>
                    <p className="text-base text-muted-foreground mt-3">
                      Feels like {convertTemp(weather.feelsLike)}°{unit}
                    </p>
                  </div>
                  <Cloud className="w-28 h-28 text-primary/30" />
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="animate-slide-in-up delay-100">
                  <WeatherCard icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
                </div>
                <div className="animate-slide-in-up delay-200">
                  <WeatherCard
                    icon={Wind}
                    label="Wind Speed"
                    value={`${convertSpeed(weather.windSpeed)} ${unit === "C" ? "km/h" : "mph"}`}
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="animate-slide-in-up delay-100">
                <WeatherCard icon={Sun} label="Sunrise" value={weather.sunrise} />
              </div>
              <div className="animate-slide-in-up delay-200">
                <WeatherCard icon={Moon} label="Sunset" value={weather.sunset} />
              </div>
              <div className="animate-slide-in-up delay-300">
                <WeatherCard
                  icon={Eye}
                  label="Visibility"
                  value={`${convertDistance(weather.visibility)} ${unit === "C" ? "km" : "mi"}`}
                />
              </div>
              <div className="animate-slide-in-up delay-400">
                <WeatherCard icon={Cloud} label="Condition" value={weather.condition} />
              </div>
            </div>

            {/* Weekly Forecast */}
            <div className="animate-slide-in-up delay-300">
              <WeeklyForecast />
            </div>

            {/* AI Suggestion */}
            <div className="animate-slide-in-up delay-500">
              <Card className="glass-card p-6 border-accent/30 mt-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0 neon-glow-accent">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 text-accent text-lg neon-text-accent">AI Suggestion</h3>
                    <p className="text-foreground leading-relaxed text-base">
                      Based on the humidity at {weather.humidity}%, today's a good day for outdoor activities. Consider
                      scheduling your morning run before 10 AM for optimal conditions.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
