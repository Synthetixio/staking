import { FC, useEffect, useState } from 'react';
import Connector from 'containers/Connector';

import { NetworkIdByName, NetworkId } from '@synthetixio/contracts-interface';
import { Navigation } from '../navigation';

export const Header: FC = () => {
  const { isWalletConnected, walletAddress, connectWallet, switchNetwork, network } =
    Connector.useContainer();

  const [localNetwork, setLocalNetwork] = useState<NetworkId>(
    network?.id ? (network.id as NetworkId) : (NetworkIdByName.mainnet as NetworkId)
  );

  useEffect(() => {
    setLocalNetwork(
      network?.id ? (network.id as NetworkId) : (NetworkIdByName.mainnet as NetworkId)
    );
  }, [network]);

  const switchMenuNetwork = async (networkId: NetworkId) => {
    if (network && networkId === network.id) return;
    if (isWalletConnected) {
      const result = await switchNetwork(networkId);
      if (!result) return;
    }

    setLocalNetwork(networkId);
  };

  return (
    <Navigation
      isWalletConnected={isWalletConnected}
      connectWallet={() => connectWallet(localNetwork)}
      currentNetwork={localNetwork}
      switchNetwork={switchMenuNetwork}
      walletAddress={walletAddress}
    />
  );
};
