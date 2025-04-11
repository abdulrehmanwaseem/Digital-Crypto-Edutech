import Link from "next/link";
import Image from "next/image";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
} from "lucide-react";

interface SiteSettings {
  siteName?: string;
  description?: string;
  contactEmail?: string;
}

export function Footer({ siteSettings }: { siteSettings: SiteSettings }) {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/logo.png"
                alt={siteSettings?.siteName || "Logo"}
                width={40}
                height={40}
                className="rounded-md hover:opacity-90 transition-opacity"
                priority
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              {siteSettings?.description ||
                "Your trusted platform for cryptocurrency education."}
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://wa.me/YOUR_WHATSAPP_NUMBER"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">WhatsApp</span>
              </Link>
              <Link
                href="https://t.me/YOUR_TELEGRAM_CHANNEL"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Telegram"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="sr-only">Telegram</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/plans"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>
                  {siteSettings?.contactEmail || "support@cryptoedu.com"}
                </span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>

          {/* Admin Panel */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Admin Panel</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/payments"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Payment Management
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  User Management
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Disclaimer: This platform is for educational purposes only. We do
            not offer any investment plans or financial advice. We are not
            responsible for any financial decisions made by users.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              {siteSettings?.siteName || "Master Crypto Education"}. All rights
              reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Link
                href="/sitemap"
                className="hover:text-foreground transition-colors"
              >
                Sitemap
              </Link>
              <Link
                href="/accessibility"
                className="hover:text-foreground transition-colors"
              >
                Accessibility
              </Link>
              <Link
                href="/cookies"
                className="hover:text-foreground transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
