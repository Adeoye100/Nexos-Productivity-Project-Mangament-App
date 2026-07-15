"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Cloud, CloudRain, Sun, CloudSnow, CloudDrizzle, CloudFog } from "lucide-react"

interface ForecastDay {
  day: string
  high: number
  low: number
  condition: string
  icon: any
}
 
const getWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase()
  if (lowerCondition.includes("rain")) return CloudRain
  if (lowerCondition.includes("snow")) return CloudSnow
  if (lowerCondition.includes("drizzle")) return CloudDrizzle
  if (lowerCondition.includes("fog") || lowerCondition.includes("mist")) return CloudFog
  if (lowerCondition.includes("clear") || lowerCondition.includes("sun")) return Sun
  return Cloud
}

export function WeeklyForecast() {
  const [forecastData, setForecastData] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchForecastData()
  }, [])

  const fetchForecastData = async () => {
    try {
      setLoading(true)

      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, () => {
          // If geolocation fails, use default coordinates (San Francisco)
          resolve({
            coords: { latitude: 37.7749, longitude: -122.4194 },
          } as GeolocationPosition)
        })
      })

      const { latitude, longitude } = position.coords

      // Fetch 5-day forecast from OpenWeather API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=imperial`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch forecast data")
      }

      const data = await response.json()

      // Process forecast data - group by day and get high/low temps
      const dailyForecasts: { [key: string]: { temps: number[]; conditions: string[] } } = {}

      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000)
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" })

        if (!dailyForecasts[dayName]) {
          dailyForecasts[dayName] = { temps: [], conditions: [] }
        }

        dailyForecasts[dayName].temps.push(item.main.temp)
        dailyForecasts[dayName].conditions.push(item.weather[0].main)
      })

      // Convert to array format
      const forecast: ForecastDay[] = Object.entries(dailyForecasts)
        .slice(0, 7)
        .map(([day, data]) => ({
          day,
          high: Math.round(Math.max(...data.temps)),
          low: Math.round(Math.min(...data.temps)),
          condition: data.conditions[0],
          icon: getWeatherIcon(data.conditions[0]),
        }))

      setForecastData(forecast)
    } catch (error) {
      console.error("[v0] Forecast fetch error:", error)
      // Fallback to mock data if API fails
      setForecastData([
        { day: "Mon", high: 75, low: 62, condition: "Clear", icon: Sun },
        { day: "Tue", high: 73, low: 61, condition: "Clouds", icon: Cloud },
        { day: "Wed", high: 68, low: 58, condition: "Rain", icon: CloudRain },
        { day: "Thu", high: 71, low: 60, condition: "Clouds", icon: Cloud },
        { day: "Fri", high: 76, low: 63, condition: "Clear", icon: Sun },
        { day: "Sat", high: 78, low: 65, condition: "Clear", icon: Sun },
        { day: "Sun", high: 74, low: 62, condition: "Clouds", icon: Cloud },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="glass-strong p-6 border-primary/20">
        <h2 className="text-xl font-bold mb-6 text-foreground">7-Day Forecast</h2>
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading forecast...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="glass-strong p-6 border-primary/20">
      <h2 className="text-xl font-bold mb-6 text-foreground">7-Day Forecast</h2>
      <div
        className="grid grid-cols-2 md:grid-cols-7 gap-4"
      >
        {forecastData.map((day, index) => {
          const Icon = day.icon
          return (
            <div
              key={day.day}
              className="flex flex-col items-center gap-3 p-4 rounded-lg bg-card/50 border border-border hover:border-primary/30 transition-all hover:bg-card/80 animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-sm font-medium text-muted-foreground">{day.day}</span>
              <Icon className="w-8 h-8 text-primary" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{day.high}°</p>
                <p className="text-sm text-muted-foreground">{day.low}°</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
