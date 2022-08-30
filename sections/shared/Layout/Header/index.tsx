import { FC, useEffect, useState } from 'react';
import Connector from 'containers/Connector';

import {
  NetworkNameById,
  NetworkIdByName,
  NetworkName,
  NetworkId,
} from '@synthetixio/contracts-interface';
import Navigation from 'components/Navigation';

const Header: FC = () => {
  const { isWalletConnected, walletAddress, connectWallet, switchNetwork, isMainnet, network } =
    Connector.useContainer();

  const [localNetwork, setLocalNetwork] = useState<NetworkName>(
    isMainnet
      ? NetworkNameById[NetworkIdByName.mainnet]
      : NetworkNameById[NetworkIdByName['mainnet-ovm']]
  );

  useEffect(() => {
    setLocalNetwork(
      isMainnet
        ? NetworkNameById[NetworkIdByName.mainnet]
        : NetworkNameById[NetworkIdByName['mainnet-ovm']]
    );
  }, [isMainnet]);

  const switchMenuNetwork = async (networkName: NetworkName) => {
    if (network && networkName === NetworkNameById[network.id as NetworkId]) return;
    if (isWalletConnected) {
      const result = await switchNetwork(NetworkIdByName[networkName]);
      if (!result) return;
    }

    setLocalNetwork(networkName);
  };

  return (
    <Navigation
      isWalletConnected={isWalletConnected}
      connectWallet={connectWallet}
      currentNetwork={localNetwork}
      switchNetwork={switchMenuNetwork}
      walletAddress={walletAddress}
    />
  );
};

export default Header;
