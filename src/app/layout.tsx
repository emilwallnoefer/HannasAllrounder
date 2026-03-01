import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hannas Allrounder",
  description: "Sichere Allrounder-Web-App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-[#0a0a0a] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
