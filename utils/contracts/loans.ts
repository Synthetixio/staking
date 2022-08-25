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
// CollateralManager
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
} from '@synthetixio/contracts/build/goerli-ovm/deployment/CollateralEth';
// CollateralStateEth
import {
  name as CollateralStateEthMainnet,
  address as CollateralStateEthAddressMainnet,
  abi as CollateralStateEthAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/CollateralStateEth';

// Not deployed yet
// import {
//   name as CollateralStateEthGoerli,
//   address as CollateralStateEthAddressGoerli,
//   abi as CollateralStateEthAbiGoerli,
// } from '@synthetixio/contracts/build/goerli/deployment/CollateralStateEth';

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
  CollateralStateEth: {
    mainnet: {
      name: CollateralStateEthMainnet,
      address: CollateralStateEthAddressMainnet,
      abi: CollateralStateEthAbiMainnet,
    },
    // Not deployed yet
    // goerli: {
    //   name: CollateralStateEthGoerli,
    //   address: CollateralStateEthAddressGoerli,
    //   abi: CollateralStateEthAbiGoerli,
    // },
  },
};
