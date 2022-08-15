import { wei } from '@synthetixio/wei';
import { calculatePercentChange } from './currencies';

describe('currencies', () => {
  test('calculatePercentChange returns 0 is new or old price missing', () => {
    expect(calculatePercentChange(wei(0), undefined).toString()).toBe(wei(0).toString());
    expect(calculatePercentChange(undefined, wei(0)).toString()).toBe(wei(0).toString());
  });
  test('calculatePercentChange handles 50% increase', () => {
    expect(calculatePercentChange(wei(5), wei(10)).toString()).toBe(wei(1).toString());
  });
  test('calculatePercentChange handles 50% decrease', () => {
    expect(calculatePercentChange(wei(10), wei(5)).toString()).toBe(wei(-0.5).toString());
  });
  test('calculatePercentChange handles old price 0', () => {
    expect(calculatePercentChange(wei(0), wei(5)).toString()).toBe(wei(500).toString());
  });
  test('calculatePercentChange handles new price 0', () => {
    expect(calculatePercentChange(wei(5), wei(0)).toString()).toBe(wei(-1).toString());
  });
});
