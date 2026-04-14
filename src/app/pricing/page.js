"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FaBolt, FaCoins, FaCheckCircle, FaStar } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState(null);

  const tiers = [
    {
      name: "Starter Manifest",
      credits: 3000,
      price: 15,
      description: "Perfect for exploring the digital ether.",
      features: [
        "1k - 4k Resolution",
        "Full Aspect Ratio Control",
        "Permanent Storage",
        "Basic Support",
      ],
      highlight: false,
    },
    {
      name: "Power Engine",
      credits: 7000,
      price: 35,
      description: "High-octane generation for serious creators.",
      features: [
        "Priority Extraction",
        "Google Smart Search",
        "Alpha Feature Access",
        "Priority Support",
      ],
      highlight: true,
    },
    {
      name: "Quantum Flow",
      credits: 24000,
      price: 120,
      description: "Infinite manifestation for the visual elite.",
      features: [
        "Uncapped Resolution",
        "Bulk Generation",
        "API Direct Access",
        "24/7 Concierge",
      ],
      highlight: false,
    },
  ];

  const handleCheckout = async (price, credits, tierName) => {
    if (status !== "authenticated") {
      router.push("/");
      return;
    }

    try {
      setLoadingTier(tierName);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, credits }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Stripe error", err);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="flex-1 bg-black overflow-y-auto custom-scrollbar p-8 md:p-12">
      <header className="max-w-7xl mx-auto mb-16 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold tracking-[0.4em] uppercase">
          Fuel your manifestation
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
          CREDIT TIERS
        </h1>
        <p className="text-zinc-500 font-medium text-xs uppercase tracking-widest max-w-xl mx-auto leading-loose">
          Unlock higher fidelity, faster polling, and permanent storage. <br />
          Choose your kinetic energy.
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-8 rounded-2xl border transition-all flex flex-col ${
              tier.highlight
                ? "bg-white/5 border-indigo-500 shadow-xl"
                : "bg-white/[0.02] border-white/5"
            }`}
          >
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500 rounded-full text-[9px] font-semibold uppercase tracking-widest shadow-lg">
                MOST POTENT
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold tracking-tight mb-2">
                {tier.name}
              </h3>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                {tier.description}
              </p>
            </div>

            <div className="mb-8 flex items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight">
                ${tier.price}
              </span>
              <span className="text-xs font-medium text-zinc-600 mb-1.5 uppercase tracking-widest">
                / Month
              </span>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <FaCoins className="text-yellow-500 text-lg" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest leading-none mb-1">
                    Yields
                  </span>
                  <span className="text-lg font-semibold">
                    {tier.credits} CREDITS
                  </span>
                </div>
              </div>

              <ul className="space-y-3 pt-2">
                {tier.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-center gap-3 text-xs font-medium text-zinc-400"
                  >
                    <FaCheckCircle className="text-indigo-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() =>
                handleCheckout(tier.price, tier.credits, tier.name)
              }
              disabled={loadingTier === tier.name}
              className={`w-full h-12 rounded-xl font-semibold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                tier.highlight
                  ? "bg-white text-black hover:scale-[1.01]"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              } disabled:opacity-20`}
            >
              {loadingTier === tier.name ? (
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Purchase Credits{" "}
                  <FaBolt
                    className={
                      tier.highlight ? "text-indigo-500" : "text-zinc-700"
                    }
                  />
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Credit Counter Hook */}
      <footer className="max-w-7xl mx-auto py-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-[10px] font-semibold tracking-[0.4em] text-zinc-700 uppercase">
            Kinetic Stats
          </div>
          <div className="text-lg font-medium flex items-center gap-3">
            Currently Holding:{" "}
            <span className="text-white font-semibold">
              {session?.user?.credits || 0} Credits
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 text-[10px] font-semibold uppercase tracking-widest">
          <FaStar className="text-yellow-500/30" /> Secure Encryption via Stripe{" "}
          <FaStar className="text-yellow-500/30" />
        </div>
      </footer>

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
