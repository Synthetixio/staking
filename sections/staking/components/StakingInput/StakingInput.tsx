import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import Img, { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';
import { Trans, useTranslation } from 'react-i18next';

import sUSDIcon from '@synthetixio/assets/synths/sUSD.svg';
import NavigationBack from 'assets/svg/app/navigation-back.svg';

import GasSelector from 'components/GasSelector';
import {
	StyledCTA,
	InputBox,
	DataContainer,
	DataRow,
	RowTitle,
	RowValue,
	StyledInput,
} from 'sections/staking/components/common';

import { ActionInProgress, ActionCompleted } from 'sections/staking/components/TxSent';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import {
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
	FlexDivRowCentered,
	NoTextTransform,
} from 'styles/common';
import { InputContainer, InputLocked } from '../common';
import { Transaction } from 'constants/network';
import { formatCurrency, formatNumber, toBigNumber } from 'utils/formatters/number';
import { getStakingAmount } from '../helper';
import { CryptoCurrency, Synths } from 'constants/currency';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import BigNumber from 'bignumber.js';
import { isWalletConnectedState } from 'store/wallet';
import Connector from 'containers/Connector';
import { BurnActionType, burnTypeState } from 'store/staking';
import Button from 'components/Button';

type StakingInputProps = {
	onSubmit: any;
	inputValue: BigNumber;
	isLocked: boolean;
	isMint: boolean;
	onBack: Function;
	error: string | null;
	txModalOpen: boolean;
	setTxModalOpen: Function;
	gasLimitEstimate: number | null;
	setGasPrice: Function;
	onInputChange: Function;
	txHash: string | null;
	transactionState: Transaction;
	setTransactionState: (tx: Transaction) => void;
	maxBurnAmount?: BigNumber;
};

const StakingInput: React.FC<StakingInputProps> = ({
	onSubmit,
	inputValue,
	isLocked,
	isMint,
	onBack,
	error,
	txModalOpen,
	setTxModalOpen,
	gasLimitEstimate,
	setGasPrice,
	onInputChange,
	txHash,
	transactionState,
	setTransactionState,
	maxBurnAmount,
}) => {
	const {
		targetCRatio,
		SNXRate,
		debtBalance,
		issuableSynths,
		collateral,
		currentCRatio,
	} = useStakingCalculations();
	const { connectWallet } = Connector.useContainer();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const burnType = useRecoilValue(burnTypeState);
	const { t } = useTranslation();

	const [stakingCurrencyKey] = useState<string>(CryptoCurrency.SNX);
	const [synthCurrencyKey] = useState<string>(Synths.sUSD);
	/**
	 * Given the amount to mint, returns the equivalent collateral needed for stake.
	 * @param mintInput Amount to mint
	 */
	const stakeInfo = useCallback(
		(mintInput: BigNumber) =>
			formatCurrency(
				stakingCurrencyKey,
				getStakingAmount(targetCRatio, mintInput.isNaN() ? 0 : mintInput, SNXRate),
				{
					currencyKey: stakingCurrencyKey,
				}
			),
		[SNXRate, stakingCurrencyKey, targetCRatio]
	);

	const formattedInput = formatCurrency(
		synthCurrencyKey,
		inputValue.isNaN() ? toBigNumber(0) : inputValue,
		{
			currencyKey: synthCurrencyKey,
		}
	);

	const returnButtonStates = useMemo(() => {
		if (!isWalletConnected) {
			return (
				<StyledCTA variant="primary" size="lg" onClick={connectWallet}>
					{t('common.wallet.connect-wallet')}
				</StyledCTA>
			);
		} else if (error) {
			return (
				<StyledCTA variant="primary" size="lg" disabled={true}>
					{t(error.toLowerCase())}
				</StyledCTA>
			);
		} else if (inputValue.toString().length === 0) {
			return (
				<StyledCTA variant="primary" size="lg" disabled={true}>
					{isMint ? t('staking.actions.mint.action.empty') : t('staking.actions.burn.action.empty')}
				</StyledCTA>
			);
		} else {
			return (
				<StyledCTA
					onClick={() => onSubmit()}
					variant="primary"
					size="lg"
					disabled={transactionState !== Transaction.PRESUBMIT}
				>
					<Trans
						i18nKey={
							isMint ? 'staking.actions.mint.action.mint' : 'staking.actions.burn.action.burn'
						}
						components={[<NoTextTransform />]}
					/>
				</StyledCTA>
			);
		}
	}, [inputValue, error, transactionState, isMint, onSubmit, t, isWalletConnected, connectWallet]);

	const equivalentSNXAmount = useMemo(() => {
		const calculatedTargetBurn = Math.max(debtBalance.minus(issuableSynths).toNumber(), 0);
		if (
			!isMint &&
			currentCRatio.isGreaterThan(targetCRatio) &&
			inputValue.isLessThanOrEqualTo(calculatedTargetBurn)
		) {
			return stakeInfo(toBigNumber(0));
		} else {
			return stakeInfo(inputValue);
		}
	}, [inputValue, isMint, debtBalance, issuableSynths, targetCRatio, currentCRatio, stakeInfo]);

	if (transactionState === Transaction.WAITING) {
		return (
			<ActionInProgress
				isMint={isMint}
				from={stakeInfo(inputValue)}
				to={formattedInput}
				hash={txHash as string}
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<ActionCompleted
				isMint={isMint}
				setTransactionState={setTransactionState}
				from={stakeInfo(inputValue)}
				to={formattedInput}
				hash={txHash as string}
			/>
		);
	}

	return (
		<>
			<InputContainer>
				<HeaderRow>
					<IconContainer onClick={() => onBack(null)}>
						<Svg src={NavigationBack} />
					</IconContainer>
					{!isMint && burnType === BurnActionType.CUSTOM && maxBurnAmount && (
						<BalanceButton variant="text" onClick={() => onInputChange(maxBurnAmount.toString())}>
							<span>{t('common.wallet.balance')}</span>
							{formatNumber(maxBurnAmount)}
						</BalanceButton>
					)}
				</HeaderRow>
				<InputBox>
					<Img width={50} height={50} src={sUSDIcon} />
					{isLocked ? (
						<InputLocked>{formattedInput}</InputLocked>
					) : (
						<StyledInput
							maxLength={12}
							value={inputValue.isNaN() ? '0' : inputValue.toString()}
							placeholder="0"
							onChange={(e) => onInputChange(e.target.value)}
							disabled={
								!isWalletConnected ||
								(!isMint && debtBalance.isZero()) ||
								(isMint && collateral.isZero())
							}
						/>
					)}
				</InputBox>
				<DataContainer>
					<DataRow>
						<RowTitle>
							{isMint
								? t('staking.actions.mint.info.staking')
								: t('staking.actions.burn.info.unstaking')}
						</RowTitle>
						<RowValue>{equivalentSNXAmount}</RowValue>
					</DataRow>
					<DataRow>
						<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
					</DataRow>
				</DataContainer>
			</InputContainer>
			{returnButtonStates}
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={error}
					attemptRetry={() => onSubmit()}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>
									{isMint
										? t('modals.confirm-transaction.minting.from')
										: t('modals.confirm-transaction.burning.from')}
								</ModalItemTitle>
								<ModalItemText>{stakeInfo(inputValue)}</ModalItemText>
							</ModalItem>
							<ModalItem>
								<ModalItemTitle>
									{isMint
										? t('modals.confirm-transaction.minting.to')
										: t('modals.confirm-transaction.burning.to')}
								</ModalItemTitle>
								<ModalItemText>{formattedInput}</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const IconContainer = styled.div``;

const HeaderRow = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

const BalanceButton = styled(Button)`
	background-color: ${(props) => props.theme.colors.navy};
	border-radius: 100px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;
	text-transform: uppercase;

	padding: 0px 16px;

	span {
		color: ${(props) => props.theme.colors.gray};
	}
`;

export default StakingInput;
