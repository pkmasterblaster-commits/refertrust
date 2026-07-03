"use client";

import { useEffect } from "react";

// Registers the PWA service worker so the app can be installed to the home
// screen ("Add to Home Screen" on iPhone, install prompt on Android).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failing shouldn't break the app — ignore silently.
      });
    }
  }, []);
  return null;
}
