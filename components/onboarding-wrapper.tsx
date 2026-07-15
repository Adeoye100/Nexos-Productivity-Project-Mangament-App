"use client"

import { OnboardingModal } from "./onboarding-modal"

export function OnboardingWrapper() {
  const handleComplete = (name: string, location: string) => {
    // Refresh the page to show updated user data
    window.location.reload()
  }

  return <OnboardingModal onComplete={handleComplete} />
}
