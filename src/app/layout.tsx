import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "ContractObligation - Extract Contract Obligations in 2 Minutes for $5",
  description: "AI-powered contract obligation extractor. Upload your PDF contract and get all obligations, deadlines, and responsible parties extracted instantly. Professional results in 2 minutes for just $5.",
  keywords: "contract analysis, legal AI, obligation extraction, contract review, legal tech, PDF analysis, contract obligations, legal automation",
  authors: [{ name: "ContractObligation" }],
  creator: "ContractObligation",
  publisher: "ContractObligation",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://contractobligation.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "ContractObligation - Extract Contract Obligations in 2 Minutes for $5",
    description: "AI-powered contract obligation extractor. Upload your PDF contract and get all obligations, deadlines, and responsible parties extracted instantly.",
    url: 'https://contractobligation.com',
    siteName: 'ContractObligation',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ContractObligation - AI Contract Obligation Extractor',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ContractObligation - Extract Contract Obligations in 2 Minutes for $5",
    description: "AI-powered contract obligation extractor. Upload your PDF contract and get all obligations, deadlines, and responsible parties extracted instantly.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
        
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ContractObligation",
              "description": "AI-powered contract obligation extractor that processes PDF contracts to identify obligations, deadlines, and responsible parties.",
              "url": "https://contractobligation.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "5",
                "priceCurrency": "USD",
                "description": "Contract obligation extraction service"
              },
              "featureList": [
                "PDF contract upload",
                "AI-powered text analysis",
                "Obligation identification",
                "Deadline extraction",
                "Party responsibility mapping",
                "Professional PDF export"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
