import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// --- Configuration ---
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001'

// Store the system prompt
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || `You are a helpful AI assistant integrated into a weather and productivity dashboard.
You help users with:
- Weather insights and recommendations
- Task organization and productivity tips
- Daily planning and scheduling advice
- General questions about their day
- Provide concise, friendly, and actionable responses
- list relevant sources of information

Be concise, friendly, and actionable in your responses.`

// Rate Limiting Setup
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
  })
  : null

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch (error) {
    console.error("[v0] /api/chat: failed to parse request body", error)
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1'
  if (ratelimit) {
    const { success, limit, remaining } = await ratelimit.limit(ip)
    if (!success) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      })
    }
  }

  let userMessage = body?.message
  if (!userMessage && body?.messages && Array.isArray(body.messages)) {
    const lastMessage = body.messages[body.messages.length - 1]
    userMessage = lastMessage?.content
  }
  if (!userMessage || userMessage.trim() === "") {
    return new Response(JSON.stringify({ error: "No user message provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    if (AI_PROVIDER === 'openrouter') {
      const apiKey = process.env.OPENROUTER_API_KEY
      if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured")
      }

      console.log(`[${new Date().toISOString()}] /api/chat OpenRouter request: ${OPENROUTER_MODEL}`)

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nexus-dashboard.com", // Required by OpenRouter
          "X-Title": "Nexus Dashboard"
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMessage }
          ],
        }),
        cache: 'no-store'
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error("OpenRouter API Error:", errText)
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const text = data.choices[0]?.message?.content || ""

      return new Response(JSON.stringify({ message: text }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })

    } else if (AI_PROVIDER === 'gemini') {
      const keys = process.env.GOOGLE_GEMINI_API_KEY?.split(',') || []
      const key = keys[Math.floor(Math.random() * keys.length)]

      if (!key && process.env.NODE_ENV === 'development') {
        return new Response(JSON.stringify({
          message: "Mock response: Configure GOOGLE_GEMINI_API_KEY for real AI."
        }), { status: 200, headers: { "Content-Type": "application/json" } })
      }

      if (!key) throw new Error("GOOGLE_GEMINI_API_KEY is not configured")

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}` }] }],
          }),
          cache: 'no-store'
        }
      )

      const data = await response.json()
      if (!response.ok) {
        console.error("Gemini API Error:", data)
        throw new Error(`Gemini API error: ${JSON.stringify(data)}`)
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
      return new Response(JSON.stringify({ message: text }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } else {
      throw new Error("Invalid AI_PROVIDER")
    }

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] /api/chat error:`, error)
    return new Response(JSON.stringify({ error: error.message || "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

