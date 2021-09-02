import { useState, useMemo, useEffect, FC, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';

import synthetix from 'lib/synthetix';

import { truncateAddress } from 'utils/formatters/string';
import Button from 'components/Button';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import {
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
	NoTextTransform,
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
} from 'sections/delegate/common';
import { tx, getGasEstimateForTransaction } from 'utils/transactions';
import {
	normalizeGasLimit as getNormalizedGasLimit,
	normalizedGasPrice as getNormalizedGasPrice,
} from 'utils/network';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

const NominateTab: FC = () => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);
	const destinationAccountAddress = useRecoilValue(walletAddressState);
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [buttonState, setButtonState] = useState<string | null>(null);

	const [sourceAccountAddress, setSourceAccountAddress] = useState('');
	const [nominatedAccountAddress, setNominatedAccountAddress] = useState('');
	const [entryIDs, setEntryIDs] = useState([]);

	const properSourceAccountAddress = useMemo(
		() =>
			sourceAccountAddress && ethers.utils.isAddress(sourceAccountAddress)
				? sourceAccountAddress
				: null,
		[sourceAccountAddress]
	);
	const shortenedSourceAccountAddress = useMemo(() => truncateAddress(sourceAccountAddress, 8, 6), [
		sourceAccountAddress,
	]);

	const sourceAccountAddressInputError = useMemo(() => {
		return sourceAccountAddress && !properSourceAccountAddress
			? 'invalid-dest-address'
			: ethers.constants.AddressZero === properSourceAccountAddress
			? 'source-is-a-burn-address'
			: properSourceAccountAddress &&
			  destinationAccountAddress &&
			  properSourceAccountAddress === ethers.utils.getAddress(destinationAccountAddress)
			? 'source-account-is-self'
			: null;
	}, [properSourceAccountAddress, destinationAccountAddress]);

	const getMergeTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(properSourceAccountAddress && !sourceAccountAddressInputError && isAppReady))
				return null;

			const {
				contracts: { RewardEscrowV2 },
			} = synthetix.js!;
			return [RewardEscrowV2, 'mergeAccount', [properSourceAccountAddress, entryIDs, gas]];
		},
		[isAppReady, properSourceAccountAddress, entryIDs, sourceAccountAddressInputError]
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
	}, [getMergeTxData]);

	// load any nominated account address
	useEffect(() => {
		if (!isAppReady) return;
		const {
			contracts: { RewardEscrowV2 },
		} = synthetix.js!;
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
					setSourceAccountAddress(nominatedAccountAddress);
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
	}, [destinationAccountAddress, properSourceAccountAddress]);

	// load nominated account address
	useEffect(() => {
		if (!isAppReady) return;
		const {
			contracts: { RewardEscrowV2 },
		} = synthetix.js!;
		if (!properSourceAccountAddress) return;

		let isMounted = true;
		const unsubs = [
			() => {
				isMounted = false;
			},
		];

		const load = async () => {
			const numVestingEntries = await RewardEscrowV2.numVestingEntries(properSourceAccountAddress);
			const entryIDs = numVestingEntries.isZero()
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
	}, [properSourceAccountAddress]);

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
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
				showSuccessNotification: (hash: string) => {},
			});
			setSourceAccountAddress('');
		} catch {
		} finally {
			setButtonState(null);
			setTxModalOpen(false);
		}
	};

	return (
		<div data-testid="form">
			<FormContainer>
				<InputsContainer>
					<AmountInput
						value={sourceAccountAddress}
						placeholder={t('merge-accounts.tabs.merge.input-placeholder')}
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
						<GasSelector gasLimitEstimate={gasLimit} setGasPrice={setGasPrice} />
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
					(!properSourceAccountAddress || !!buttonState || sourceAccountAddressInputError)
				}
			>
				{!isWalletConnected ? (
					t('common.wallet.connect-wallet')
				) : (
					<Trans
						i18nKey={`merge-accounts.form.button-labels.${
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

			{!sourceAccountAddressInputError ? null : <div>{sourceAccountAddressInputError}</div>}

			{!error ? null : <ErrorMessage>{error}</ErrorMessage>}

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={null}
					attemptRetry={connectOrMerge}
					content={
						<TxModalItem>
							<TxModalItemTitle>{t('delegate.form.tx-confirmation-title')}</TxModalItemTitle>
							<TxModalItemText>{shortenedSourceAccountAddress}</TxModalItemText>
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
