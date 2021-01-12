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
	depositAmount: string;
	hash: string;
	currencyKey: string;
};

const ActionInProgress: FC<ActionInProgressProps> = ({ depositAmount, currencyKey, hash }) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const link = etherscanInstance != null ? etherscanInstance.txLink(hash) : undefined;
	return (
		<Container>
			<SectionHeader>{t('layer2.actions.deposit.action.in-progress.title')}</SectionHeader>
			<Svg src={PendingConfirmation} />
			<FlexDivCentered>
				<InfoContainer key="one">
					<InfoTitle>{t('layer2.actions.deposit.action.in-progress.depositing')}</InfoTitle>
					<InfoData>
						{formatCurrency(currencyKey, depositAmount, { currencyKey: currencyKey })}
					</InfoData>
				</InfoContainer>
			</FlexDivCentered>
			<SectionSubtext>{t('layer2.actions.deposit.action.in-progress.subtext')}</SectionSubtext>
			{link ? (
				<StyledExternalLink href={link}>
					{t('layer2.actions.deposit.action.in-progress.etherscan')}
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
