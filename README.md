# OpenSchool

Two apps share this Next.js codebase:

| Route | What it is | AI |
|---|---|---|
| `/tools` | **OpenSchool teacher tools.** A MagicSchool/Brisk-style toolkit (lesson plans, quizzes, rubrics, text leveling, feedback, family emails, and more). | A **local model** through any OpenAI-compatible server. Nothing leaves your machine. |
| `/`, `/careers`, `/explore`, `/pathways`, `/wizard` | **E2C Pathways.** A bilingual map from adult-ed classes to careers in North San Diego County. | None, except the staff-only `/admin/content-assistant`, which uses Gemini. |

## Quick start (teacher tools on a local model)

1. **Run a model server.** [Ollama](https://ollama.com) is the easiest:

   ```bash
   ollama pull qwen3:8b          # or a bigger Qwen model if your hardware allows; see below
   ollama serve                  # if it isn't already running
   ```

   LM Studio, llama.cpp (`llama-server`), and vLLM work too. They all expose `/v1/chat/completions`.

2. **Configure** (optional, since the defaults target Ollama on localhost):

   ```bash
   cp .env.example .env.local    # then set LOCAL_LLM_MODEL / LOCAL_LLM_BASE_URL
   ```

3. **Run the app:**

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000/tools. The badge in the top-right shows which model is connected.

## Picking a model

| Hardware (VRAM / unified memory) | Suggested size | Notes |
|---|---|---|
| 8 GB | ~4B (Q4) | Fine for emails, exit tickets, and report comments. Quizzes lean on the JSON repair retry. |
| 12–16 GB | 8–14B (Q4) | A good default. Handles every tool. |
| 24 GB+ / 32 GB+ Mac | ~27–32B dense (Q4) | Best quality for lesson/unit plans, leveling, and writing feedback. |

Use the exact tag your server lists (`ollama list`) for `LOCAL_LLM_MODEL`.

**Context length matters.** Ollama's default context window is small. Pasting a long passage into
the Text Leveler, Quiz, or Writing Feedback tools can be **silently truncated**. Raise it with
`OLLAMA_CONTEXT_LENGTH=16384 ollama serve` (or `num_ctx` in a Modelfile).

**Thinking models.** Qwen3-style `<think>…</think>` reasoning is stripped from output
automatically. Reasoning makes responses slower. For faster drafts, use a non-thinking or
"instruct" variant, or turn thinking off in your server.

## How the toolkit is built

```
lib/ai/local.ts          server-only OpenAI-compatible client: streaming, <think> stripping,
                         JSON-schema output with one validate-and-repair retry, status check
lib/tools/catalog.ts     client-safe tool registry: metadata + form fields + input validation
lib/tools/prompts.ts     server-only prompt builders, written for small models
app/api/tools/[toolId]   one POST route for every tool (streams Markdown, or returns quiz JSON)
app/api/ai/status        which model is connected
app/tools/…              catalog page + generic tool page
components/tools/…       ToolRunner (form → stream → Markdown), QuizView, ModelStatus
```

**To add a tool:** add an entry to `TOOLS` in `lib/tools/catalog.ts`, then add a prompt builder
with the same `id` in `lib/tools/prompts.ts`. The form, route, and page are generated from the
registry, so no new UI code is needed.

## Security notes

- The `/tools` and `/admin` routes have **no authentication**. That's fine on a teacher's laptop.
  Put the app behind SSO before hosting it for a school or district.
- Keeping the model local keeps student work out of third-party AI services, which simplifies
  FERPA/COPPA review. Tools that take student work still remind teachers to remove names.
