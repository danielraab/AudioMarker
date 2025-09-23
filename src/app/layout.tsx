import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import Providers from "~/components/Providers";

export const metadata: Metadata = {
  title: "Audio Marker",
  description: "Audio Marker - Upload, mark, and share your audio files with ease. By DRaab",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <Providers>
          <TRPCReactProvider>
            <main className="flex flex-col items-center justify-center gap-12 px-4 py-16">
              {children}
            </main>
          </TRPCReactProvider>
        </Providers>
      </body>
    </html>
  );
}
