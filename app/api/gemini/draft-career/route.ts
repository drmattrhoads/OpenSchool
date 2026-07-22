import { draftCareer } from "@/lib/gemini";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { jobTitle, fieldLabel } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof jobTitle !== "string" ||
    typeof fieldLabel !== "string" ||
    !jobTitle.trim() ||
    !fieldLabel.trim()
  ) {
    return Response.json(
      { error: "jobTitle and fieldLabel are both required." },
      { status: 400 },
    );
  }

  try {
    const draft = await draftCareer({ jobTitle, fieldLabel });
    return Response.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
