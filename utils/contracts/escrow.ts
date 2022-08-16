// RewardEscrowV2
import {
  name as RewardEscrowV2Mainnet,
  address as RewardEscrowV2AddressMainnet,
  abi as RewardEscrowV2AbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/RewardEscrowV2';
import {
  name as RewardEscrowV2MainnetOvm,
  address as RewardEscrowV2AddressMainnetOvm,
  abi as RewardEscrowV2AbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/RewardEscrowV2';
import {
  name as RewardEscrowV2Goerli,
  address as RewardEscrowV2AddressGoerli,
  abi as RewardEscrowV2AbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/RewardEscrowV2';
import {
  name as RewardEscrowV2GoerliOvm,
  address as RewardEscrowV2AddressGoerliOvm,
  abi as RewardEscrowV2AbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/RewardEscrowV2';

// Escrow Checker
import {
  name as EscrowCheckerMainnet,
  address as EscrowCheckerAddressMainnet,
  abi as EscrowCheckerAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/EscrowChecker';
import {
  name as EscrowCheckerMainnetOvm,
  address as EscrowCheckerAddressMainnetOvm,
  abi as EscrowCheckerAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/EscrowChecker';
import {
  name as EscrowCheckerGoerli,
  address as EscrowCheckerAddressGoerli,
  abi as EscrowCheckerAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/EscrowChecker';
import {
  name as EscrowCheckerGoerliOvm,
  address as EscrowCheckerAddressGoerliOvm,
  abi as EscrowCheckerAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/EscrowChecker';

// Synthetix Escrow
import {
  name as SynthetixEscrowMainnet,
  address as SynthetixEscrowAddressMainnet,
  abi as SynthetixEscrowAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/SynthetixEscrow';
import {
  name as SynthetixEscrowMainnetOvm,
  address as SynthetixEscrowAddressMainnetOvm,
  abi as SynthetixEscrowAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/SynthetixEscrow';
import {
  name as SynthetixEscrowGoerli,
  address as SynthetixEscrowAddressGoerli,
  abi as SynthetixEscrowAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/SynthetixEscrow';
import {
  name as SynthetixEscrowGoerliOvm,
  address as SynthetixEscrowAddressGoerliOvm,
  abi as SynthetixEscrowAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/SynthetixEscrow';

export const contracts = {
  RewardEscrowV2: {
    mainnet: {
      name: RewardEscrowV2Mainnet,
      address: RewardEscrowV2AddressMainnet,
      abi: RewardEscrowV2AbiMainnet,
    },
    'mainnet-ovm': {
      name: RewardEscrowV2MainnetOvm,
      address: RewardEscrowV2AddressMainnetOvm,
      abi: RewardEscrowV2AbiMainnetOvm,
    },
    goerli: {
      name: RewardEscrowV2Goerli,
      address: RewardEscrowV2AddressGoerli,
      abi: RewardEscrowV2AbiGoerli,
    },
    'goerli-ovm': {
      name: RewardEscrowV2GoerliOvm,
      address: RewardEscrowV2AddressGoerliOvm,
      abi: RewardEscrowV2AbiGoerliOvm,
    },
  },
  EscrowChecker: {
    mainnet: {
      name: EscrowCheckerMainnet,
      address: EscrowCheckerAddressMainnet,
      abi: EscrowCheckerAbiMainnet,
    },
    'mainnet-ovm': {
      name: EscrowCheckerMainnetOvm,
      address: EscrowCheckerAddressMainnetOvm,
      abi: EscrowCheckerAbiMainnetOvm,
    },
    goerli: {
      name: EscrowCheckerGoerli,
      address: EscrowCheckerAddressGoerli,
      abi: EscrowCheckerAbiGoerli,
    },
    'goerli-ovm': {
      name: EscrowCheckerGoerliOvm,
      address: EscrowCheckerAddressGoerliOvm,
      abi: EscrowCheckerAbiGoerliOvm,
    },
  },
  SynthetixEscrow: {
    mainnet: {
      name: SynthetixEscrowMainnet,
      address: SynthetixEscrowAddressMainnet,
      abi: SynthetixEscrowAbiMainnet,
    },
    'mainnet-ovm': {
      name: SynthetixEscrowMainnetOvm,
      address: SynthetixEscrowAddressMainnetOvm,
      abi: SynthetixEscrowAbiMainnetOvm,
    },
    goerli: {
      name: SynthetixEscrowGoerli,
      address: SynthetixEscrowAddressGoerli,
      abi: SynthetixEscrowAbiGoerli,
    },
    'goerli-ovm': {
      name: SynthetixEscrowGoerliOvm,
      address: SynthetixEscrowAddressGoerliOvm,
      abi: SynthetixEscrowAbiGoerliOvm,
    },
  },
};
