
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, MapPin, Bell, Palette, Save, Github, RefreshCw, Unlink, ExternalLink, CheckCircle2, AlertCircle, Share2 } from "lucide-react"
import { encrypt, decrypt } from "@/lib/encryption"
import { useToast } from "@/hooks/use-toast"
import { PairingModal } from "./pairing-modal"

export function SettingsPanel() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  // GitHub Integration state
  const [githubToken, setGithubToken] = useState("")
  const [githubRepo, setGithubRepo] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    // Load settings from localStorage
    setName(localStorage.getItem("userName") || "")
    setLocation(localStorage.getItem("userLocation") || "")
    setNotifications(localStorage.getItem("notifications") !== "false")

    // Load GitHub settings
    const encryptedToken = localStorage.getItem("github_token")
    if (encryptedToken) {
      setGithubToken(decrypt(encryptedToken))
    }
    setGithubRepo(localStorage.getItem("github_repo") || "")
  }, [])

  const handleSave = () => {
    localStorage.setItem("userName", name)
    localStorage.setItem("userLocation", location)
    localStorage.setItem("notifications", notifications.toString())

    // Save GitHub settings
    if (githubToken) {
      localStorage.setItem("github_token", encrypt(githubToken))
    } else {
      localStorage.removeItem("github_token")
    }
    localStorage.setItem("github_repo", githubRepo)

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated locally.",
    })
  }

  const testGithubConnection = async () => {
    if (!githubToken || !githubRepo) {
      setConnectionStatus("error")
      toast({
        title: "Missing information",
        description: "Please provide both a GitHub token and a repository.",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      const response = await fetch(`https://api.github.com/repos/${githubRepo}`, {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (response.ok) {
        setConnectionStatus("success")
        toast({
          title: "Connection successful",
          description: `Successfully connected to ${githubRepo}`,
        })
      } else {
        setConnectionStatus("error")
        const errorData = await response.json()
        toast({
          title: "Connection failed",
          description: errorData.message || "Invalid token or repository.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Connection failed",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const disconnectGithub = () => {
    setGithubToken("")
    setGithubRepo("")
    localStorage.removeItem("github_token")
    localStorage.removeItem("github_repo")
    localStorage.removeItem("github_issues_cache")
    localStorage.removeItem("github_commits_cache")
    setConnectionStatus("idle")
    toast({
      title: "GitHub disconnected",
      description: "GitHub token and cached data have been cleared.",
    })
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
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
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

        {/* Cross-Device Sync */}
        <PairingModal />

        {/* GitHub Integration */}
        <Card className="glass-strong p-6 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">GitHub Integration</h2>
              <p className="text-sm text-muted-foreground">Sync your issues and activity</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center justify-between">
                <span>Personal Access Token</span>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center hover:underline"
                >
                  Generate Token <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </label>
              <Input
                type="password"
                placeholder="github_pat_..."
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="bg-background/50 border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Generate a fine-grained token with "Issues" and "Pull requests" read access only.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Target Repository</label>
              <Input
                placeholder="owner/repo (e.g. Adeoye100/Nexos)"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="bg-background/50 border-border"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={testGithubConnection}
                disabled={isTestingConnection}
                className="flex-1"
              >
                {isTestingConnection ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : connectionStatus === "success" ? (
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                ) : connectionStatus === "error" ? (
                  <AlertCircle className="w-4 h-4 mr-2 text-destructive" />
                ) : (
                  <Github className="w-4 h-4 mr-2" />
                )}
                Test Connection
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectGithub}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
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
