import { FC } from 'react';
import { Svg } from 'react-optimized-image';

import Etherscan from 'containers/BlockExplorer';
import { ExternalLink, FlexDivCentered } from 'styles/common';

import LinkIcon from 'assets/svg/app/link-blue.svg';
import styled from 'styled-components';

type ExternalLinkIconProps = {
	transactionHash: string;
	relay?: boolean;
	children?: React.ReactNode;
};

const ExternalLinkIcon: FC<ExternalLinkIconProps> = ({ transactionHash, relay, children }) => {
	const { blockExplorerInstance } = Etherscan.useContainer();
	const link =
		blockExplorerInstance != null
			? relay
				? blockExplorerInstance.messageRelayer(transactionHash)
				: blockExplorerInstance.txLink(transactionHash)
			: undefined;
	return (
		<ExternalLink href={link}>
			<FlexDivCentered>
				<StyledLabel>{children}</StyledLabel>
				<Svg src={LinkIcon} />
			</FlexDivCentered>
		</ExternalLink>
	);
};

const StyledLabel = styled.span`
	color: ${(props) => props.theme.colors.blue};
	margin-right: 2px;
`;

export default ExternalLinkIcon;
