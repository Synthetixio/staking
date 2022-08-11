import { contracts as StakingContracts } from './staking';
import { contracts as DebtContracts } from './debt';
import { contracts as EscrowContracts } from './escrow';
import { contracts as LiquidationContracts } from './liquidation';
import { contracts as RatesContracts } from './rates';
import { contracts as ShortsContracts } from './shorts';
import { contracts as StatusContracts } from './status';
import { contracts as SynthsContracts } from './synths';
import { contracts as SynthsCurrenciesContracts } from './synthsCurrencies';
import { contracts as WalletContracts } from './wallet';
import { NetworkId, NetworkNameById } from '@synthetixio/contracts-interface';

export const contracts: any = {
	...StakingContracts,
	...DebtContracts,
	...EscrowContracts,
	...LiquidationContracts,
	...RatesContracts,
	...ShortsContracts,
	...StatusContracts,
	...SynthsContracts,
	...SynthsCurrenciesContracts,
	...WalletContracts,
};

type ContractName = keyof typeof contracts;

function initializeSynthetix(networkId: NetworkId) {
	const contractsNames = Object.keys(contracts) as ContractName[];
	contractsNames.map((contractName: ContractName) => {
		const { name, address, abi } = contracts[contractName][NetworkNameById[networkId]];
		return {
			name,
			address,
			abi,
		};
	});
}

initializeSynthetix(1);
