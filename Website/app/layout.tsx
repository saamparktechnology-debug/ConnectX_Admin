import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://connectx.live";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ConnectX — 100% Real Friendships.",
    template: "%s | ConnectX",
  },
  description:
    "ConnectX gives you instant access to trained experts for personalised audio consultations. Get confidential guidance while your identity stays protected behind an AI-generated avatar.",
  keywords: [
    "ConnectX",
    "expert consultation app",
    "anonymous audio call",
    "talk to an expert",
    "confidential advice",
    "become an expert",
  ],
  authors: [{ name: "ConnectX" }],
  openGraph: {
    title: "ConnectX — Talk to Trained Experts, Instantly & Anonymously",
    description:
      "Instant, confidential audio consultations with trained experts. Your identity stays protected with an AI-generated avatar.",
    url: siteUrl,
    siteName: "ConnectX",
    images: [
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: "ConnectX",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConnectX — Talk to Trained Experts, Instantly & Anonymously",
    description:
      "Instant, confidential audio consultations with trained experts. Your identity stays protected with an AI-generated avatar.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080B1A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
