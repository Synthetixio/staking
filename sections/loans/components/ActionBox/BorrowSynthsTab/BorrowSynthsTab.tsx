import { FC, useState, useMemo, useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import UIContainer from 'containers/UI';
import GasSelector from 'components/GasSelector';
import { Synths } from 'constants/currency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
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
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import { parseSafeWei } from 'utils/parse';

type BorrowSynthsTabProps = {};

const COLLATERAL_ASSETS: { [asset: string]: string[] } = {
	sETH: ['ETH'],
	sBTC: ['renBTC'],
	sUSD: ['ETH', 'renBTC'],
};

const BorrowSynthsTab: FC<BorrowSynthsTabProps> = (props) => {
	const { t } = useTranslation();
	const { signer, synthetixjs } = Connector.useContainer();
	const router = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const address = useRecoilValue(walletAddressState);
	const { renBTCContract, minCRatios } = Loans.useContainer();
	const { setTitle } = UIContainer.useContainer();

	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));

	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const [debtAmountNumber, setDebtAmount] = useState<string>('');
	const [debtAsset, setDebtAsset] = useState<string>('sUSD');

	const debtAmount = parseSafeWei(debtAmountNumber, wei(0));

	const [collateralAmountNumber, setCollateralAmount] = useState<string>('');
	const [minCollateralAmount, setMinCollateralAmount] = useState<Wei>(wei(0));
	const [collateralAsset, setCollateralAsset] = useState<string>('');
	const [collateralBalance, setCollateralBalance] = useState<Wei>(wei(0));

	const collateralDecimals = collateralAsset === 'renBTC' ? 8 : 18; // todo
	const collateralAmount = parseSafeWei(collateralAmountNumber, wei(0)).scale(collateralDecimals);

	const collateralIsETH = collateralAsset === 'ETH';
	const collateralContract = useMemo(
		(): ethers.Contract | null => (!collateralIsETH ? null : renBTCContract),
		[collateralIsETH, renBTCContract]
	);

	const minCRatio = minCRatios.get(collateralIsETH ? LOAN_TYPE_ETH : LOAN_TYPE_ERC20) || wei(0);

	const hasLowCollateralAmount = useMemo(
		() => !collateralAmount.eq(0) && collateralAmount.lt(minCollateralAmount),
		[collateralAmount, minCollateralAmount]
	);
	const minCollateralAmountString = minCollateralAmount.scale(collateralDecimals).toString(2);

	const loanContract = useMemo(() => {
		if (!signer || !synthetixjs) return;
		const {
			contracts: { CollateralEth: ethLoanContract, CollateralErc20: erc20LoanContract },
		} = synthetixjs!;
		return collateralIsETH ? ethLoanContract : erc20LoanContract;
	}, [collateralIsETH, signer, synthetixjs]);

	const { useExchangeRatesQuery, useSynthetixTxn, useContractTxn } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	const [allowance, setAllowance] = useState<Wei | null>(null);
	const [isBorrowing, setIsBorrowing] = useState<boolean>(false);

	const isApproved: boolean = collateralIsETH || allowance?.gt(collateralAmount) || false;

	const getAllowance = useCallback(async () => {
		if (collateralIsETH) {
			return ethers.constants.MaxUint256;
		}

		if (address && collateralContract && loanContract) {
			const allowance = wei(await collateralContract.allowance(address, loanContract?.address));

			setAllowance(allowance);

			return allowance;
		}

		return null;
	}, [address, collateralContract, collateralIsETH, loanContract]);

	const approveTxn = useContractTxn(
		collateralContract,
		'approve',
		[loanContract?.address || ethers.constants.AddressZero, ethers.constants.MaxUint256],
		{ gasPrice: gasPrice.toBN() }
	);

	const openTxn = useSynthetixTxn(
		collateralIsETH ? 'CollateralEth' : 'CollateralErc20',
		'open',
		collateralIsETH
			? [debtAmount.toBN(), ethers.utils.formatBytes32String(debtAsset)]
			: [collateralAmount.toBN(), debtAmount.toBN(), ethers.utils.formatBytes32String(debtAsset)],
		{ gasPrice: gasPrice.toBN(), value: collateralIsETH ? collateralAmount.toBN() : 0 }
	);

	// cratio start
	let cratio = wei(0);

	if (exchangeRates && !collateralAmount.eq(0) && !debtAmount.eq(0)) {
		const collateralUSDPrice = getExchangeRatesForCurrencies(
			exchangeRates,
			collateralAsset === 'renBTC' ? Synths.sBTC : Synths.sETH,
			Synths.sUSD
		);

		const debtUSDPrice = getExchangeRatesForCurrencies(exchangeRates, debtAsset, Synths.sUSD);

		cratio = collateralAmount.mul(collateralUSDPrice).div(debtUSDPrice.mul(debtAmount));
	}
	// cratio end

	const hasLowCRatio = useMemo(
		() => !collateralAmount.eq(0) && !debtAmount.eq(0) && cratio.lt(SAFE_MIN_CRATIO),
		[collateralAmount, debtAmount, cratio]
	);

	const hasInsufficientCollateral = useMemo(() => collateralBalance.lt(minCollateralAmount), [
		collateralBalance,
		minCollateralAmount,
	]);

	// min collateral amount
	useEffect(() => {
		let isMounted = true;
		const load = async () => {
			if (!loanContract) {
				return setMinCollateralAmount(wei(0));
			}
			const minCollateralAmount = wei(await loanContract.minCollateral());
			if (isMounted) setMinCollateralAmount(minCollateralAmount);
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [collateralIsETH, loanContract, collateralDecimals]);

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
			if (isMounted) setCollateralBalance(wei(balance.toString()));
		};
		load();
		return () => {
			isMounted = false;
		};
	}, [collateralIsETH, collateralContract, address, signer]);

	useEffect(() => {
		switch (openTxn.txnStatus) {
			case 'unsent':
				setTxModalOpen(false);
				break;
			case 'pending':
				setTxModalOpen(true);
				break;
			case 'confirmed':
				setDebtAmount('0');
				setCollateralAmount('0');
				setTxModalOpen(false);
				setIsBorrowing(false);
				router.push('/loans/list');
				break;
		}
	}, [openTxn.txnStatus, router]);

	useEffect(() => {
		switch (openTxn.txnStatus) {
			case 'unsent':
			case 'confirmed':
				getAllowance();
				break;
		}
	}, [approveTxn.txnStatus, openTxn.txnStatus, getAllowance]);

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
						setAsset={setDebtAsset}
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
						assets={COLLATERAL_ASSETS[debtAsset]}
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
						<GasSelector gasLimitEstimate={openTxn.gasLimit} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton
				onClick={async () => {
					!isApproved ? approveTxn.mutate() : openTxn.mutate();
					setTxModalOpen(true);
				}}
				{...{
					isWalletConnected,
					isApproved,
					collateralAsset,
					debtAsset,
					minCollateralAmountString,
					hasLowCollateralAmount,
					hasLowCRatio,
					isBorrowing,
					hasInsufficientCollateral: !collateralAmount.eq(0) && hasInsufficientCollateral,
					hasBothInputsSet: !debtAmount.eq(0) && !collateralAmount.eq(0),
				}}
			/>

			{openTxn.isError && <ErrorMessage>{openTxn.errorMessage}</ErrorMessage>}

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={openTxn.errorMessage}
					attemptRetry={openTxn.mutate}
					content={
						<TxModalContent>
							<TxModalItem>
								<TxModalItemTitle>
									{t('loans.tabs.new.confirm-transaction.left-panel-label')}
								</TxModalItemTitle>
								<TxModalItemText>
									{debtAmount.toString(2)} {debtAsset}
								</TxModalItemText>
							</TxModalItem>
							<TxModalItemSeperator />
							<TxModalItem>
								<TxModalItemTitle>
									{t('loans.tabs.new.confirm-transaction.right-panel-label')}
								</TxModalItemTitle>
								<TxModalItemText>
									{collateralAmount.toString(2)} {collateralAsset}
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
