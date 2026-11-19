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
      <body className="bg-brand-neutral text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
