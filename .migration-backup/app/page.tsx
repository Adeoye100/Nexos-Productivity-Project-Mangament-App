import { WeatherDashboard } from "@/components/weather-dashboard"
import { Navigation } from "@/components/navigation"
import { OnboardingWrapper } from "@/components/onboarding-wrapper"
import { BackgroundManager } from "@/components/background-manager"

export default function Home() {
  return (
    <main className="min-h-screen">
      <BackgroundManager />
      <Navigation />
      <OnboardingWrapper />
      <WeatherDashboard />
    </main>
  )
}
