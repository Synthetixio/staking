import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import UIContainer from 'containers/UI';
import { CryptoCurrency, Synths } from 'constants/currency';
import { TabContainer } from '../common';

import { walletAddressState, delegateWalletState } from 'store/wallet';
import BurnTiles from '../BurnTiles';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import StakingInput from '../StakingInput';
import { formatCurrency } from 'utils/formatters/number';
import { amountToBurnState, BurnActionType, burnTypeState } from 'store/staking';
import { addSeconds, differenceInSeconds } from 'date-fns';

import Connector from 'containers/Connector';
import useClearDebtCalculations from 'sections/staking/hooks/useClearDebtCalculations';
import { useTranslation } from 'react-i18next';
import { toFutureDate } from 'utils/formatters/date';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import { parseSafeWei } from 'utils/parse';

const BurnTab: React.FC = () => {
	const [amountToBurn, onBurnChange] = useRecoilState(amountToBurnState);
	const [burnType, onBurnTypeChange] = useRecoilState(burnTypeState);

	const {
		useSynthsBalancesQuery,
		useETHBalanceQuery,
		useSynthetixTxn,
		useEVMTxn,
	} = useSynthetixQueries();

	const { percentageTargetCRatio, debtBalance, issuableSynths } = useStakingCalculations();
	const walletAddress = useRecoilValue(walletAddressState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const { synthetixjs } = Connector.useContainer();
	const { t } = useTranslation();

	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [waitingPeriod, setWaitingPeriod] = useState(0);
	const [issuanceDelay, setIssuanceDelay] = useState(0);

	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const sUSDBalance = synthBalances?.balancesMap.sUSD
		? synthBalances.balancesMap.sUSD.balance
		: wei(0);

	const {
		needToBuy,
		debtBalanceWithBuffer,
		missingSUSDWithBuffer,
		quoteAmount,
		swapData,
	} = useClearDebtCalculations(debtBalance, sUSDBalance, walletAddress!);

	const ethBalanceQuery = useETHBalanceQuery(walletAddress);
	const ethBalance = ethBalanceQuery.data ?? wei(0);

	const amountToBurnBN = Wei.max(wei(0), parseSafeWei(amountToBurn, wei(0)));

	const isToTarget = burnType === BurnActionType.TARGET;

	const { setTitle } = UIContainer.useContainer();

	const getMaxSecsLeftInWaitingPeriod = useCallback(async () => {
		const {
			contracts: { Exchanger },
			utils: { formatBytes32String },
		} = synthetixjs!;

		try {
			const maxSecsLeftInWaitingPeriod = await Exchanger.maxSecsLeftInWaitingPeriod(
				delegateWallet?.address ?? walletAddress,
				formatBytes32String('sUSD')
			);
			setWaitingPeriod(Number(maxSecsLeftInWaitingPeriod));
		} catch (e) {
			console.log(e);
		}
	}, [walletAddress, delegateWallet, synthetixjs]);

	const getIssuanceDelay = useCallback(async () => {
		const {
			contracts: { Issuer },
		} = synthetixjs!;
		try {
			const [canBurnSynths, lastIssueEvent, minimumStakeTime] = await Promise.all([
				Issuer.canBurnSynths(delegateWallet?.address ?? walletAddress),
				Issuer.lastIssueEvent(delegateWallet?.address ?? walletAddress),
				Issuer.minimumStakeTime(),
			]);

			if (Number(lastIssueEvent) && Number(minimumStakeTime)) {
				const burnUnlockDate = addSeconds(Number(lastIssueEvent) * 1000, Number(minimumStakeTime));
				const issuanceDelayInSeconds = differenceInSeconds(burnUnlockDate, new Date());
				setIssuanceDelay(
					issuanceDelayInSeconds > 0 ? issuanceDelayInSeconds : canBurnSynths ? 0 : 1
				);
			}
		} catch (e) {
			console.log(e);
		}
		// eslint-disable-next-line
	}, [walletAddress, debtBalance, delegateWallet, synthetixjs]);

	const burnCall: [string, any[]] = !!delegateWallet
		? isToTarget
			? ['burnSynthsToTargetOnBehalf', [delegateWallet]]
			: ['burnSynthsOnBehalf', [delegateWallet, amountToBurnBN.toBN()]]
		: isToTarget
		? ['burnSynthsToTarget', []]
		: ['burnSynths', [amountToBurnBN.toBN()]];

	const swapTxn = useEVMTxn(swapData);

	const txn = useSynthetixTxn('Synthetix', burnCall[0], burnCall[1], {
		gasPrice: gasPrice.toBN(),
	});

	useEffect(() => {
		if (swapTxn.txnStatus === 'prompting' || txn.txnStatus === 'prompting') setTxModalOpen(true);
	}, [txn.txnStatus, swapTxn.txnStatus]);

	// header title
	useEffect(() => {
		setTitle('staking', 'burn');
	}, [setTitle]);

	useEffect(() => {
		getMaxSecsLeftInWaitingPeriod();
		getIssuanceDelay();
	}, [getMaxSecsLeftInWaitingPeriod, getIssuanceDelay]);

	const maxBurnAmount = debtBalance.gt(sUSDBalance) ? wei(sUSDBalance) : debtBalance;

	let error: string | null = null;

	if (debtBalance.eq(0)) error = t('staking.actions.burn.action.error.no-debt');
	else if (
		(Number(amountToBurn) > sUSDBalance.toNumber() || maxBurnAmount.eq(0)) &&
		burnType !== BurnActionType.CLEAR
	)
		error = t('staking.actions.burn.action.error.insufficient');
	else if (burnType === BurnActionType.CLEAR && wei(quoteAmount).gt(ethBalance)) {
		error = t('staking.actions.burn.action.error.insufficient-eth-1inch');
	} else if (waitingPeriod) {
		error = t('staking.actions.burn.action.error.waiting-period', {
			date: toFutureDate(waitingPeriod),
		});
	} else if (issuanceDelay && burnType !== BurnActionType.TARGET) {
		error = t('staking.actions.burn.action.error.issuance-period', {
			date: toFutureDate(issuanceDelay),
		});
	}

	const returnPanel = useMemo(() => {
		let handleSubmit;
		let inputValue: string = '0';
		let isLocked;
		let etherNeededToBuy;
		let sUSDNeededToBuy;
		let sUSDNeededToBurn;

		/* If a user has more sUSD than the debt balance, the max burn amount is their debt balance, else it is just the balance they have */
		const maxBurnAmount = debtBalance.gt(sUSDBalance) ? wei(sUSDBalance) : debtBalance;

		const burnAmountToFixCRatio = wei(Math.max(debtBalance.sub(issuableSynths).toNumber(), 0));

		switch (burnType) {
			case BurnActionType.MAX:
				onBurnChange(maxBurnAmount.toString());
				handleSubmit = () => {
					txn.mutate();
				};
				inputValue = maxBurnAmount.toString();
				isLocked = true;
				break;
			case BurnActionType.TARGET:
				const calculatedTargetBurn = Wei.max(debtBalance.sub(issuableSynths), wei(0));
				onBurnChange(calculatedTargetBurn.toString());
				handleSubmit = () => {
					txn.mutate();
				};
				inputValue = calculatedTargetBurn.toString();
				isLocked = true;
				break;
			case BurnActionType.CUSTOM:
				handleSubmit = () => txn.mutate();
				inputValue = amountToBurn;
				isLocked = false;
				break;
			case BurnActionType.CLEAR:
				if (!needToBuy) {
					onBurnTypeChange(BurnActionType.MAX);
					handleSubmit = () => {
						txn.mutate();
					};
					inputValue = maxBurnAmount.toString();
					isLocked = true;
					break;
				}
				onBurnChange(debtBalanceWithBuffer.toString());
				handleSubmit = () => swapTxn.mutate();
				inputValue = debtBalanceWithBuffer.toString();
				isLocked = true;
				if (quoteAmount) {
					etherNeededToBuy = formatCurrency(CryptoCurrency.ETH, quoteAmount, {
						currencyKey: CryptoCurrency.ETH,
					});
				}
				sUSDNeededToBuy = formatCurrency(Synths.sUSD, missingSUSDWithBuffer);
				sUSDNeededToBurn = formatCurrency(Synths.sUSD, debtBalanceWithBuffer);
				break;
			default:
				return (
					<BurnTiles
						percentageTargetCRatio={percentageTargetCRatio}
						burnAmountToFixCRatio={burnAmountToFixCRatio}
					/>
				);
		}
		return (
			<StakingInput
				onSubmit={handleSubmit}
				inputValue={inputValue}
				isLocked={isLocked}
				isMint={false}
				onBack={onBurnTypeChange}
				// error={error || txn.errorMessage}
				error={null}
				txModalOpen={txModalOpen}
				setTxModalOpen={setTxModalOpen}
				gasLimitEstimate={txn.gasLimit}
				setGasPrice={setGasPrice}
				onInputChange={onBurnChange}
				txHash={txn.hash}
				transactionState={txn.txnStatus}
				resetTransaction={txn.refresh}
				maxBurnAmount={maxBurnAmount}
				burnAmountToFixCRatio={burnAmountToFixCRatio}
				etherNeededToBuy={etherNeededToBuy}
				sUSDNeededToBuy={sUSDNeededToBuy}
				sUSDNeededToBurn={sUSDNeededToBurn}
			/>
		);
	}, [
		burnType,
		txModalOpen,
		amountToBurn,
		debtBalance,
		issuableSynths,
		onBurnChange,
		onBurnTypeChange,
		percentageTargetCRatio,
		sUSDBalance,
		debtBalanceWithBuffer,
		missingSUSDWithBuffer,
		needToBuy,
		quoteAmount,
		error,
		txn,
		swapTxn,
	]);

	return <TabContainer>{returnPanel}</TabContainer>;
};

export default BurnTab;
