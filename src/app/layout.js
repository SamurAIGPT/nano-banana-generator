import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/saas/Navbar";

const font = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "NanoBanana 2.0 - Premium AI Generator",
  description: "The next evolution of image generation templates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light h-dvh w-full">
      <body className={`${font.className} h-dvh w-full flex flex-col bg-slate-50 text-slate-900 antialiased`}>
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
