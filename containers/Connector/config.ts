import { getChainIdHex, getInfuraRpcURL } from 'utils/infura';
import { NetworkIdByName } from '@synthetixio/contracts-interface';

import Onboard from '@web3-onboard/core';
import type { OnboardAPI } from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import coinbaseWalletModule from '@web3-onboard/coinbase';
import walletConnectModule from '@web3-onboard/walletconnect';
import ledgerModule from '@web3-onboard/ledger';
// import trezorModule from '@web3-onboard/trezor';
import gnosisModule from '@web3-onboard/gnosis';
import portisModule from '@web3-onboard/portis';
import torusModule from '@web3-onboard/torus';

import { SynthetixIcon, SynthetixLogo } from 'components/WalletComponents';

const injected = injectedModule();
const coinbaseWalletSdk = coinbaseWalletModule({ darkMode: true });
const walletConnect = walletConnectModule();
const ledger = ledgerModule();
// The trezor module have a bug, we can enable it when this has been merged and released: https://github.com/blocknative/web3-onboard/pull/1165
// const trezor = trezorModule({ email: 'info@synthetix.io', appUrl: 'https://www.synthetix.io' });
const gnosis = gnosisModule();
const portis = portisModule({ apiKey: `${process.env.NEXT_PUBLIC_PORTIS_APP_ID}` });
const torus = torusModule();

const supportedChains = [
  // Mainnet
  {
    id: getChainIdHex(NetworkIdByName.mainnet),
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: getInfuraRpcURL(NetworkIdByName.mainnet),
  },
  // Mainnet Ovm
  {
    id: getChainIdHex(NetworkIdByName['mainnet-ovm']),
    token: 'ETH',
    label: 'Optimism Mainnet',
    rpcUrl: getInfuraRpcURL(NetworkIdByName['mainnet-ovm']),
  },
  // goerli
  {
    id: getChainIdHex(NetworkIdByName.goerli),
    token: 'ETH',
    label: 'Goerli',
    rpcUrl: getInfuraRpcURL(NetworkIdByName.goerli),
  },
  // goerli Ovm
  {
    id: getChainIdHex(NetworkIdByName['goerli-ovm']),
    token: 'ETH',
    label: 'Optimism Goerli',
    rpcUrl: getInfuraRpcURL(NetworkIdByName['goerli-ovm']),
  },
];

export const isSupportedWalletChain = (networkId: number) => {
  return !!supportedChains.find((chain) => chain.id === `0x${networkId.toString(16)}`);
};

export const onboard: OnboardAPI = Onboard({
  appMetadata: {
    name: 'Synthetix',
    icon: SynthetixIcon,
    logo: SynthetixLogo,
    description: 'Synthetix | The derivatives liquidity protocol.',
    recommendedInjectedWallets: [
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
    gettingStartedGuide: 'https://synthetix.io',
    explore: 'https://blog.synthetix.io/',
  },
  apiKey: process.env.NEXT_PUBLIC_BN_ONBOARD_API_KEY,
  wallets: [injected, ledger /*trezor,*/, coinbaseWalletSdk, walletConnect, gnosis, portis, torus],
  chains: [...supportedChains],
  accountCenter: {
    desktop: {
      enabled: false,
      containerElement: 'body',
    },
    mobile: {
      enabled: false,
      containerElement: 'body',
    },
  },
  notify: {
    enabled: false,
  },
});
