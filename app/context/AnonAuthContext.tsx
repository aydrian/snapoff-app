import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

type AnonAuthContextType = {
  anonId: string | null;
  loading: boolean;
};

const AnonAuthContext = createContext<AnonAuthContextType>({
  anonId: null,
  loading: true
});

export const AnonAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [anonId, setAnonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnonId = async () => {
      let stored = localStorage.getItem("anonId");
      if (!stored) {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        stored = result.visitorId;
        localStorage.setItem("anonId", stored);
      }
      setAnonId(stored);
      setLoading(false);
    };

    loadAnonId();
  }, []);

  return (
    <AnonAuthContext.Provider value={{ anonId, loading }}>
      {children}
    </AnonAuthContext.Provider>
  );
};

export const useAnonAuth = () => useContext(AnonAuthContext);
