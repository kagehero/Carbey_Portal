import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carbey Portal",
  description: "カーベイ FC 加盟店プラットフォーム",
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
