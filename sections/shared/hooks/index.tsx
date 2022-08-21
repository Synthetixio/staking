import { useCallback } from 'react';
import { getOptimismNetwork } from '@synthetixio/optimism-networks';
import { handleSwitchChain } from '@synthetixio/providers';
import Connector from 'containers/Connector';
import { providers } from 'ethers';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import { delegateWalletState } from 'store/wallet';
import UIContainer from 'containers/UI';

export function useAddOptimism() {
  const { network, isWalletConnected, isL2 } = Connector.useContainer();

  const delegateWallet = useRecoilValue(delegateWalletState);

  const { setNetworkError } = UIContainer.useContainer();
  const { provider } = Connector.useContainer();
  const { t } = useTranslation();

  const showAddOptimism = !isL2 && isWalletConnected && !delegateWallet;

  const addOptimismNetwork = useCallback(async () => {
    setNetworkError(null);
    if (process.browser && !(window.ethereum && window.ethereum.isMetaMask)) {
      return setNetworkError(t('user-menu.error.please-install-metamask'));
    }

    try {
      if (provider) {
        await handleSwitchChain(provider as providers.Web3Provider, false);
      }
    } catch (e: any) {
      if (e?.code === 4001) return; // Exit if user has cancelled
      try {
        // metamask mobile throws if iconUrls is included
        const { chainId, chainName, rpcUrls, blockExplorerUrls } = getOptimismNetwork({
          layerOneNetworkId: Number(network?.id) || 1,
        });
        await (window.ethereum as any).request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId,
              chainName,
              rpcUrls,
              blockExplorerUrls,
            },
          ],
        });
      } catch (e) {
        setNetworkError((e as Record<'message', string>).message);
      }
    }
  }, [provider, network?.id, t, setNetworkError]);

  return { showAddOptimism, addOptimismNetwork };
}
