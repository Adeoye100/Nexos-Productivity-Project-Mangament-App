import { useEffect, useState, useCallback } from "react"

interface UseVimNavigationOptions<T> {
  items: T[]
  onEnter?: (item: T) => void
  onSpace?: (item: T) => void
  onSlash?: () => void
  onEscape?: () => void
  enabled?: boolean
}

export function useVimNavigation<T>({
  items,
  onEnter,
  onSpace,
  onSlash,
  onEscape,
  enabled = true,
}: UseVimNavigationOptions<T>) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest('[cmdk-root]') // Don't trigger if inside command palette
      ) {
        return
      }

      switch (e.key) {
        case "j":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev))
          break
        case "k":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case "Enter":
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            e.preventDefault()
            onEnter?.(items[selectedIndex])
          }
          break
        case "x":
        case " ":
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            e.preventDefault()
            onSpace?.(items[selectedIndex])
          }
          break
        case "/":
          e.preventDefault()
          onSlash?.()
          break
        case "Escape":
          e.preventDefault()
          setSelectedIndex(-1)
          onEscape?.()
          break
      }
    },
    [enabled, items, selectedIndex, onEnter, onSpace, onSlash, onEscape]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return { selectedIndex, setSelectedIndex }
}
