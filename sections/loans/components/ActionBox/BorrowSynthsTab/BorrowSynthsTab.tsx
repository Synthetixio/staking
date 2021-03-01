import React from 'react';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import Big from 'bignumber.js';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import Notify from 'containers/Notify';
import synthetix from 'lib/synthetix';
import GasSelector from 'components/GasSelector';
import { toBig, formatUnits, toEthersBig } from 'utils/formatters/big-number';
import { tx, getGasEstimateForTransaction } from 'utils/transactions';
import {
	normalizeGasLimit as getNormalizedGasLimit,
	normalizedGasPrice as getNormalizedGasPrice,
} from 'utils/network';
import { Synths } from 'constants/currency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { DEBT_ASSETS, MIN_CRATIO } from 'sections/loans/constants';
import {
	FormContainer,
	InputsContainer,
	InputsDivider,
	SettingsContainer,
	SettingContainer,
	ErrorMessage,
} from 'sections/loans/components/common';
import { useLoans } from 'sections/loans/contexts/loans';
import CRatio from 'sections/loans/components/ActionBox/components/CRatio';
import InterestRate from 'sections/loans/components/ActionBox/components/InterestRate';
import IssuanceFee from 'sections/loans/components/ActionBox/components/IssuanceFee';
import FormButton from './FormButton';
import AssetInput from './AssetInput';

type BorrowSynthsTabProps = {};

const BorrowSynthsTab: React.FC<BorrowSynthsTabProps> = (props) => {
	const { monitorHash } = Notify.useContainer();
	const { connectWallet } = Connector.useContainer();
	const router = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const address = useRecoilValue(walletAddressState);
	const { renBTCContract } = useLoans();

	const [gasPrice, setGasPrice] = React.useState<number>(0);
	const [gasLimit, setGasLimitEstimate] = React.useState<number | null>(null);

	const [debtAmountNumber, setDebtAmount] = React.useState<string>('');
	const [debtAsset, setDebtAsset] = React.useState<string>('');
	const debtDecimals = 18; // todo
	const debtAmount = React.useMemo(() => {
		try {
			return toBig(ethers.utils.parseUnits(debtAmountNumber.toString(), debtDecimals));
		} catch {
			return toBig(0);
		}
	}, [debtAmountNumber, debtDecimals]);

	const [collateralAmountNumber, setCollateralAmount] = React.useState<string>('');
	const [minCollateralAmount, setMinCollateralAmount] = React.useState<Big>(toBig(0));
	const [collateralAsset, setCollateralAsset] = React.useState<string>('');
	const [collateralAssets, setCollateralAssets] = React.useState<Array<string>>([]);
	const collateralDecimals = collateralAsset === 'renBTC' ? 8 : 18; // todo
	const collateralAmount = React.useMemo(() => {
		try {
			return toBig(ethers.utils.parseUnits(collateralAmountNumber.toString(), collateralDecimals));
		} catch {
			return toBig(0);
		}
	}, [collateralAmountNumber, collateralDecimals]);
	const collateralIsETH = collateralAsset === 'ETH';
	const collateralContract = React.useMemo(
		(): ethers.Contract | null => (!collateralIsETH ? null : renBTCContract),
		[collateralIsETH, renBTCContract]
	);

	const hasLowCollateralAmount = React.useMemo(
		() => !collateralAmount.isZero() && collateralAmount.lt(minCollateralAmount),
		[collateralAmount, minCollateralAmount]
	);
	const minCollateralAmountString = formatUnits(minCollateralAmount, collateralDecimals, 2);

	const loanContract = React.useMemo(() => {
		const {
			contracts: { CollateralEth: ethLoanContract, CollateralErc20: erc20LoanContract },
		} = synthetix.js!;
		return collateralIsETH ? ethLoanContract : erc20LoanContract;
	}, [collateralIsETH]);
	const loanContractAddress = loanContract?.address;

	const [cratio, setCRatio] = React.useState(toBig(0));

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const [isApproving, setIsApproving] = React.useState<boolean>(false);
	const [isBorrowing, setIsBorrowing] = React.useState<boolean>(false);
	const [isApproved, setIsApproved] = React.useState<boolean>(false);
	const [error, setError] = React.useState<string | null>(null);

	const hasLowCRatio = React.useMemo(
		() => !collateralAmount.isZero() && !debtAmount.isZero() && cratio.lt(MIN_CRATIO),
		[collateralAmount, debtAmount, cratio]
	);

	const onSetDebtAsset = React.useCallback(
		(debtAsset: string): void => {
			const collateralAssets =
				debtAsset === 'sETH' ? ['ETH'] : debtAsset === 'sBTC' ? ['renBTC'] : ['ETH', 'renBTC'];
			setCollateralAssets(collateralAssets);
			setCollateralAsset(collateralAssets[0]);
			setDebtAsset(debtAsset);
		},
		[setCollateralAssets, setCollateralAsset, setDebtAsset]
	);

	React.useEffect(() => {
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

	const getApproveTxData = React.useCallback(
		(gas: Record<string, number>) => {
			if (!(collateralContract && !collateralAmount.isZero())) return null;
			return [
				collateralContract,
				'approve',
				[loanContractAddress, collateralAmount.toString(), gas],
			];
		},
		[collateralContract, loanContractAddress, collateralAmount]
	);

	const getBorrowTxData = React.useCallback(
		(gas: Record<string, number>) => {
			if (!(loanContract && !debtAmount.isZero())) return null;
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
		]
	);

	const getTxData = React.useMemo(() => (!isApproved ? getApproveTxData : getBorrowTxData), [
		isApproved,
		getApproveTxData,
		getBorrowTxData,
	]);

	const approve = async (gas: Record<string, number>) => {
		setIsApproving(true);
		try {
			await tx(() => getApproveTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorHash({
						txHash: hash,
						onTxConfirmed: () => {},
					}),
				showSuccessNotification: (hash: string) => {},
			});
			if (collateralIsETH || !(collateralContract && loanContractAddress && address))
				return setIsApproved(true);
			// update isApproved
			const allowance = toBig(await collateralContract.allowance(address, loanContractAddress));
			setIsApproved(allowance.gte(collateralAmount.toString()));
		} catch {
		} finally {
			setIsApproving(false);
		}
	};

	const borrow = async (gas: Record<string, number>) => {
		if (debtAmount.isZero()) {
			return setError(`Enter ${debtAsset} amount..`);
		}
		setIsBorrowing(true);
		try {
			await tx(() => getBorrowTxData(gas), {
				showErrorNotification: (e: string) => setError(e),
				showProgressNotification: (hash: string) =>
					monitorHash({
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
			setIsBorrowing(false);
		}
	};

	// approved
	React.useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (collateralIsETH || !(collateralContract && loanContractAddress && address)) {
				return setIsApproved(true);
			}
			const allowance = toBig(await collateralContract.allowance(address, loanContractAddress));
			if (isMounted) setIsApproved(allowance.gte(collateralAmount));
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [collateralIsETH, collateralContract, address, loanContractAddress, collateralAmount]);

	// min collateral amount
	React.useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (!loanContract) {
				return setMinCollateralAmount(toBig(0));
			}
			const minCollateralAmount = toBig(await loanContract.minCollateral()).dividedBy(
				Math.pow(10, 18 - collateralDecimals)
			);
			if (isMounted) setMinCollateralAmount(minCollateralAmount);
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [collateralIsETH, loanContract, collateralDecimals]);

	// cratio
	React.useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (!(exchangeRates && !collateralAmount.isZero() && !debtAmount.isZero())) {
				return setCRatio(toBig('0'));
			}

			const collateralUSDPrice = toBig(
				getExchangeRatesForCurrencies(
					exchangeRates,
					collateralAsset === 'renBTC' ? Synths.sBTC : Synths.sETH,
					Synths.sUSD
				)
			);
			const debtUSDPrice = toBig(
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
	React.useEffect(() => {
		if (!(!debtAmount.isZero() && !collateralAmount.isZero())) return;
		let isMounted = true;
		(async () => {
			try {
				setError(null);
				const data: any[] | null = getTxData({});
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
	}, [getTxData, collateralAmount, debtAmount]);

	return (
		<>
			<FormContainer>
				<InputsContainer>
					<AssetInput
						label="loans.tabs.new.debt.label"
						asset={debtAsset}
						setAsset={onSetDebtAsset}
						amount={debtAmountNumber}
						setAmount={setDebtAmount}
						assets={DEBT_ASSETS}
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
					/>
				</InputsContainer>

				<SettingsContainer>
					<SettingContainer>
						<CRatio {...{ cratio, hasLowCRatio }} />
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

			{!error ? null : <ErrorMessage>{error}</ErrorMessage>}

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
				}}
			/>
		</>
	);
};

export default BorrowSynthsTab;
