import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { AuthModal } from "../components/auth/AuthModal";

export const metadata: Metadata = {
  title: "AuraVocal — AI Vocal Separator & Studio Audio Workstation",
  description: "Split vocals, isolate stems, and create karaoke tracks from any audio or YouTube link using state-of-the-art Meta Demucs AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
