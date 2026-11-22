import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drafto",
  description: "Gerador de propostas comerciais",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <footer className="border-primary-100 mt-auto border-t px-4 py-3 text-center">
          <a
            href="https://espalha.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-700 text-xs transition-colors"
          >
            espalha.ai - Gestão inteligente de eventos.
          </a>
        </footer>
        <Toaster
          position="bottom-right"
          closeButton
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid var(--color-primary-200)",
              color: "var(--color-primary-900)",
            },
          }}
        />
      </body>
    </html>
  );
}
