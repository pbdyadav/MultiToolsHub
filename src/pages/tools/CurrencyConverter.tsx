import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, RefreshCw, TrendingUp, Search } from 'lucide-react';
import { CopyButton } from '../../components/CopyButton';

interface ExchangeRate {
  [key: string]: number;
}

type CurrencyMeta = { code: string; name: string; flag: string };
const currencyNames: Record<string, string> = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc', CNY: 'Chinese Yuan'
};

const countryFlagFromCurrency = (code: string): string => {
  if (code === 'EUR') return '🇪🇺';
  // Basic ISO 3166 mapping heuristic; can be expanded for special cases
  const special: Record<string, string> = { USD: 'US', GBP: 'GB', JPY: 'JP', CAD: 'CA', AUD: 'AU', CHF: 'CH', CNY: 'CN', INR: 'IN' };
  const country = special[code] || code.slice(0, 2);
  const base = 127397;
  return country
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(base + c.charCodeAt(0)))
    .join('');
};

export function CurrencyConverter() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState('');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    if (exchangeRates && amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  const currencies: CurrencyMeta[] = useMemo(() => {
    const codes = Object.keys(exchangeRates);
    if (!codes.length) {
      return [
        { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'EUR', name: 'Euro', flag: '🇪🇺' }
      ];
    }
    return codes
      .sort()
      .map((code) => ({ code, name: currencyNames[code] || code, flag: countryFlagFromCurrency(code) }));
  }, [exchangeRates]);

  const filteredFrom = useMemo(() => {
    const term = searchFrom.trim().toLowerCase();
    if (!term) return currencies;
    return currencies.filter((c) => c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term));
  }, [currencies, searchFrom]);

  const filteredTo = useMemo(() => {
    const term = searchTo.trim().toLowerCase();
    if (!term) return currencies;
    return currencies.filter((c) => c.code.toLowerCase().includes(term) || c.name.toLowerCase().includes(term));
  }, [currencies, searchTo]);

  const fetchExchangeRates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
      const data = await response.json();
      setExchangeRates(data.rates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Fallback rates for demo
      setExchangeRates({
        USD: 1, EUR: 0.85, GBP: 0.73, JPY: 110, 
        CAD: 1.25, AUD: 1.35, CHF: 0.92, CNY: 6.45
      });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const convertCurrency = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !exchangeRates) {
      setResult('');
      return;
    }

    let converted: number;
    
    if (fromCurrency === 'USD') {
      converted = numAmount * exchangeRates[toCurrency];
    } else if (toCurrency === 'USD') {
      converted = numAmount / exchangeRates[fromCurrency];
    } else {
      // Convert to USD first, then to target currency
      const usdAmount = numAmount / exchangeRates[fromCurrency];
      converted = usdAmount * exchangeRates[toCurrency];
    }

    setResult(converted.toFixed(2));
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
          <DollarSign className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Currency Converter</h1>
        <p className="text-gray-600">Convert between currencies with live exchange rates</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
          />
        </div>

        {/* Currency Selection with search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <div className="relative mb-2">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                placeholder="Search currency..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {filteredFrom.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <button
              onClick={swapCurrencies}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <div className="relative mb-2">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                placeholder="Search currency..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {filteredTo.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800 mb-2">
                {currencies.find(c => c.code === toCurrency)?.flag} {result} {toCurrency}
              </div>
              <div className="text-green-600">
                {amount} {fromCurrency} = {result} {toCurrency}
              </div>
              <div className="mt-4">
                <CopyButton text={`${amount} ${fromCurrency} = ${result} ${toCurrency}`} className="bg-white hover:bg-green-100" />
              </div>
            </div>
          </div>
        )}

        {/* Exchange Rate Info */}
        {exchangeRates[fromCurrency] && exchangeRates[toCurrency] && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>
                  1 {fromCurrency} = {(exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)} {toCurrency}
                </span>
              </div>
              {lastUpdated && (
                <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading exchange rates...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}