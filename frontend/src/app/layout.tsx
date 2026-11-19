import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioVision — Multimodal Agro-AI Engine",
  description: "Plant Pathology Diagnosis & Yield Forecasting Engine powered by Next.js & Deep Learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-brand-neutral text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
