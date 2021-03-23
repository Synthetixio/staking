import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useRecoilValue } from 'recoil';
import { networkState, isWalletConnectedState } from 'store/wallet';
import { NetworkId } from '@synthetixio/contracts-interface';

type ConnectionDotProps = {};

const ConnectionDot: React.FC<ConnectionDotProps> = ({ ...rest }) => {
	const network = useRecoilValue(networkState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = network?.useOvm ?? false;

	const theme = useTheme();

	if (network && isWalletConnected) {
		if (isL2) return <Dot {...rest} background={theme.colors.layer2} />;
		switch (network.id) {
			case NetworkId.Mainnet:
				return <Dot {...rest} background={theme.colors.mainnet} />;
			case NetworkId.Ropsten:
				return <Dot {...rest} background={theme.colors.ropsten} />;
			case NetworkId.Kovan:
				return <Dot {...rest} background={theme.colors.kovan} />;
			case NetworkId.Rinkeby:
				return <Dot {...rest} background={theme.colors.rinkeby} />;
			case NetworkId.Goerli:
				return <Dot {...rest} background={theme.colors.goerli} />;
			default:
				return <Dot {...rest} background={theme.colors.noNetwork} />;
		}
	} else {
		return <Dot {...rest} background={theme.colors.noNetwork} />;
	}
};

const Dot = styled.span<{ background: string }>`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background-color: ${(props) => props.background};
`;

export default ConnectionDot;
