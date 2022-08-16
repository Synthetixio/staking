// SystemStatus
import {
  name as SystemStatusMainnet,
  address as SystemStatusAddressMainnet,
  abi as SystemStatusAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/SystemStatus';
import {
  name as SystemStatusMainnetOvm,
  address as SystemStatusAddressMainnetOvm,
  abi as SystemStatusAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/SystemStatus';
import {
  name as SystemStatusGoerli,
  address as SystemStatusAddressGoerli,
  abi as SystemStatusAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/SystemStatus';
import {
  name as SystemStatusGoerliOvm,
  address as SystemStatusAddressGoerliOvm,
  abi as SystemStatusAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/SystemStatus';

// DappMaintenance
import {
  name as DappMaintenanceMainnet,
  address as DappMaintenanceAddressMainnet,
  abi as DappMaintenanceAbiMainnet,
} from '@synthetixio/contracts/build/mainnet/deployment/DappMaintenance';
import {
  name as DappMaintenanceMainnetOvm,
  address as DappMaintenanceAddressMainnetOvm,
  abi as DappMaintenanceAbiMainnetOvm,
} from '@synthetixio/contracts/build/mainnet-ovm/deployment/DappMaintenance';
import {
  name as DappMaintenanceGoerli,
  address as DappMaintenanceAddressGoerli,
  abi as DappMaintenanceAbiGoerli,
} from '@synthetixio/contracts/build/goerli/deployment/DappMaintenance';
import {
  name as DappMaintenanceGoerliOvm,
  address as DappMaintenanceAddressGoerliOvm,
  abi as DappMaintenanceAbiGoerliOvm,
} from '@synthetixio/contracts/build/goerli-ovm/deployment/DappMaintenance';

export const contracts = {
  SystemStatus: {
    mainnet: {
      name: SystemStatusMainnet,
      address: SystemStatusAddressMainnet,
      abi: SystemStatusAbiMainnet,
    },
    'mainnet-ovm': {
      name: SystemStatusMainnetOvm,
      address: SystemStatusAddressMainnetOvm,
      abi: SystemStatusAbiMainnetOvm,
    },
    goerli: {
      name: SystemStatusGoerli,
      address: SystemStatusAddressGoerli,
      abi: SystemStatusAbiGoerli,
    },
    'goerli-ovm': {
      name: SystemStatusGoerliOvm,
      address: SystemStatusAddressGoerliOvm,
      abi: SystemStatusAbiGoerliOvm,
    },
  },
  DappMaintenance: {
    mainnet: {
      name: DappMaintenanceMainnet,
      address: DappMaintenanceAddressMainnet,
      abi: DappMaintenanceAbiMainnet,
    },
    'mainnet-ovm': {
      name: DappMaintenanceMainnetOvm,
      address: DappMaintenanceAddressMainnetOvm,
      abi: DappMaintenanceAbiMainnetOvm,
    },
    goerli: {
      name: DappMaintenanceGoerli,
      address: DappMaintenanceAddressGoerli,
      abi: DappMaintenanceAbiGoerli,
    },
    'goerli-ovm': {
      name: DappMaintenanceGoerliOvm,
      address: DappMaintenanceAddressGoerliOvm,
      abi: DappMaintenanceAbiGoerliOvm,
    },
  },
};
