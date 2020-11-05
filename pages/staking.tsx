import React, { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { MintBurnBox, InfoBox } from 'sections/staking';
import { Column, Row } from 'styles/common';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';

export enum StakingPanelType {
	BURN = 'burn',
	MINT = 'mint',
}

const StakingPage = () => {
	const { t } = useTranslation();

	const [amountToStake, setAmountToStake] = useState<string>('0');
	const [amountToBurn, setAmountToBurn] = useState<string>('0');
	const [panelType, setPanelType] = useState<StakingPanelType>(StakingPanelType.MINT);

	const currencyRatesQuery = useCurrencyRatesQuery(['SNX']);
	const debtDataQuery = useGetDebtDataQuery();
	const currencyRates = currencyRatesQuery.data ?? null;
	const debtData = debtDataQuery?.data ?? null;
	const collateral = debtData?.collateral ?? 0;
	const targetCRatio = debtData?.targetCRatio ?? 0;
	const currentCRatio = debtData?.currentCRatio ?? 0;
	const snxPrice = currencyRates?.SNX ?? 0;
	const issuableSynths = debtData?.issuableSynths ?? 0;
	const transferableSNX = debtData?.transferable ?? 0;
	const debtBalance = debtData?.debtBalance ?? 0;
	const stakedSNX = collateral * Math.min(1, currentCRatio / targetCRatio);

	const lockedSNX = collateral - transferableSNX;

	const unstakedSNX = collateral - stakedSNX;

	return (
		<>
			<Head>
				<title>{t('staking.page-title')}</title>
			</Head>
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
					/>
				</Column>
				<Column>
					<MintBurnBox
						amountToStake={amountToStake}
						amountToBurn={amountToBurn}
						setAmountToBurn={setAmountToBurn}
						setAmountToStake={setAmountToStake}
						maxIssuabledSynthAmount={issuableSynths}
						maxBurnAmount={debtBalance}
						snxPrice={snxPrice}
						targetCRatio={targetCRatio}
						setPanelType={setPanelType}
						stakedSNX={stakedSNX}
					/>
				</Column>
			</Row>
		</>
	);
};

export default StakingPage;
