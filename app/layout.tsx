import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Pixelify+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
