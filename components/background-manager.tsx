"use client"

import type React from "react";

import { useEffect, useState, useRef } from "react"
import { Upload, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const DEFAULT_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
  "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=1920&q=80",
]

// Helper functions for localStorage
const getFromStorage = <T,>(key: string, defaultValue: T, parser: (item: string) => T = JSON.parse): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? parser(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const setToStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

export function BackgroundManager() {
  const [backgroundUrl, setBackgroundUrl] = useState<string>(() => getFromStorage("customBackground", "", (val) => val));
  const [opacity, setOpacity] = useState<number>(() => getFromStorage("bgOpacity", 0.3, parseFloat));
  const [blur, setBlur] = useState<number>(() => getFromStorage("bgBlur", 8, parseFloat));
  const [isBlackWhite, setIsBlackWhite] = useState<boolean>(() => getFromStorage("bgBlackWhite", false, val => val === 'true'));
  const [showSettings, setShowSettings] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load saved settings
    const savedBg = localStorage.getItem("customBackground")

    if (!savedBg) {
      // Random default background
      const randomBg = DEFAULT_BACKGROUNDS[Math.floor(Math.random() * DEFAULT_BACKGROUNDS.length)]
      setBackgroundUrl(randomBg)
    }

    // Parallax scroll effect
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        setBackgroundUrl(url);
        setToStorage("customBackground", url);
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    setToStorage("bgOpacity", value);
  }

  const handleBlurChange = (value: number) => {
    setBlur(value);
    setToStorage("bgBlur", value);
  }

  const toggleBlackWhite = () => {
    setIsBlackWhite(prev => {
      const newValue = !prev;
      setToStorage("bgBlackWhite", newValue);
      return newValue;
    });
  }

  const selectDefaultBackground = (url: string) => {
    setBackgroundUrl(url);
    setToStorage("customBackground", url);
  }

  const backgroundFilter = `blur(${blur}px) ${isBlackWhite ? "grayscale(1)" : "grayscale(0)"}`

  return (
    <>
      {/* Parallax Background */}
      <div className="parallax-container">
        <div
          className="parallax-bg"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: backgroundFilter,
            opacity: opacity,
            transform: `translateY(${scrollY * 0.5}px) scale(1.1)`,
          }}
        />
        {/* Dark overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(10, 10, 20, 0.7), rgba(10, 10, 20, 0.85))",
          }}
        />
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full glass-strong flex items-center justify-center neon-glow hover:scale-110 transition-transform"
        aria-label="Background settings"
      >
        <ImageIcon className="w-6 h-6 text-primary" />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <Card className="glass-strong p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-primary/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold neon-text">Background Settings</h2>
              <Button
                variant="ghost"
                onClick={() => setShowSettings(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Close
              </Button>
            </div>

            {/* Upload Custom Background */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-foreground">Upload Custom Background</h3>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image (JPG/PNG)
              </Button>
            </div>

            {/* Default Backgrounds */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-foreground">Or Choose a Default</h3>
              <div className="grid grid-cols-3 gap-3">
                {DEFAULT_BACKGROUNDS.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => selectDefaultBackground(url)}
                    className={cn(
                      "aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                      backgroundUrl === url ? "border-primary neon-glow" : "border-border",
                    )}
                  >
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Background ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Black & White Mode Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between p-4 rounded-lg glass border border-primary/20">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Black & White Mode</h3>
                  <p className="text-xs text-muted-foreground mt-1">Convert background to grayscale</p>
                </div>
                <button
                  onClick={toggleBlackWhite}
                  className={cn(
                    "relative w-14 h-7 rounded-full transition-colors duration-300",
                    isBlackWhite ? "bg-primary" : "bg-muted",
                  )}
                  aria-label="Toggle black and white mode"
                >
                  <div
                    className={cn(
                      "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300",
                      isBlackWhite ? "translate-x-7" : "translate-x-0",
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Opacity</label>
                <span className="text-sm text-muted-foreground">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => handleOpacityChange(Number.parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Blur Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Blur</label>
                <span className="text-sm text-muted-foreground">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={blur}
                onChange={(e) => handleBlurChange(Number.parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
