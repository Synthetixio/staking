import React, { FC } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivRowCentered, FlexDivCentered, ExternalLink, boxShadowBlue } from 'styles/common';
import Success from 'assets/svg/app/circle-tick.svg';
import { Transaction } from 'constants/network';

import { InfoContainer, InfoData, InfoTitle, SectionHeader, Container } from './common';
import { formatCurrency } from 'utils/formatters/number';
import Etherscan from 'containers/Etherscan';
import { NumericValue } from 'utils/formatters/number';

type ActionCompletedProps = {
	setTransactionState: (tx: Transaction) => void;
	vestingAmount?: string;
	currencyKey?: string;
	hash: string;
	isMigration?: boolean;
	setIsMigration?: (isMigration: boolean) => void;
};

const ActionCompleted: FC<ActionCompletedProps> = ({
	setTransactionState,
	vestingAmount,
	currencyKey,
	hash,
	isMigration = false,
	setIsMigration = () => null,
}) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const link = etherscanInstance != null ? etherscanInstance.txLink(hash) : undefined;
	return (
		<Container>
			<SectionHeader>
				{isMigration
					? t('escrow.actions.migration.completed.title')
					: t('escrow.actions.completed.title')}
			</SectionHeader>
			<Svg src={Success} />
			<FlexDivCentered>
				<InfoContainer key="one">
					<InfoTitle>
						{isMigration
							? t('escrow.actions.migration.completed.migrating')
							: t('escrow.actions.completed.vested')}
					</InfoTitle>
					<InfoData>
						{isMigration
							? t('escrow.actions.migration.completed.escrow-schedule')
							: formatCurrency(currencyKey as string, vestingAmount as NumericValue, {
									currencyKey: currencyKey,
							  })}
					</InfoData>
				</InfoContainer>
			</FlexDivCentered>
			<ButtonWrap>
				{link ? (
					<ExternalLink href={link}>
						<LeftButton>{t('escrow.actions.completed.verify')}</LeftButton>
					</ExternalLink>
				) : null}
				<RightButton
					onClick={() => {
						setIsMigration(false);
						setTransactionState(Transaction.PRESUBMIT);
					}}
				>
					{t('staking.actions.mint.completed.dismiss')}
				</RightButton>
			</ButtonWrap>
		</Container>
	);
};

const BaseButton = styled.div`
	width: 175px;
	height: 50px;
	padding-top: 16px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;
	border-radius: 4px;
	cursor: pointer;
`;

const ButtonWrap = styled(FlexDivRowCentered)`
	width: 100%;
	margin: 16px 0px;
`;

const LeftButton = styled(BaseButton)`
	background-color: ${(props) => props.theme.colors.black};
	color: ${(props) => props.theme.colors.white};
	border: 1px solid ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
`;

const RightButton = styled(BaseButton)`
	${boxShadowBlue}
	background-color: ${(props) => props.theme.colors.grayBlue};
	color: ${(props) => props.theme.colors.blue};
	text-transform: uppercase;

`;

export default ActionCompleted;
