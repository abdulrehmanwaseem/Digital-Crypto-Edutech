"use client";

import { useEffect, useRef } from "react";

export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    }

    // Set initial focus
    firstFocusable?.focus();

    // Add event listener
    container.addEventListener("keydown", handleKeyDown);

    // Prevent focus from leaving the modal
    const handleFocusIn = (e: FocusEvent) => {
      if (!container.contains(e.target as Node)) {
        firstFocusable?.focus();
      }
    };

    document.addEventListener("focusin", handleFocusIn);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [isOpen]);

  return containerRef;
}
