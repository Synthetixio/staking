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

// ExchangeRates
import {
  name as CollateralManagerMainnet,
  address as CollateralManagerAddressMainnet,
  abi as CollateralManagerAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/CollateralManager';
import {
  name as CollateralManagerMainnetOvm,
  address as CollateralManagerAddressMainnetOvm,
  abi as CollateralManagerAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/CollateralManager';
import {
  name as CollateralManagerGoerli,
  address as CollateralManagerAddressGoerli,
  abi as CollateralManagerAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/CollateralManager';
import {
  name as CollateralManagerGoerliOvm,
  address as CollateralManagerAddressGoerliOvm,
  abi as CollateralManagerAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/CollateralManager';

import {
  name as ShortingRewardsBTCMainnet,
  address as ShortingRewardsBTCAddressMainnet,
  abi as ShortingRewardsBTCAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/ShortingRewardssBTC';

import {
  name as ShortingRewardsETHMainnet,
  address as ShortingRewardsETHAddressMainnet,
  abi as ShortingRewardsETHAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/ShortingRewardssETH';

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
  CollateralManager: {
    mainnet: {
      name: CollateralManagerMainnet,
      address: CollateralManagerAddressMainnet,
      abi: CollateralManagerAbiMainnet,
    },
    'mainnet-ovm': {
      name: CollateralManagerMainnetOvm,
      address: CollateralManagerAddressMainnetOvm,
      abi: CollateralManagerAbiMainnetOvm,
    },
    goerli: {
      name: CollateralManagerGoerli,
      address: CollateralManagerAddressGoerli,
      abi: CollateralManagerAbiGoerli,
    },
    'goerli-ovm': {
      name: CollateralManagerGoerliOvm,
      address: CollateralManagerAddressGoerliOvm,
      abi: CollateralManagerAbiGoerliOvm,
    },
  },
  ShortingRewardsBTC: {
    mainnet: {
      name: ShortingRewardsBTCMainnet,
      address: ShortingRewardsBTCAddressMainnet,
      abi: ShortingRewardsBTCAbiMainnet,
    },
  },
  ShortingRewardsETH: {
    mainnet: {
      name: ShortingRewardsETHMainnet,
      address: ShortingRewardsETHAddressMainnet,
      abi: ShortingRewardsETHAbiMainnet,
    },
  },
};
