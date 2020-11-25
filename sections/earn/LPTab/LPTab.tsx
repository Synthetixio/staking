import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Input from 'components/Input/Input';
import Button from 'components/Button';
import { FlexDiv, FlexDivColCentered } from 'styles/common';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';

interface LPTabProps {
	title: string;
	weeklyRewards: number;
}

const LPTab: FC<LPTabProps> = ({ title, weeklyRewards }) => {
	const { t } = useTranslation();
	const rewardsAmount = 0;
	const [stakeAmount, setStakeAmount] = useState<string>('0');
	const [unstakeAmount, setUnstakeAmount] = useState<string>('0');
	return (
		<TabContainer>
			<Label>{title}</Label>
			<Label>
				{t('earn.incentives.weekly-rewards', { weeklyRewards, asset: CRYPTO_CURRENCY_MAP.SNX })}
			</Label>
			<FlexDiv>
				<StakeContainer>
					<Input
						placeholder="0"
						onChange={(e) => setStakeAmount(e.target.value)}
						value={stakeAmount}
					/>
					<StyledButton
						variant="primary"
						onClick={() => console.log('stake')}
						disabled={stakeAmount === '0'}
					>
						{t('earn.actions.stake.title')}
					</StyledButton>
				</StakeContainer>
				<StakeContainer>
					<Input
						placeholder="0"
						onChange={(e) => setUnstakeAmount(e.target.value)}
						value={unstakeAmount}
					/>
					<StyledButton
						variant="primary"
						onClick={() => console.log('claim')}
						disabled={unstakeAmount === '0'}
					>
						{t('earn.actions.unstake.title')}
					</StyledButton>
				</StakeContainer>
			</FlexDiv>
			<StyledButton
				variant="primary"
				onClick={() => console.log('claim')}
				disabled={rewardsAmount === 0}
			>
				{t('earn.actions.rewards.title')}
			</StyledButton>
		</TabContainer>
	);
};

const Label = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
	font-size: 12px;
`;

const StyledButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	width: 100%;
	text-transform: uppercase;
`;

const StakeContainer = styled(FlexDivColCentered)`
	padding: 20px;
`;

export const TabContainer = styled(FlexDivColCentered)`
	height: 100%;
	justify-content: space-evenly;
	padding: 24px;
`;

export default LPTab;
