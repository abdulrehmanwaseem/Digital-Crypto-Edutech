import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider } from "@radix-ui/react-toast";
import { Footer } from "@/components/footer";
import { HeaderWrapper } from "@/components/header-wrapper";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Digital Edutech',
  description: 'Expert-led cryptocurrency education platform with flexible learning plans and earning opportunities',
  keywords: 'crypto, trading, education, blockchain, cryptocurrency',
  openGraph: {
    title: 'Digital Edutech',
    description: 'Expert-led cryptocurrency education platform',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          suppressHydrationWarning
        >
          <ToastProvider swipeDirection="right">
            <HeaderWrapper />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ToastProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}