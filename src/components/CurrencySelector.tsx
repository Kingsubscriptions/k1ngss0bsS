import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrency, Currency } from '@/context/CurrencyContext';

const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrency();

  const currencies: { value: Currency; label: string; flag: string }[] = [
    { value: 'USD', label: 'USD', flag: '🇺🇸' },
    { value: 'EUR', label: 'EUR', flag: '🇪🇺' },
    { value: 'GBP', label: 'GBP', flag: '🇬🇧' },
    { value: 'PKR', label: 'PKR', flag: '🇵🇰' },
    { value: 'INR', label: 'INR', flag: '🇮🇳' },
  ];

  return (
    <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
      <SelectTrigger className="w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => (
          <SelectItem key={curr.value} value={curr.value}>
            <div className="flex items-center space-x-2">
              <span>{curr.flag}</span>
              <span>{curr.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelector;