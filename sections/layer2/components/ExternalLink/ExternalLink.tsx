import { FC } from 'react';
import { Svg } from 'react-optimized-image';

import Etherscan from 'containers/BlockExplorer';
import { ExternalLink } from 'styles/common';

import LinkIcon from 'assets/svg/app/link-blue.svg';

type ExternalLinkIconProps = {
	transactionHash: string;
};

const ExternalLinkIcon: FC<ExternalLinkIconProps> = ({ transactionHash }) => {
	const { blockExplorerInstance } = Etherscan.useContainer();
	const link =
		blockExplorerInstance != null ? blockExplorerInstance.txLink(transactionHash) : undefined;
	return (
		<ExternalLink href={link}>
			<Svg src={LinkIcon} />
		</ExternalLink>
	);
};

export default ExternalLinkIcon;
