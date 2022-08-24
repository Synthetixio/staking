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

export const contracts = {
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
