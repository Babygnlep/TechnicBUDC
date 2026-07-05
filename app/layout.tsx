import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Join Our Team | Reel Crew Productions",
  description:
    "We're looking for passionate creators to join our media production team. Apply now.",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
