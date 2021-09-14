import { useState, useMemo, useEffect, FC, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';
import { wei } from '@synthetixio/wei';

import ROUTES from 'constants/routes';
import Button from 'components/Button';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import Etherscan from 'containers/BlockExplorer';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import {
	ModalContent as TxModalContent,
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
	NoTextTransform,
	IconButton,
} from 'styles/common';
import StructuredTab from 'components/StructuredTab';
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
import walletIcon from 'assets/svg/app/wallet-purple.svg';
import { Transaction } from 'constants/network';
import { TxWaiting, TxSuccess } from './Tx';

const MergeTab: FC = () => {
	const { t } = useTranslation();

	const tabData = useMemo(
		() => [
			{
				title: t('merge-accounts.merge.title'),
				tabChildren: <MergeTabInner />,
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

const MergeTabInner: FC = () => {
	const { t } = useTranslation();
	const { connectWallet, synthetixjs } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);
	const destinationAccountAddress = useRecoilValue(walletAddressState);
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { blockExplorerInstance } = Etherscan.useContainer();

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const txLink = useMemo(
		() => (blockExplorerInstance && txHash ? blockExplorerInstance.txLink(txHash) : ''),
		[blockExplorerInstance, txHash]
	);
	const [buttonState, setButtonState] = useState<string | null>(null);

	const router = useRouter();
	const onGoBack = () => router.replace(ROUTES.MergeAccounts.Home);

	const [sourceAccountAddress, setSourceAccountAddress] = useState('');
	const [nominatedAccountAddress, setNominatedAccountAddress] = useState('');
	const [entryIDs, setEntryIDs] = useState([]);

	const properSourceAccountAddress = useMemo(
		() =>
			sourceAccountAddress && ethers.utils.isAddress(sourceAccountAddress)
				? ethers.utils.getAddress(sourceAccountAddress)
				: null,
		[sourceAccountAddress]
	);

	const sourceAccountAddressInputError = useMemo(() => {
		return sourceAccountAddress && !properSourceAccountAddress
			? 'invalid-dest-address'
			: ethers.constants.AddressZero === properSourceAccountAddress
			? 'source-is-a-burn-address'
			: properSourceAccountAddress &&
			  destinationAccountAddress &&
			  properSourceAccountAddress === ethers.utils.getAddress(destinationAccountAddress)
			? 'source-account-is-self'
			: nominatedAccountAddress &&
			  destinationAccountAddress &&
			  nominatedAccountAddress !== ethers.utils.getAddress(destinationAccountAddress)
			? 'not-nominated'
			: null;
	}, [
		properSourceAccountAddress,
		destinationAccountAddress,
		nominatedAccountAddress,
		sourceAccountAddress,
	]);

	const getMergeTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(properSourceAccountAddress && !sourceAccountAddressInputError && isAppReady))
				return null;

			const {
				contracts: { RewardEscrowV2 },
			} = synthetixjs!;
			return [RewardEscrowV2, 'mergeAccount', [properSourceAccountAddress, entryIDs, gas]];
		},
		[isAppReady, properSourceAccountAddress, entryIDs, sourceAccountAddressInputError, synthetixjs]
	);

	// gas
	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				setError(null);
				const data: any[] | null = getMergeTxData({});
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
	}, [getMergeTxData, synthetixjs]);

	// load any nominated account address
	useEffect(() => {
		if (!isAppReady) return;
		const {
			contracts: { RewardEscrowV2 },
		} = synthetixjs!;
		if (!properSourceAccountAddress) return;

		let isMounted = true;
		const unsubs = [
			() => {
				isMounted = false;
			},
		];

		const load = async () => {
			const nominatedAccountAddress = await RewardEscrowV2.nominatedReceiver(
				properSourceAccountAddress
			);
			if (isMounted) {
				if (ethers.constants.AddressZero !== nominatedAccountAddress) {
					console.log(nominatedAccountAddress, destinationAccountAddress);
					setNominatedAccountAddress(nominatedAccountAddress);
				}
				setEntryIDs(entryIDs);
			}
		};

		const subscribe = () => {
			const contractEvent = RewardEscrowV2.filters.NominateAccountToMerge(
				properSourceAccountAddress
			);
			const onContractEvent = async (src: string, dest: string) => {
				if (src === destinationAccountAddress) {
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
	}, [destinationAccountAddress, properSourceAccountAddress, entryIDs, isAppReady, synthetixjs]);

	// load nominated account address
	useEffect(() => {
		if (!isAppReady) return;
		const {
			contracts: { RewardEscrowV2 },
		} = synthetixjs!;
		if (!properSourceAccountAddress) return;

		let isMounted = true;
		const unsubs = [
			() => {
				isMounted = false;
			},
		];

		const load = async () => {
			const numVestingEntries = await RewardEscrowV2.numVestingEntries(properSourceAccountAddress);
			const entryIDs = numVestingEntries.eq(0)
				? []
				: await RewardEscrowV2.getAccountVestingEntryIDs(
						properSourceAccountAddress,
						0,
						numVestingEntries
				  );

			if (isMounted) {
				setEntryIDs(entryIDs);
			}
		};

		load();

		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [properSourceAccountAddress, isAppReady, synthetixjs]);

	// funcs

	const onEnterAddress = (e: any) => setSourceAccountAddress((e.target.value ?? '').trim());

	const connectOrMerge = async () => {
		if (!isWalletConnected) {
			return connectWallet();
		}

		setButtonState('merging');
		setTxModalOpen(true);
		try {
			const gas: Record<string, number> = {
				gasPrice: getNormalizedGasPrice(gasPrice),
				gasLimit: gasLimit!,
			};
			await tx(() => getMergeTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) => {
					setTransactionState(Transaction.WAITING);
					setTxHash(hash);
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {
							setTransactionState(Transaction.SUCCESS);
						},
					});
				},
				showSuccessNotification: (hash: string) => {},
			});
			setSourceAccountAddress('');
		} catch {
		} finally {
			setButtonState(null);
			setTxModalOpen(false);
			setTransactionState(Transaction.PRESUBMIT);
		}
	};

	if (transactionState === Transaction.WAITING) {
		return <TxWaiting {...{ txLink }} />;
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<TxSuccess
				{...{ txLink }}
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
					<Svg src={walletIcon} />
					<AmountInput
						value={sourceAccountAddress}
						placeholder={t('merge-accounts.merge.input-placeholder')}
						onChange={onEnterAddress}
						disabled={false}
						rows={3}
						autoComplete={'off'}
						spellCheck={false}
						data-testid="form-input"
					/>
				</InputsContainer>

				<SettingsContainer>
					<SettingContainer>
						<GasSelector gasLimitEstimate={wei(gasLimit ?? 0)} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton
				onClick={connectOrMerge}
				variant="primary"
				size="lg"
				data-testid="form-button"
				disabled={
					isWalletConnected &&
					(!properSourceAccountAddress || !!buttonState || !!sourceAccountAddressInputError)
				}
			>
				{!isWalletConnected ? (
					t('common.wallet.connect-wallet')
				) : (
					<Trans
						i18nKey={`merge-accounts.merge.button-labels.${
							buttonState ||
							(!sourceAccountAddress
								? 'enter-address'
								: sourceAccountAddressInputError
								? sourceAccountAddressInputError
								: 'merge')
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
					attemptRetry={connectOrMerge}
					content={
						<TxModalItem>
							<TxModalItemTitle>{t('merge-accounts.merge.tx-waiting.title')}</TxModalItemTitle>
							<TxModalContent>
								<TxModalItem>
									<TxModalItemTitle>
										{t('merge-accounts.merge.tx-waiting.merging')}
									</TxModalItemTitle>
									<TxModalItemText>
										{t('merge-accounts.merge.tx-waiting.escrowed-schedule')}
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

export default MergeTab;
