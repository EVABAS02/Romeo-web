import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Edouard Roméo AZON — Professeur certifié de Mathématiques à Porto-Novo, Bénin",
  description: "Site officiel d'Edouard Roméo AZON, professeur certifié de mathématiques (CAPES & BAPES) à Porto-Novo, Bénin. Cours particuliers du collège au lycée.",
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