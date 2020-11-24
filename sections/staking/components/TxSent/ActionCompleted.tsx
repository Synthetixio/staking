import { FC, useEffect } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { FlexDivRowCentered, FlexDivCentered, FlexDivColCentered } from 'styles/common';
import Burn from 'assets/svg/app/burn.svg';
import { Transaction } from 'constants/network';
import ROUTES from 'constants/routes';
import { SYNTHS_MAP } from 'constants/currency';

import { SectionHeader, SectionSubtext } from './common';

type ActionCompletedProps = {
	setTransactionState: (tx: Transaction) => void;
	isMint: boolean;
};

const ActionCompleted: FC<ActionCompletedProps> = ({ setTransactionState, isMint }) => {
	const { t } = useTranslation();
	const { push } = useRouter();

	useEffect(() => {
		if (!isMint) {
			setTransactionState(Transaction.PRESUBMIT);
		}
	}, [isMint, setTransactionState]);

	if (!isMint) {
		return <Container></Container>;
	}
	return (
		<Container>
			<SectionHeader>
				{t('staking.actions.mint.completed.title', { synth: SYNTHS_MAP.sUSD })}
			</SectionHeader>
			<MainInfoBox>
				<Svg src={Burn} />
				<MiddleInfoSection>
					{t('staking.actions.mint.completed.curve', { synth: SYNTHS_MAP.sUSD })}
				</MiddleInfoSection>
				<RightInfoSection>
					<AprText>{t('staking.actions.mint.completed.est-apr')}</AprText>
					<div>14%</div>
				</RightInfoSection>
			</MainInfoBox>
			<SectionSubtext>{t('staking.actions.mint.completed.subtext')}</SectionSubtext>
			<ButtonWrap>
				<DismissButton onClick={() => setTransactionState(Transaction.PRESUBMIT)}>
					{t('staking.actions.mint.completed.dismiss')}
				</DismissButton>
				<SeeMoreButton onClick={() => push(ROUTES.Earn.Home)}>
					{t('staking.actions.mint.completed.see-more')}
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

const MainInfoBox = styled(FlexDivCentered)`
	margin-top: 45px;
	background-color: ${(props) => props.theme.colors.blueGray};
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 12px;
	justify-content: space-around;
	color: ${(props) => props.theme.colors.white};
	height: 95px;
	width: 100%;
	border-radius: 4px;
	margin-bottom: 20px;
`;

const MiddleInfoSection = styled.div`
	word-wrap: normal;
	height: auto;
	width: 180px;
`;

const RightInfoSection = styled(FlexDivColCentered)`
	border: 1px solid ${(props) => props.theme.colors.borderSilver};
	padding: 10px;
	font-size: 10px;
	border-radius: 4px;
`;

const AprText = styled.div`
	color: ${(props) => props.theme.colors.lightFont};
	margin-bottom: 5px;
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
	margin-top: 60px;
`;

const DismissButton = styled(BaseButton)`
	background-color: ${(props) => props.theme.colors.darkBlue};
	color: ${(props) => props.theme.colors.white};
	border: 1px solid ${(props) => props.theme.colors.borderLight};
`;

const SeeMoreButton = styled(BaseButton)`
	background-color: ${(props) => props.theme.colors.lightBlue};
	color: ${(props) => props.theme.colors.brightBlue};
	border: 1px solid ${(props) => props.theme.colors.brightBlue};
`;

export default ActionCompleted;
