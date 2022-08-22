// Liquidator
import {
  name as LiquidatorMainnet,
  address as LiquidatorAddressMainnet,
  abi as LiquidatorAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/Liquidator';
import {
  name as LiquidatorMainnetOvm,
  address as LiquidatorAddressMainnetOvm,
  abi as LiquidatorAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/Liquidator';
import {
  name as LiquidatorGoerli,
  address as LiquidatorAddressGoerli,
  abi as LiquidatorAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/Liquidator';
import {
  name as LiquidatorGoerliOvm,
  address as LiquidatorAddressGoerliOvm,
  abi as LiquidatorAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/Liquidator';

// LiquidatorRewards
import {
  name as LiquidatorRewardsMainnet,
  address as LiquidatorRewardsAddressMainnet,
  abi as LiquidatorRewardsAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/LiquidatorRewards';
import {
  name as LiquidatorRewardsMainnetOvm,
  address as LiquidatorRewardsAddressMainnetOvm,
  abi as LiquidatorRewardsAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/LiquidatorRewards';
import {
  name as LiquidatorRewardsGoerli,
  address as LiquidatorRewardsAddressGoerli,
  abi as LiquidatorRewardsAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/LiquidatorRewards';
import {
  name as LiquidatorRewardsGoerliOvm,
  address as LiquidatorRewardsAddressGoerliOvm,
  abi as LiquidatorRewardsAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/LiquidatorRewards';

export const contracts = {
  Liquidator: {
    mainnet: {
      name: LiquidatorMainnet,
      address: LiquidatorAddressMainnet,
      abi: LiquidatorAbiMainnet,
    },
    'mainnet-ovm': {
      name: LiquidatorMainnetOvm,
      address: LiquidatorAddressMainnetOvm,
      abi: LiquidatorAbiMainnetOvm,
    },
    goerli: {
      name: LiquidatorGoerli,
      address: LiquidatorAddressGoerli,
      abi: LiquidatorAbiGoerli,
    },
    'goerli-ovm': {
      name: LiquidatorGoerliOvm,
      address: LiquidatorAddressGoerliOvm,
      abi: LiquidatorAbiGoerliOvm,
    },
  },
  LiquidatorRewards: {
    mainnet: {
      name: LiquidatorRewardsMainnet,
      address: LiquidatorRewardsAddressMainnet,
      abi: LiquidatorRewardsAbiMainnet,
    },
    'mainnet-ovm': {
      name: LiquidatorRewardsMainnetOvm,
      address: LiquidatorRewardsAddressMainnetOvm,
      abi: LiquidatorRewardsAbiMainnetOvm,
    },
    goerli: {
      name: LiquidatorRewardsGoerli,
      address: LiquidatorRewardsAddressGoerli,
      abi: LiquidatorRewardsAbiGoerli,
    },
    'goerli-ovm': {
      name: LiquidatorRewardsGoerliOvm,
      address: LiquidatorRewardsAddressGoerliOvm,
      abi: LiquidatorRewardsAbiGoerliOvm,
    },
  },
};
