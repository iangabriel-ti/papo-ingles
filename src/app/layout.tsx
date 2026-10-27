import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} - aprenda inglês conversando`,
  description: APP_TAGLINE,
};

export const viewport: Viewport = {
  themeColor: "#5865f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${nunito.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
