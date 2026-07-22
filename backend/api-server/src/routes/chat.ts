import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "google/gemini-3.5-flash-lite";

interface TaskSummary {
  id: string;
  title: string;
  priority: string;
  category: string;
  completed: boolean;
  dueDate?: string;
}

function buildSystemPrompt(tasks?: TaskSummary[]): string {
  const base =
    process.env.SYSTEM_PROMPT ||
    `You are Nexus, an intelligent AI assistant built into a weather and productivity dashboard.
You help users with weather insights, task organization, productivity tips, and daily planning.
Be concise, friendly, and actionable. Keep lists brief. When you do not know something, say so.`;

  if (!tasks || tasks.length === 0) return base;

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  let context = `\n\n--- User's tasks (${tasks.length} total, ${pending.length} pending, ${done.length} done) ---\n`;
  pending.forEach((t) => {
    const due = t.dueDate
      ? ` [due: ${new Date(t.dueDate).toLocaleDateString()}]`
      : "";
    context += `• [PENDING | ${t.priority}] ${t.title} (${t.category})${due} [id: ${t.id}]\n`;
  });
  if (done.length) {
    done.slice(0, 5).forEach((t) => {
      context += `• [DONE] ${t.title} [id: ${t.id}]\n`;
    });
    if (done.length > 5) context += `• … and ${done.length - 5} more completed tasks\n`;
  }

  context += `
You can act on tasks by appending ONE XML action block AFTER your normal reply text (no extra formatting):
  Create task : <action>{"type":"create_task","title":"…","priority":"High|Medium|Low","category":"Personal|Work|Health|Shopping|Other"}</action>
  Complete task: <action>{"type":"complete_task","id":"<task_id>"}</action>
Only include an action block when the user explicitly asks you to create or complete a specific task. Never add one otherwise.`;

  return base + context;
}

router.post("/chat", async (req, res) => {
  const body = req.body as {
    message?: string;
    messages?: { role: string; content: string }[];
    tasks?: TaskSummary[];
  };

  const history = (body?.messages || []).filter(
    (m) => m.role === "user" || m.role === "assistant",
  );

  const userMessage =
    body?.message ||
    (history.length > 0 ? history[history.length - 1]?.content : undefined);

  if (!userMessage?.trim()) {
    res.status(400).json({ error: "No user message provided" });
    return;
  }

  const systemPrompt = buildSystemPrompt(body?.tasks);

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
            messages: [{ role: "system", content: systemPrompt }, ...history],
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
            message: "Mock response: Configure GOOGLE_GEMINI_API_KEY for real AI.",
          });
          return;
        }
        res.status(500).json({ error: "GOOGLE_GEMINI_API_KEY is not configured" });
        return;
      }

      // Build Gemini multi-turn contents (role: user | model)
      const contents = history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Guarantee the last entry is from the user
      if (!contents.length || contents[contents.length - 1].role !== "user") {
        contents.push({ role: "user", parts: [{ text: userMessage }] });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
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
    logger.error({ err: error }, "/api/chat error");
    res.status(500).json({ error: "Failed to generate response" });
  }
});

export default router;
