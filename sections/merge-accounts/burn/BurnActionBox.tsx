import { useState, useMemo, useEffect, FC, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import StructuredTab from 'components/StructuredTab';
import TransactionNotifier from 'containers/TransactionNotifier';
import Etherscan from 'containers/BlockExplorer';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import {
	ModalContent as TxModalContent,
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
	ModalItemSeperator as TxModalItemSeperator,
	NoTextTransform,
	GlowingCircle,
	IconButton,
} from 'styles/common';
import GasSelector from 'components/GasSelector';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import {
	FormContainer,
	InputsContainer,
	SettingsContainer,
	SettingContainer,
	ErrorMessage,
	TxModalItem,
	FormHeader,
} from 'sections/merge-accounts/common';
import { tx, getGasEstimateForTransaction } from 'utils/transactions';
import {
	normalizeGasLimit as getNormalizedGasLimit,
	normalizedGasPrice as getNormalizedGasPrice,
} from 'utils/network';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { formatCryptoCurrency, formatNumber } from 'utils/formatters/number';
import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import ROUTES from 'constants/routes';
import Currency from 'components/Currency';
import { Transaction } from 'constants/network';
import { CryptoCurrency, Synths } from 'constants/currency';
import { parseSafeWei } from 'utils/parse';
import { getStakingAmount } from 'sections/staking/components/helper';

import { TxWaiting, TxSuccess } from './Tx';

const BurnTab: FC = () => {
	const { t } = useTranslation();

	const tabData = useMemo(
		() => [
			{
				title: t('merge-accounts.burn.title'),
				tabChildren: <BurnTabInner />,
				key: 'main',
				blue: true,
			},
		],
		[t]
	);

	return (
		<StructuredTab singleTab={true} boxPadding={20} tabData={tabData} setPanelType={() => null} />
	);
};

const BurnTabInner: FC = () => {
	const { t } = useTranslation();
	const { connectWallet, synthetixjs } = Connector.useContainer();
	const walletAddress = useRecoilValue(walletAddressState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);
	const sourceAccountAddress = useRecoilValue(walletAddressState);
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const router = useRouter();
	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const { blockExplorerInstance } = Etherscan.useContainer();

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [buttonState, setButtonState] = useState<string | null>(null);
	const [txHash, setTxHash] = useState<string | null>(null);
	const txLink = useMemo(
		() => (blockExplorerInstance && txHash ? blockExplorerInstance.txLink(txHash) : ''),
		[blockExplorerInstance, txHash]
	);

	const onGoBack = () => router.replace(ROUTES.MergeAccounts.Home);

	const {
		targetCRatio,
		SNXRate,
		debtBalance,
		issuableSynths,
		currentCRatio,
	} = useStakingCalculations();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const sUSDBalance = synthBalances?.balancesMap.sUSD
		? synthBalances.balancesMap.sUSD.balance
		: wei(0);

	const stakeInfo = useCallback(
		(burnAmount: Wei): Wei => wei(getStakingAmount(targetCRatio, burnAmount, SNXRate)),
		[SNXRate, targetCRatio]
	);

	const burnAmount = debtBalance.gt(sUSDBalance) ? wei(sUSDBalance) : debtBalance;
	const unstakeAmount = useMemo(() => {
		const calculatedTargetBurn = Math.max(debtBalance.sub(issuableSynths).toNumber(), 0);
		if (currentCRatio.gt(targetCRatio) && parseSafeWei(burnAmount, 0).lte(calculatedTargetBurn)) {
			return stakeInfo(wei(0));
		} else {
			return stakeInfo(burnAmount);
		}
	}, [burnAmount, debtBalance, issuableSynths, targetCRatio, currentCRatio, stakeInfo]);

	const getBurnTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(isAppReady && sourceAccountAddress)) return null;
			const {
				contracts: { Synthetix },
			} = synthetixjs!;
			return [Synthetix, 'burnSynths', [sourceAccountAddress, gas]];
		},
		[isAppReady, sourceAccountAddress]
	);

	// gas

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				setError(null);
				const data: any[] | null = getBurnTxData({});
				if (!data) return;
				const [contract, method, args] = data;
				const gasEstimate = await getGasEstimateForTransaction(args, contract.estimateGas[method]);
				if (isMounted) setGasLimitEstimate(getNormalizedGasLimit(Number(gasEstimate)));
			} catch (error) {
				// console.error(error);
				if (isMounted) setGasLimitEstimate(null);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [getBurnTxData, synthetixjs]);

	// funcs

	const connectOrBurn = async () => {
		if (!isWalletConnected) {
			return connectWallet();
		}
		burn();
	};

	const burn = async () => {
		if (sUSDBalance.lt(debtBalance)) {
			const requiredSUSDTopUp = debtBalance.sub(sUSDBalance);
			return setError(
				`You need to acquire an additional ${formatCryptoCurrency(
					requiredSUSDTopUp.toString()
				)} sUSD in order to fully burn your debt.`
			);
		}

		setButtonState('burning-debt');
		setTxModalOpen(true);
		try {
			const gas: Record<string, number> = {
				gasPrice: getNormalizedGasPrice(gasPrice),
				gasLimit: gasLimit!,
			};
			await tx(() => getBurnTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) => {
					setTransactionState(Transaction.WAITING);
					setTxHash(hash);
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: async () => {
							setTransactionState(Transaction.SUCCESS);
						},
					});
				},
				showSuccessNotification: (hash: string) => {},
			});
		} catch {
		} finally {
			setButtonState(null);
			setTxModalOpen(false);
			setTransactionState(Transaction.PRESUBMIT);
		}
	};

	if (transactionState === Transaction.WAITING) {
		return <TxWaiting {...{ unstakeAmount, burnAmount, txLink }} />;
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<TxSuccess
				{...{ unstakeAmount, burnAmount, txLink }}
				onDismiss={() => {
					setTransactionState(Transaction.PRESUBMIT);
					router.push(ROUTES.MergeAccounts.Nominate);
				}}
			/>
		);
	}

	return (
		<div data-testid="form">
			<FormContainer>
				<FormHeader>
					<IconButton onClick={onGoBack}>
						<Svg src={NavigationBack} />
					</IconButton>
				</FormHeader>

				<InputsContainer>
					<GlowingCircle variant="blue" size="md">
						<Currency.Icon currencyKey={Synths.sUSD} width="52" height="52" />
					</GlowingCircle>
					<AmountLabel>{formatCryptoCurrency(debtBalance.toString())}</AmountLabel>
				</InputsContainer>

				<SettingsContainer>
					<SettingContainer>
						<GasSelector gasLimitEstimate={wei(gasLimit ?? 0)} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton
				onClick={connectOrBurn}
				variant="primary"
				size="lg"
				data-testid="form-button"
				disabled={isWalletConnected && !!buttonState}
			>
				{!isWalletConnected ? (
					t('common.wallet.connect-wallet')
				) : (
					<Trans
						i18nKey={`merge-accounts.burn.button-labels.${buttonState || 'burn'}`}
						components={[<NoTextTransform />]}
					/>
				)}
			</FormButton>

			{!error ? null : <ErrorMessage>{error}</ErrorMessage>}

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={null}
					attemptRetry={connectOrBurn}
					content={
						<TxModalItem>
							<TxModalItemTitle>{t('merge-accounts.burn.tx-waiting.title')}</TxModalItemTitle>
							<TxModalContent>
								<TxModalItem>
									<TxModalItemTitle>
										{t('merge-accounts.burn.tx-waiting.unstaking')}
									</TxModalItemTitle>
									<TxModalItemText>
										{t('merge-accounts.burn.tx-waiting.unstake-amount', {
											amount: formatNumber(unstakeAmount, {
												minDecimals: DEFAULT_FIAT_DECIMALS,
												maxDecimals: DEFAULT_FIAT_DECIMALS,
											}),
											asset: Synths.sUSD,
										})}
									</TxModalItemText>
								</TxModalItem>
								<TxModalItemSeperator />
								<TxModalItem>
									<TxModalItemTitle>{t('merge-accounts.burn.tx-waiting.burning')}</TxModalItemTitle>
									<TxModalItemText>
										{t('merge-accounts.burn.tx-waiting.burn-amount', {
											amount: formatNumber(burnAmount, {
												minDecimals: DEFAULT_FIAT_DECIMALS,
												maxDecimals: DEFAULT_FIAT_DECIMALS,
											}),
											asset: CryptoCurrency.SNX,
										})}
									</TxModalItemText>
								</TxModalItem>
							</TxModalContent>
						</TxModalItem>
					}
				/>
			)}
		</div>
	);
};

const AmountLabel = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 24px;
`;

const FormButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;

export default BurnTab;
