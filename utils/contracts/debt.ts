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

// Synthetix
import {
  name as SynthetixMainnet,
  address as SynthetixAddressMainnet,
  abi as SynthetixAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/Synthetix';
import {
  name as SynthetixMainnetOvm,
  address as SynthetixAddressMainnetOvm,
  abi as SynthetixAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/Synthetix';
import {
  name as SynthetixGoerli,
  address as SynthetixAddressGoerli,
  abi as SynthetixAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/Synthetix';
import {
  name as SynthetixGoerliOvm,
  address as SynthetixAddressGoerliOvm,
  abi as SynthetixAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/Synthetix';

// SystemSettings
import {
  name as SystemSettingsMainnet,
  address as SystemSettingsAddressMainnet,
  abi as SystemSettingsAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/SystemSettings';
import {
  name as SystemSettingsMainnetOvm,
  address as SystemSettingsAddressMainnetOvm,
  abi as SystemSettingsAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/SystemSettings';
import {
  name as SystemSettingsGoerli,
  address as SystemSettingsAddressGoerli,
  abi as SystemSettingsAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/SystemSettings';
import {
  name as SystemSettingsGoerliOvm,
  address as SystemSettingsAddressGoerliOvm,
  abi as SystemSettingsAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/SystemSettings';

export const contracts = {
  ExchangeRates: {
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
  Synthetix: {
    mainnet: {
      name: SynthetixMainnet,
      address: SynthetixAddressMainnet,
      abi: SynthetixAbiMainnet,
    },
    'mainnet-ovm': {
      name: SynthetixMainnetOvm,
      address: SynthetixAddressMainnetOvm,
      abi: SynthetixAbiMainnetOvm,
    },
    goerli: {
      name: SynthetixGoerli,
      address: SynthetixAddressGoerli,
      abi: SynthetixAbiGoerli,
    },
    'goerli-ovm': {
      name: SynthetixGoerliOvm,
      address: SynthetixAddressGoerliOvm,
      abi: SynthetixAbiGoerliOvm,
    },
  },
  SystemState: {
    mainnet: {
      name: SystemSettingsMainnet,
      address: SystemSettingsAddressMainnet,
      abi: SystemSettingsAbiMainnet,
    },
    'mainnet-ovm': {
      name: SystemSettingsMainnetOvm,
      address: SystemSettingsAddressMainnetOvm,
      abi: SystemSettingsAbiMainnetOvm,
    },
    goerli: {
      name: SystemSettingsGoerli,
      address: SystemSettingsAddressGoerli,
      abi: SystemSettingsAbiGoerli,
    },
    'goerli-ovm': {
      name: SystemSettingsGoerliOvm,
      address: SystemSettingsAddressGoerliOvm,
      abi: SystemSettingsAbiGoerliOvm,
    },
  },
};
