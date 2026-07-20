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

    const formData = await req.formData();
    const prompt = formData.get("prompt");
    const imageFile = formData.get("image");
    const steps = parseInt(formData.get("steps") || "20");
    const cfg = parseFloat(formData.get("cfg") || "1");
    const denoise = parseFloat(formData.get("denoise") || "1");
    const sampler = formData.get("sampler") || "euler";
    const scheduler = formData.get("scheduler") || "simple";

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // Read image file as buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const imageFilename = imageFile.name || "image.png";

    const result = await AIService.edit(session.user.id, {
      prompt,
      imageBuffer,
      filename: imageFilename,
      steps,
      cfg,
      denoise,
      sampler,
      scheduler,
    });

    return NextResponse.json({
      ...result,
      metadata: { prompt, steps, cfg, sampler, scheduler, denoise }
    });
  } catch (error) {
    if (error.message === "Insufficient credits") {
      return new NextResponse("Insufficient credits", { status: 403 });
    }
    console.error("[AI_COMFY_EDIT]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
