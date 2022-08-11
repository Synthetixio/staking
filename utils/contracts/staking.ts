// FeePool
import {
	name as FeePoolMainnet,
	address as FeePoolAddressMainnet,
	abi as FeePoolAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/FeePool';
import {
	name as FeePoolMainnetOvm,
	address as FeePoolAddressMainnetOvm,
	abi as FeePoolAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/FeePool';
import {
	name as FeePoolGoerli,
	address as FeePoolAddressGoerli,
	abi as FeePoolAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/FeePool';
import {
	name as FeePoolGoerliOvm,
	address as FeePoolAddressGoerliOvm,
	abi as FeePoolAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/FeePool';

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

// Synthetix
import {
	name as SynthetixMainnet,
	address as SynthetixAddressMainnet,
	abi as SynthetixAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/Synthetix';
import {
	name as SynthetixMainnetOvm,
	address as SynthetixAddressMainnetOvm,
	abi as SynthetixAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/Synthetix';
import {
	name as SynthetixGoerli,
	address as SynthetixAddressGoerli,
	abi as SynthetixAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/Synthetix';
import {
	name as SynthetixGoerliOvm,
	address as SynthetixAddressGoerliOvm,
	abi as SynthetixAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/Synthetix';

// SynthetixState
import {
	name as SynthetixStateMainnet,
	address as SynthetixStateAddressMainnet,
	abi as SynthetixStateAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/SynthetixState';
import {
	name as SynthetixStateMainnetOvm,
	address as SynthetixStateAddressMainnetOvm,
	abi as SynthetixStateAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/SynthetixState';
import {
	name as SynthetixStateGoerli,
	address as SynthetixStateAddressGoerli,
	abi as SynthetixStateAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/SynthetixState';

// TODO: Update - SynthetixState does not currently exist on Goerli Ovm
import {
	name as SynthetixStateGoerliOvm,
	address as SynthetixStateAddressGoerliOvm,
	abi as SynthetixStateAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/Synthetix';

// SystemSettings
import {
	name as SystemSettingsMainnet,
	address as SystemSettingsAddressMainnet,
	abi as SystemSettingsAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/SystemSettings';
import {
	name as SystemSettingsMainnetOvm,
	address as SystemSettingsAddressMainnetOvm,
	abi as SystemSettingsAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/SystemSettings';
import {
	name as SystemSettingsGoerli,
	address as SystemSettingsAddressGoerli,
	abi as SystemSettingsAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/SystemSettings';
import {
	name as SystemSettingsGoerliOvm,
	address as SystemSettingsAddressGoerliOvm,
	abi as SystemSettingsAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/SystemSettings';

export const contracts = {
	FeePool: {
		mainnet: {
			name: FeePoolMainnet,
			address: FeePoolAddressMainnet,
			abi: FeePoolAbiMainnet,
		},
		'mainnet-ovm': {
			name: FeePoolMainnetOvm,
			address: FeePoolAddressMainnetOvm,
			abi: FeePoolAbiMainnetOvm,
		},
		goerli: {
			name: FeePoolGoerli,
			address: FeePoolAddressGoerli,
			abi: FeePoolAbiGoerli,
		},
		'goerli-ovm': {
			name: FeePoolGoerliOvm,
			address: FeePoolAddressGoerliOvm,
			abi: FeePoolAbiGoerliOvm,
		},
	},
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
	Synthetix: {
		mainnet: {
			name: SynthetixMainnet,
			address: SynthetixAddressMainnet,
			abi: SynthetixAbiMainnet,
		},
		'mainnet-ovm': {
			name: SynthetixMainnetOvm,
			address: SynthetixAddressMainnetOvm,
			abi: SynthetixAbiMainnetOvm,
		},
		goerli: {
			name: SynthetixGoerli,
			address: SynthetixAddressGoerli,
			abi: SynthetixAbiGoerli,
		},
		'goerli-ovm': {
			name: SynthetixGoerliOvm,
			address: SynthetixAddressGoerliOvm,
			abi: SynthetixAbiGoerliOvm,
		},
	},
	SynthetixState: {
		mainnet: {
			name: SynthetixStateMainnet,
			address: SynthetixStateAddressMainnet,
			abi: SynthetixStateAbiMainnet,
		},
		'mainnet-ovm': {
			name: SynthetixStateMainnetOvm,
			address: SynthetixStateAddressMainnetOvm,
			abi: SynthetixStateAbiMainnetOvm,
		},
		goerli: {
			name: SynthetixStateGoerli,
			address: SynthetixStateAddressGoerli,
			abi: SynthetixStateAbiGoerli,
		},
		'goerli-ovm': {
			name: SynthetixStateGoerliOvm,
			address: SynthetixStateAddressGoerliOvm,
			abi: SynthetixStateAbiGoerliOvm,
		},
	},
	SystemState: {
		mainnet: {
			name: SystemSettingsMainnet,
			address: SystemSettingsAddressMainnet,
			abi: SystemSettingsAbiMainnet,
		},
		'mainnet-ovm': {
			name: SystemSettingsMainnetOvm,
			address: SystemSettingsAddressMainnetOvm,
			abi: SystemSettingsAbiMainnetOvm,
		},
		goerli: {
			name: SystemSettingsGoerli,
			address: SystemSettingsAddressGoerli,
			abi: SystemSettingsAbiGoerli,
		},
		'goerli-ovm': {
			name: SystemSettingsGoerliOvm,
			address: SystemSettingsAddressGoerliOvm,
			abi: SystemSettingsAbiGoerliOvm,
		},
	},
};
