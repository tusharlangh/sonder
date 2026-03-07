import type { Metadata } from "next";
import { Pixelify_Sans } from "next/font/google";
import "./globals.css";

const pixelify = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixelify" });

export const metadata: Metadata = {
  title: "Sonder | Kinetic Text Lab",
  description: "High-performance interactive ASCII kinetic text rendering — transform images and 3D scenes into stunning text-based art.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pixelify.variable}`}>
      <head>
        {/* Utilizing native system font stack: San Francisco on macOS/iOS, Segoe on Windows */}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
