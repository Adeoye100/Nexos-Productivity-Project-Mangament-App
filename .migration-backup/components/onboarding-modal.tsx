"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Sparkles } from "lucide-react"

interface OnboardingModalProps {
  onComplete: (name: string, location: string) => void
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")

  useEffect(() => {
    // Check if user has completed onboarding
    const hasOnboarded = localStorage.getItem("hasOnboarded")
    if (!hasOnboarded) {
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2)
    } else if (step === 2 && location.trim()) {
      localStorage.setItem("hasOnboarded", "true")
      localStorage.setItem("userName", name)
      localStorage.setItem("userLocation", location)
      setIsOpen(false)
      onComplete(name, location)
    }
  }

  const handleSkip = () => {
    localStorage.setItem("hasOnboarded", "true")
    setIsOpen(false)
    onComplete("User", "San Francisco, CA")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="glass-strong border-primary/30 p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-2 neon-text">Welcome to Nexus</h2>
            <p className="text-muted-foreground text-center mb-6">
              Your next-generation weather and productivity dashboard
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">What's your name?</label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  className="bg-background/50 border-border"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue
              </Button>

              <button onClick={handleSkip} className="w-full text-sm text-muted-foreground hover:text-foreground">
                Skip for now
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-2 neon-text">Nice to meet you, {name}!</h2>
            <p className="text-muted-foreground text-center mb-6">Where are you located?</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Your location</label>
                <Input
                  placeholder="e.g., San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  className="bg-background/50 border-border"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleNext}
                disabled={!location.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Button>

              <button onClick={() => setStep(1)} className="w-full text-sm text-muted-foreground hover:text-foreground">
                Back
              </button>
            </div>
          </>
        )}

        <div className="flex justify-center gap-2 mt-6">
          <div className={`w-2 h-2 rounded-full ${step === 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-2 h-2 rounded-full ${step === 2 ? "bg-primary" : "bg-muted"}`} />
        </div>
      </Card>
    </div>
  )
}
