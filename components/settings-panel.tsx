"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, MapPin, Bell, Palette, Save } from "lucide-react"

export function SettingsPanel() {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    setName(localStorage.getItem("userName") || "")
    setLocation(localStorage.getItem("userLocation") || "")
    setNotifications(localStorage.getItem("notifications") !== "false")
  }, [])

  const handleSave = () => {
    localStorage.setItem("userName", name)
    localStorage.setItem("userLocation", location)
    localStorage.setItem("notifications", notifications.toString())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    localStorage.removeItem("hasOnboarded")
    localStorage.removeItem("userName")
    localStorage.removeItem("userLocation")
    localStorage.removeItem("tasks")
    window.location.reload()
  }

  return (
    <div className="container mx-auto px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 neon-text">Settings</h1>
        <p className="text-muted-foreground text-lg">Customize your dashboard experience</p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <Card className="glass-strong p-6 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
              <div className="flex gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground mt-2" />
                <Input
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-background/50 border-border flex-1"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="glass-strong p-6 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Preferences</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive weather alerts and task reminders</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications ? "bg-primary" : "bg-muted"
                } relative`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
          >
            Reset All Data
          </Button>
        </div>

        {/* Info */}
        <Card className="glass p-4 border-accent/20">
          <p className="text-sm text-muted-foreground">
            <span className="text-accent font-semibold">Note:</span> All data is stored locally in your browser. No
            information is sent to external servers.
          </p>
        </Card>
      </div>
    </div>
  )
}
