import config from "@/lib/config";
import { UserService } from "./user";
import { prisma } from "@/lib/prisma";

/**
 * Service to manage AI generations and interactions.
 */
/**
 * Service to manage AI generations and interactions.
 */
export const AIService = {
  /**
   * Calculate credit cost based on resolution
   */
  getCreditCost(resolution) {
    switch (resolution) {
      case "2k": return 18;
      case "4k": return 24;
      case "1k":
      default: return 12;
    }
  },

  /**
   * Execute a generation quest using muapi.ai
   */
  async generate(userId, { prompt, aspect_ratio = "1:1", resolution = "1k", google_search = false }) {
    const cost = this.getCreditCost(resolution);
    await UserService.deductCredits(userId, cost);

    const apiKey = config.ai.banana.apiKey;
    if (!apiKey) throw new Error("NANO_BANANA_API_KEY is not configured");

    const submitUrl = "https://api.muapi.ai/api/v1/nano-banana-2";
    const submitRes = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio,
        resolution,
        google_search,
        output_format: "jpg",
      }),
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text();
      throw new Error(`API Submission Failed: ${submitRes.status} ${errorText}`);
    }

    const { request_id } = await submitRes.json();
    if (!request_id) throw new Error("No request_id received from API");

    return { request_id };
  },

  /**
   * Execute an edit quest using muapi.ai
   */
  async edit(userId, { prompt, images_list = [], aspect_ratio = "Auto", google_search = false, resolution = "1k" }) {
    const cost = this.getCreditCost(resolution);
    await UserService.deductCredits(userId, cost);

    const apiKey = config.ai.banana.apiKey;
    if (!apiKey) throw new Error("NANO_BANANA_API_KEY is not configured");

    const submitUrl = "https://api.muapi.ai/api/v1/nano-banana-2-edit";
    const submitRes = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        prompt,
        images_list,
        aspect_ratio,
        google_search,
        resolution,
      }),
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text();
      throw new Error(`API Submission Failed: ${submitRes.status} ${errorText}`);
    }

    const { request_id } = await submitRes.json();
    if (!request_id) throw new Error("No request_id received from API");

    return { request_id };
  },

  /**
   * Check status of a request and save to DB on completion
   */
  async checkStatus(requestId, userId, metadata) {
    const apiKey = config.ai.banana.apiKey;
    const resultUrl = `https://api.muapi.ai/api/v1/predictions/${requestId}/result`;

    const pollRes = await fetch(resultUrl, {
      headers: { "x-api-key": apiKey },
    });

    if (!pollRes.ok) {
      throw new Error(`Status check failed: ${pollRes.status}`);
    }

    const result = await pollRes.json();
    const { status, outputs, error } = result;

    if (status === "completed") {
      const imageUrl = outputs[0];

      const creationModel = prisma.creation || prisma.Creation;
      if (creationModel) {
        await creationModel.create({
          data: {
            userId,
            prompt: metadata.prompt || "",
            imageUrl,
            aspectRatio: metadata.aspect_ratio || "1:1",
            resolution: metadata.resolution || "1k",
          }
        });
      }

      return { status: "completed", imageUrl };
    }

    if (status === "failed") {
      throw new Error(error || "Generation failed.");
    }

    return { status: "processing" };
  }
};
