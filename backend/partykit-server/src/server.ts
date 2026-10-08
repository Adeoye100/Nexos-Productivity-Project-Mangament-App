import type * as Party from "partykit/server";

interface TaskSummary {
  id: string;
  title: string;
  priority: string;
  category: string;
  completed: boolean;
  dueDate?: string;
}

function buildSystemPrompt(tasks?: TaskSummary[], env?: Record<string, any>): string {
  const base =
    (env?.SYSTEM_PROMPT as string) ||
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

export default class SignalingServer implements Party.Server {
  // Map from topic-name to the set of connection IDs subscribed to it.
  topics = new Map<string, Set<string>>();
  
  // Set of topic-names that this specific connection is subscribed to.
  subscriptions = new Map<string, Set<string>>();

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    this.subscriptions.set(conn.id, new Set<string>());
  }

  onMessage(message: string, sender: Party.Connection) {
    let msg: any;
    try {
      msg = JSON.parse(message);
    } catch (e) {
      return;
    }
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case 'subscribe':
        (msg.topics || []).forEach((topicName: string) => {
          if (typeof topicName === 'string') {
            if (!this.topics.has(topicName)) {
              this.topics.set(topicName, new Set());
            }
            this.topics.get(topicName)!.add(sender.id);
            this.subscriptions.get(sender.id)?.add(topicName);
          }
        });
        break;
      case 'unsubscribe':
        (msg.topics || []).forEach((topicName: string) => {
          this.topics.get(topicName)?.delete(sender.id);
          this.subscriptions.get(sender.id)?.delete(topicName);
        });
        break;
      case 'publish':
        if (msg.topic) {
          const receivers = this.topics.get(msg.topic);
          if (receivers) {
            msg.clients = receivers.size;
            const strMsg = JSON.stringify(msg);
            receivers.forEach((connId) => {
              if (connId !== sender.id) {
                const receiver = this.room.getConnection(connId);
                if (receiver) {
                  receiver.send(strMsg);
                }
              }
            });
          }
        }
        break;
      case 'ping':
        sender.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  }

  onClose(conn: Party.Connection) {
    const subscribedTopics = this.subscriptions.get(conn.id) || new Set<string>();
    subscribedTopics.forEach((topicName) => {
      const subs = this.topics.get(topicName);
      if (subs) {
        subs.delete(conn.id);
        if (subs.size === 0) {
          this.topics.delete(topicName);
        }
      }
    });
    this.subscriptions.delete(conn.id);
  }

  // Handle serverless HTTP requests
  static async onFetch(req: Party.Request, lobby: Party.FetchLobby, ctx: Party.ExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    // Provide a health check route
    if (url.pathname === "/api/health" && req.method === "GET") {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    if (url.pathname === "/api/chat" && req.method === "POST") {
      return SignalingServer.handleChat(req, lobby.env);
    }

    // Allow CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }

    return new Response("Not found", { status: 404 });
  }

  static async handleChat(req: Party.Request, env: Record<string, any>): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    };

    try {
      const body = (await req.json()) as {
        message?: string;
        messages?: { role: string; content: string }[];
        tasks?: TaskSummary[];
      };

      const AI_PROVIDER = (env.AI_PROVIDER as string) || "gemini";
      const GEMINI_MODEL = (env.GEMINI_MODEL as string) || "gemini-1.5-flash";
      const OPENROUTER_MODEL = (env.OPENROUTER_MODEL as string) || "google/gemini-3.5-flash-lite";

      const history = (body?.messages || []).filter(
        (m) => m.role === "user" || m.role === "assistant"
      );

      const userMessage =
        body?.message ||
        (history.length > 0 ? history[history.length - 1]?.content : undefined);

      if (!userMessage?.trim()) {
        return new Response(JSON.stringify({ error: "No user message provided" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const systemPrompt = buildSystemPrompt(body?.tasks, env);

      if (AI_PROVIDER === "openrouter") {
        const apiKey = env.OPENROUTER_API_KEY as string;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY is not configured" }), {
            status: 500,
            headers: corsHeaders
          });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        });

        if (!response.ok) {
          return new Response(JSON.stringify({ error: "AI provider error" }), {
            status: 502,
            headers: corsHeaders
          });
        }

        const data = (await response.json()) as { choices: { message: { content: string } }[] };
        return new Response(JSON.stringify({ message: data.choices[0]?.message?.content || "" }), {
          headers: corsHeaders
        });
      } else {
        // Gemini (default)
        const keysRaw = (env.GOOGLE_GEMINI_API_KEY as string) || "";
        const keys = keysRaw.split(",").filter(Boolean);
        const key = keys[Math.floor(Math.random() * keys.length)];

        if (!key) {
          if ((env.NODE_ENV as string) === "development" || true) {
            // Provide mock response if no key is present for dev purposes
            return new Response(JSON.stringify({ message: "Mock response: Configure GOOGLE_GEMINI_API_KEY for real AI." }), {
              headers: corsHeaders
            });
          }
          return new Response(JSON.stringify({ error: "GOOGLE_GEMINI_API_KEY is not configured" }), {
            status: 500,
            headers: corsHeaders
          });
        }

        const contents = history.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

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
          }
        );

        if (!response.ok) {
          return new Response(JSON.stringify({ error: "AI provider error" }), {
            status: 502,
            headers: corsHeaders
          });
        }

        const data = (await response.json()) as any;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return new Response(JSON.stringify({ message: text }), {
          headers: corsHeaders
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to generate response" }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
}
