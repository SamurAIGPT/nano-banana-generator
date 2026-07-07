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
      default: return 1;
    }
  },

  /**
   * Execute a generation quest using muapi.ai
   */
  async generate(userId, { prompt, aspect_ratio = "1:1", resolution = "1k", google_search = false }) {
    const cost = this.getCreditCost(resolution);
    await UserService.deductCredits(userId, cost);

    const comfyUrl = config.ai?.comfy?.submitUrl;
    if (comfyUrl) {
      // Try synchronous submission to local ComfyUI endpoint
      const submitRes = await fetch(comfyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio,
          resolution,
          google_search,
        }),
      });

      if (!submitRes.ok) {
        const errorText = await submitRes.text();
        throw new Error(`Comfy submission failed: ${submitRes.status} ${errorText}`);
      }

      let submitJson = null;
      try { submitJson = await submitRes.json(); } catch (e) { submitJson = null; }
      const request_id = submitJson?.request_id || submitJson?.id || null;
      const imageUrl = submitJson?.imageUrl || submitJson?.url || submitJson?.output || submitJson?.image || (submitJson?.data && submitJson.data.url) || null;
      const creationModel = prisma.creation || prisma.Creation;
      if (imageUrl && creationModel) {
        await creationModel.create({
          data: {
            userId,
            prompt,
            aspectRatio: aspect_ratio,
            resolution,
            requestId: request_id,
            status: "completed",
            imageUrl,
          }
        });
        return { request_id, imageUrl };
      } else if (request_id && creationModel) {
        await creationModel.create({
          data: {
            userId,
            prompt,
            aspectRatio: aspect_ratio,
            resolution,
            requestId: request_id,
            status: "processing",
          }
        });
        return { request_id };
      }
      // If comfy didn't return a usable result, fallthrough to existing provider logic
    }

    const apiKey = config.ai.banana.apiKey;
    if (!apiKey) throw new Error("NANO_BANANA_API_KEY is not configured");

    const webhookUrl = `${config.auth.webhook_url}/api/webhook/muapi`;
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
      throw new Error(`API Submission Failed: ${submitRes.status} ${errorText}`);
    }

    const { request_id } = await submitRes.json();
    if (!request_id) throw new Error("No request_id received from API");

    const creationModel = prisma.creation || prisma.Creation;
    if (creationModel) {
      await creationModel.create({
        data: {
          userId,
          prompt,
          aspectRatio: aspect_ratio,
          resolution,
          requestId: request_id,
          status: "processing",
        }
      });
    }

    return { request_id };
  },

  /**
   * Execute an edit quest using muapi.ai
   */
  async edit(userId, { prompt, images_list = [], aspect_ratio = "Auto", google_search = false, resolution = "1k" }) {
    const cost = this.getCreditCost(resolution);
    await UserService.deductCredits(userId, cost);

    const comfyUrl = config.ai?.comfy?.submitUrl;
    if (comfyUrl) {
      // Try synchronous submission to local ComfyUI endpoint for edits
      const submitRes = await fetch(comfyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(`Comfy submission failed: ${submitRes.status} ${errorText}`);
      }

      let submitJson = null;
      try { submitJson = await submitRes.json(); } catch (e) { submitJson = null; }
      const request_id = submitJson?.request_id || submitJson?.id || null;
      const imageUrl = submitJson?.imageUrl || submitJson?.url || submitJson?.output || submitJson?.image || (submitJson?.data && submitJson.data.url) || null;
      const creationModel = prisma.creation || prisma.Creation;
      if (imageUrl && creationModel) {
        await creationModel.create({
          data: {
            userId,
            prompt,
            aspectRatio: aspect_ratio,
            resolution,
            requestId: request_id,
            status: "completed",
            imageUrl,
          }
        });
        return { request_id, imageUrl };
      } else if (request_id && creationModel) {
        await creationModel.create({
          data: {
            userId,
            prompt,
            aspectRatio: aspect_ratio,
            resolution,
            requestId: request_id,
            status: "processing",
          }
        });
        return { request_id };
      }
      // fallthrough to existing provider if needed
    }

    const apiKey = config.ai.banana.apiKey;
    if (!apiKey) throw new Error("NANO_BANANA_API_KEY is not configured");

    const webhookUrl = `${config.auth.webhook_url}/api/webhook/muapi`;
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
      throw new Error(`API Submission Failed: ${submitRes.status} ${errorText}`);
    }

    const { request_id } = await submitRes.json();
    if (!request_id) throw new Error("No request_id received from API");

    const creationModel = prisma.creation || prisma.Creation;
    if (creationModel) {
      await creationModel.create({
        data: {
          userId,
          prompt,
          aspectRatio: aspect_ratio,
          resolution,
          requestId: request_id,
          status: "processing",
        }
      });
    }

    return { request_id };
  },

  /**
   * Check status of a request and save to DB on completion
   */
  async checkStatus(requestId, userId, metadata) {
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
    const comfyUrl = config.ai?.comfy?.submitUrl;
    const apiKey = config.ai.banana.apiKey;
    // Only poll Nano Banana if Comfy is not configured
    if (!comfyUrl && apiKey) {
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
