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
import { formatCryptoCurrency } from 'utils/formatters/number';

const sUSDCurrencyKey = ethers.utils.formatBytes32String('sUSD');

const NominateTab: FC = () => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);
	const sourceAccountAddress = useRecoilValue(walletAddressState);
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);

	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [buttonState, setButtonState] = useState<string | null>(null);

	const [destinationAccountAddress, setDestinationAccountAddress] = useState('');
	const [nominatedAccountAddress, setNominatedAccountAddress] = useState('');
	const [sourceAccountSUSDDebtBalance, setSourceAccountSUSDDebtBalance] = useState<
		ethers.BigNumber
	>(ethers.BigNumber.from('0'));

	const sourceAccountHasDebt = useMemo(() => !sourceAccountSUSDDebtBalance.isZero(), [
		sourceAccountSUSDDebtBalance,
	]);

	const hasNominatedDestinationAccount = useMemo(
		() => nominatedAccountAddress && nominatedAccountAddress === destinationAccountAddress,
		[nominatedAccountAddress, destinationAccountAddress]
	);

	const readyForMerge = useMemo(
		() =>
			!buttonState &&
			!!sourceAccountAddress &&
			!sourceAccountHasDebt &&
			hasNominatedDestinationAccount,
		[buttonState, sourceAccountAddress, sourceAccountHasDebt, hasNominatedDestinationAccount]
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

	const getBurnTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(properDestinationAccountAddress && !destinationAccountAddressInputError && isAppReady))
				return null;
			const {
				contracts: { Synthetix },
			} = synthetix.js!;
			return [Synthetix, 'burnSynths', [sourceAccountAddress, gas]];
		},
		[isAppReady, properDestinationAccountAddress, destinationAccountAddressInputError]
	);

	const getNominateTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(properDestinationAccountAddress && !destinationAccountAddressInputError && isAppReady))
				return null;
			const {
				contracts: { RewardEscrowV2 },
			} = synthetix.js!;
			return [RewardEscrowV2, 'nominateAccountToMerge', [properDestinationAccountAddress, gas]];
		},
		[isAppReady, properDestinationAccountAddress, destinationAccountAddressInputError]
	);

	// const getTxData = useMemo(() => (sourceAccountHasDebt ? getBurnTxData : getNominateTxData), [
	// 	getBurnTxData,
	// 	getNominateTxData,
	// ]);

	// // gas
	// useEffect(() => {
	// 	let isMounted = true;
	// 	(async () => {
	// 		try {
	// 			setError(null);
	// 			const data: any[] | null = getTxData({});
	// 			if (!data) return;
	// 			const [contract, method, args] = data;
	// 			const gasEstimate = await getGasEstimateForTransaction(args, contract.estimateGas[method]);
	// 			if (isMounted) setGasLimitEstimate(getNormalizedGasLimit(Number(gasEstimate)));
	// 		} catch (error) {
	// 			// console.error(error);
	// 			if (isMounted) setGasLimitEstimate(null);
	// 		}
	// 	})();
	// 	return () => {
	// 		isMounted = false;
	// 	};
	// }, [getTxData]);

	// load source address debt
	useEffect(() => {
		if (!isAppReady) return;
		const {
			contracts: { Issuer },
		} = synthetix.js!;

		let isMounted = true;
		const unsubs = [
			() => {
				isMounted = false;
			},
		];

		const load = async () => {
			if (!sourceAccountAddress) return;
			const sUSDDebtBalance = await Issuer.debtBalanceOf(sourceAccountAddress, sUSDCurrencyKey);
			// if (isMounted) setSourceAccountSUSDDebtBalance(sUSDDebtBalance);
			if (isMounted) setSourceAccountSUSDDebtBalance(ethers.BigNumber.from(1219));
		};

		// const subscribe = () => {
		//   const contractEvent = Issuer.filters.Burn();
		//   const onContractEvent = async from => {
		//     if (from === sourceAccountAddress) {
		//       await sleep(1000);
		//       await load();
		//     }
		//   };
		//   issuerContract.on(contractEvent, onContractEvent);
		//   unsubs.push(() => issuerContract.off(contractEvent, onContractEvent));
		// };

		load();
		// subscribe();
		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [sourceAccountAddress]);

	// load any previously nominated account address
	useEffect(() => {
		if (!isAppReady) return;
		const {
			contracts: { RewardEscrowV2 },
		} = synthetix.js!;
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
		if (sourceAccountHasDebt) {
			burn();
		} else {
			nominate();
		}
	};

	const burn = async () => {
		const sUSDBalance = await synthetix.js!.contracts.ProxyERC20.balanceOf(sourceAccountAddress);
		if (sUSDBalance.lt(sourceAccountSUSDDebtBalance)) {
			const requiredSUSDTopUp = sourceAccountSUSDDebtBalance.sub(sUSDBalance);
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
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: async () => {
							const sUSDDebtBalance = await synthetix.js!.contracts.Issuer.debtBalanceOf(
								sourceAccountAddress,
								sUSDCurrencyKey
							);
							setSourceAccountSUSDDebtBalance(sUSDDebtBalance);
						},
					}),
				showSuccessNotification: (hash: string) => {},
			});
			setDestinationAccountAddress('');
		} catch {
		} finally {
			setButtonState(null);
			setTxModalOpen(false);
		}
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
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
				showSuccessNotification: (hash: string) => {},
			});
			setDestinationAccountAddress('');
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
						value={destinationAccountAddress}
						placeholder={t('merge-accounts.tabs.nominate.input-placeholder')}
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
				onClick={connectOrBurnOrNominate}
				variant="primary"
				size="lg"
				data-testid="form-button"
				disabled={
					isWalletConnected &&
					(!properDestinationAccountAddress || !!buttonState || destinationAccountAddressInputError)
				}
			>
				{!isWalletConnected ? (
					t('common.wallet.connect-wallet')
				) : (
					<Trans
						i18nKey={`merge-accounts.form.button-labels.${
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

			{!sourceAccountHasDebt ? null : (
				<div>
					You have a debt of {formatCryptoCurrency(sourceAccountSUSDDebtBalance.toString())} sUSD,
					that you will need to burn in order for the nominated account to proceed with the merge.
				</div>
			)}

			{!readyForMerge ? null : (
				<div>
					On the Merge tab, switch to the nominated account in your wallet and proceed with the
					merge.
				</div>
			)}

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
