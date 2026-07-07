import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/lib/services/ai";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      mode = "generate",
      prompt,
      negativePrompt = "",
      aspect_ratio = "1:1",
      resolution = "1k",
      steps = 20,
      cfg = 7,
      sampler = "euler",
      scheduler = "karras",
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // ComfyUI only supports generation, not edit mode
    if (mode === "edit") {
      return NextResponse.json({ error: "Edit mode is not yet supported" }, { status: 400 });
    }

    const result = await AIService.generate(session.user.id, {
      prompt,
      negativePrompt,
      aspect_ratio,
      resolution,
      steps,
      cfg,
      sampler,
      scheduler,
    });

    return NextResponse.json({
      ...result,
      metadata: { prompt, aspect_ratio, resolution, steps, cfg, sampler, scheduler }
    });
  } catch (error) {
    if (error.message === "Insufficient credits") {
      return new NextResponse("Insufficient credits", { status: 403 });
    }
    console.error("[AI_COMFY]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

