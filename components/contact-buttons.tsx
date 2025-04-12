import Link from "next/link";
import Image from "next/image";
import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContactButtons() {
  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col space-y-3">
      {/* WhatsApp Button */}
      <Link
        href="https://wa.me/YOUR_WHATSAPP_NUMBER" // Replace with actual WhatsApp number
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110",
          "bg-[#25D366] text-white", // WhatsApp's official color
          "hover:bg-[#22c55e] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        )}
        aria-label="Contact us on WhatsApp"
      >
        {/* WhatsApp Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="white"
          className="h-6 w-6"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </Link>

      {/* Telegram Button */}
      <Link
        href="https://t.me/YOUR_TELEGRAM_CHANNEL" // Replace with actual Telegram channel
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110",
          "bg-[#0088cc] text-white", // Telegram's official color
          "hover:bg-[#0077b5] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        )}
        aria-label="Join our Telegram channel"
      >
        {/* Telegram Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="white"
          className="h-6 w-6"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.069l-1.68 8.958c-.125.55-.462.688-.94.429l-2.582-2.013-1.246 1.271c-.138.138-.255.255-.523.255l.187-2.694 4.675-4.479c.203-.179-.044-.279-.314-.101l-5.773 3.859-2.486-.809c-.541-.177-.553-.541.126-.802l9.662-3.946c.447-.182.839.11.894 1.072z" />
        </svg>
      </Link>

      {/* Feedback Button */}
      <Link
        href="/feedback"
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110",
          "bg-purple-500 text-white",
          "hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        )}
        aria-label="Provide feedback"
      >
        <MessageSquareText className="h-6 w-6" />
      </Link>
    </div>
  );
}
