import React, { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AppLayout from 'sections/shared/Layout/AppLayout';

import { MintBurnBox, InfoBox } from 'sections/staking';
import StatBox from 'components/StatBox';
import { Column, Row, StatsSection } from 'styles/common';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { formatFiatCurrency, formatPercent } from 'utils/formatters/number';

export enum StakingPanelType {
	BURN = 'burn',
	MINT = 'mint',
}

const StakingPage = () => {
	const { t } = useTranslation();

	const [amountToStake, setAmountToStake] = useState<string>('0');
	const [amountToBurn, setAmountToBurn] = useState<string>('0');
	const [panelType, setPanelType] = useState<StakingPanelType>(StakingPanelType.MINT);

	const currencyRatesQuery = useCurrencyRatesQuery([CRYPTO_CURRENCY_MAP.SNX]);
	const debtDataQuery = useGetDebtDataQuery();
	const currencyRates = currencyRatesQuery.data ?? null;
	const debtData = debtDataQuery?.data ?? null;
	const collateral = debtData?.collateral ?? 0;
	const targetCRatio = debtData?.targetCRatio ?? 0;
	const currentCRatio = debtData?.currentCRatio ?? 0;
	const snxPrice = currencyRates?.SNX ?? 0;
	const transferableSNX = debtData?.transferable ?? 0;
	const debtBalance = debtData?.debtBalance ?? 0;
	const stakedSNX = collateral * Math.min(1, currentCRatio / targetCRatio);

	const lockedSNX = collateral - transferableSNX;

	const unstakedSNX = collateral - stakedSNX;

	const SNXRate = currencyRates?.SNX ?? 0;
	const stakedValue = collateral * Math.min(1, currentCRatio / targetCRatio) * SNXRate;
	const activeDebt = debtDataQuery.data?.debtBalance ?? 0;

	// @TODO: Implement custom gas pricing
	// const gasPrice = useMemo(
	// 	() =>
	// 		customGasPrice !== ''
	// 			? Number(customGasPrice)
	// 			: ethGasStationQuery.data != null
	// 			? ethGasStationQuery.data[gasSpeed]
	// 			: null,
	// 	[customGasPrice, ethGasStationQuery.data, gasSpeed]
	// );

	return (
		<>
			<Head>
				<title>{t('staking.page-title')}</title>
			</Head>
			<AppLayout>
				<StatsSection>
					<StakedValue
						title={t('common.stat-box.staked-value')}
						value={formatFiatCurrency(stakedValue ? stakedValue : 0, { sign: '$' })}
					/>
					<CRatio
						title={t('common.stat-box.c-ratio')}
						value={formatPercent(currentCRatio ? 1 / currentCRatio : 0)}
						size="lg"
					/>
					<ActiveDebt
						title={t('common.stat-box.active-debt')}
						value={formatFiatCurrency(activeDebt ? activeDebt : 0, { sign: '$' })}
					/>
				</StatsSection>
				<Row>
					<Column>
						<InfoBox
							unstakedCollateral={unstakedSNX}
							stakedCollateral={stakedSNX}
							transferableCollateral={transferableSNX}
							currentCRatio={currentCRatio}
							debtBalance={debtBalance}
							lockedCollateral={lockedSNX}
							amountToStake={amountToStake}
							targetCRatio={targetCRatio}
							panelType={panelType}
							snxPrice={snxPrice}
						/>
					</Column>
					<Column>
						<MintBurnBox
							amountToStake={amountToStake}
							amountToBurn={amountToBurn}
							setAmountToBurn={setAmountToBurn}
							setAmountToStake={setAmountToStake}
							maxCollateral={unstakedSNX}
							maxBurnAmount={debtBalance}
							snxPrice={snxPrice}
							targetCRatio={targetCRatio}
							setPanelType={setPanelType}
							stakedSNX={stakedSNX}
						/>
					</Column>
				</Row>
			</AppLayout>
		</>
	);
};

const StakedValue = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.brightBlue};
	}
`;
const CRatio = styled(StatBox)`
	.value {
		text-shadow: ${(props) => props.theme.colors.brightBlueTextShadow};
		color: ${(props) => props.theme.colors.darkBlue};
	}
`;
const ActiveDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.brightPink};
	}
`;

export default StakingPage;
