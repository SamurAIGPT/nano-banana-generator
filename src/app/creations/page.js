"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaDownload,
  FaMagic,
  FaCalendarAlt,
  FaExpandAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { downloadImage } from "@/lib/utils";
import { FiDownload } from "react-icons/fi";

export default function CreationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCreations();
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  const fetchCreations = async () => {
    try {
      const res = await fetch("/api/creations");
      const data = await res.json();
      if (res.ok) {
        setCreations(data);
      }
    } catch (error) {
      console.error("Error fetching creations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto custom-scrollbar p-8 md:p-12">
      <header className="max-w-7xl mx-auto mb-10 space-y-3">
        <div className="flex items-center gap-3 text-indigo-500 mb-1">
          <FaCalendarAlt className="text-sm" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.4em]">
            Historical Archive
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
          MY CREATIONS
        </h1>
        <p className="text-zinc-500 font-medium text-xs uppercase tracking-widest leading-loose max-w-xl">
          Your generative legacy, manifested and stored.{" "}
          <br className="hidden md:block" />
          Quick access to your visual nodes.
        </p>
      </header>

      <div className="max-w-7xl mx-auto">
        {creations.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-8">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
              <FaMagic className="text-3xl text-slate-300" />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold italic">COLLECTION EMPTY</h3>
              <button
                onClick={() => router.push("/")}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl"
              >
                Start your first Manifestation
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {creations.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative rounded-xl bg-white border border-slate-200 aspect-square cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-shadow transition-all"
                  onClick={() => setSelectedImage(item)}
                >
                  <img
                    src={item.imageUrl}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={item.prompt}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-4 flex flex-col justify-end">
                    <p className="text-white text-xs font-semibold tracking-tight truncate mb-1">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-indigo-400 uppercase tracking-widest">
                        {item.aspectRatio}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                        <FaExpandAlt className="text-[10px]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Image Detail Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white/10 backdrop-blur-sm p-6 md:p-12 flex flex-col items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative max-w-6xl w-full h-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Side */}
              <div className="flex w-full md:w-[50%] h-[50%] md:h-full p-2 bg-slate-100 flex border-r border-slate-200">
                <img
                  src={selectedImage.imageUrl}
                  className="h-full w-full object-contain"
                  alt="Creation"
                />
              </div>

              {/* Details Side */}
              <div className="flex w-full md:w-[50%] h-[50%] md:h-full p-6 flex flex-col bg-white overflow-y-auto custom-scrollbar">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs text-zinc-500">
                      MANIFEST PARAMETERS
                    </div>
                    <p className="text-sm font-normal text-slate-900 leading-relaxed">
                      {selectedImage.prompt}
                    </p>
                  </div>

                  <div className="space-y-6 border-t border-white/5 pt-10">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1.5">
                        <div className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest">Ratio</div>
                        <div className="text-xs text-zinc-300">{selectedImage.aspectRatio}</div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest">Resolution</div>
                        <div className="text-xs text-slate-900 font-medium">{selectedImage.resolution || "1k"}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest">Timestamp</div>
                      <div className="text-[11px] text-zinc-400">
                        {new Date(selectedImage.createdAt).toLocaleString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-12">
                  <button
                    onClick={async () => {
                      setDownloading(true);
                      await downloadImage(selectedImage.imageUrl, `nano-banana-${selectedImage.id}.jpg`);
                      setDownloading(false);
                    }}
                    disabled={downloading}
                    className="w-full py-3 bg-slate-900 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:bg-black disabled:opacity-50 shadow-xl"
                  >
                    {downloading ? (
                      <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiDownload size={16} />
                    )}
                    {downloading ? "Extracting..." : "Download Piece"}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              >
                <span className="text-xl">✕</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        .custom-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
