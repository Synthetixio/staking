import { CurrencyKey } from 'constants/currency';
import { truncate } from 'lodash';

export const truncateAddress = (address: string, first = 5, last = 5) =>
  `${address.slice(0, first)}...${address.slice(-last, address.length)}`;

export const truncateString = (value: string, maxLength = 5) =>
  truncate(value, {
    length: maxLength,
  });

export const formatCurrencyPair = (baseCurrencyKey: CurrencyKey, quoteCurrencyKey: CurrencyKey) =>
  `${baseCurrencyKey} / ${quoteCurrencyKey}`;

export const strPadLeft = (string: string | number, pad: string, length: number) => {
  return (new Array(length + 1).join(pad) + string).slice(-length);
};
