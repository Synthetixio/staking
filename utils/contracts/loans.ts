// CollateralEth
import {
  name as CollateralEthMainnet,
  address as CollateralEthAddressMainnet,
  abi as CollateralEthAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/CollateralEth';
import {
  name as CollateralEthMainnetOvm,
  address as CollateralEthAddressMainnetOvm,
  abi as CollateralEthAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/CollateralEth';
import {
  name as CollateralEthGoerli,
  address as CollateralEthAddressGoerli,
  abi as CollateralEthAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/CollateralEth';
import {
  name as CollateralEthGoerliOvm,
  address as CollateralEthAddressGoerliOvm,
  abi as CollateralEthAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/CollateralEth';

export const contracts = {
  CollateralEth: {
    mainnet: {
      name: CollateralEthMainnet,
      address: CollateralEthAddressMainnet,
      abi: CollateralEthAbiMainnet,
    },
    'mainnet-ovm': {
      name: CollateralEthMainnetOvm,
      address: CollateralEthAddressMainnetOvm,
      abi: CollateralEthAbiMainnetOvm,
    },
    goerli: {
      name: CollateralEthGoerli,
      address: CollateralEthAddressGoerli,
      abi: CollateralEthAbiGoerli,
    },
    'goerli-ovm': {
      name: CollateralEthGoerliOvm,
      address: CollateralEthAddressGoerliOvm,
      abi: CollateralEthAbiGoerliOvm,
    },
  },
};
