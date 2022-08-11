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

export const contracts = {
	FeePool: {
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
};
