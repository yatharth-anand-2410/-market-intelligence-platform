import { GoogleGenAI } from "@google/genai";
import { CATEGORIES } from "../types";

export interface GeminiClient {
  /** Step 1: Google Search grounded answer. */
  grounded(query: string): Promise<{ text: string; sourceUrls: string[]; sourceHosts: string[] }>;
  /** Step 2: tool-free structured extraction from the grounded text. */
  extract(text: string, sourceUrls: string[]): Promise<unknown>;
}

export const MODEL = "gemini-2.5-flash";

const SCHEMA = {
  type: "object",
  properties: {
    businesses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string", enum: [...CATEGORIES] },
          locality: { type: "string" },
          website: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          summary: { type: "string" },
          signals: {
            type: "object",
            properties: {
              relevance: { type: "integer" },
              projectActivity: { type: "integer" },
              evidence: { type: "integer" },
              requirement: { type: "integer" },
            },
            required: ["relevance", "projectActivity", "evidence", "requirement"],
          },
          facts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" },
                sourceUrls: { type: "array", items: { type: "string" } },
              },
              required: ["label", "value", "sourceUrls"],
            },
          },
          sourceUrls: { type: "array", items: { type: "string" } },
        },
        required: ["name", "category", "locality", "summary", "signals", "facts", "sourceUrls"],
      },
    },
  },
  required: ["businesses"],
} as const;

const looksLikeHost = (s?: string) => !!s && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(s);

export function createGeminiClient(apiKey: string): GeminiClient {
  const ai = new GoogleGenAI({ apiKey });
  return {
    async grounded(query) {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents:
          `You are a B2B market researcher for a plywood, timber, hardware and door (brand: Archwood) business in Varanasi, India. ` +
          `Using web search, answer: ${query}\n` +
          `List real businesses with locality, website and any publicly listed contact details, and note the project activity. ` +
          `Only report what sources say; say when something is unknown.`,
        config: { tools: [{ googleSearch: {} }] },
      });
      const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sourceUrls: string[] = [];
      const sourceHosts: string[] = [];
      for (const c of chunks) {
        if (c.web?.uri) sourceUrls.push(c.web.uri);
        if (looksLikeHost(c.web?.title)) sourceHosts.push(c.web!.title!.toLowerCase());
      }
      return { text: res.text ?? "", sourceUrls, sourceHosts };
    },
    async extract(text, sourceUrls) {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents:
          `Extract businesses from this research text into JSON. category must be one of: ${CATEGORIES.join(", ")}. ` +
          `signals are integers 0-5 (relevance to a plywood/door seller, projectActivity, evidence strength, requirement potential). ` +
          `For each fact, put only URLs that appear in the text or in this list in sourceUrls; use [] when unsourced.\n` +
          `Known source URLs: ${sourceUrls.join(", ")}\n\nTEXT:\n${text}`,
        config: { responseMimeType: "application/json", responseJsonSchema: SCHEMA },
      });
      return JSON.parse(res.text ?? "null");
    },
  };
}
