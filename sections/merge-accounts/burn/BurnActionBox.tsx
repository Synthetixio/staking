import { useState, useMemo, useEffect, FC, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';
import { wei } from '@synthetixio/wei';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import StructuredTab from 'components/StructuredTab';
import TransactionNotifier from 'containers/TransactionNotifier';
import Etherscan from 'containers/BlockExplorer';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import {
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
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
	FormHeaderButton,
} from 'sections/merge-accounts/common';
import { tx, getGasEstimateForTransaction } from 'utils/transactions';
import {
	normalizeGasLimit as getNormalizedGasLimit,
	normalizedGasPrice as getNormalizedGasPrice,
} from 'utils/network';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { formatCryptoCurrency } from 'utils/formatters/number';
import ROUTES from 'constants/routes';
import { Synths } from '@synthetixio/contracts-interface';
import Currency from 'components/Currency';
import useSynthetixQueries from '@synthetixio/queries';
import { Transaction } from 'constants/network';
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

	const unstakeAmount = wei(99);
	const burnAmount = wei(100);

	const onGoBack = () => router.replace(ROUTES.MergeAccounts.Home);

	const { debtBalance } = useStakingCalculations();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const sUSDBalance = synthBalances?.balancesMap.sUSD
		? synthBalances.balancesMap.sUSD.balance
		: wei(0);

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
	}, [getBurnTxData]);

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
							router.push(ROUTES.MergeAccounts.Nominate);
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
							<TxModalItemTitle>{t('delegate.form.tx-confirmation-title')}</TxModalItemTitle>
							<TxModalItemText>-</TxModalItemText>
						</TxModalItem>
					}
				/>
			)}
		</div>
	);
};

const AmountInput = styled.textarea`
	padding: 0;
	font-size: 24px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;
	margin-top: 15px;
	overflow: hidden;
	resize: none;
	color: white;
	border: none;
	outline: none;

	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;

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
