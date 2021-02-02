import { FC } from 'react';
import { Svg } from 'react-optimized-image';

import Etherscan from 'containers/Etherscan';
import { ExternalLink } from 'styles/common';

import LinkIcon from 'assets/svg/app/link-blue.svg';

type ExternalLinkIconProps = {
	transactionHash: string;
};

const ExternalLinkIcon: FC<ExternalLinkIconProps> = ({ transactionHash }) => {
	const { etherscanInstance } = Etherscan.useContainer();
	const link = etherscanInstance != null ? etherscanInstance.txLink(transactionHash) : undefined;
	return (
		<ExternalLink href={link}>
			<Svg src={LinkIcon} />
		</ExternalLink>
	);
};

export default ExternalLinkIcon;
