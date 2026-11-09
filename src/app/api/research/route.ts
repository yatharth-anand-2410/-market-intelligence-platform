import { handleResearch } from "@/lib/api/handlers";
import { createRateLimiter } from "@/lib/rate-limit";
import { runResearch } from "@/lib/research";
import { createGeminiClient } from "@/lib/research/gemini";

const limiter = createRateLimiter();

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  return handleResearch(req, {
    apiKey,
    limiter,
    now: () => Date.now(),
    run: (q) => runResearch(q, createGeminiClient(apiKey!)),
  });
}
