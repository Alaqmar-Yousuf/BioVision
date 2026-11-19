import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioVision — See Beyond the Leaf | Multimodal Agricultural AI",
  description: "Transform agricultural uncertainty into actionable intelligence with AI-powered plant disease detection across 62 classes and FAO crop harvest forecasting.",
  keywords: ["plant disease", "agricultural AI", "crop yield forecasting", "leaf pathology", "deep learning", "Grad-CAM", "FAO agriculture"],
  authors: [{ name: "BioVision Research Team" }],
  openGraph: {
    title: "BioVision — See Beyond the Leaf",
    description: "AI-powered foliar disease diagnosis and crop harvest forecasting across 62 pathology classes and 26 global crops.",
    siteName: "BioVision",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#071C16] text-[#F3F5EC] antialiased selection:bg-[#B7F36B] selection:text-[#071C16]">
        {children}
      </body>
    </html>
  );
}
