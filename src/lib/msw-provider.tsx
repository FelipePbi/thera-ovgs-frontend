"use client";

import { useEffect, useState } from "react";

let workerStartPromise: Promise<void> | null = null;

async function startWorkerOnce() {
  if (!workerStartPromise) {
    workerStartPromise = (async () => {
      const { worker } = await import("@/mocks/browser");
      await worker.start({ onUnhandledRequest: "bypass" });
    })();
  }
  return workerStartPromise;
}

export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(process.env.NODE_ENV !== "development");

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

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
