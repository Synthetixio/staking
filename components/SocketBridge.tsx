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
function SocketBridge() {
	const { colors } = useTheme();
	const { provider, network, synthetixjs } = Connector.useContainer();
	const sourceNetworks = [NetworkIdByName['mainnet-ovm'], NetworkIdByName['mainnet']];
	const destinationNetworks = [NetworkIdByName['mainnet-ovm'], NetworkIdByName['mainnet']];
	const defaultDestNetwork =
		network?.id === NetworkIdByName['mainnet-ovm']
			? NetworkIdByName['mainnet']
			: NetworkIdByName['mainnet-ovm'];

	return (
		<Bridge
			provider={provider}
			API_KEY={process.env.NEXT_PUBLIC_SOCKET_API_KEY}
			sourceNetworks={sourceNetworks}
			destNetworks={destinationNetworks}
			defaultSourceToken={synthetixjs?.contracts.SynthsUSD.address}
			defaultDestToken={synthetixjs?.contracts.SynthsUSD.address}
			defaultSourceNetwork={network?.id}
			defaultDestNetwork={defaultDestNetwork}
			customize={
				{
					width: 500,
					responsiveWidth: true,
					borderRadius: 0,
					primary: hexToRgb(colors.navy),
					secondary: hexToRgb(colors.mediumBlue),
					text: hexToRgb(colors.white),
					secondaryText: hexToRgb(colors.white),
					accent: hexToRgb(colors.blueHover),
					onAccent: hexToRgb(colors.white),
					interactive: hexToRgb(colors.navy),
					onInteractive: hexToRgb(colors.white),
					outline: hexToRgb(colors.mediumBlue),
				} as any
			}
		/>
	);
}

export default SocketBridge;
