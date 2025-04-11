import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@radix-ui/react-toast";
import { Footer } from "@/components/footer";
import { SessionProvider } from "next-auth/react";
import { SiteHeader } from "@/components/site-header";
import { currentUser } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { OAuthReferral } from "@/components/auth/oauth-referral";

const inter = Inter({ subsets: ["latin"] });

// Generate metadata dynamically
export async function generateMetadata() {
  const settings = await prisma.siteSettings.findFirst();

  return {
    title: "Master Crypto Education",
    description: "Your platform for crypto education",
    keywords: "crypto, education, blockchain, cryptocurrency",
    openGraph: {
      title: settings?.siteName || "Master Crypto Education",
      description:
        settings?.description || "Expert-led cryptocurrency education platform",
      images: ["/og-image.jpg"],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const settings = await prisma.siteSettings.findFirst();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <ToastProvider swipeDirection="right">
              <OAuthReferral />
              <SiteHeader session={user} siteSettings={settings} />
              <main className="min-h-screen">{children}</main>
              <Footer
                siteSettings={
                  settings || {
                    id: "1",
                    siteName: "CryptoEdu",
                    siteTitle: "Learn Crypto Trading",
                    description: "Your platform for crypto education",
                    contactEmail: "contact@cryptoedu.com",
                    maintenanceMode: false,
                    updatedAt: new Date(),
                  }
                }
              />
            </ToastProvider>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
