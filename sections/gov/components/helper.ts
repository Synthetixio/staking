import Wei, { wei } from '@synthetixio/wei';
import { getCurrentTimestampSeconds } from 'utils/formatters/date';

export const quadraticWeighting = (value: Wei) => {
  const scaledValue = value.mul(1e5);
  return wei(scaledValue.toBig().sqrt());
};

export const expired = (end?: number) => {
  if (!end) return true;
  if (getCurrentTimestampSeconds() > end) {
    return true;
  } else {
    return false;
  }
};

export const pending = (start?: number) => {
  if (!start) return true;
  if (getCurrentTimestampSeconds() < start) {
    return true;
  } else {
    return false;
  }
};
