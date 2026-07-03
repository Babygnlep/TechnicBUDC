import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Join Our Team | Reel Crew Productions",
  description:
    "We're looking for passionate creators to join our media production team. Apply now.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
