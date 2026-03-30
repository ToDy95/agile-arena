import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import { AppProviders } from "@/app/providers";
import { cn } from "@/lib/utils";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Agile Arena",
    template: "%s | Agile Arena",
  },
  description: "A realtime multiplayer room for agile retro and grooming sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark h-full antialiased", spaceGrotesk.variable, ibmPlexMono.variable)}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-100">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
