import { FC, useState, useMemo, useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';
import UIContainer from 'containers/UI';
import GasSelector from 'components/GasSelector';

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
import { ethers } from 'ethers';
import { calculateLoanCRatio } from './calculateLoanCRatio';
import { useMinCollateralAmount } from './useMinCollateralAmount';
import { getRenBTCToken } from 'contracts/renBTCToken';
import { getETHToken } from 'contracts/ethToken';

type BorrowSynthsTabProps = {};

const COLLATERAL_ASSETS: { [asset: string]: string[] } = {
	sETH: ['ETH'],
	sBTC: ['renBTC'],
	sUSD: ['ETH', 'renBTC'],
};

const BorrowSynthsTab: FC<BorrowSynthsTabProps> = (props) => {
	const { t } = useTranslation();
	const { signer, synthetixjs, connectWallet, network } = Connector.useContainer();
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const router = useRouter();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const address = useRecoilValue(walletAddressState);
	const { renBTCContract, minCRatios } = Loans.useContainer();
	const {
		useExchangeRatesQuery,
		useContractTxn,
		useSynthetixTxn,
		useTokensBalancesQuery,
	} = useSynthetixQueries();
	const { setTitle } = UIContainer.useContainer();

	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));

	const [debtAmountNumber, setDebtAmount] = useState<string>('');
	const [debtAsset, setDebtAsset] = useState<string>('sUSD');

	const debtAmount = parseSafeWei(debtAmountNumber, wei(0));

	const [collateralAmountNumber, setCollateralAmount] = useState<string>('');
	const [collateralAsset, setCollateralAsset] = useState<string>('');
	const renToken = getRenBTCToken(network);
	const ethToken = getETHToken(network);
	const collateralDecimals = collateralAsset === 'renBTC' ? renToken.decimals : ethToken.decimals;
	const collateralAmount = parseSafeWei(collateralAmountNumber, wei(0)).scale(collateralDecimals);

	const collateralIsETH = collateralAsset === 'ETH';
	const collateralContract = collateralIsETH ? null : renBTCContract;
	const ethAndRenBalance = useTokensBalancesQuery([renToken, ethToken], address);

	const minCRatio = minCRatios.get(collateralIsETH ? LOAN_TYPE_ETH : LOAN_TYPE_ERC20) || wei(0);

	const loanContract = useMemo(() => {
		if (!signer || !synthetixjs) return null;
		const {
			contracts: { CollateralEth: ethLoanContract, CollateralErc20: erc20LoanContract },
		} = synthetixjs;
		return collateralIsETH ? ethLoanContract : erc20LoanContract;
	}, [collateralIsETH, signer, synthetixjs]);
	const minCollateralAmount = useMinCollateralAmount(loanContract);

	const hasLowCollateralAmount = useMemo(
		() => !collateralAmount.eq(0) && collateralAmount.lt(minCollateralAmount),
		[collateralAmount, minCollateralAmount]
	);
	const minCollateralAmountString = minCollateralAmount.scale(collateralDecimals).toString(2);
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
	const rawCollateralBalance = collateralIsETH
		? ethAndRenBalance.data?.ETH?.balance
		: ethAndRenBalance.data?.renBTC?.balance;
	const collateralBalance = rawCollateralBalance || wei(0);

	const approveTxn = useContractTxn(
		collateralContract,
		'approve',
		[loanContract?.address || ethers.constants.AddressZero, ethers.constants.MaxUint256],
		{ gasPrice: gasPrice.toBN() }
	);

	const debt = { amount: debtAmount, asset: debtAsset };
	const collateral = { amount: collateralAmount, asset: collateralAsset };
	const cratio = calculateLoanCRatio(exchangeRates, collateral, debt);
	const hasLowCRatio = !collateralAmount.eq(0) && !debtAmount.eq(0) && cratio.lt(SAFE_MIN_CRATIO);
	const hasInsufficientCollateral = collateralBalance.lt(minCollateralAmount);

	const shouldOpenTransaction = Boolean(
		debtAmount.gt(0) &&
			collateralAmount.gt(0) &&
			collateralAsset &&
			debtAsset &&
			!hasLowCollateralAmount &&
			!hasLowCRatio &&
			!hasInsufficientCollateral
	);

	const openTxn = useSynthetixTxn(
		collateralIsETH ? 'CollateralEth' : 'CollateralErc20',
		'open',
		collateralIsETH
			? [debt.amount.toBN(), ethers.utils.formatBytes32String(debt.asset)]
			: [
					collateral.amount.toBN(),
					debt.amount.toBN(),
					ethers.utils.formatBytes32String(debt.asset),
			  ],
		{
			gasPrice: gasPrice.toBN(),
			value: collateralIsETH ? collateral.amount.toBN() : 0,
		},
		{ enabled: shouldOpenTransaction }
	);
	const openTransactionStatus = openTxn ? openTxn.txnStatus : null;
	useEffect(() => {
		switch (openTransactionStatus) {
			case 'unsent':
				setTxModalOpen(false);
				getAllowance();
				break;
			case 'pending':
				setTxModalOpen(true);
				break;
			case 'confirmed':
				getAllowance();
				setDebtAmount('0');
				setCollateralAmount('0');
				setTxModalOpen(false);
				setIsBorrowing(false);
				router.push('/loans/list');
				break;
		}
	}, [getAllowance, openTransactionStatus, router]); // header title
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
						<GasSelector
							gasLimitEstimate={openTxn ? openTxn.gasLimit : null}
							setGasPrice={(x: Wei) => {
								setGasPrice(x);
							}}
						/>
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton
				onClick={async () => {
					if (!isWalletConnected) {
						connectWallet();
						return;
					}
					if (!openTxn) return;
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
			{openTxn && openTxn.isError && <ErrorMessage>{openTxn.errorMessage}</ErrorMessage>}
			{openTxn && txModalOpen && (
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
									{debt.amount.toString(2)} {debt.asset}
								</TxModalItemText>
							</TxModalItem>
							<TxModalItemSeperator />
							<TxModalItem>
								<TxModalItemTitle>
									{t('loans.tabs.new.confirm-transaction.right-panel-label')}
								</TxModalItemTitle>
								<TxModalItemText>
									{collateral.amount.toString(2)} {collateral.asset}
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
