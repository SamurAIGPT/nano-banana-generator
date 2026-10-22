import config from "@/lib/config";
import { UserService } from "./user";
import { prisma } from "@/lib/prisma";
import { buildMuapiWebhookUrl, createMuapiWebhookToken, hashMuapiWebhookToken } from "./muapi-webhook";

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
      default: return 1;
    }
  },

  /**
   * Execute a generation quest using muapi.ai
   */
  async generate(userId, { prompt, aspect_ratio = "1:1", resolution = "1k", google_search = false, customApiKey = null }) {
    const isUsingCustomKey = Boolean(customApiKey && customApiKey.trim().length > 0);
    const cost = isUsingCustomKey ? 0 : this.getCreditCost(resolution);

    if (!isUsingCustomKey && cost > 0) {
      await UserService.deductCredits(userId, cost);
    }

    const apiKey = isUsingCustomKey ? customApiKey.trim() : config.ai.banana.apiKey;
    if (!apiKey) throw new Error("NANO_BANANA_API_KEY is not configured");

    const creationModel = prisma.creation || prisma.Creation;
    if (!creationModel) throw new Error("Creation model is not available");
    const webhookToken = createMuapiWebhookToken();
    const creation = await creationModel.create({
      data: {
        userId,
        prompt,
        aspectRatio: aspect_ratio,
        resolution,
        status: "processing",
        webhookTokenHash: hashMuapiWebhookToken(webhookToken),
      }
    });

    const webhookUrl = buildMuapiWebhookUrl(config.auth.webhook_url, webhookToken);
    const submitUrl = `https://api.muapi.ai/api/v1/nano-banana-2?webhook=${encodeURIComponent(webhookUrl)}`;
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
      await creationModel.deleteMany({ where: { id: creation.id, status: "processing", requestId: null } });
      throw new Error(`API Submission Failed: ${submitRes.status} ${errorText}`);
    }

    const { request_id } = await submitRes.json();
    if (!request_id) throw new Error("No request_id received from API");

    await creationModel.update({
      where: { id: creation.id },
      data: { requestId: request_id }
    });

    return { request_id };
  },

  /**
   * Execute an edit quest using muapi.ai
   */
  async edit(userId, { prompt, images_list = [], aspect_ratio = "Auto", google_search = false, resolution = "1k", customApiKey = null }) {
    const isUsingCustomKey = Boolean(customApiKey && customApiKey.trim().length > 0);
    const cost = isUsingCustomKey ? 0 : this.getCreditCost(resolution);

    if (!isUsingCustomKey && cost > 0) {
      await UserService.deductCredits(userId, cost);
    }

    const apiKey = isUsingCustomKey ? customApiKey.trim() : config.ai.banana.apiKey;
    if (!apiKey) throw new Error("NANO_BANANA_API_KEY is not configured");

    const creationModel = prisma.creation || prisma.Creation;
    if (!creationModel) throw new Error("Creation model is not available");
    const webhookToken = createMuapiWebhookToken();
    const creation = await creationModel.create({
      data: {
        userId,
        prompt,
        aspectRatio: aspect_ratio,
        resolution,
        status: "processing",
        webhookTokenHash: hashMuapiWebhookToken(webhookToken),
      }
    });

    const webhookUrl = buildMuapiWebhookUrl(config.auth.webhook_url, webhookToken);
    const submitUrl = `https://api.muapi.ai/api/v1/nano-banana-2-edit?webhook=${encodeURIComponent(webhookUrl)}`;
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
      await creationModel.deleteMany({ where: { id: creation.id, status: "processing", requestId: null } });
      throw new Error(`API Submission Failed: ${submitRes.status} ${errorText}`);
    }

    const { request_id } = await submitRes.json();
    if (!request_id) throw new Error("No request_id received from API");

    await creationModel.update({
      where: { id: creation.id },
      data: { requestId: request_id }
    });

    return { request_id };
  },

  /**
   * Check status of a request and save to DB on completion
   */
  async checkStatus(requestId, userId, metadata, customApiKey = null) {
    const creationModel = prisma.creation || prisma.Creation;
    if (!creationModel) return { status: "processing" };

    const creation = await creationModel.findUnique({
      where: { requestId }
    });

    if (!creation) {
      return { status: "processing" };
    }

    if (creation.status === "completed") {
      return { status: "completed", imageUrl: creation.imageUrl };
    }

    if (creation.status === "failed") {
      throw new Error(creation.error || "Generation failed.");
    }

    // Fallback: poll the external API if the webhook has not updated the database
    const apiKey = (customApiKey && customApiKey.trim().length > 0) ? customApiKey.trim() : config.ai.banana.apiKey;
    if (apiKey) {
      try {
        const pollRes = await fetch(`https://api.muapi.ai/api/v1/predictions/${requestId}/result`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
          }
        });

        if (pollRes.ok) {
          const pollJson = await pollRes.json();
          const state = pollJson.status || pollJson.state;

          if (state === "completed" || state === "succeeded") {
            const outputs = pollJson.outputs || [];
            const imageUrl = outputs[0] || (typeof pollJson.output === "string" ? pollJson.output : pollJson.output?.urls?.get);
            if (imageUrl) {
              const updated = await creationModel.update({
                where: { id: creation.id },
                data: {
                  status: "completed",
                  imageUrl
                }
              });
              return { status: "completed", imageUrl: updated.imageUrl };
            }
          } else if (state === "failed") {
            const errorMsg = pollJson.error || "Generation failed";
            await creationModel.update({
              where: { id: creation.id },
              data: {
                status: "failed",
                error: errorMsg
              }
            });
            throw new Error(errorMsg);
          }
        }
      } catch (err) {
        console.error("Error polling external status:", err);
      }
    }

    return { status: "processing" };
  }
};
