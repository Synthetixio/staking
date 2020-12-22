import React, { FC } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import Etherscan from 'containers/Etherscan';
import { FlexDivCentered, ExternalLink } from 'styles/common';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';

import {
	InfoContainer,
	SectionHeader,
	SectionSubtext,
	InfoTitle,
	InfoData,
	Container,
} from './common';
import { formatCurrency } from 'utils/formatters/number';

type ActionInProgressProps = {
	vestingAmount: string;
	hash: string;
	currencyKey: string;
};

const ActionInProgress: FC<ActionInProgressProps> = ({ vestingAmount, currencyKey, hash }) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const link = etherscanInstance != null ? etherscanInstance.txLink(hash) : undefined;
	return (
		<Container>
			<SectionHeader>{t('escrow.actions.in-progress.title')}</SectionHeader>
			<Svg src={PendingConfirmation} />
			<FlexDivCentered>
				<InfoContainer key="one">
					<InfoTitle>{t('escrow.actions.in-progress.vesting')}</InfoTitle>
					<InfoData>
						{formatCurrency(currencyKey, vestingAmount, { currencyKey: currencyKey })}
					</InfoData>
				</InfoContainer>
			</FlexDivCentered>
			<SectionSubtext>{t('escrow.actions.in-progress.subtext')}</SectionSubtext>
			{link ? (
				<StyledExternalLink href={link}>
					{t('escrow.actions.in-progress.etherscan')}
				</StyledExternalLink>
			) : null}
		</Container>
	);
};

const StyledExternalLink = styled(ExternalLink)`
	margin-top: 25px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.blue};
	font-size: 12px;
`;

export default ActionInProgress;
