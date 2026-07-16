import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";

const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ||
  `You are a helpful AI assistant integrated into a weather and productivity dashboard.
You help users with:
- Weather insights and recommendations
- Task organization and productivity tips
- Daily planning and scheduling advice
- General questions about their day
- Provide concise, friendly, and actionable responses
- list relevant sources of information

Be concise, friendly, and actionable in your responses.`;

router.post("/chat", async (req, res) => {
  const body = req.body as { message?: string; messages?: { role: string; content: string }[] };

  let userMessage = body?.message;
  if (!userMessage && body?.messages && Array.isArray(body.messages)) {
    const lastMessage = body.messages[body.messages.length - 1];
    userMessage = lastMessage?.content;
  }

  if (!userMessage || userMessage.trim() === "") {
    res.status(400).json({ error: "No user message provided" });
    return;
  }

  try {
    if (AI_PROVIDER === "openrouter") {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "OPENROUTER_API_KEY is not configured" });
        return;
      }

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://nexus-dashboard.replit.app",
            "X-Title": "Nexus Dashboard",
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userMessage },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        req.log.error({ errText }, "OpenRouter API error");
        res.status(502).json({ error: "AI provider error" });
        return;
      }

      const data = (await response.json()) as { choices: { message: { content: string } }[] };
      const text = data.choices[0]?.message?.content || "";
      res.json({ message: text });
    } else {
      // Gemini (default)
      const keysRaw = process.env.GOOGLE_GEMINI_API_KEY || "";
      const keys = keysRaw.split(",").filter(Boolean);
      const key = keys[Math.floor(Math.random() * keys.length)];

      if (!key) {
        if (process.env.NODE_ENV === "development") {
          res.json({
            message:
              "Mock response: Configure GOOGLE_GEMINI_API_KEY for real AI.",
          });
          return;
        }
        res.status(500).json({ error: "GOOGLE_GEMINI_API_KEY is not configured" });
        return;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}` }],
              },
            ],
          }),
        },
      );

      const data = (await response.json()) as { candidates?: { content: { parts: { text: string }[] } }[]; error?: unknown };
      if (!response.ok) {
        req.log.error({ data }, "Gemini API error");
        res.status(502).json({ error: "AI provider error" });
        return;
      }

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      res.json({ message: text });
    }
  } catch (error) {
    logger.error({ error }, "/api/chat error");
    res.status(500).json({ error: "Failed to generate response" });
  }
});

export default router;
