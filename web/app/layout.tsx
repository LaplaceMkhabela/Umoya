import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { ToastProvider } from "@/components/Toast";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Umoya — On-Chain Stokvel",
  description: "Save together. Grow together. Own it on-chain.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ToastProvider>
            <div className="mx-auto min-h-screen w-full max-w-md px-4 pb-28 pt-6">
              {children}
            </div>
            <Nav />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
