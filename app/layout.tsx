import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next JS Lucia Auth Example",
  description: "Next JS Lucia Auth Example",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex max-w-xl mx-auto items-center justify-center h-screen">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
