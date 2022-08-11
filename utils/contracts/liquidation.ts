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

export const contracts = {
	FeePool: {
		mainnet: {
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
	},
};
