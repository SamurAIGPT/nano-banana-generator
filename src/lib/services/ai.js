import config from "@/lib/config";
import { UserService } from "./user";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

/**
 * ComfyUI integration for image generation
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
   * Get resolution dimensions based on aspect ratio
   */
  getResolutionDimensions(resolution, aspectRatio) {
    const baseSize = {
      "1k": 512,
      "2k": 768,
      "4k": 1024,
    }[resolution] || 512;

    const [w, h] = aspectRatio.split(":").map(Number);
    const ratio = w / h;

    let width, height;
    if (ratio >= 1) {
      width = baseSize;
      height = Math.round(baseSize / ratio);
    } else {
      height = baseSize;
      width = Math.round(baseSize * ratio);
    }

    return { width, height };
  },

  /**
   * Load and customize ComfyUI workflow from environment config
   */
  async loadComfyWorkflow(prompt, negativePrompt, params = {}) {
    const workflowJson = config.ai?.comfy?.workflow;
    if (!workflowJson) {
      throw new Error("ComfyUI workflow not configured");
    }

    let workflow;
    try {
      workflow = typeof workflowJson === "string" ? JSON.parse(workflowJson) : workflowJson;
    } catch (err) {
      console.error("Failed to parse workflow JSON:", err);
      throw new Error("Invalid ComfyUI workflow JSON");
    }

    // Update positive prompt (usually node 6)
    if (workflow["6"]) {
      workflow["6"]["inputs"]["text"] = prompt;
    }

    // Update negative prompt (usually node 7)
    if (workflow["7"]) {
      workflow["7"]["inputs"]["text"] = negativePrompt;
    }

    // Update KSampler node (node 3) with generation parameters
    if (workflow["3"]) {
      workflow["3"]["inputs"]["seed"] = params.seed || Math.floor(Math.random() * 1000000000);
      workflow["3"]["inputs"]["steps"] = params.steps || 20;
      workflow["3"]["inputs"]["cfg"] = params.cfg || 7;
      workflow["3"]["inputs"]["sampler_name"] = params.sampler || "euler";
      workflow["3"]["inputs"]["scheduler"] = params.scheduler || "karras";
      workflow["3"]["inputs"]["denoise"] = 1.0; // Always 1.0 for text-to-image
    }

    // Update latent image dimensions (node 5)
    if (workflow["5"]) {
      workflow["5"]["inputs"]["width"] = params.width || 512;
      workflow["5"]["inputs"]["height"] = params.height || 512;
      workflow["5"]["inputs"]["batch_size"] = 1; // Single image
    }

    return workflow;
  },

  /**
   * Submit workflow to ComfyUI and get prompt ID
   */
  async submitComfyWorkflow(workflow, comfyServerUrl) {
    const payload = { prompt: workflow };
    const response = await fetch(`${comfyServerUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`ComfyUI submission failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    if (!data.prompt_id) {
      throw new Error("ComfyUI did not return a prompt_id");
    }
    return data.prompt_id;
  },

  /**
   * Poll ComfyUI history to check generation status and retrieve image URL
   */
  async pollComfyStatus(promptId, comfyServerUrl, maxAttempts = 120) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${comfyServerUrl}/history/${promptId}`);
        if (!response.ok) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        const history = await response.json();
        if (!history[promptId]) {
          // Prompt not yet in history, keep polling
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        const execution = history[promptId];

        // Check if execution completed
        if (execution.outputs && execution.status && execution.status.exec_info === "execution completed") {
          // Extract images from SaveImage node (usually node 9)
          const images = execution.outputs[9]?.images || [];
          if (images.length > 0) {
            const img = images[0];
            return {
              status: "completed",
              imageFilename: img.filename,
              imageSubfolder: img.subfolder || "outputs",
            };
          }
        }

        // Still processing, wait and retry
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        console.error("Poll error:", err);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    throw new Error("ComfyUI generation timeout after 4 minutes");
  },

  /**
   * Get image URL from ComfyUI server
   */
  getComfyImageUrl(comfyServerUrl, filename, subfolder = "outputs") {
    // ComfyUI /view endpoint returns the image directly
    return `${comfyServerUrl}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}`;
  },

  /**
   * Execute a generation quest using ComfyUI with workflow
   */
  async generate(userId, { prompt, negativePrompt = "", aspect_ratio = "1:1", resolution = "1k", steps = 20, cfg = 7, sampler = "euler", scheduler = "karras" }) {
    const cost = this.getCreditCost(resolution);
    await UserService.deductCredits(userId, cost);

    const comfyServerUrl = config.ai?.comfy?.serverUrl;
    if (!comfyServerUrl) {
      throw new Error("ComfyUI server URL not configured (COMFY_SERVER_URL)");
    }

    try {
      // Calculate resolution dimensions from aspect ratio
      const { width, height } = this.getResolutionDimensions(resolution, aspect_ratio);

      // Load and customize workflow
      const workflow = await this.loadComfyWorkflow(prompt, negativePrompt, {
        steps,
        cfg,
        sampler,
        scheduler,
        width,
        height,
      });

      // Submit workflow to ComfyUI
      const promptId = await this.submitComfyWorkflow(workflow, comfyServerUrl);

      // Create initial DB record with processing status
      const creationModel = prisma.creation || prisma.Creation;
      if (creationModel) {
        await creationModel.create({
          data: {
            userId,
            prompt,
            aspectRatio: aspect_ratio,
            resolution,
            requestId: promptId,
            status: "processing",
          }
        });
      }

      return { request_id: promptId };
    } catch (err) {
      console.error("ComfyUI generation error:", err);
      throw err;
    }
  },

  /**
   * Check status of a ComfyUI generation request
   */
  async checkStatus(requestId, userId, metadata) {
    const comfyServerUrl = config.ai?.comfy?.serverUrl;
    if (!comfyServerUrl) {
      return { status: "processing" };
    }

    const creationModel = prisma.creation || prisma.Creation;
    if (!creationModel) return { status: "processing" };

    try {
      const creation = await creationModel.findUnique({
        where: { requestId: requestId }
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

      // Poll ComfyUI for latest status
      try {
        const pollResult = await this.pollComfyStatus(requestId, comfyServerUrl);
        
        if (pollResult.status === "completed") {
          const { imageFilename, imageSubfolder } = pollResult;
          const viewUrl = this.getComfyImageUrl(comfyServerUrl, imageFilename, imageSubfolder);

          try {
            // Try downloading the image repeatedly because ComfyUI may expose the file slightly after history shows it.
            const maxAttempts = 40; // ~2 minutes at 3s interval
            const intervalMs = 3000;
            let buffer = null;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              try {
                const res = await fetch(viewUrl);
                if (res && res.ok) {
                  const arrayBuffer = await res.arrayBuffer();
                  if (arrayBuffer && arrayBuffer.byteLength > 0) {
                    buffer = Buffer.from(arrayBuffer);
                    break;
                  }
                }
              } catch (attemptErr) {
                // ignore and retry
              }

              // Wait before next attempt
              await new Promise((r) => setTimeout(r, intervalMs));
            }

            if (!buffer) throw new Error(`Failed to download image after ${maxAttempts} attempts`);

            const publicDir = path.join(process.cwd(), "public", "creations");
            if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

            // Prefix filename with requestId to avoid collisions
            const savedName = `${requestId}_${imageFilename}`;
            const savePath = path.join(publicDir, savedName);

            fs.writeFileSync(savePath, buffer);
            const publicUrl = `/creations/${savedName}`;

            const updated = await creationModel.update({
              where: { id: creation.id },
              data: {
                status: "completed",
                imageUrl: publicUrl,
              }
            });

            return { status: "completed", imageUrl: updated.imageUrl };
          } catch (downloadErr) {
            console.error("Failed to download/save image:", downloadErr);
            // Fallback: store comfy view URL so client can still fetch it
            const fallbackUrl = viewUrl;
            const updated = await creationModel.update({
              where: { id: creation.id },
              data: {
                status: "completed",
                imageUrl: fallbackUrl,
              }
            });
            return { status: "completed", imageUrl: updated.imageUrl };
          }
        }
      } catch (pollErr) {
        console.error("Error polling ComfyUI:", pollErr);
        // Return processing status if polling fails
        return { status: "processing" };
      }

      return { status: "processing" };
    } catch (err) {
      console.error("Error checking status:", err);
      throw err;
    }
  },

  /**
   * Edit is not supported in ComfyUI version yet (only generation)
   */
  async edit(userId, { prompt, images_list = [], aspect_ratio = "Auto", resolution = "1k" }) {
    throw new Error("Edit mode is not yet supported with ComfyUI. Please use Generate mode.");
  },
};
