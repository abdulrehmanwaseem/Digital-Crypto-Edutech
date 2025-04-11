-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT '1',
    "siteName" TEXT NOT NULL DEFAULT 'CryptoEdu',
    "siteTitle" TEXT NOT NULL DEFAULT 'Learn Crypto Trading',
    "description" TEXT NOT NULL DEFAULT 'Your platform for crypto education',
    "contactEmail" TEXT NOT NULL DEFAULT 'contact@cryptoedu.com',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
