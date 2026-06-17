import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchAndGenerateNewsletter } from "@/lib/ai";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await db.ensure();
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const automation = db.getAutomation(id, session.userId);
  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    // Get user's Gemini API key
    const geminiKey = db.getGeminiApiKey(session.userId);
    if (!geminiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Go to your Dashboard and add your API key to get started." },
        { status: 400 }
      );
    }

    // Google Search (Gemini 2.0 Flash) → Gemma 4 newsletter pipeline
    const newsletter = await searchAndGenerateNewsletter(
      automation.topic_prompt as string,
      automation.perspective as string,
      automation.categories as string[],
      geminiKey,
      (automation.length as string) || "standard"
    );

    const saved = db.createNewsletter(id, {
      title: newsletter.title,
      summary_html: newsletter.summaryHtml,
      sources: newsletter.sources,
      article_hashes: newsletter.sources.map((s) => {
        const crypto = require("crypto");
        return crypto.createHash("sha256").update(s.url).digest("hex").slice(0, 16);
      }),
    });

    return NextResponse.json({ newsletter: saved }, { status: 201 });
  } catch (e) {
    console.error("Newsletter generation failed:", e);
    let message = "Generation failed";
    if (e instanceof Error) {
      if (e.message.includes("API_KEY_INVALID") || e.message.includes("API key not valid")) {
        message = "Invalid Gemini API key. Please update your key on the Dashboard.";
      } else {
        message = e.message;
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
