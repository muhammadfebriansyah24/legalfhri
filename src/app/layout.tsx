import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

// Konfigurasi ketebalan font Poppins yang dibutuhkan
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FHRI Legal Advisory",
  description: "Portal Konsultasi Hukum First HR Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* Menerapkan font Poppins ke seluruh elemen body */}
      <body className={`${poppins.className} bg-bg-app antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}