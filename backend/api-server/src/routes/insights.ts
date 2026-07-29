import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "google/gemini-3.5-flash-lite";

const SYSTEM_PROMPT = `You are reviewing a short activity digest from a productivity app.
Give 2-4 brief, honest observations about patterns you notice.
If the data is sparse (only a few days), say so plainly rather than overstating confidence.
Never use clinical or diagnostic language (no 'burnout', 'depression', 'anxiety', etc.) — describe patterns only ('you've logged more hours than usual this week'), and let the user draw their own conclusions.
Keep the tone observational and calm, not alarming.`;

router.post("/insights/generate", async (req, res) => {
  const { digest } = req.body as { digest?: string };

  if (!digest?.trim()) {
    res.status(400).json({ error: "No digest provided" });
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
              { role: "user", content: digest },
            ],
            max_tokens: 1024,
          }),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        req.log.error({ errText }, "OpenRouter API error");
        res.status(502).json({ error: "AI provider error" });
        return;
      }

      const data = (await response.json()) as {
        choices: { message: { content: string } }[];
      };
      res.json({ message: data.choices[0]?.message?.content || "" });
    } else {
      // Gemini (default)
      const keysRaw = process.env.GOOGLE_GEMINI_API_KEY || "";
      const keys = keysRaw.split(",").filter(Boolean);
      const key = keys[Math.floor(Math.random() * keys.length)];

      if (!key) {
        if (process.env.NODE_ENV === "development") {
          res.json({
            message: "Mock Insights: You've been consistently completing high-priority tasks this week. Keep up the good work! (Configure GOOGLE_GEMINI_API_KEY for real AI)",
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
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [
              { role: "user", parts: [{ text: digest }] }
            ],
          }),
        },
      );

      const data = (await response.json()) as {
        candidates?: { content: { parts: { text: string }[] } }[];
        error?: unknown;
      };

      if (!response.ok) {
        req.log.error({ data }, "Gemini API error");
        res.status(502).json({ error: "AI provider error" });
        return;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      res.json({ message: text });
    }
  } catch (error) {
    logger.error({ err: error }, "/api/insights/generate error");
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

export default router;
