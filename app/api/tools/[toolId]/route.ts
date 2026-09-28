import { getTool, validateToolValues } from "@/lib/tools/catalog";
import { buildMarkdownPrompt, buildQuizPrompt, QUIZ_SCHEMA, validateQuiz } from "@/lib/tools/prompts";
import { generateJson, LocalModelError, streamChat } from "@/lib/ai/local";

// Local models can be slow on modest hardware; don't let a platform default cut them off.
export const maxDuration = 300;

function errorResponse(error: unknown) {
  const status = error instanceof LocalModelError ? error.status : 502;
  const message = error instanceof Error ? error.message : "The local model request failed.";
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request, { params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = await params;
  const tool = getTool(toolId);
  if (!tool) return Response.json({ error: "Unknown tool." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const checked = validateToolValues(tool, (body as { values?: unknown } | null)?.values);
  if ("error" in checked) return Response.json({ error: checked.error }, { status: 400 });
  const { values } = checked;

  try {
    if (tool.output === "quiz") {
      const prompt = buildQuizPrompt(values);
      const expected = Number(values.count) || 5;
      const quiz = await generateJson({
        ...prompt,
        schema: QUIZ_SCHEMA,
        validate: (value) => validateQuiz(value, expected),
        signal: request.signal,
      });
      return Response.json({ quiz });
    }

    const prompt = buildMarkdownPrompt(tool.id, values);
    if (!prompt) return Response.json({ error: "This tool has no prompt yet." }, { status: 500 });

    // Passing the request signal means closing the tab or pressing Stop
    // also stops generation on the local GPU.
    const stream = await streamChat({ ...prompt, signal: request.signal });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
