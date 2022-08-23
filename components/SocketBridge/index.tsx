import { Bridge } from '@socket.tech/widget';
import { NetworkIdByName } from '@synthetixio/contracts-interface';
import { useTheme } from 'styled-components';
import Connector from 'containers/Connector';

// The widget requires rgb and we have our theme defined in hex
const hexToRgb = (hex: string) => {
  //@ts-ignore
  const rgbString = hex
    .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16))
    .join();
  return `rba(${rgbString})`;
};
const sUSDAddressMainnet = '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51';
const sUSDAddressOptimism = '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9';

function SocketBridge() {
  const { colors } = useTheme();
  const { provider, network } = Connector.useContainer();
  const isL2 = network?.id === NetworkIdByName['mainnet-ovm'];
  const defaultDestNetwork = isL2 ? NetworkIdByName['mainnet'] : NetworkIdByName['mainnet-ovm'];
  const defaultSourceToken = isL2 ? sUSDAddressOptimism : sUSDAddressMainnet;
  const defaultDestToken = isL2 ? sUSDAddressMainnet : sUSDAddressOptimism;
  return (
    <Bridge
      provider={provider}
      API_KEY={process.env.NEXT_PUBLIC_SOCKET_API_KEY!}
      defaultSourceToken={defaultSourceToken}
      defaultDestToken={defaultDestToken}
      defaultSourceNetwork={network?.id}
      defaultDestNetwork={defaultDestNetwork}
      customize={{
        width: 500,
        responsiveWidth: true,
        borderRadius: 0.2,
        primary: hexToRgb(colors.navy),
        secondary: hexToRgb(colors.mediumBlue),
        text: hexToRgb(colors.white),
        secondaryText: hexToRgb(colors.white),
        accent: hexToRgb(colors.blueHover),
        onAccent: hexToRgb(colors.white),
        interactive: hexToRgb(colors.grayBlue),
        onInteractive: hexToRgb(colors.white),
        outline: hexToRgb(colors.mediumBlue),
      }}
    />
  );
}

export default SocketBridge;
