"use client";

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

interface PaymentMethodCardProps {
  title: string;
  method: "bank" | "crypto";
  icon: LucideIcon;
  isSelected: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const PaymentMethodCard = forwardRef<
  HTMLDivElement,
  PaymentMethodCardProps
>(({ title, method, icon: Icon, isSelected, onClick, children }, ref) => {
  return (
    <Card
      ref={ref}
      className={`p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-primary ring-2 ring-primary ring-opacity-50"
          : "hover:border-primary/50"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon
          className={`h-5 w-5 ${
            isSelected ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <h3 className="font-medium">{title}</h3>
      </div>
      {children && <div onClick={(e) => e.stopPropagation()}>{children}</div>}
    </Card>
  );
});

PaymentMethodCard.displayName = "PaymentMethodCard";
