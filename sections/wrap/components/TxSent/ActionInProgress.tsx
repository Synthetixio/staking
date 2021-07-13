import React, { FC } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import Etherscan from 'containers/BlockExplorer';
import { FlexDivCentered } from 'styles/common';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import {
	Container,
	IconContainer,
	InfoContainer,
	InfoData,
	InfoTitle,
	SectionHeader,
	SectionSubtext,
	StyledExternalLink,
	MiddleSection,
} from './common';

type ActionInProgressProps = {
	isMint: boolean;
	from: string;
	to: string;
	hash: string;
};

const ActionInProgress: FC<ActionInProgressProps> = ({ isMint, from, to, hash }) => {
	const { t } = useTranslation();
	const { blockExplorerInstance } = Etherscan.useContainer();
	const link = blockExplorerInstance != null ? blockExplorerInstance.txLink(hash) : undefined;
	return (
		<Container>
			<SectionHeader>
				{isMint
					? t('staking.actions.mint.in-progress.title')
					: t('staking.actions.burn.in-progress.title')}
			</SectionHeader>
			<MiddleSection>
				<IconContainer>
					<Svg src={PendingConfirmation} />
				</IconContainer>
				<FlexDivCentered>
					<InfoContainer key="one">
						<InfoTitle>
							{isMint
								? t('staking.actions.mint.in-progress.staking')
								: t('staking.actions.burn.in-progress.unstaking')}
						</InfoTitle>
						<InfoData>{from}</InfoData>
					</InfoContainer>
					<InfoContainer key="two">
						<InfoTitle>
							{isMint
								? t('staking.actions.mint.in-progress.minting')
								: t('staking.actions.burn.in-progress.burning')}
						</InfoTitle>
						<InfoData>{to}</InfoData>
					</InfoContainer>
				</FlexDivCentered>
			</MiddleSection>
			<SectionSubtext>
				{isMint
					? t('staking.actions.mint.in-progress.subtext')
					: t('staking.actions.burn.in-progress.subtext')}
			</SectionSubtext>
			{link ? (
				<StyledExternalLink href={link}>
					{isMint
						? t('staking.actions.mint.in-progress.etherscan')
						: t('staking.actions.burn.in-progress.etherscan')}
				</StyledExternalLink>
			) : null}
		</Container>
	);
};

export default ActionInProgress;
