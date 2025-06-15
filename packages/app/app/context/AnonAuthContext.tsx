import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useFetcher } from "react-router";

type AnonAuthContextType = {
  anonId: string | null;
  loading: boolean;
};

const AnonAuthContext = createContext<AnonAuthContextType>({
  anonId: null,
  loading: true
});

export function AnonAuthProvider({
  initialAnonId,
  children
}: {
  initialAnonId: string | null;
  children: React.ReactNode;
}) {
  const [anonId, setAnonId] = useState<string | null>(initialAnonId);
  const [loading, setLoading] = useState(!initialAnonId);
  const fetcher = useFetcher();

  useEffect(() => {
    const loadAnonId = async () => {
      if (!anonId) {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const newAnonId = result.visitorId;
        setAnonId(newAnonId);
        fetcher.submit(
          { anonId: newAnonId },
          { method: "post", action: "/api/set-anon-id" }
        );
      }
      console.log("Loaded anonId:", anonId);
      setLoading(false);
    };

    loadAnonId();
  }, [anonId, fetcher]);

  return (
    <AnonAuthContext.Provider value={{ anonId, loading }}>
      {children}
    </AnonAuthContext.Provider>
  );
}

export const useAnonAuth = () => useContext(AnonAuthContext);
