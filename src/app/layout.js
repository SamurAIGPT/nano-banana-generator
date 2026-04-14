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
    <html lang="en" className="dark h-dvh w-full">
      <body className={`${font.className} h-dvh w-full flex flex-col bg-[#020202] text-white antialiased`}>
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
