import React from 'react';
import { useRecoilValue } from 'recoil';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import { appReadyState } from 'store/app';
import Connector from 'containers/Connector';
import Notify from 'containers/Notify';
import synthetix from 'lib/synthetix';
import GasSelector from 'components/GasSelector';
import { Big, toBig, isZero, formatUnits, toEthersBig } from 'utils/formatters/big-number';
import { tx } from 'utils/transactions';
import { normalizedGasPrice } from 'utils/network';
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
	const isAppReady = useRecoilValue(appReadyState);
	const { renBTCContract } = useLoans();

	const [gasLimitEstimate, setGasLimitEstimate] = React.useState<number | null>(null);
	const [gasPrice, setGasPrice] = React.useState<number>(0);

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
		() => !isZero(collateralAmount) && collateralAmount.lt(minCollateralAmount),
		[collateralAmount, minCollateralAmount]
	);
	const minCollateralAmountString = formatUnits(minCollateralAmount, collateralDecimals, 2);

	const loanContract = React.useMemo(() => {
		if (isAppReady) {
			const {
				contracts: { CollateralEth: ethLoanContract, CollateralErc20: erc20LoanContract },
			} = synthetix.js!;
			return collateralIsETH ? ethLoanContract : erc20LoanContract;
		}
	}, [isAppReady, collateralIsETH]);
	const loanContractAddress = loanContract?.address;

	const [cratio, setCRatio] = React.useState(toBig(0));

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const [isApproving, setIsApproving] = React.useState<boolean>(false);
	const [isBorrowing, setIsBorrowing] = React.useState<boolean>(false);
	const [isApproved, setIsApproved] = React.useState<boolean>(false);
	const [, setError] = React.useState<string | null>(null);

	const hasLowCRatio = React.useMemo(
		() => !isZero(collateralAmount) && !isZero(debtAmount) && cratio.lt(MIN_CRATIO),
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

	const onSetCollateralAmount = (amount: string) => {
		setError('');
		setCollateralAmount(amount);
	};

	const onSetDebtAmount = (amount: string) => {
		setError('');
		setDebtAmount(amount);
	};

	React.useEffect(() => {
		const debtAsset = DEBT_ASSETS[0];
		onSetDebtAsset(debtAsset);
	}, [onSetDebtAsset]);

	const connectOrApproveOrTrade = async (): Promise<void> => {
		if (!isWalletConnected) {
			return connectWallet();
		}
		!isApproved ? approve() : borrow();
	};

	const approve = async () => {
		setIsApproving(true);
		try {
			await tx(
				() => [
					collateralContract,
					'approve',
					[loanContractAddress, collateralAmount.toString()],
					{ gasPrice: normalizedGasPrice(gasPrice) },
				],
				{
					showErrorNotification: (e: Error) => setError(e.message),
					showProgressNotification: (hash: string) =>
						monitorHash({
							txHash: hash,
							onTxConfirmed: () => {},
						}),
					showSuccessNotification: (hash: string) => {},
				}
			);
			if (collateralIsETH || !(collateralContract && loanContractAddress && address))
				return setIsApproved(true);
			// update approve
			const allowance = toBig(await collateralContract.allowance(address, loanContractAddress));
			setIsApproved(allowance.gte(collateralAmount.toString()));
		} catch (e) {
			console.log(e);
		} finally {
			setIsApproving(false);
		}
	};

	const borrow = async () => {
		if (isZero(debtAmount)) {
			return setError(`Enter ${debtAsset} amount..`);
		}

		setIsBorrowing(true);
		const debtAssetCurrencyKey = ethers.utils.formatBytes32String(debtAsset);
		try {
			await tx(
				() => [
					loanContract,
					'open',
					collateralIsETH
						? [
								toEthersBig(debtAmount, debtDecimals),
								debtAssetCurrencyKey,
								{
									value: toEthersBig(collateralAmount, collateralDecimals),
									gasPrice: normalizedGasPrice(gasPrice),
								},
						  ]
						: [
								toEthersBig(collateralAmount, collateralDecimals),
								toEthersBig(debtAmount, debtDecimals),
								debtAssetCurrencyKey,
								{ gasPrice: normalizedGasPrice(gasPrice) },
						  ],
				],
				{
					showErrorNotification: (e: Error) => setError(e.message),
					showProgressNotification: (hash: string) =>
						monitorHash({
							txHash: hash,
							onTxConfirmed: () => {},
						}),
					showSuccessNotification: (hash: string) => {},
				}
			);
			onSetDebtAmount('0');
			onSetCollateralAmount('0');
			router.push('/loans/list');
		} catch (e) {
			console.log(e);
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
			const minCollateralAmount = toBig(await loanContract.minCollateral()).div(
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
			if (!(exchangeRates && !isZero(collateralAmount) && !isZero(debtAmount))) {
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
				.mul(collateralUSDPrice)
				.div(Math.pow(10, collateralDecimals))
				.mul(100)
				.div(debtUSDPrice.mul(debtAmount).div(Math.pow(10, debtDecimals)));
			if (isMounted) setCRatio(cratio);
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [collateralAmount, collateralAsset, debtAmount, debtAsset, exchangeRates, collateralDecimals]);

	return (
		<>
			<FormContainer>
				<InputsContainer>
					<AssetInput
						label="loans.tabs.new.debt.label"
						asset={debtAsset}
						setAsset={onSetDebtAsset}
						amount={debtAmountNumber}
						setAmount={onSetDebtAmount}
						assets={DEBT_ASSETS}
					/>
					<InputsDivider />
					<AssetInput
						label="loans.tabs.new.collateral.label"
						asset={collateralAsset}
						setAsset={setCollateralAsset}
						amount={collateralAmountNumber}
						setAmount={onSetCollateralAmount}
						assets={collateralAssets}
						onSetMaxAmount={onSetCollateralAmount}
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
						<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
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
				}}
			/>
		</>
	);
};

export default BorrowSynthsTab;
