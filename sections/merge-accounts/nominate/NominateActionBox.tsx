import { useState, useMemo, useEffect, FC, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';
import { wei } from '@synthetixio/wei';

import { truncateAddress } from 'utils/formatters/string';
import Button from 'components/Button';
import Connector from 'containers/Connector';
import StructuredTab from 'components/StructuredTab';
import TransactionNotifier from 'containers/TransactionNotifier';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import {
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
	NoTextTransform,
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
import walletIcon from 'assets/svg/app/wallet-purple.svg';
import ROUTES from 'constants/routes';
import { Transaction, GasLimitEstimate } from 'constants/network';
import { TxWaiting, TxSuccess } from './Tx';

const NominateTab: FC = () => {
	const { t } = useTranslation();

	const tabData = useMemo(
		() => [
			{
				title: t('merge-accounts.nominate.title'),
				tabChildren: <NominateTabInner />,
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

const NominateTabInner: FC = () => {
	const { t } = useTranslation();
	const { connectWallet, synthetixjs } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);
	const sourceAccountAddress = useRecoilValue(walletAddressState);
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [buttonState, setButtonState] = useState<string | null>(null);

	const router = useRouter();
	const onGoBack = () => router.replace(ROUTES.MergeAccounts.Home);

	const [destinationAccountAddress, setDestinationAccountAddress] = useState('');
	const [nominatedAccountAddress, setNominatedAccountAddress] = useState('');

	const { debtBalance } = useStakingCalculations();
	const readyForMerge = false;

	const hasNominatedDestinationAccount = useMemo(
		() => nominatedAccountAddress && nominatedAccountAddress === destinationAccountAddress,
		[nominatedAccountAddress, destinationAccountAddress]
	);

	const properDestinationAccountAddress = useMemo(
		() =>
			destinationAccountAddress && ethers.utils.isAddress(destinationAccountAddress)
				? destinationAccountAddress
				: null,
		[destinationAccountAddress]
	);
	const shortenedDestinationAccountAddress = useMemo(
		() => truncateAddress(destinationAccountAddress, 8, 6),
		[destinationAccountAddress]
	);

	const destinationAccountAddressInputError = useMemo(() => {
		return destinationAccountAddress && !properDestinationAccountAddress
			? 'invalid-dest-address'
			: ethers.constants.AddressZero === properDestinationAccountAddress
			? 'dest-is-a-burn-address'
			: properDestinationAccountAddress &&
			  sourceAccountAddress &&
			  properDestinationAccountAddress === ethers.utils.getAddress(sourceAccountAddress)
			? 'dest-account-is-self'
			: null;
	}, [properDestinationAccountAddress, sourceAccountAddress]);

	const getNominateTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(properDestinationAccountAddress && !destinationAccountAddressInputError && isAppReady))
				return null;
			const {
				contracts: { RewardEscrowV2 },
			} = synthetixjs!;
			return [RewardEscrowV2, 'nominateAccountToMerge', [properDestinationAccountAddress, gas]];
		},
		[isAppReady, properDestinationAccountAddress, destinationAccountAddressInputError]
	);

	// gas
	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				setError(null);
				const data: any[] | null = getNominateTxData({});
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
	}, [getNominateTxData]);

	// load any previously nominated account address
	useEffect(() => {
		if (!isAppReady) return;
		const {
			contracts: { RewardEscrowV2 },
		} = synthetixjs!;
		if (!sourceAccountAddress) return;

		let isMounted = true;
		const unsubs = [
			() => {
				isMounted = false;
			},
		];

		const load = async () => {
			const nominatedAccountAddress = await RewardEscrowV2.nominatedReceiver(sourceAccountAddress);
			if (isMounted) {
				if (ethers.constants.AddressZero !== nominatedAccountAddress) {
					setDestinationAccountAddress(nominatedAccountAddress);
					setNominatedAccountAddress(nominatedAccountAddress);
				}
			}
		};

		const subscribe = () => {
			const contractEvent = RewardEscrowV2.filters.NominateAccountToMerge(sourceAccountAddress);
			const onContractEvent = async (src: string, dest: string) => {
				if (src === sourceAccountAddress) {
					setNominatedAccountAddress(dest);
				}
			};
			RewardEscrowV2.on(contractEvent, onContractEvent);
			unsubs.push(() => {
				RewardEscrowV2.off(contractEvent, onContractEvent);
			});
		};

		load();
		subscribe();
		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [sourceAccountAddress]);

	// funcs

	const onEnterAddress = (e: any) => setDestinationAccountAddress((e.target.value ?? '').trim());

	const connectOrBurnOrNominate = async () => {
		if (!isWalletConnected) {
			return connectWallet();
		}
		nominate();
	};

	const nominate = async () => {
		setButtonState('nominating');
		setTxModalOpen(true);
		try {
			const gas: Record<string, number> = {
				gasPrice: getNormalizedGasPrice(gasPrice),
				gasLimit: gasLimit!,
			};
			await tx(() => getNominateTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) => {
					setTransactionState(Transaction.WAITING);
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {
							setTransactionState(Transaction.SUCCESS);
						},
					});
				},
				showSuccessNotification: (hash: string) => {},
			});
			setDestinationAccountAddress('');
		} catch {
			setTransactionState(Transaction.PRESUBMIT);
		} finally {
			setButtonState(null);
			setTxModalOpen(false);
		}
	};

	if (transactionState === Transaction.WAITING) {
		return <TxWaiting />;
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<TxSuccess
				onDismiss={() => {
					setTransactionState(Transaction.PRESUBMIT);
					router.push(ROUTES.MergeAccounts.Merge);
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
					{readyForMerge ? (
						<div>
							On the Merge tab, switch to the nominated account in your wallet and proceed with the
							merge.
						</div>
					) : (
						<>
							<Svg src={walletIcon} />
							<AmountInput
								value={destinationAccountAddress}
								placeholder={t('merge-accounts.nominate.input-placeholder')}
								onChange={onEnterAddress}
								disabled={false}
								rows={3}
								autoComplete={'off'}
								spellCheck={false}
								data-testid="form-input"
							/>
						</>
					)}
				</InputsContainer>

				<SettingsContainer>
					<SettingContainer>
						<GasSelector gasLimitEstimate={wei(gasLimit ?? 0)} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton
				onClick={connectOrBurnOrNominate}
				variant="primary"
				size="lg"
				data-testid="form-button"
				disabled={
					isWalletConnected &&
					(!properDestinationAccountAddress ||
						!!buttonState ||
						!!destinationAccountAddressInputError)
				}
			>
				{!isWalletConnected ? (
					t('common.wallet.connect-wallet')
				) : (
					<Trans
						i18nKey={`merge-accounts.nominate.button-labels.${
							buttonState ||
							(!destinationAccountAddress
								? 'enter-address'
								: destinationAccountAddressInputError
								? destinationAccountAddressInputError
								: !hasNominatedDestinationAccount
								? 'nominate'
								: 'ready-for-merge')
						}`}
						components={[<NoTextTransform />]}
					/>
				)}
			</FormButton>

			{!error ? null : <ErrorMessage>{error}</ErrorMessage>}

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={null}
					attemptRetry={connectOrBurnOrNominate}
					content={
						<TxModalItem>
							<TxModalItemTitle>{t('delegate.form.tx-confirmation-title')}</TxModalItemTitle>
							<TxModalItemText>{shortenedDestinationAccountAddress}</TxModalItemText>
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

const FormButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;

export default NominateTab;
