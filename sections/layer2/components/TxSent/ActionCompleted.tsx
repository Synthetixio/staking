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

type ActionCompletedProps = {
	setTransactionState: (tx: Transaction) => void;
	depositAmount: string;
	currencyKey: string;
	hash: string;
};

const ActionCompleted: FC<ActionCompletedProps> = ({
	setTransactionState,
	depositAmount,
	currencyKey,
	hash,
}) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const link = etherscanInstance != null ? etherscanInstance.txLink(hash) : undefined;
	return (
		<Container>
			<SectionHeader>{t('layer2.actions.deposit.action.completed.title')}</SectionHeader>
			<Svg src={Success} />
			<FlexDivCentered>
				<InfoContainer key="one">
					<InfoTitle>{t('layer2.actions.deposit.action.completed.deposited')}</InfoTitle>
					<InfoData>
						{formatCurrency(currencyKey, depositAmount, { currencyKey: currencyKey })}
					</InfoData>
				</InfoContainer>
			</FlexDivCentered>
			<ButtonWrap>
				{link ? (
					<ExternalLink href={link}>
						<LeftButton>{t('layer2.actions.deposit.action.completed.verify')}</LeftButton>
					</ExternalLink>
				) : null}
				<RightButton onClick={() => setTransactionState(Transaction.PRESUBMIT)}>
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
