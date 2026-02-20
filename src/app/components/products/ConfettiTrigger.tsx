"use client";

import { useEffect } from "react";
import { launchConfetti } from "../../../lib/confetti";

export interface ConfettiTriggerProps {
  shouldFire: boolean;
  storageKey?: string;
}

export function ConfettiTrigger({
  shouldFire,
  storageKey = "detailflow_checkout_confetti_shown",
}: ConfettiTriggerProps) {
  useEffect(() => {
    if (!shouldFire || typeof window === "undefined") return;

    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "1");
      launchConfetti();
    } catch {
      launchConfetti();
    }
  }, [shouldFire, storageKey]);

  return null;
}
