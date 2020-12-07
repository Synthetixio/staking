import { FC, useState } from 'react';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import useIETHPoolQuery_1 from 'queries/liquidityPools/useIETHPoolQuery_1';
import useIBTCPoolQuery_1 from 'queries/liquidityPools/useIBTCPoolQuery_1';
import useCurvePoolQuery_1 from 'queries/liquidityPools/useCurvePoolQuery_1';
import useSNXLockedValueQuery from 'queries/staking/useSNXLockedValueQuery';
import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';
import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { FlexDiv } from 'styles/common';

import curveSVG from 'assets/svg/incentives/pool-curve.svg';
import iBTCSVG from 'assets/svg/incentives/pool-ibtc.svg';
import iETHSVG from 'assets/svg/incentives/pool-ieth.svg';
import snxSVG from 'assets/svg/incentives/pool-snx.svg';
import IncentivesTable from './IncentivesTable';
import ClaimTab from './ClaimTab';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

type APRFields = {
	price: number;
	balanceOf: number;
};

type IncentivesProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
	refetch: Function;
	stakingAPR: number;
	stakedValue: number;
};

const Incentives: FC<IncentivesProps> = ({
	tradingRewards,
	stakingRewards,
	totalRewards,
	refetch,
	stakingAPR,
	stakedValue,
}) => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<number | null>(null);

	const claimedSNX = useClaimedStatus();
	const useiETHPool = useIETHPoolQuery_1();
	const useiBTCPool = useIBTCPoolQuery_1();
	const useCurvePool = useCurvePoolQuery_1();
	const useSNXLockedValue = useSNXLockedValueQuery();
	const { nextFeePeriodStarts } = useFeePeriodTimeAndProgress();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

	const iETHTVL = (useiETHPool.data?.balance ?? 0) * (useiETHPool.data?.price ?? 0);
	const iETHAPR = (((useiETHPool.data?.distribution ?? 0) * SNXRate) / iETHTVL) * 52;

	const iBTCTVL = (useiBTCPool.data?.balance ?? 0) * (useiBTCPool.data?.price ?? 0);
	const iBTCAPR = (((useiBTCPool.data?.distribution ?? 0) * SNXRate) / iBTCTVL) * 52;

	const curveTVL = (useCurvePool.data?.balance ?? 0) * (useCurvePool.data?.price ?? 0);
	const curveAPR =
		(((useCurvePool.data?.distribution ?? 0) * SNXRate) / curveTVL) * 52 +
		(useCurvePool.data?.swapAPY ?? 0) +
		(useCurvePool.data?.rewardsAPY ?? 0);

	const incentives = [
		{
			icon: () => <Svg src={snxSVG} />,
			title: t('earn.incentives.options.snx.title'),
			subtitle: t('earn.incentives.options.snx.subtitle'),
			apr: stakingAPR,
			tvl: useSNXLockedValue.data ?? 0,
			staked: {
				balance: stakedValue,
				asset: CRYPTO_CURRENCY_MAP.SNX,
			},
			rewards: 0,
			periodFinish: nextFeePeriodStarts.getTime(),
			incentivesIndex: 0,
			claimed: claimedSNX,
		},
		{
			icon: () => <Svg src={curveSVG} />,
			title: t('earn.incentives.options.curve.title'),
			subtitle: t('earn.incentives.options.curve.subtitle'),
			apr: curveAPR,
			tvl: curveTVL,
			staked: {
				balance: 0,
				asset: SYNTHS_MAP.sUSD,
			},
			rewards: 0,
			periodFinish: useCurvePool.data?.periodFinish ?? 0,
			incentivesIndex: 1,
			claimed: false,
		},
		{
			icon: () => <Svg src={iETHSVG} />,
			title: t('earn.incentives.options.ieth.title'),
			subtitle: t('earn.incentives.options.ieth.subtitle'),
			apr: iETHAPR,
			tvl: iETHTVL,
			staked: {
				balance: 0,
				asset: SYNTHS_MAP.iETH,
			},
			rewards: 0,
			periodFinish: useiETHPool.data?.periodFinish ?? 0,
			incentivesIndex: 2,
			claimed: false,
		},
		{
			icon: () => <Svg src={iBTCSVG} />,
			title: t('earn.incentives.options.ibtc.title'),
			subtitle: t('earn.incentives.options.ibtc.subtitle'),
			apr: iBTCAPR,
			tvl: iBTCTVL,
			staked: {
				balance: 0,
				asset: SYNTHS_MAP.iBTC,
			},
			rewards: 0,
			periodFinish: useiBTCPool.data?.periodFinish ?? 0,
			incentivesIndex: 3,
			claimed: false,
		},
	];
	return (
		<FlexDiv>
			<IncentivesTable
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				data={incentives}
				isLoaded={useCurvePool.data && useiBTCPool.data && useiETHPool.data ? true : false}
			/>
			{activeTab != null ? (
				<TabContainer>
					{activeTab === 0 && (
						<ClaimTab
							tradingRewards={tradingRewards}
							stakingRewards={stakingRewards}
							totalRewards={totalRewards}
							refetch={refetch}
						/>
					)}
				</TabContainer>
			) : null}
		</FlexDiv>
	);
};

const TabContainer = styled.div`
	width: 60%;
	background-color: ${(props) => props.theme.colors.mediumBlue};
`;

export default Incentives;
