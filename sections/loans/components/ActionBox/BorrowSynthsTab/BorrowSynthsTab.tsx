import { FC, useState, useMemo, useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import Big from 'bignumber.js';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import UIContainer from 'containers/UI';
import synthetix from 'lib/synthetix';
import GasSelector from 'components/GasSelector';
import { toBigNumber, formatUnits, toEthersBig } from 'utils/formatters/number';
import { tx } from 'utils/transactions';
import {
	normalizeGasLimit as getNormalizedGasLimit,
	normalizedGasPrice as getNormalizedGasPrice,
} from 'utils/network';
import { Synths } from 'constants/currency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import {
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
} from 'styles/common';
import {
	DEBT_ASSETS,
	LOAN_TYPE_ERC20,
	LOAN_TYPE_ETH,
	SAFE_MIN_CRATIO,
} from 'sections/loans/constants';
import {
	FormContainer,
	InputsContainer,
	InputsDivider,
	SettingsContainer,
	SettingContainer,
	ErrorMessage,
	TxModalContent,
	TxModalItem,
	TxModalItemSeperator,
} from 'sections/loans/components/common';
import Loans from 'containers/Loans';
import CRatio from 'sections/loans/components/ActionBox/components/CRatio';
import InterestRate from 'sections/loans/components/ActionBox/components/InterestRate';
import IssuanceFee from 'sections/loans/components/ActionBox/components/IssuanceFee';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import FormButton from './FormButton';
import AssetInput from './AssetInput';

type BorrowSynthsTabProps = {};

const BorrowSynthsTab: FC<BorrowSynthsTabProps> = (props) => {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { connectWallet, signer } = Connector.useContainer();
	const router = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const address = useRecoilValue(walletAddressState);
	const { renBTCContract, minCRatios } = Loans.useContainer();
	const { setTitle } = UIContainer.useContainer();

	const [gasPrice, setGasPrice] = useState<number>(0);
	const [gasLimit, setGasLimitEstimate] = useState<number | null>(null);

	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const [debtAmountNumber, setDebtAmount] = useState<string>('');
	const [debtAsset, setDebtAsset] = useState<string>('');
	const debtDecimals = 18; // todo
	const debtAmount = useMemo(() => {
		try {
			return toBigNumber(
				ethers.utils.parseUnits(debtAmountNumber.toString(), debtDecimals).toString()
			);
		} catch {
			return toBigNumber(0);
		}
	}, [debtAmountNumber, debtDecimals]);

	const [collateralAmountNumber, setCollateralAmount] = useState<string>('');
	const [minCollateralAmount, setMinCollateralAmount] = useState<Big>(toBigNumber(0));
	const [collateralAsset, setCollateralAsset] = useState<string>('');
	const [collateralAssets, setCollateralAssets] = useState<Array<string>>([]);
	const [collateralBalance, setCollateralBalance] = useState<Big>(toBigNumber(0));

	const collateralDecimals = collateralAsset === 'renBTC' ? 8 : 18; // todo
	const collateralAmount = useMemo(() => {
		try {
			return toBigNumber(
				ethers.utils.parseUnits(collateralAmountNumber.toString(), collateralDecimals).toString()
			);
		} catch {
			return toBigNumber(0);
		}
	}, [collateralAmountNumber, collateralDecimals]);
	const collateralIsETH = collateralAsset === 'ETH';
	const collateralContract = useMemo(
		(): ethers.Contract | null => (!collateralIsETH ? null : renBTCContract),
		[collateralIsETH, renBTCContract]
	);

	const minCRatio =
		minCRatios.get(collateralIsETH ? LOAN_TYPE_ETH : LOAN_TYPE_ERC20) || toBigNumber(0);

	const hasLowCollateralAmount = useMemo(
		() => !collateralAmount.isZero() && collateralAmount.lt(minCollateralAmount),
		[collateralAmount, minCollateralAmount]
	);
	const minCollateralAmountString = formatUnits(minCollateralAmount, collateralDecimals, 2);

	const loanContract = useMemo(() => {
		if (!signer) return;
		const {
			contracts: { CollateralEth: ethLoanContract, CollateralErc20: erc20LoanContract },
		} = synthetix.js!;
		return collateralIsETH ? ethLoanContract : erc20LoanContract;
	}, [collateralIsETH, signer]);

	const loanContractAddress = loanContract?.address;

	const [cratio, setCRatio] = useState(toBigNumber(0));

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const [isApproving, setIsApproving] = useState<boolean>(false);
	const [isBorrowing, setIsBorrowing] = useState<boolean>(false);
	const [isApproved, setIsApproved] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const hasLowCRatio = useMemo(
		() => !collateralAmount.isZero() && !debtAmount.isZero() && cratio.lt(SAFE_MIN_CRATIO),
		[collateralAmount, debtAmount, cratio]
	);

	const hasInsufficientCollateral = useMemo(() => collateralBalance.lt(minCollateralAmount), [
		collateralBalance,
		minCollateralAmount,
	]);

	const onSetDebtAsset = useCallback(
		(debtAsset: string): void => {
			const collateralAssets =
				debtAsset === 'sETH' ? ['ETH'] : debtAsset === 'sBTC' ? ['renBTC'] : ['ETH', 'renBTC'];
			setCollateralAssets(collateralAssets);
			setCollateralAsset(collateralAssets[0]);
			setDebtAsset(debtAsset);
		},
		[setCollateralAssets, setCollateralAsset, setDebtAsset]
	);

	useEffect(() => {
		const debtAsset = DEBT_ASSETS[0];
		onSetDebtAsset(debtAsset);
	}, [onSetDebtAsset]);

	const connectOrApproveOrTrade = async () => {
		if (!isWalletConnected) {
			return connectWallet();
		}
		const gas: Record<string, number> = {
			gasPrice: getNormalizedGasPrice(gasPrice),
			gasLimit: gasLimit!,
		};
		!isApproved ? approve(gas) : borrow(gas);
	};

	const getApproveTxData = useCallback(
		(gas: Record<string, number>) => {
			if (
				!(
					collateralContract &&
					!collateralAmount.isZero() &&
					!hasLowCRatio &&
					!hasInsufficientCollateral
				)
			)
				return null;
			return [
				collateralContract,
				'approve',
				[loanContractAddress, collateralAmount.toString(), gas],
			];
		},
		[
			collateralContract,
			loanContractAddress,
			collateralAmount,
			hasInsufficientCollateral,
			hasLowCRatio,
		]
	);

	const getBorrowTxData = useCallback(
		(gas: Record<string, number>) => {
			if (!(loanContract && !debtAmount.isZero() && !hasLowCRatio && !hasInsufficientCollateral))
				return null;

			const debtAssetCurrencyKey = ethers.utils.formatBytes32String(debtAsset);
			return [
				loanContract,
				'open',
				collateralIsETH
					? [
							toEthersBig(debtAmount, debtDecimals),
							debtAssetCurrencyKey,
							{
								value: toEthersBig(collateralAmount, collateralDecimals),
								...gas,
							},
					  ]
					: [
							toEthersBig(collateralAmount, collateralDecimals),
							toEthersBig(debtAmount, debtDecimals),
							debtAssetCurrencyKey,
							gas,
					  ],
			];
		},
		[
			loanContract,
			debtAmount,
			debtDecimals,
			debtAsset,
			collateralAmount,
			collateralDecimals,
			collateralIsETH,
			hasInsufficientCollateral,
			hasLowCRatio,
		]
	);

	const getTxData = useMemo(() => (!isApproved ? getApproveTxData : getBorrowTxData), [
		isApproved,
		getApproveTxData,
		getBorrowTxData,
	]);

	const approve = async (gas: Record<string, number>) => {
		setIsApproving(true);
		setTxModalOpen(true);
		try {
			await tx(() => getApproveTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
				showSuccessNotification: (hash: string) => {},
			});
			if (collateralIsETH || !(collateralContract && loanContractAddress && address))
				return setIsApproved(true);
			// update isApproved
			const allowance = toBigNumber(
				await collateralContract.allowance(address, loanContractAddress)
			);
			setIsApproved(allowance.gte(collateralAmount.toString()));
		} catch {
		} finally {
			setTxModalOpen(false);
			setIsApproving(false);
		}
	};

	const borrow = async (gas: Record<string, number>) => {
		if (debtAmount.isZero()) {
			return setError(`Enter ${debtAsset} amount..`);
		}
		setIsBorrowing(true);
		setTxModalOpen(true);
		try {
			await tx(() => getBorrowTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorTransaction({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
				showSuccessNotification: (hash: string) => {},
			});
			setDebtAmount('0');
			setCollateralAmount('0');
			router.push('/loans/list');
		} catch {
		} finally {
			setTxModalOpen(false);
			setIsBorrowing(false);
		}
	};

	// approved
	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (collateralIsETH || !(collateralContract && loanContractAddress && address)) {
				return setIsApproved(true);
			}
			const allowance = toBigNumber(
				await collateralContract.allowance(address, loanContractAddress)
			);
			if (isMounted) setIsApproved(allowance.gte(collateralAmount));
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [collateralIsETH, collateralContract, address, loanContractAddress, collateralAmount]);

	// min collateral amount
	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (!loanContract) {
				return setMinCollateralAmount(toBigNumber(0));
			}
			const minCollateralAmount = toBigNumber(
				(await loanContract.minCollateral()).toString()
			).dividedBy(Math.pow(10, 18 - collateralDecimals));
			if (isMounted) setMinCollateralAmount(minCollateralAmount);
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [collateralIsETH, loanContract, collateralDecimals]);

	// cratio
	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (!(exchangeRates && !collateralAmount.isZero() && !debtAmount.isZero())) {
				return setCRatio(toBigNumber('0'));
			}

			const collateralUSDPrice = toBigNumber(
				getExchangeRatesForCurrencies(
					exchangeRates,
					collateralAsset === 'renBTC' ? Synths.sBTC : Synths.sETH,
					Synths.sUSD
				)
			);
			const debtUSDPrice = toBigNumber(
				getExchangeRatesForCurrencies(exchangeRates, debtAsset, Synths.sUSD)
			);
			const cratio = collateralAmount
				.multipliedBy(collateralUSDPrice)
				.dividedBy(Math.pow(10, collateralDecimals))
				.multipliedBy(100)
				.dividedBy(debtUSDPrice.multipliedBy(debtAmount).dividedBy(Math.pow(10, debtDecimals)));
			if (isMounted) setCRatio(cratio);
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [collateralAmount, collateralAsset, debtAmount, debtAsset, exchangeRates, collateralDecimals]);

	// gas
	useEffect(() => {
		if (!(!debtAmount.isZero() && !collateralAmount.isZero())) return;
		let isMounted = true;
		(async () => {
			try {
				setError(null);
				const data: any[] | null = getTxData({});
				if (!data) return;
				const [contract, method, args] = data;
				const gasEstimate = await synthetix.getGasEstimateForTransaction({
					txArgs: args,
					method: contract.estimateGas[method],
				});
				if (isMounted) setGasLimitEstimate(getNormalizedGasLimit(Number(gasEstimate)));
			} catch (error) {
				// console.error(error);
				if (isMounted) setGasLimitEstimate(null);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [getTxData, collateralAmount, debtAmount]);

	// balance
	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			let balance = ethers.BigNumber.from(0);
			if (collateralIsETH) {
				if (signer) {
					balance = await signer.getBalance();
				}
			} else if (collateralContract && address) {
				balance = await collateralContract.balanceOf(address);
			}
			if (isMounted) setCollateralBalance(toBigNumber(balance.toString()));
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [collateralIsETH, collateralContract, address, signer]);

	// header title
	useEffect(() => {
		setTitle('loans', 'new');
	}, [setTitle]);

	return (
		<>
			<FormContainer data-testid="loans-form">
				<InputsContainer>
					<AssetInput
						label="loans.tabs.new.debt.label"
						asset={debtAsset}
						setAsset={onSetDebtAsset}
						amount={debtAmountNumber}
						setAmount={setDebtAmount}
						assets={DEBT_ASSETS}
						testId="loans-form-left-input"
					/>
					<InputsDivider />
					<AssetInput
						label="loans.tabs.new.collateral.label"
						asset={collateralAsset}
						setAsset={setCollateralAsset}
						amount={collateralAmountNumber}
						setAmount={setCollateralAmount}
						assets={collateralAssets}
						onSetMaxAmount={setCollateralAmount}
						testId="loans-form-right-input"
					/>
				</InputsContainer>

				<SettingsContainer>
					<SettingContainer>
						<CRatio {...{ cratio, hasLowCRatio, minCRatio }} />
					</SettingContainer>
					<SettingContainer>
						<InterestRate />
					</SettingContainer>
					<SettingContainer>
						<IssuanceFee {...{ collateralIsETH }} />
					</SettingContainer>
					<SettingContainer>
						<GasSelector gasLimitEstimate={gasLimit} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton
				onClick={connectOrApproveOrTrade}
				{...{
					isWalletConnected,
					isApproved,
					collateralAsset,
					debtAsset,
					minCollateralAmountString,
					hasLowCollateralAmount,
					hasLowCRatio,
					isApproving,
					isBorrowing,
					hasInsufficientCollateral: !collateralAmount.isZero() && hasInsufficientCollateral,
				}}
			/>

			{!error ? null : <ErrorMessage>{error}</ErrorMessage>}

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={null}
					attemptRetry={connectOrApproveOrTrade}
					content={
						<TxModalContent>
							<TxModalItem>
								<TxModalItemTitle>
									{t('loans.tabs.new.confirm-transaction.left-panel-label')}
								</TxModalItemTitle>
								<TxModalItemText>
									{formatUnits(debtAmount, debtDecimals, 2)} {debtAsset}
								</TxModalItemText>
							</TxModalItem>
							<TxModalItemSeperator />
							<TxModalItem>
								<TxModalItemTitle>
									{t('loans.tabs.new.confirm-transaction.right-panel-label')}
								</TxModalItemTitle>
								<TxModalItemText>
									{formatUnits(collateralAmount, collateralDecimals, 2)} {collateralAsset}
								</TxModalItemText>
							</TxModalItem>
						</TxModalContent>
					}
				/>
			)}
		</>
	);
};

export default BorrowSynthsTab;
