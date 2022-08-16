// SynthetixBridgeToOptimism
import {
  name as SynthetixBridgeToOptimismMainnet,
  address as SynthetixBridgeToOptimismAddressMainnet,
  abi as SynthetixBridgeToOptimismAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/SynthetixBridgeToOptimism';

import {
  name as SynthetixBridgeToOptimismGoerli,
  address as SynthetixBridgeToOptimismAddressGoerli,
  abi as SynthetixBridgeToOptimismAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/SynthetixBridgeToOptimism';

// SynthetixBridgeToBase
import {
  name as SynthetixBridgeToBaseMainnetOvm,
  address as SynthetixBridgeToBaseAddressMainnetOvm,
  abi as SynthetixBridgeToBaseAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/SynthetixBridgeToBase';

import {
  name as SynthetixBridgeToBaseGoerliOvm,
  address as SynthetixBridgeToBaseAddressGoerliOvm,
  abi as SynthetixBridgeToBaseAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/SynthetixBridgeToBase';

export const contracts = {
  SynthetixBridgeToOptimism: {
    mainnet: {
      name: SynthetixBridgeToOptimismMainnet,
      address: SynthetixBridgeToOptimismAddressMainnet,
      abi: SynthetixBridgeToOptimismAbiMainnet,
    },
    goerli: {
      name: SynthetixBridgeToOptimismGoerli,
      address: SynthetixBridgeToOptimismAddressGoerli,
      abi: SynthetixBridgeToOptimismAbiGoerli,
    },
  },
  SynthetixBridgeToBase: {
    'mainnet-ovm': {
      name: SynthetixBridgeToBaseMainnetOvm,
      address: SynthetixBridgeToBaseAddressMainnetOvm,
      abi: SynthetixBridgeToBaseAbiMainnetOvm,
    },
    'goerli-ovm': {
      name: SynthetixBridgeToBaseGoerliOvm,
      address: SynthetixBridgeToBaseAddressGoerliOvm,
      abi: SynthetixBridgeToBaseAbiGoerliOvm,
    },
  },
};
