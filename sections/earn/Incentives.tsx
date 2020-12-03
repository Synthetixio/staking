import { FC, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import useiETHPoolQuery_1 from 'queries/liquidityPools/useiETHPoolQuery_1';
import useiBTCPoolQuery_1 from 'queries/liquidityPools/useiBTCPoolQuery_1';
import useCurvePoolQuery_1 from 'queries/liquidityPools/useCurvePoolQuery_1';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import useSNXLockedValueQuery from 'queries/staking/useSNXLockedValueQuery';
import useFeePeriodTimeAndProgress from 'hooks/useFeePeriodTimeAndProgress';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';

import curveSVG from 'assets/svg/incentives/pool-curve.svg';
import iBTCSVG from 'assets/svg/incentives/pool-ibtc.svg';
import iETHSVG from 'assets/svg/incentives/pool-ieth.svg';
import snxSVG from 'assets/svg/incentives/pool-snx.svg';
import IncentivesTable from './IncentivesTable';

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

	const useiETHPool = useiETHPoolQuery_1();
	const useiBTCPool = useiBTCPoolQuery_1();
	const useCurvePool = useCurvePoolQuery_1();
	const useSNXLockedValue = useSNXLockedValueQuery();
	const { nextFeePeriodStarts } = useFeePeriodTimeAndProgress();
	const currencyRates = useCurrencyRatesQuery([CRYPTO_CURRENCY_MAP.SNX]);
	const SNXRate = currencyRates.data?.SNX ?? 0;

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
		},
	];
	const isLoaded = useCurvePool.data && useiBTCPool.data && useiETHPool.data ? true : false;
	return (
		<IncentivesTable
			activeTab={activeTab}
			setActiveTab={setActiveTab}
			data={incentives}
			isLoaded={true}
		/>
	);
};

export default Incentives;
