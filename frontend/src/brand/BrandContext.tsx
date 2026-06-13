import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { BrandProfile, listBrandProfiles } from "../api/brandProfile";

interface BrandContextValue {
  profiles: BrandProfile[];
  selected: BrandProfile | null;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  loading: boolean;
  refresh: () => void;
}

const BrandContext = createContext<BrandContextValue | null>(null);

const SELECTED_KEY = "aima_selected_brand";

export function BrandProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [selectedId, setSelectedIdState] = useState<string | null>(
    localStorage.getItem(SELECTED_KEY)
  );
  const [loading, setLoading] = useState(true);

  const setSelectedId = (id: string) => {
    setSelectedIdState(id);
    localStorage.setItem(SELECTED_KEY, id);
  };

  const refresh = () => {
    setLoading(true);
    listBrandProfiles()
      .then((data) => {
        setProfiles(data);
        // Keep selection valid; default to the first profile.
        setSelectedIdState((current) => {
          if (current && data.some((p) => p.id === current)) return current;
          const next = data[0]?.id ?? null;
          if (next) localStorage.setItem(SELECTED_KEY, next);
          return next;
        });
      })
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const selected = profiles.find((p) => p.id === selectedId) ?? null;

  return (
    <BrandContext.Provider
      value={{ profiles, selected, selectedId, setSelectedId, loading, refresh }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within BrandProvider");
  return ctx;
}
