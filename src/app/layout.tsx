import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Edouard Roméo AZON — Professeur certifié de Mathématiques",
  description: "Site officiel d'Edouard Roméo AZON, professeur certifié de mathématiques (CAPES & BAPES) à Porto-Novo, Bénin. Cours particuliers du collège au lycée.",
  openGraph: {
    title: "Edouard Roméo AZON — Professeur de Mathématiques",
    description: "Professeur certifié CAPES & BAPES à Porto-Novo, Bénin. Pédagogie rigoureuse, vivante et accessible du collège au lycée.",
    url: "https://romeo-web-gules.vercel.app",
    siteName: "Edouard Roméo AZON",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edouard Roméo AZON — Professeur de Mathématiques",
    description: "Professeur certifié CAPES & BAPES à Porto-Novo, Bénin. Pédagogie rigoureuse, vivante et accessible.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}