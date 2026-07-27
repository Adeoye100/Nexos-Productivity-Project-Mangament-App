import { Router } from "express";
import { logger } from "../lib/logger";

const router = Router();

const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "google/gemini-3.5-flash-lite";

const VALID_PRIORITIES = new Set(["Low", "Medium", "High"]);

const INTENT_SYSTEM_PROMPT = `You convert a user's natural-language goal into a flat project plan.
Respond with STRICT JSON only — no prose, no markdown fences, no commentary.
Exact shape:
{"projectName":string,"tasks":[{"title":string,"priority":"Low"|"Medium"|"High"}]}
Rules:
- projectName: short category tag suitable for grouping tasks on a board (2–5 words).
- Generate between 3 and 8 concrete, actionable tasks — never fewer than 3, never more than 8.
- Each title must be a non-empty, specific next action (not vague).
- priority must be exactly one of: Low, Medium, High.`;

interface GeneratedTask {
  title: string;
  priority: "Low" | "Medium" | "High";
}

interface GeneratedPlan {
  projectName: string;
  tasks: GeneratedTask[];
}

function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function validatePlan(data: unknown): GeneratedPlan | null {
  if (!data || typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;
  if (typeof obj.projectName !== "string" || !obj.projectName.trim()) return null;
  if (!Array.isArray(obj.tasks) || obj.tasks.length === 0) return null;

  const tasks: GeneratedTask[] = [];
  for (const item of obj.tasks) {
    if (!item || typeof item !== "object") return null;
    const t = item as Record<string, unknown>;
    if (typeof t.title !== "string" || !t.title.trim()) return null;
    if (typeof t.priority !== "string" || !VALID_PRIORITIES.has(t.priority)) {
      return null;
    }
    tasks.push({
      title: t.title.trim(),
      priority: t.priority as GeneratedTask["priority"],
    });
  }

  return {
    projectName: obj.projectName.trim(),
    tasks,
  };
}

function parseAiJson(raw: string): GeneratedPlan | null {
  try {
    const parsed: unknown = JSON.parse(stripMarkdownFences(raw));
    return validatePlan(parsed);
  } catch {
    return null;
  }
}

async function callOpenRouter(intent: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error("OPENROUTER_API_KEY is not configured"), {
      status: 500,
    });
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
          { role: "system", content: INTENT_SYSTEM_PROMPT },
          { role: "user", content: intent },
        ],
        max_tokens: 1024,
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    logger.error({ errText }, "OpenRouter API error (generate-from-intent)");
    throw Object.assign(new Error("AI provider error"), { status: 502 });
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content || "";
}

async function callGemini(intent: string): Promise<string> {
  const keysRaw = process.env.GOOGLE_GEMINI_API_KEY || "";
  const keys = keysRaw.split(",").filter(Boolean);
  const key = keys[Math.floor(Math.random() * keys.length)];

  if (!key) {
    if (process.env.NODE_ENV === "development") {
      return JSON.stringify({
        projectName: "Sample Project",
        tasks: [
          { title: "Clarify scope and success criteria", priority: "High" },
          { title: "Set up the project scaffolding", priority: "High" },
          { title: "Build the core feature", priority: "Medium" },
          { title: "Add polish and edge-case handling", priority: "Medium" },
          { title: "Test and ship a first version", priority: "Low" },
        ],
      });
    }
    throw Object.assign(new Error("GOOGLE_GEMINI_API_KEY is not configured"), {
      status: 500,
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: INTENT_SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: intent }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    },
  );

  const data = (await response.json()) as {
    candidates?: { content: { parts: { text: string }[] } }[];
    error?: unknown;
  };

  if (!response.ok) {
    logger.error({ data }, "Gemini API error (generate-from-intent)");
    throw Object.assign(new Error("AI provider error"), { status: 502 });
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

router.post("/tasks/generate-from-intent", async (req, res) => {
  const intent =
    typeof req.body?.intent === "string" ? req.body.intent.trim() : "";

  if (!intent) {
    res.status(400).json({ error: "intent is required" });
    return;
  }

  try {
    const raw =
      AI_PROVIDER === "openrouter"
        ? await callOpenRouter(intent)
        : await callGemini(intent);

    const plan = parseAiJson(raw);
    if (!plan) {
      logger.error(
        { rawPreview: raw.slice(0, 500) },
        "AI returned invalid format for generate-from-intent",
      );
      res.status(502).json({ error: "AI returned invalid format" });
      return;
    }

    // Proposal only — never write to a task store from this endpoint
    res.json(plan);
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status: number }).status)
        : 500;
    const message =
      error instanceof Error ? error.message : "Failed to generate tasks";

    if (status === 500 && !message.includes("not configured")) {
      logger.error({ err: error }, "/api/tasks/generate-from-intent error");
      res.status(500).json({ error: "Failed to generate tasks" });
      return;
    }

    res.status(status).json({ error: message });
  }
});

export default router;
