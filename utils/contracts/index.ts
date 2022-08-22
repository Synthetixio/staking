import { Signer, Contract } from 'ethers';
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
import { contracts as BridgeContracts } from './bridge';
import { contracts as DelegateContracts } from './delegate';
import { contracts as LoanContracts } from './loans';
import { ContractsMap, NetworkId, NetworkNameById } from '@synthetixio/contracts-interface';

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
  ...BridgeContracts,
  ...DelegateContracts,
  ...LoanContracts,
};

type ContractName = keyof typeof contracts;

export function initializeSynthetix(networkId: NetworkId, signer: Signer) {
  const contractsNames = Object.keys(contracts) as ContractName[];
  return contractsNames
    .map((contractName: ContractName) => {
      if (!contracts[contractName][NetworkNameById[networkId]]) {
        // Some contracts are not supported on both networks
        return null;
      }

      const { name, address, abi } = contracts[contractName][NetworkNameById[networkId]];

      return {
        name,
        address,
        abi,
      };
    })
    .filter((item) => item !== null)
    .reduce((acc: ContractsMap, contract) => {
      acc[contract?.name] = new Contract(contract?.address, contract?.abi, signer);
      return acc;
    }, {});
}
