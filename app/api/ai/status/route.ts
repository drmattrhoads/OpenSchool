import { getModelStatus } from "@/lib/ai/local";

export async function GET() {
  return Response.json(await getModelStatus(), { headers: { "Cache-Control": "no-store" } });
}
