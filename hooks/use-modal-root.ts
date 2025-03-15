"use client";

import { useEffect, useRef } from "react";

export function useModalRoot() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    rootRef.current = document.body;
  }, []);

  return rootRef;
}
