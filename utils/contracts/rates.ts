// ExchangeRates
import {
  name as ExchangeRatesMainnet,
  address as ExchangeRatesAddressMainnet,
  abi as ExchangeRatesAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/ExchangeRates';
import {
  name as ExchangeRatesMainnetOvm,
  address as ExchangeRatesAddressMainnetOvm,
  abi as ExchangeRatesAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/ExchangeRates';
import {
  name as ExchangeRatesGoerli,
  address as ExchangeRatesAddressGoerli,
  abi as ExchangeRatesAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/ExchangeRates';
import {
  name as ExchangeRatesGoerliOvm,
  address as ExchangeRatesAddressGoerliOvm,
  abi as ExchangeRatesAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/ExchangeRates';

// SynthUtil
import {
  name as SynthUtilMainnet,
  address as SynthUtilAddressMainnet,
  abi as SynthUtilAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/SynthUtil';
import {
  name as SynthUtilMainnetOvm,
  address as SynthUtilAddressMainnetOvm,
  abi as SynthUtilAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/SynthUtil';
import {
  name as SynthUtilGoerli,
  address as SynthUtilAddressGoerli,
  abi as SynthUtilAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/SynthUtil';
import {
  name as SynthUtilGoerliOvm,
  address as SynthUtilAddressGoerliOvm,
  abi as SynthUtilAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/SynthUtil';

// Synths
import { contracts as SynthsCurrencies } from './synthsCurrencies';

export const contracts = {
  ...SynthsCurrencies,
  ExchangeRates: {
    mainnet: {
      mainnet: {
        name: ExchangeRatesMainnet,
        address: ExchangeRatesAddressMainnet,
        abi: ExchangeRatesAbiMainnet,
      },
      'mainnet-ovm': {
        name: ExchangeRatesMainnetOvm,
        address: ExchangeRatesAddressMainnetOvm,
        abi: ExchangeRatesAbiMainnetOvm,
      },
      goerli: {
        name: ExchangeRatesGoerli,
        address: ExchangeRatesAddressGoerli,
        abi: ExchangeRatesAbiGoerli,
      },
      'goerli-ovm': {
        name: ExchangeRatesGoerliOvm,
        address: ExchangeRatesAddressGoerliOvm,
        abi: ExchangeRatesAbiGoerliOvm,
      },
    },
  },
  SynthUtil: {
    mainnet: {
      name: SynthUtilMainnet,
      address: SynthUtilAddressMainnet,
      abi: SynthUtilAbiMainnet,
    },
    'mainnet-ovm': {
      name: SynthUtilMainnetOvm,
      address: SynthUtilAddressMainnetOvm,
      abi: SynthUtilAbiMainnetOvm,
    },
    goerli: {
      name: SynthUtilGoerli,
      address: SynthUtilAddressGoerli,
      abi: SynthUtilAbiGoerli,
    },
    'goerli-ovm': {
      name: SynthUtilGoerliOvm,
      address: SynthUtilAddressGoerliOvm,
      abi: SynthUtilAbiGoerliOvm,
    },
  },
};
