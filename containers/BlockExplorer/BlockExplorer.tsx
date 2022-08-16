import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { OPTIMISM_NETWORKS } from '@synthetixio/optimism-networks';

import { NetworkIdByName } from '@synthetixio/contracts-interface';
import { Network } from 'store/wallet';

import _ from 'lodash';
import Connector from 'containers/Connector';

type BlockExplorerInstance = {
  txLink: (txId: string) => string;
  addressLink: (address: string) => string;
  tokenLink: (address: string) => string;
  blockLink: (blockNumber: string) => string;
  messageRelayer: (txId: string) => string;
};

const getBaseUrl = (network: Network) => {
  if (network.useOvm) {
    return (
      OPTIMISM_NETWORKS[Number(network.id)]?.blockExplorerUrls[0] ??
      OPTIMISM_NETWORKS[_.keys(OPTIMISM_NETWORKS)[0] as any].blockExplorerUrls[0]
    );
  } else if (network.id === NetworkIdByName.mainnet) {
    return 'https://etherscan.io';
  }
  return `https://${network.name}.etherscan.io`;
};

const generateExplorerFunctions = (baseUrl: string) => {
  return {
    txLink: (txId: string) => `${baseUrl}/tx/${txId}`,
    addressLink: (address: string) => `${baseUrl}/address/${address}`,
    tokenLink: (address: string) => `${baseUrl}/token/${address}`,
    blockLink: (blockNumber: string) => `${baseUrl}/block/${blockNumber}`,
    messageRelayer: (txId: string) => `${baseUrl}/messagerelayer?search=${txId}`,
  };
};

const useBlockExplorer = () => {
  const { network } = Connector.useContainer();

  const [blockExplorerInstance, setBlockExplorerInstance] = useState<BlockExplorerInstance | null>(
    null
  );

  useEffect(() => {
    if (network) {
      const baseUrl = getBaseUrl(network);
      setBlockExplorerInstance(generateExplorerFunctions(baseUrl));
    }
  }, [network]);

  return {
    blockExplorerInstance,
  };
};

const BlockExplorer = createContainer(useBlockExplorer);

export default BlockExplorer;
