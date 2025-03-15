"use client";

import { useRef, useCallback } from "react";

export function useDialogForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // Prevent the focus from bubbling up to the dialog
      e.stopPropagation();
    },
    []
  );

  return {
    formRef,
    handleInputFocus,
  };
}
