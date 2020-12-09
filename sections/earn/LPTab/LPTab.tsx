import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import StructuredTab from 'components/StructuredTab';
import { FlexDiv, FlexDivColCentered } from 'styles/common';
import { CurrencyKey } from 'constants/currency';
import smallWaveSVG from 'assets/svg/app/small-wave.svg';
import InnerTab from './InnerTab';
import { TabContainer, Label, StyledButton } from '../common';
import snxSVG from 'assets/svg/incentives/pool-snx.svg';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { formatCurrency, formatFiatCurrency } from 'utils/formatters/number';

export enum Staking {
	STAKE = 'STAKE',
	UNSTAKE = 'UNSTAKE',
}

interface LPTabProps {
	asset: CurrencyKey;
	title: JSX.Element;
	icon: ImgSrc;
	tokenRewards: number;
}

const LPTab: FC<LPTabProps> = ({ icon, asset, title, tokenRewards }) => {
	const { t } = useTranslation();
	const [stakeAmount, setStakeAmount] = useState<number | null>(null);
	const [unstakeAmount, setUnstakeAmount] = useState<number | null>(null);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

	const handleStake = (type: Staking) => {
		if (type === Staking.STAKE) {
			console.log('stake amount:', stakeAmount);
		} else if (type === Staking.UNSTAKE) {
			console.log('unstake amount:', unstakeAmount);
		}
	};

	const assetAmount = 0;

	const commonInnerTabProps = {
		icon,
		asset,
		handleStake,
		assetAmount,
	};

	const tabData = useMemo(
		() => [
			{
				title: t('earn.actions.stake.title'),
				tabChildren: (
					<InnerTab
						{...commonInnerTabProps}
						isStake={true}
						setAmount={setStakeAmount}
						inputAmount={stakeAmount}
					/>
				),
				blue: true,
				key: 'stake',
			},
			{
				title: t('earn.actions.unstake.title'),
				tabChildren: (
					<InnerTab
						{...commonInnerTabProps}
						isStake={false}
						setAmount={setUnstakeAmount}
						inputAmount={unstakeAmount}
					/>
				),
				blue: false,
				key: 'unstake',
			},
		],
		[
			t,
			setStakeAmount,
			stakeAmount,
			unstakeAmount,
			setUnstakeAmount,
			icon,
			asset,
			assetAmount,
			handleStake,
		]
	);

	return (
		<TabContainer>
			<Label>{title}</Label>
			<FlexDiv>
				<StructuredTab boxPadding={10} boxHeight={250} boxWidth={300} tabData={tabData} />
				<RewardsContainer>
					<RewardsTitle>{t('earn.actions.rewards.title')}</RewardsTitle>
					<Svg src={snxSVG} />
					<RewardsAmountSNX>
						{formatCurrency(CRYPTO_CURRENCY_MAP.SNX, tokenRewards, {
							currencyKey: '',
							decimals: 2,
						})}
					</RewardsAmountSNX>
					<RewardsAmountUSD>
						{formatFiatCurrency(tokenRewards * SNXRate, { sign: '$' })}
					</RewardsAmountUSD>
					<StyledButton
						variant="primary"
						onClick={() => console.log('claim')}
						disabled={tokenRewards === 0}
					>
						Claim Button text
					</StyledButton>
				</RewardsContainer>
			</FlexDiv>
		</TabContainer>
	);
};

const RewardsContainer = styled(FlexDivColCentered)`
	width: 200px;
	margin: 15px;
	padding: 15px;
	border: 1px solid ${(props) => props.theme.colors.pink};
	border-radius: 4px;
	background-image: url(${smallWaveSVG.src});
`;

const RewardsTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const RewardsAmountSNX = styled.div`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 24px;
	color: ${(props) => props.theme.colors.white};
`;

const RewardsAmountUSD = styled.div`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.gray};
`;

export default LPTab;
