import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface WeatherCardProps {
  icon: LucideIcon
  label: string
  value: string
}

export function WeatherCard({ icon: Icon, label, value }: WeatherCardProps) {
  return (
    <Card className="glass-card p-5 border-border/50 hover:border-primary/40 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center neon-glow">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
          <p className="text-xl font-bold text-foreground mt-1">{value}</p>
        </div>
      </div>
    </Card>
  )
}
