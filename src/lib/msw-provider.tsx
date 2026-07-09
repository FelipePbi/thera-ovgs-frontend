"use client";

import { useEffect, useState } from "react";

let workerStartPromise: Promise<void> | null = null;

async function startWorkerOnce() {
  if (!workerStartPromise) {
    workerStartPromise = (async () => {
      const { worker } = await import("@/mocks/browser");
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: { url: "/mockServiceWorker.js" },
      });
    })();
  }
  return workerStartPromise;
}

export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void startWorkerOnce()
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch((error) => {
        console.error("Failed to start MSW worker", error);
        // Evita travar a UI se o worker já estiver ativo
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
