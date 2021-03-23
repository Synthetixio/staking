import React, { FC } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import Etherscan from 'containers/BlockExplorer';
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
	amount: string;
	action: string;
	hash: string;
	currencyKey: string;
};

const ActionInProgress: FC<ActionInProgressProps> = ({ amount, currencyKey, hash, action }) => {
	const { t } = useTranslation();
	const { blockExplorerInstance } = Etherscan.useContainer();
	const link = blockExplorerInstance != null ? blockExplorerInstance.txLink(hash) : undefined;
	return (
		<Container>
			<SectionHeader>{t(`layer2.actions.${action}.action.in-progress.title`)}</SectionHeader>
			<Svg src={PendingConfirmation} />
			<FlexDivCentered>
				<InfoContainer key="one">
					<InfoTitle>{t(`layer2.actions.${action}.action.in-progress.depositing`)}</InfoTitle>
					<InfoData>{formatCurrency(currencyKey, amount, { currencyKey: currencyKey })}</InfoData>
				</InfoContainer>
			</FlexDivCentered>
			<SectionSubtext>{t(`layer2.actions.${action}.action.in-progress.subtext`)}</SectionSubtext>
			{link ? (
				<StyledExternalLink href={link}>
					{t(`layer2.actions.${action}.action.in-progress.etherscan`)}
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
