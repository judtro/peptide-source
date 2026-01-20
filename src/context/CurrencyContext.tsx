import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type Currency = 'USD' | 'EUR' | 'PLN' | 'GBP' | 'CHF';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertFromUSD: (amountUSD: number) => number;
  formatPrice: (amountUSD: number, showSymbol?: boolean) => string;
  currencySymbol: string;
  exchangeRates: Record<Currency, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates: how many units of each currency per 1 USD
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  PLN: 4.0,
  GBP: 0.79,
  CHF: 0.88,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  PLN: 'zł',
  GBP: '£',
  CHF: 'CHF',
};

// Map language to default currency
const LANGUAGE_CURRENCY_MAP: Record<string, Currency> = {
  en: 'USD',
  de: 'EUR',
  fr: 'EUR',
  es: 'EUR',
  nl: 'EUR',
  pl: 'PLN',
};

const STORAGE_KEY = 'chemverify-currency';
const MANUAL_OVERRIDE_KEY = 'chemverify-currency-manual';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && Object.keys(EXCHANGE_RATES).includes(saved)) {
      return saved as Currency;
    }
    return LANGUAGE_CURRENCY_MAP[i18n.language] || 'USD';
  });

  const [manualOverride, setManualOverride] = useState<boolean>(() => {
    return localStorage.getItem(MANUAL_OVERRIDE_KEY) === 'true';
  });

  // When language changes, update currency if not manually overridden
  useEffect(() => {
    if (!manualOverride) {
      const defaultCurrency = LANGUAGE_CURRENCY_MAP[i18n.language] || 'USD';
      setCurrencyState(defaultCurrency);
      localStorage.setItem(STORAGE_KEY, defaultCurrency);
    }
  }, [i18n.language, manualOverride]);

  const setCurrency = useCallback((newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
    localStorage.setItem(MANUAL_OVERRIDE_KEY, 'true');
    setManualOverride(true);
  }, []);

  const convertFromUSD = useCallback((amountUSD: number): number => {
    const rate = EXCHANGE_RATES[currency];
    return amountUSD * rate;
  }, [currency]);

  const formatPrice = useCallback((amountUSD: number, showSymbol = true): string => {
    const convertedAmount = convertFromUSD(amountUSD);
    const symbol = CURRENCY_SYMBOLS[currency];
    
    // Format based on currency conventions
    if (currency === 'CHF') {
      return showSymbol ? `${symbol} ${convertedAmount.toFixed(2)}` : convertedAmount.toFixed(2);
    }
    if (currency === 'PLN') {
      return showSymbol ? `${convertedAmount.toFixed(2)} ${symbol}` : convertedAmount.toFixed(2);
    }
    
    return showSymbol ? `${symbol}${convertedAmount.toFixed(2)}` : convertedAmount.toFixed(2);
  }, [currency, convertFromUSD]);

  const currencySymbol = CURRENCY_SYMBOLS[currency];

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      convertFromUSD,
      formatPrice,
      currencySymbol,
      exchangeRates: EXCHANGE_RATES,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
