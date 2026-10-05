import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkGb — PC Building Simulator",
  description:
    "Game simulator perakitan komputer PC modern full-stack dengan visual meja kerja 2.5D, sistem kompatibilitas hardware riil, dan simulasi POST BIOS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#080b11] text-[#f0f4f8] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
