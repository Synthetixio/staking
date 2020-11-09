import React, { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { MintBurnBox, InfoBox } from 'sections/staking';
import { Column, Row } from 'styles/common';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import synthetix from 'lib/synthetix';
import { SynthetixJS } from '@synthetixio/js';
import useEthGasStationQuery from 'queries/network/useGasStationQuery';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { GWEI_UNIT } from 'constants/network';

export enum StakingPanelType {
	BURN = 'burn',
	MINT = 'mint',
}

const StakingPage = () => {
	const { t } = useTranslation();

	const [amountToStake, setAmountToStake] = useState<string>('0');
	const [amountToBurn, setAmountToBurn] = useState<string>('0');
	const [panelType, setPanelType] = useState<StakingPanelType>(StakingPanelType.MINT);
	const [customGasPrice, setCustomGasPrice] = useState(null);

	const currencyRatesQuery = useCurrencyRatesQuery([CRYPTO_CURRENCY_MAP.SNX]);
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

	const ethGasStationQuery = useEthGasStationQuery();

	// const gasPrice = useMemo(
	// 	() =>
	// 		customGasPrice !== ''
	// 			? Number(customGasPrice)
	// 			: ethGasStationQuery.data != null
	// 			? ethGasStationQuery.data[gasSpeed]
	// 			: null,
	// 	[customGasPrice, ethGasStationQuery.data, gasSpeed]
	// );

	// @TODO: Implement custom gas pricing
	const gasPrice = ethGasStationQuery?.data?.average ?? 0;

	const handleStake = async () => {
		try {
			const {
				contracts: { Synthetix },
				utils,
			} = synthetix.js as SynthetixJS;

			// Open Modal
			let transaction;
			if (Number(amountToStake) === issuableSynths) {
				const gasLimit = getGasEstimateForTransaction([], Synthetix.estimateGas.issueMaxSynths);
				transaction = await Synthetix.issueMaxSynths({
					gasPrice: gasPrice * GWEI_UNIT,
					gasLimit,
				});
			} else {
				const gasLimit = getGasEstimateForTransaction(
					[utils.parseEther(amountToStake)],
					Synthetix.estimateGas.issueSynths
				);
				transaction = await Synthetix.issueSynths(utils.parseEther(amountToStake), {
					gasPrice: gasPrice * GWEI_UNIT,
					gasLimit,
				});
			}
			// if (notify && transaction) {
			// 	const refetch = () => {
			// 		fetchDebtStatusRequest();
			// 		fetchBalancesRequest();
			// 	};
			// 	const message = `Minted ${formatCurrency(mintAmount)} sUSD`;
			// 	setTransactionInfo({ transactionHash: transaction.hash });
			// 	notifyHandler(notify, transaction.hash, networkId, refetch, message);
			// }
		} catch (e) {
			console.log(e);
		}
	};

	const handleBurn = () => {};

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
						handleStake={handleStake}
					/>
				</Column>
			</Row>
		</>
	);
};

export default StakingPage;
