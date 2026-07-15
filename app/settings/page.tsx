import { SettingsPanel } from "@/components/settings-panel"
import { Navigation } from "@/components/navigation"

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12">
        <SettingsPanel />
      </div>
    </main>
  )
}
