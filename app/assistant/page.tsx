import { AIAssistant } from "@/components/ai-assistant"
import { Navigation } from "@/components/navigation"

export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12">
        <AIAssistant />
      </div>
    </main>
  )
}
