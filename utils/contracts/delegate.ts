// DelegateApprovals
import {
  name as DelegateApprovalsMainnet,
  address as DelegateApprovalsAddressMainnet,
  abi as DelegateApprovalsAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/DelegateApprovals';
import {
  name as DelegateApprovalsMainnetOvm,
  address as DelegateApprovalsAddressMainnetOvm,
  abi as DelegateApprovalsAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/DelegateApprovals';
import {
  name as DelegateApprovalsGoerli,
  address as DelegateApprovalsAddressGoerli,
  abi as DelegateApprovalsAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/DelegateApprovals';
import {
  name as DelegateApprovalsGoerliOvm,
  address as DelegateApprovalsAddressGoerliOvm,
  abi as DelegateApprovalsAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/DelegateApprovals';

export const contracts = {
  DelegateApprovals: {
    mainnet: {
      name: DelegateApprovalsMainnet,
      address: DelegateApprovalsAddressMainnet,
      abi: DelegateApprovalsAbiMainnet,
    },
    'mainnet-ovm': {
      name: DelegateApprovalsMainnetOvm,
      address: DelegateApprovalsAddressMainnetOvm,
      abi: DelegateApprovalsAbiMainnetOvm,
    },
    goerli: {
      name: DelegateApprovalsGoerli,
      address: DelegateApprovalsAddressGoerli,
      abi: DelegateApprovalsAbiGoerli,
    },
    'goerli-ovm': {
      name: DelegateApprovalsGoerliOvm,
      address: DelegateApprovalsAddressGoerliOvm,
      abi: DelegateApprovalsAbiGoerliOvm,
    },
  },
};
