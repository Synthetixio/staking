import React, { FC } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import Etherscan from 'containers/Etherscan';
import { FlexDivCentered, FlexDivColCentered, ExternalLink } from 'styles/common';
import Burn from 'assets/svg/app/burn.svg';

import { SectionHeader } from './common';

type ActionInProgressProps = {
	isMint: boolean;
	stake?: string;
	mint?: string;
	unstake?: string;
	burn?: string;
	hash: string;
};

const ActionInProgress: FC<ActionInProgressProps> = ({
	isMint,
	stake,
	unstake,
	mint,
	burn,
	hash,
}) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const link = etherscanInstance != null ? etherscanInstance.txLink(hash) : undefined;
	return (
		<Container>
			<SectionHeader>
				{isMint
					? t('staking.actions.mint.in-progress.title')
					: t('staking.actions.burn.in-progress.title')}
			</SectionHeader>
			<Svg src={Burn} />
			<FlexDivCentered>
				<FlexDivColCentered key="one">
					<InfoTitle>
						{isMint
							? t('staking.actions.mint.in-progress.staking')
							: t('staking.actions.burn.in-progress.unstaking')}
					</InfoTitle>
					<InfoData>{isMint ? stake : mint}</InfoData>
				</FlexDivColCentered>
				<FlexDivColCentered key="two">
					<InfoTitle>
						{isMint
							? t('staking.actions.mint.in-progress.minting')
							: t('staking.actions.burn.in-progress.burning')}
					</InfoTitle>
					<InfoData>{isMint ? unstake : burn}</InfoData>
				</FlexDivColCentered>
			</FlexDivCentered>
			<Subtext>
				{isMint
					? t('staking.actions.mint.in-progress.subtext')
					: t('staking.actions.burn.in-progress.subtext')}
			</Subtext>
			{link ? (
				<ExternalLink href={link}>
					{isMint
						? t('staking.actions.mint.in-progress.etherscan')
						: t('staking.actions.burn.in-progress.etherscan')}
				</ExternalLink>
			) : null}
		</Container>
	);
};

const Container = styled(FlexDivColCentered)`
	width: 80%;
	margin: 0 auto;
	text-align: center;
`;

const InfoTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
	margin-bottom: 15px;
`;
const InfoData = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
	margin-bottom: 15px;
`;

const Subtext = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.gray};
	margin-bottom: 15px;
`;

export default ActionInProgress;
