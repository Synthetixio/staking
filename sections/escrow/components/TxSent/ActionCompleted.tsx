import React, { FC } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivRowCentered, FlexDivCentered, FlexDivColCentered } from 'styles/common';
import Success from 'assets/svg/app/circle-tick.svg';
import { Transaction } from 'constants/network';

import { InfoContainer, InfoData, InfoTitle, SectionHeader } from './common';
import { formatCurrency } from 'utils/formatters/number';
import Etherscan from 'containers/Etherscan';

type ActionCompletedProps = {
	setTransactionState: (tx: Transaction) => void;
	vestingAmount: string;
	currencyKey: string;
	hash: string;
};

const ActionCompleted: FC<ActionCompletedProps> = ({
	setTransactionState,
	vestingAmount,
	currencyKey,
	hash,
}) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const link = etherscanInstance != null ? etherscanInstance.txLink(hash) : undefined;
	return (
		<Container>
			<SectionHeader>{t('escrow.actions.completed.title')}</SectionHeader>
			<Svg src={Success} />
			<FlexDivCentered>
				<InfoContainer key="one">
					<InfoTitle>{t('escrow.actions.completed.vested')}</InfoTitle>
					<InfoData>
						{formatCurrency(currencyKey, vestingAmount, { currencyKey: currencyKey })}
					</InfoData>
				</InfoContainer>
			</FlexDivCentered>
			<ButtonWrap>
				{link ? (
					<a href={link} target="_blank">
						<DismissButton>{t('escrow.actions.completed.verify')}</DismissButton>
					</a>
				) : null}
				<SeeMoreButton onClick={() => setTransactionState(Transaction.PRESUBMIT)}>
					{t('staking.actions.mint.completed.dismiss')}
				</SeeMoreButton>
			</ButtonWrap>
		</Container>
	);
};

const Container = styled(FlexDivColCentered)`
	width: 90%;
	margin: 0 auto;
	text-align: center;
`;

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

const DismissButton = styled(BaseButton)`
	background-color: ${(props) => props.theme.colors.black};
	color: ${(props) => props.theme.colors.white};
	border: 1px solid ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
`;

const SeeMoreButton = styled(BaseButton)`
	background-color: ${(props) => props.theme.colors.blue};
	color: ${(props) => props.theme.colors.blue};
	border: 1px solid ${(props) => props.theme.colors.blue};
`;

export default ActionCompleted;
