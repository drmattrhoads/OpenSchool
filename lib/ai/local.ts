import "server-only";

// Server-only client for a locally hosted model behind an OpenAI-compatible
// API. Ollama, LM Studio, llama.cpp's llama-server, and vLLM all expose
// /v1/chat/completions and /v1/models, so one client covers all of them.
// Nothing sent through here leaves the machine the model runs on.

const BASE_URL = (process.env.LOCAL_LLM_BASE_URL || "http://localhost:11434/v1").replace(/\/+$/, "");
const API_KEY = process.env.LOCAL_LLM_API_KEY || "local";
const CONFIGURED_MODEL = process.env.LOCAL_LLM_MODEL || "";
const TIMEOUT_MS = Number(process.env.LOCAL_LLM_TIMEOUT_MS) || 300_000;

export class LocalModelError extends Error {
  constructor(
    message: string,
    readonly status: number = 502,
  ) {
    super(message);
  }
}

export interface ChatRequest {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface ModelStatus {
  ok: boolean;
  baseUrl: string;
  model: string | null;
  available: string[];
  error?: string;
}

function headers(): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` };
}

function withTimeout(signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

async function request(path: string, init: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers: headers() });
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
      throw new LocalModelError("The local model took too long or the request was cancelled.", 504);
    }
    throw new LocalModelError(
      `Can't reach the local model server at ${BASE_URL}. Start it (e.g. \`ollama serve\`) or set LOCAL_LLM_BASE_URL in .env.local.`,
      503,
    );
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new LocalModelError(
      `Local model server returned ${res.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`,
    );
  }
  return res;
}

async function listModels(): Promise<string[]> {
  const res = await request("/models", { method: "GET", signal: AbortSignal.timeout(5_000) });
  const body = (await res.json()) as { data?: { id: string }[] };
  return (body.data ?? []).map((m) => m.id);
}

let resolvedModel: string | null = CONFIGURED_MODEL || null;

/** LOCAL_LLM_MODEL if set, otherwise the first model the server reports. */
async function resolveModel(): Promise<string> {
  if (resolvedModel) return resolvedModel;
  const models = await listModels();
  if (models.length === 0) {
    throw new LocalModelError(
      "The local model server has no models loaded. Pull one first (e.g. `ollama pull qwen3:8b`).",
      503,
    );
  }
  resolvedModel = models[0];
  return resolvedModel;
}

export async function getModelStatus(): Promise<ModelStatus> {
  try {
    const available = await listModels();
    const model = CONFIGURED_MODEL || available[0] || null;
    const missing = CONFIGURED_MODEL && !available.includes(CONFIGURED_MODEL);
    return {
      ok: Boolean(model) && !missing,
      baseUrl: BASE_URL,
      model,
      available,
      error: missing
        ? `LOCAL_LLM_MODEL "${CONFIGURED_MODEL}" isn't loaded on the server.`
        : model
          ? undefined
          : "No models loaded.",
    };
  } catch (error) {
    return {
      ok: false,
      baseUrl: BASE_URL,
      model: CONFIGURED_MODEL || null,
      available: [],
      error: error instanceof Error ? error.message : "Unknown error.",
    };
  }
}

// Reasoning models (Qwen3, DeepSeek-R1, etc.) may emit <think>...</think>
// inline before the answer. Teachers only want the answer.
const THINK_OPEN = "<think>";
const THINK_CLOSE = "</think>";

/**
 * Stateful filter that removes <think> blocks from a token stream, even when
 * a tag is split across chunks.
 */
export function createThinkFilter() {
  let buffer = "";
  let inThink = false;
  let started = false;

  function emit(text: string): string {
    if (!started) {
      text = text.replace(/^\s+/, "");
      if (text) started = true;
    }
    return text;
  }

  return {
    push(chunk: string): string {
      buffer += chunk;
      let out = "";
      while (buffer) {
        if (inThink) {
          const end = buffer.indexOf(THINK_CLOSE);
          if (end === -1) {
            buffer = buffer.slice(-(THINK_CLOSE.length - 1));
            return emit(out);
          }
          buffer = buffer.slice(end + THINK_CLOSE.length);
          inThink = false;
          continue;
        }
        const start = buffer.indexOf(THINK_OPEN);
        if (start !== -1) {
          out += buffer.slice(0, start);
          buffer = buffer.slice(start + THINK_OPEN.length);
          inThink = true;
          continue;
        }
        // Hold back a tail that could be the start of a split "<think>".
        let keep = 0;
        for (let n = Math.min(THINK_OPEN.length - 1, buffer.length); n > 0; n--) {
          if (THINK_OPEN.startsWith(buffer.slice(-n))) {
            keep = n;
            break;
          }
        }
        out += buffer.slice(0, buffer.length - keep);
        buffer = buffer.slice(buffer.length - keep);
        break;
      }
      return emit(out);
    },
    flush(): string {
      const rest = inThink ? "" : buffer;
      buffer = "";
      return emit(rest);
    },
  };
}

export function stripThinking(text: string): string {
  const filter = createThinkFilter();
  return (filter.push(text) + filter.flush()).trim();
}

/** Streams the model's answer as plain UTF-8 text. */
export async function streamChat(req: ChatRequest): Promise<ReadableStream<Uint8Array>> {
  const model = await resolveModel();
  const res = await request("/chat/completions", {
    method: "POST",
    signal: withTimeout(req.signal),
    body: JSON.stringify({
      model,
      stream: true,
      temperature: req.temperature ?? 0.6,
      max_tokens: req.maxTokens ?? 4096,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
    }),
  });
  if (!res.body) throw new LocalModelError("Local model returned an empty stream.");

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  const encoder = new TextEncoder();
  const filter = createThinkFilter();
  let pending = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const tail = filter.flush();
          if (tail) controller.enqueue(encoder.encode(tail));
          controller.close();
          return;
        }
        pending += value;
        const lines = pending.split("\n");
        pending = lines.pop() ?? "";
        let out = "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data) as {
              choices?: { delta?: { content?: string | null } }[];
            };
            // Only `content`; servers that split reasoning into a separate
            // field (`reasoning`, `reasoning_content`) are ignored on purpose.
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) out += filter.push(content);
          } catch {
            // Ignore keep-alives and malformed lines.
          }
        }
        if (out) {
          controller.enqueue(encoder.encode(out));
          return;
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}

async function completeChat(
  req: ChatRequest & { messages?: { role: string; content: string }[]; schema?: object },
): Promise<string> {
  const model = await resolveModel();
  const res = await request("/chat/completions", {
    method: "POST",
    signal: withTimeout(req.signal),
    body: JSON.stringify({
      model,
      stream: false,
      temperature: req.temperature ?? 0.3,
      max_tokens: req.maxTokens ?? 4096,
      messages: req.messages ?? [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
      ...(req.schema && {
        response_format: {
          type: "json_schema",
          json_schema: { name: "output", strict: true, schema: req.schema },
        },
      }),
    }),
  });
  const body = (await res.json()) as { choices?: { message?: { content?: string | null } }[] };
  return stripThinking(body.choices?.[0]?.message?.content ?? "");
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object found in the model output.");
  return JSON.parse(candidate.slice(start, end + 1));
}

/**
 * Asks for JSON matching `schema` (constrained decoding where the server
 * supports it), then validates. Smaller models sometimes slip, so one repair
 * round-trip is attempted before giving up.
 */
export async function generateJson<T>(
  req: ChatRequest & { schema: object; validate: (value: unknown) => T },
): Promise<T> {
  const first = await completeChat(req);
  try {
    return req.validate(extractJson(first));
  } catch (error) {
    const reason = error instanceof Error ? error.message : "invalid JSON";
    const repaired = await completeChat({
      ...req,
      temperature: 0,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
        { role: "assistant", content: first },
        {
          role: "user",
          content: `That output was not usable (${reason}). Reply again with ONLY the corrected JSON object — no prose, no code fences.`,
        },
      ],
    });
    try {
      return req.validate(extractJson(repaired));
    } catch (retryError) {
      throw new LocalModelError(
        `The model didn't return valid structured output (${
          retryError instanceof Error ? retryError.message : "invalid JSON"
        }). Try again, or use a larger model.`,
      );
    }
  }
}
