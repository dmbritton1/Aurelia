import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  await db.ensure();
  const { code } = await params;
  const automation = db.getAutomationByShareCode(code);
  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owner = db.getUserById(automation.user_id as string);

  return NextResponse.json({
    template: {
      name: automation.name,
      topic_prompt: automation.topic_prompt,
      categories: automation.categories,
      perspective: automation.perspective,
      length: automation.length || "standard",
      frequency: automation.frequency,
      created_by: owner?.name || "Anonymous",
    },
  });
}
