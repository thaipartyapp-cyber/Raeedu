import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: "Raena's Learning Journey - AI Scholar & Companion",
  description: "An adaptive, multimodal AI learning tutor for 7-year-old Raena featuring gamified math challenges, phonics & sight words mastery, interactive storytelling, and parent learning analytics.",
  openGraph: {
    title: "Raena's Learning Journey",
    description: "An adaptive, multimodal AI learning tutor for 7-year-old Raena.",
    type: 'website',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
