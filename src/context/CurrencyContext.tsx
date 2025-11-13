import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

/** All amounts passed in are PKR. We only convert FROM PKR -> selected currency for display. */
export type Currency = "USD" | "EUR" | "GBP" | "PKR" | "INR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  /** Pass PKR amounts here; returns a localized currency string */
  formatPrice: (amountInPKR: number) => string;
  /** Convert PKR -> active currency (or a specific one) for raw numbers */
  convertPrice: (amountInPKR: number, toCurrency?: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

/** Fallback multipliers FROM PKR -> target currency (used if network is unavailable). */
const SEED_RATES_FROM_PKR: Record<Currency, number> = {
  PKR: 1,
  USD: 1 / 280, // approx
  EUR: 1 / 305,
  GBP: 1 / 355,
  INR: 1 / 3.4,
};

const LS_FX_KEY = "fx_from_pkr_v1";
const LS_CCY_KEY = "selected_currency_v1";
const REFRESH_MS = 24 * 60 * 60 * 1000; // 24h

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to PKR; try to restore last choice from localStorage
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(LS_CCY_KEY) as Currency | null;
      return saved || "PKR";
    } catch {
      return "PKR";
    }
  });

  // Persist user choice
  useEffect(() => {
    try {
      localStorage.setItem(LS_CCY_KEY, currency);
    } catch (error) {
      console.error('Error storing currency preference:', error);
    }
  }, [currency]);

  const [ratesFromPKR, setRatesFromPKR] = useState<Record<Currency, number>>(
    SEED_RATES_FROM_PKR
  );

  // Load cached FX, then refresh from internet (exchangerate.host)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LS_FX_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as {
          updatedAt: number;
          rates: Record<Currency, number>;
        };
        if (parsed?.rates) {
          setRatesFromPKR((prev) => ({ ...prev, ...parsed.rates }));
        }
        // If cached is still fresh, skip fetch
        if (parsed?.updatedAt && Date.now() - parsed.updatedAt < REFRESH_MS) return;
      }
    } catch (error) {
      console.error('Error loading currency preference:', error);
    }

    (async () => {
      try {
        // Get rates with base=USD, then compute PKR→X = (X/USD) / (PKR/USD)
        const res = await fetch(
          "https://api.exchangerate.host/latest?base=USD&symbols=PKR,USD,EUR,GBP,INR"
        );
        const data = await res.json();
        if (!data?.rates?.PKR) return;

        const usdTo = data.rates as Record<string, number>;
        const usdToPKR = usdTo.PKR;
        const pkrToUSD = 1 / usdToPKR;

        const next: Record<Currency, number> = {
          PKR: 1,
          USD: pkrToUSD,
          EUR: (usdTo.EUR ?? 0) * pkrToUSD,
          GBP: (usdTo.GBP ?? 0) * pkrToUSD,
          INR: (usdTo.INR ?? 0) * pkrToUSD,
        };

        setRatesFromPKR((prev) => ({ ...prev, ...next }));
        try {
          localStorage.setItem(
            LS_FX_KEY,
            JSON.stringify({ updatedAt: Date.now(), rates: next })
          );
        } catch (error) {
          console.error('Error caching exchange rates:', error);
        }
      } catch (error) {
        // Ignore network errors; seed rates will remain in use
        console.error('Error fetching exchange rates:', error);
      }
    })();
  }, []);

  /** Convert FROM PKR -> selected (or specific) currency */
  const convertPrice = (amountInPKR: number, toCurrency: Currency = currency): number => {
    const mul = ratesFromPKR[toCurrency] ?? 1;
    const safe = Number.isFinite(amountInPKR) ? amountInPKR : 0;
    return safe * mul;
  };

  /** Format a PKR amount in the active currency */
  const formatPrice = (amountInPKR: number): string => {
    const converted = convertPrice(amountInPKR, currency);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "PKR" || currency === "INR" ? 0 : 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
