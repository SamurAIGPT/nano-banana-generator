"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import {
  FaBolt,
  FaMagic,
  FaSearch,
  FaChevronDown,
  FaDownload,
  FaExpand,
  FaPlus,
  FaTrash,
  FaImages,
  FaSyncAlt,
} from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { downloadImage } from "@/lib/utils";

const ASPECT_RATIOS = [
  { label: "1:1 Square", value: "1:1" },
  { label: "16:9 Landscape", value: "16:9" },
  { label: "9:16 Portrait", value: "9:16" },
  { label: "4:3 Classic", value: "4:3" },
  { label: "3:4 Classic", value: "3:4" },
  { label: "3:2 Photo", value: "3:2" },
  { label: "2:3 Photo", value: "2:3" },
  { label: "21:9 UltraWide", value: "21:9" },
  { label: "9:21 UltraPortrait", value: "9:21" },
  { label: "4:5 Portrait", value: "4:5" },
  { label: "5:4 Portrait", value: "5:4" },
  { label: "Auto Detect", value: "Auto" },
];

const RESOLUTIONS = [
  { value: "1k", cost: 12 },
  { value: "2k", cost: 18 },
  { value: "4k", cost: 24 },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Mode State: only 'generate' for ComfyUI
  const [mode, setMode] = useState("generate");

  // UI State
  const [isRatioOpen, setIsRatioOpen] = useState(false);
  const ratioRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  // Google Search toggle
  const [googleSearch, setGoogleSearch] = useState(false);

  // Form State
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  
  // ComfyUI generation parameters
  const [steps, setSteps] = useState(20);
  const [cfg, setCfg] = useState(7);
  const [sampler, setSampler] = useState("euler");
  const [scheduler, setScheduler] = useState("karras");
  
  const [imagesList, setImagesList] = useState([]); // Max 14 URLs (for edit mode, not used)
  const [newImageUrl, setNewImageUrl] = useState("");

  // Generation State
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (ratioRef.current && !ratioRef.current.contains(event.target)) {
        setIsRatioOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addImageToList = () => {
    if (newImageUrl && imagesList.length < 14) {
      setImagesList([...imagesList, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload only PNG, JPG, or JPEG images.");
      return;
    }

    if (!session) {
      signIn();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed.");
      }

      const data = await res.json();
      if (data.url && imagesList.length < 14) {
        setImagesList([...imagesList, data.url]);
      }
    } catch (err) {
      setError("Failed to upload image. Try a URL instead.");
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImageFromList = (index) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    // Guest Guard
    if (!session) {
      signIn();
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResultUrl(null);
      setStatusMessage("INITIATING GENERATION...");

      const res = await fetch("/api/banana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          prompt,
          negativePrompt,
          aspect_ratio: aspectRatio.value,
          resolution: resolution.value,
          steps,
          cfg,
          sampler,
          scheduler,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate request.");
      }

      // Start Polling
      const { request_id, metadata } = data;
      await pollStatus(request_id, metadata);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      console.error(err);
      setLoading(false);
    }
  };

  const pollStatus = async (requestId, metadata) => {
    setStatusMessage("PROCESSING [SYNCING WITH ENGINE]...");

    try {
      const res = await fetch("/api/banana/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, metadata }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Status check failed.");
      }

      if (data.status === "completed") {
        setResultUrl(data.imageUrl);
        setStatusMessage("");
        setLoading(false);
      } else if (data.status === "failed") {
        throw new Error(data.error || "Generation failed.");
      } else {
        setTimeout(() => pollStatus(requestId, metadata), 3000);
      }
    } catch (err) {
      setError(err.message || "An error occurred during verification.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row flex-1 h-full w-full overflow-y-auto lg:overflow-hidden">
      <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-r border-glass-border bg-glass-bg backdrop-blur-3xl flex flex-col shrink-0 h-auto lg:h-full lg:overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-glass-border space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-black tracking-tight text-foreground drop-shadow-sm">
              ENGINE CORE
            </h2>
            <p className="text-[10px] text-muted font-medium uppercase tracking-[0.2em]">
              Variable Kinetic Input
            </p>
          </div>

          <div className="flex p-1 bg-glass-hover rounded-lg border border-glass-border">
            <button
              onClick={() => setMode("generate")}
              className="flex-1 py-2 rounded-md text-[10px] font-semibold uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-[var(--solid-bg)] text-foreground drop-shadow-sm shadow-md ring-1 ring-glass-border"
            >
              <FaMagic className="text-xs" /> Generate
            </button>
            <button
              disabled
              className="flex-1 py-2 rounded-md text-[10px] font-semibold uppercase tracking-widest text-muted/50 cursor-not-allowed opacity-50 flex items-center justify-center gap-2"
              title="Edit mode not yet supported with ComfyUI workflows"
            >
              <FaSyncAlt className="text-xs" /> Edit (Coming Soon)
            </button>
          </div>
        </div>
        <div className="flex-1 custom-scrollbar p-6 space-y-4">
          {/* Prompt Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground font-semibold flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full" /> Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cybernetic banana floating in space..."
              className="w-full h-24 bg-[var(--solid-bg)] bg-opacity-70 border border-glass-border rounded-lg p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:text-muted/60 text-foreground drop-shadow-sm"
            />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground font-semibold flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full" /> Negative Prompt (Optional)
            </label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Blur, low quality, distorted..."
              className="w-full h-20 bg-[var(--solid-bg)] bg-opacity-70 border border-glass-border rounded-lg p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:text-muted/60 text-foreground drop-shadow-sm"
            />
          </div>

          {/* ComfyUI Generation Parameters */}
          <div className="grid grid-cols-2 gap-3">
            {/* Steps */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground font-semibold flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" /> Steps
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full bg-glass-bg border border-glass-border rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-primary/50 text-foreground drop-shadow-sm"
              />
            </div>

            {/* CFG */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground font-semibold flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" /> CFG Scale
              </label>
              <input
                type="number"
                min="0.1"
                max="20"
                step="0.1"
                value={cfg}
                onChange={(e) => setCfg(Number(e.target.value))}
                className="w-full bg-glass-bg border border-glass-border rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-primary/50 text-foreground drop-shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Sampler */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground font-semibold flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" /> Sampler
              </label>
              <select
                value={sampler}
                onChange={(e) => setSampler(e.target.value)}
                className="w-full bg-glass-bg border border-glass-border rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-primary/50 text-foreground drop-shadow-sm"
              >
                <option value="euler">Euler</option>
                <option value="euler_ancestral">Euler Ancestral</option>
                <option value="heun">Heun</option>
                <option value="dpm_2">DPM 2</option>
                <option value="dpm_2_ancestral">DPM 2 Ancestral</option>
                <option value="lms">LMS</option>
                <option value="dpm_fast">DPM Fast</option>
                <option value="dpm_adaptive">DPM Adaptive</option>
                <option value="dpmpp_2s_ancestral">DPMpp 2S Ancestral</option>
                <option value="dpmpp_2m">DPMpp 2M</option>
                <option value="dpmpp_sde">DPMpp SDE</option>
                <option value="dpmpp_sde_gpu">DPMpp SDE GPU</option>
                <option value="uni_pc">Uni PC</option>
                <option value="uni_pc_bh2">Uni PC BH2</option>
              </select>
            </div>

            {/* Scheduler */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground font-semibold flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" /> Scheduler
              </label>
              <select
                value={scheduler}
                onChange={(e) => setScheduler(e.target.value)}
                className="w-full bg-glass-bg border border-glass-border rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-primary/50 text-foreground drop-shadow-sm"
              >
                <option value="normal">Normal</option>
                <option value="karras">Karras</option>
                <option value="exponential">Exponential</option>
                <option value="simple">Simple</option>
                <option value="ddim_uniform">DDIM Uniform</option>
              </select>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-3" ref={ratioRef}>
            <label className="text-xs font-medium text-foreground font-semibold flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full" /> Aspect
              Ratio
            </label>
            <div className="relative">
              <button
                onClick={() => setIsRatioOpen(!isRatioOpen)}
                className="w-full flex items-center justify-between p-3 bg-glass-bg border border-glass-border hover:bg-glass-hover shadow-sm rounded-lg text-xs font-semibold transition-all outline-none text-foreground backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <FaExpand className="text-primary" />
                  {aspectRatio.label}
                </div>
                <FaChevronDown
                  className={`text-[10px] transition-transform duration-300 ${isRatioOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isRatioOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-12 left-0 right-0 max-h-60 bg-[var(--solid-bg)] border border-glass-border rounded-lg overflow-y-auto custom-scrollbar shadow-2xl z-[100] p-1"
                  >
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => {
                          setAspectRatio(ratio);
                          setIsRatioOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg text-[10px] font-bold transition-all flex items-center gap-3 ${
                          aspectRatio.value === ratio.value
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-muted hover:bg-glass-hover hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 border ${aspectRatio.value === ratio.value ? "border-white" : "border-zinc-700"} rounded-sm`}
                        />
                        {ratio.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tiered Resolution */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-foreground font-semibold flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full" /> Resolution
            </label>
            <div className="flex gap-2">
              {RESOLUTIONS.map((res) => (
                <button
                  key={res.value}
                  onClick={() => setResolution(res)}
                  className={`flex-1 flex flex-col items-center py-3 rounded-lg border transition-all ${
                    resolution.value === res.value
                      ? "bg-primary border-primary/50 text-white shadow-lg shadow-primary/30"
                      : "bg-glass-bg border-glass-border text-muted hover:bg-glass-hover hover:text-foreground"
                  }`}
                >
                  <span className="text-sm font-semibold tracking-tight">
                    {res.value}
                  </span>
                  <span
                    className={`text-xs font-medium mt-1 ${resolution.value === res.value ? "text-white/80" : "opacity-60"}`}
                  >
                    {res.cost} Credits
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Google Search */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-foreground font-semibold flex items-center gap-2">
              <div className="w-1 h-1 bg-primary rounded-full" /> Google
              Search
            </label>
            <button
              onClick={() => setGoogleSearch(!googleSearch)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                googleSearch
                  ? "bg-primary border-primary/50 text-white shadow-md"
                  : "bg-glass-bg border-glass-border text-muted hover:bg-glass-bg"
              }`}
            >
              <div className="flex items-center gap-3">
                <FaSearch
                  className={googleSearch ? "text-white" : "text-muted"}
                />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Smart Search
                </span>
              </div>
              <div
                className={`w-8 h-4 rounded-full relative p-1 transition-colors flex items-center ${googleSearch ? "bg-primary" : "bg-[var(--solid-bg)] border border-glass-border opacity-70"}`}
              >
                <motion.div
                  animate={{ x: googleSearch ? 14 : 0 }}
                  className="w-2.5 h-2.5 rounded-full bg-white shadow-sm absolute left-1"
                />
              </div>
            </button>
          </div>
        </div>
        <div className="p-6 border-t border-glass-border">
          <button
            onClick={handleGenerate}
            disabled={
              loading ||
              (mode === "generate" && !prompt.trim()) ||
              (mode === "edit" && imagesList.length === 0)
            }
            className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg py-3.5 font-bold tracking-wider uppercase text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-xl shadow-primary/30 border border-primary/50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
            ) : (
              <FaBolt className="text-yellow-400" />
            )}
            {loading ? "PROCESSING..." : `Generate ${resolution.cost} Credits`}
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 relative flex flex-col bg-transparent overflow-hidden min-h-[50vh] lg:min-h-0 shrink-0">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[100%] h-[100%] bg-gradient-to-br from-primary/[0.03] to-secondary-500/[0.03]" />
          <div className="absolute top-1/4 left-1/4 w-[60%] h-[60%] bg-primary/[0.12] rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-secondary-500/[0.12] rounded-full blur-[120px]" />
        </div>

        <div className="flex-1 relative z-10 p-12 overflow-y-auto flex items-center justify-center custom-scrollbar">
          <AnimatePresence mode="wait">
            {!resultUrl && !loading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center space-y-8"
              >
                <div className="relative w-28 h-28 mx-auto group">
                  <div className="absolute inset-0 bg-primary/10 blur-[30px] rounded-full" />
                  <div className="relative w-full h-full bg-glass-bg border border-glass-border rounded-3xl flex items-center justify-center shadow-sm transition-transform duration-700 group-hover:rotate-12">
                    <FaMagic className="text-3xl text-slate-200" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold tracking-tight uppercase text-foreground drop-shadow-sm">
                    {mode === "generate"
                      ? "Engine Standby."
                      : "Reconfiguration Ready."}
                  </h2>
                  <p className="text-muted font-medium text-[10px] uppercase tracking-widest leading-loose">
                    {mode === "generate"
                      ? "Submit text parameters to manifest pixels."
                      : "Add visual nodes and adjust directives to edit."}
                  </p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center space-y-12"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-48 h-48 border-2 border-primary/10 rounded-full border-t-primary"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaBolt className="text-primary animate-pulse text-2xl" />
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-2xl font-black italic uppercase animate-pulse text-foreground drop-shadow-sm">
                    {statusMessage}
                  </div>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">
                    ESTIMATED EXTRACTION: 120.0s
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-sm w-full p-10 bg-red-500/[0.02] border-2 border-red-500/10 rounded-3xl text-center space-y-4"
              >
                <div className="text-red-500 font-black uppercase tracking-[0.4em] text-[10px]">
                  Processing Error
                </div>
                <p className="text-muted text-xs font-bold leading-loose text-center">
                  {typeof error === "string"
                    ? error
                    : "Verification failed. Check credits."}
                </p>
              </motion.div>
            )}

            {resultUrl && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group rounded-2xl overflow-hidden shadow-xl border border-glass-border"
              >
                <img src={resultUrl} className="max-h-[80vh] w-auto h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end">
                  <div className="flex items-end justify-between">
                    <div className="space-y-3">
                      <h3 className="text-white text-lg font-semibold tracking-tight truncate max-w-[300px] uppercase">
                        {prompt || "Result Manifest"}
                      </h3>
                      <div className="flex gap-3">
                        <div className="px-3 py-1.5 rounded-lg bg-glass-bg backdrop-blur-3xl text-[10px] font-semibold text-white">
                          {aspectRatio.label}
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-glass-bg backdrop-blur-3xl text-[10px] font-semibold text-white uppercase">
                          {resolution.value}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        setDownloading(true);
                        await downloadImage(resultUrl, `creation-${Date.now()}.jpg`);
                        setDownloading(false);
                      }}
                      disabled={downloading}
                      className="p-2 bg-glass-bg text-foreground drop-shadow-sm rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                    >
                      {downloading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiDownload className="text-lg" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
          border-radius: 10px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
      `}</style>
    </div>
  );
}
