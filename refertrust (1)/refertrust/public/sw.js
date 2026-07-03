// Minimal service worker: exists so the app is installable as a PWA.
// Deliberately does NOT cache pages — this app is auth'd + realtime, and stale
// cached pages would cause confusing "why isn't my data updating" bugs.
// Network passthrough only.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // no-op: let every request hit the network normally
});
