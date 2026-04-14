"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FaCoins, FaUser, FaSignOutAlt, FaChevronDown, FaRocket } from "react-icons/fa";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Image Editor", href: "/editor" },
    { name: "My Creations", href: "/creations" },
    // { name: "Showcase", href: "/showcase" },
    { name: "Pricing", href: "/pricing" },
  ];

  if (!session) return null;

  return (
    <nav className="h-20 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-[100] px-6 md:px-12 flex items-center justify-between">
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
          <FaRocket className="text-white text-lg" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-tighter leading-none italic uppercase">NANO BANANA</span>
          <span className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">Engine BIZ</span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-bold tracking-tight transition-all relative py-2 ${
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {link.name}
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <Link href="/pricing" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
          <FaCoins className="text-yellow-500 text-xs group-hover:scale-125 transition-transform" />
          <div className="flex flex-col gap-2 items-start leading-none">
            <span className="text-[10px] font-medium text-zinc-500">Balance</span>
            <span className="text-xs font-medium">{session.user.credits} Credits</span>
          </div>
        </Link>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1 rounded-2xl hover:bg-white/5 transition-all outline-none"
          >
            <img
              src={session.user.image}
              alt="Avatar"
              className="w-8 h-8 rounded-full ring-2 ring-white/5 shadow-lg"
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 w-56 bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl p-2 z-[200] backdrop-blur-3xl"
              >
                <div className="flex flex-col gap-2 p-3 border-b border-white/5">
                  <div className="text-xs font-medium text-zinc-400">Account</div>
                  <h3 className="text-xs font-medium text-zinc-300 truncate">{session.user.name}</h3>
                  <div className="text-xs font-medium text-zinc-300 truncate">{session.user.email}</div>
                </div>
                
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all font-bold text-xs group"
                >
                  Sign Out
                  <FaSignOutAlt className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
