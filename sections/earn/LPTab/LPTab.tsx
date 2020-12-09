import { FC, useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import StructuredTab from 'components/StructuredTab';
import { FlexDivCentered, FlexDivColCentered } from 'styles/common';
import { CurrencyKey } from 'constants/currency';
import smallWaveSVG from 'assets/svg/app/small-wave.svg';
import snxSVG from 'assets/svg/incentives/pool-snx.svg';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { formatCurrency, formatFiatCurrency } from 'utils/formatters/number';

import InnerTab from './InnerTab';
import { TabContainer, Label, StyledButton } from '../common';
import Approve from './Approve';

export enum Staking {
	STAKE = 'STAKE',
	UNSTAKE = 'UNSTAKE',
}

interface LPTabProps {
	asset: CurrencyKey;
	title: JSX.Element;
	tokenRewards: number;
	icon: () => JSX.Element;
	allowance: number | null;
}

const LPTab: FC<LPTabProps> = ({ icon, asset, title, tokenRewards, allowance }) => {
	const { t } = useTranslation();
	const [stakeAmount, setStakeAmount] = useState<number | null>(null);
	const [showApproveOverlayModal, setShowApproveOverlayModal] = useState<boolean>(false);
	const [unstakeAmount, setUnstakeAmount] = useState<number | null>(null);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

	useEffect(() => {
		if (allowance === 0) {
			setShowApproveOverlayModal(true);
		} else if (allowance == null) {
			// NOTe maybe do a loading state in this case
			console.log('this is the allowance null case to ignore');
		} else if (allowance > 0) {
			setShowApproveOverlayModal(false);
		}
	}, [allowance]);

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
					<InnerTab {...commonInnerTabProps} isStake={true} setAmount={setStakeAmount} />
				),
				blue: true,
				key: 'stake',
			},
			{
				title: t('earn.actions.unstake.title'),
				tabChildren: (
					<InnerTab {...commonInnerTabProps} isStake={false} setAmount={setUnstakeAmount} />
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
			<FlexDivCentered>
				<StructuredTab
					tabHeight={40}
					inverseTabColor={true}
					boxPadding={0}
					boxHeight={242}
					boxWidth={270}
					tabData={tabData}
				/>
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
						≈ {formatFiatCurrency(tokenRewards * SNXRate, { sign: '$' })}
					</RewardsAmountUSD>
					<StyledButton
						variant="primary"
						onClick={() => console.log('claim')}
						disabled={tokenRewards === 0}
					>
						{t('earn.actions.claim.claim-snx-button')}
					</StyledButton>
				</RewardsContainer>
			</FlexDivCentered>
			{showApproveOverlayModal ? <Approve synth={asset} /> : null}
		</TabContainer>
	);
};

const RewardsContainer = styled(FlexDivColCentered)`
	height: 280px;
	width: 180px;
	margin: 15px;
	padding: 15px;
	border: 1px solid ${(props) => props.theme.colors.pink};
	border-radius: 4px;
	background-image: url(${smallWaveSVG.src});
	background-size: cover;
`;

const RewardsTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	margin-bottom: 10px;
`;

const RewardsAmountSNX = styled.div`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 24px;
	color: ${(props) => props.theme.colors.white};
	margin-top: 10px;
`;

const RewardsAmountUSD = styled.div`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.gray};
	margin-top: 5px;
	margin-bottom: 20px;
`;

export default LPTab;
