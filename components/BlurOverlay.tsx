import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlurOverlayProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const BlurOverlay: React.FC<BlurOverlayProps> = ({
  message,
  actionLabel = "Contact Support",
  onAction,
}) => {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-50 flex mt-[4.09rem] items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-card border border-border -mt-10 max-w-lg w-full rounded-xl shadow-2xl overflow-hidden transform transition-all">
        <div className="bg-primary/10 p-4 flex justify-center">
          <div className="bg-primary/10 rounded-full p-3">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="p-6 text-center space-y-4 ">
          <h2 className="text-2xl font-bold tracking-tight">
            Access Restricted
          </h2>
          <p
            className={cn(
              "text-muted-foreground text-base",
              "dark:text-neutral-300"
            )}
          >
            {message}
          </p>
          {onAction && (
            <div className="pt-2">
              <Button onClick={onAction} className="w-full">
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlurOverlay;
