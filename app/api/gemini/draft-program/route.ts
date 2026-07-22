import { draftProgram } from "@/lib/gemini";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { realProgramName, schoolName, categoryLabel } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof realProgramName !== "string" ||
    typeof schoolName !== "string" ||
    typeof categoryLabel !== "string" ||
    !realProgramName.trim() ||
    !schoolName.trim() ||
    !categoryLabel.trim()
  ) {
    return Response.json(
      { error: "realProgramName, schoolName, and categoryLabel are all required." },
      { status: 400 },
    );
  }

  try {
    const draft = await draftProgram({ realProgramName, schoolName, categoryLabel });
    return Response.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini request failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
