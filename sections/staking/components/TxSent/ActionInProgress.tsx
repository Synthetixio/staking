import React, { FC } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import Etherscan from 'containers/Etherscan';
import { FlexDivCentered, FlexDivColCentered, ExternalLink } from 'styles/common';
import Burn from 'assets/svg/app/burn.svg';

import { SectionHeader, SectionSubtext } from './common';

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
				<InfoContainer key="one">
					<InfoTitle>
						{isMint
							? t('staking.actions.mint.in-progress.staking')
							: t('staking.actions.burn.in-progress.unstaking')}
					</InfoTitle>
					<InfoData>{isMint ? stake : mint}</InfoData>
				</InfoContainer>
				<InfoContainer key="two">
					<InfoTitle>
						{isMint
							? t('staking.actions.mint.in-progress.minting')
							: t('staking.actions.burn.in-progress.burning')}
					</InfoTitle>
					<InfoData>{isMint ? unstake : burn}</InfoData>
				</InfoContainer>
			</FlexDivCentered>
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

const Container = styled(FlexDivColCentered)`
	width: 80%;
	margin: 0 auto;
	text-align: center;
`;

const InfoContainer = styled(FlexDivColCentered)`
	border-bottom: 1px solid ${(props) => props.theme.colors.linedBlue};
	width: 150px;
	margin: 45px 0;
	height: 100px;
	&:first-child {
		border-right: 1px solid ${(props) => props.theme.colors.linedBlue};
	}
`;

const InfoTitle = styled.div`
	margin-top: 5px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	margin-bottom: 25px;
`;
const InfoData = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	margin-bottom: 25px;
`;

const StyledExternalLink = styled(ExternalLink)`
	margin-top: 25px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.brightBlue};
	font-size: 14px;
`;

export default ActionInProgress;
