import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

// leaving the wrong icons for now
import Stake from 'assets/inline-svg/app/stake.svg';
import Trade from 'assets/inline-svg/app/trade.svg';

import { FlexDiv, FlexDivCentered, FlexDivCol, FlexDivRowCentered } from 'styles/common';

type Action = {
	icon: () => JSX.Element;
	title: string;
	copy: string;
	link: string;
	action: string;
};

interface PossibleActionsProps {
	claimAmount: number;
	sUSDAmount: number;
	SNXAmount: number;
	earnPercent: number;
}

const PossibleActions: FC<PossibleActionsProps> = ({
	claimAmount,
	sUSDAmount,
	SNXAmount,
	earnPercent,
}) => {
	const { t } = useTranslation();
	const actions: Action[] = useMemo(
		() => [
			{
				icon: () => <Stake />,
				title: t('dashboard.actions.claim.title', { amount: claimAmount }),
				copy: t('dashboard.actions.claim.copy'),
				action: t('dashboard.actions.claim.action'),
				link: '/',
			},
			{
				icon: () => <Stake />,
				title: t('dashboard.actions.stake.title'),
				copy: t('dashboard.actions.stake.copy', { sUSDAmount, SNXAmount }),
				action: t('dashboard.actions.stake.action'),
				link: '/',
			},
			{
				icon: () => <Trade />,
				title: t('dashboard.actions.earn.title', { percent: earnPercent }),
				copy: t('dashboard.actions.earn.copy'),
				action: t('dashboard.actions.earn.action'),
				link: '/',
			},
		],
		[claimAmount, sUSDAmount, SNXAmount, earnPercent]
	);

	return (
		<PossibleActionsContainer>
			<PossibleActionsTitle>{t('dashboard.actions.title')}</PossibleActionsTitle>
			<ActionsContainer>
				{actions.map(({ icon, title, copy, action, link }, index) => (
					<ActionBox key={index}>
						<ActionIcon>{icon()}</ActionIcon>
						<ActionTitle>{title}</ActionTitle>
						<ActionCopy>{copy}</ActionCopy>
						<ActionButton as="a" href={link}>
							{action}
						</ActionButton>
					</ActionBox>
				))}
			</ActionsContainer>
		</PossibleActionsContainer>
	);
};

const PossibleActionsContainer = styled.div`
	margin: 20px 0;
`;

const PossibleActionsTitle = styled.div`
	font-size: 20px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.white};
`;

const ActionsContainer = styled(FlexDiv)`
	justify-content: space-between;
`;

const ActionTitle = styled.p`
	font-size: 20px;
	font-family: ${(props) => props.theme.fonts.expanded};
	color: ${(props) => props.theme.colors.white};
`;

const ActionBox = styled(FlexDivCol)`
	background: rgba(9, 9, 47, 0.8);
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);
	border-radius: 4px;
	margin-bottom: 16px;
	padding: 20px;
	text-align: center;
`;

const ActionIcon = styled.div`
	width: 100px;
	height: 20px;
	margin: 20px auto;
`;

const ActionCopy = styled.p`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	font-size: 12px;
	width: 75%;
	color: ${(props) => props.theme.colors.silver};
	margin: 0 auto;
`;

const ActionButton = styled.div`
	width: 161px;
	height: 48px;
	background: #0c2344;
	border: ${(props) => `1px solid ${props.theme.colors.brightBlue}`};
	box-sizing: border-box;
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	color: ${(props) => props.theme.colors.brightBlue};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	font-size: 12px;
	text-decoration: none;
	text-align: center;
	margin: 20px auto;
	padding-top: 15px;
`;

export default PossibleActions;
