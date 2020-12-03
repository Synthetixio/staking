import React, { useState } from 'react';
import styled from 'styled-components';
import Img, { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

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

import { ModalContent, ModalItem, ModalItemTitle, ModalItemText } from 'styles/common';
import { InputContainer, InputLocked } from '../common';
import { Transaction } from 'constants/network';
import { formatCurrency, toBigNumber } from 'utils/formatters/number';
import { getStakingAmount } from '../helper';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import BigNumber from 'bignumber.js';

type StakingInputProps = {
	onSubmit: any;
	inputValue: BigNumber;
	isLocked: boolean;
	isMint: boolean;
	onBack: Function;
	txError: boolean;
	txModalOpen: boolean;
	setTxModalOpen: Function;
	gasLimitEstimate: number | null;
	setGasPrice: Function;
	onInputChange: Function;
	txHash: string | null;
	transactionState: Transaction;
	setTransactionState: (tx: Transaction) => void;
};

const StakingInput: React.FC<StakingInputProps> = ({
	onSubmit,
	inputValue,
	isLocked,
	isMint,
	onBack,
	txError,
	txModalOpen,
	setTxModalOpen,
	gasLimitEstimate,
	setGasPrice,
	onInputChange,
	txHash,
	transactionState,
	setTransactionState,
}) => {
	const { targetCRatio, SNXRate, debtBalance, unstakedCollateral } = useStakingCalculations();
	const synthsBalancesQuery = useSynthsBalancesQuery();
	const totalUSDBalance = synthsBalancesQuery?.data?.totalUSDBalance ?? 0;

	const [stakingCurrencyKey] = useState<string>(CRYPTO_CURRENCY_MAP.SNX);
	const [synthCurrencyKey] = useState<string>(SYNTHS_MAP.SNX);

	const { t } = useTranslation();

	/**
	 * Given the amount to mint, returns the equivalent collateral needed for stake.
	 * @param mintInput Amount to mint
	 */
	const stakeInfo = (mintInput: BigNumber) =>
		formatCurrency(stakingCurrencyKey, getStakingAmount(targetCRatio, mintInput, SNXRate), {
			currencyKey: stakingCurrencyKey,
		});

	const formattedInput = formatCurrency(synthCurrencyKey, inputValue, {
		currencyKey: synthCurrencyKey,
	});

	const returnButtonStates = () => {
		const insufficientBalance = isMint
			? getStakingAmount(targetCRatio, inputValue, SNXRate).isGreaterThan(unstakedCollateral)
			: toBigNumber(inputValue).isGreaterThan(debtBalance) || Number(inputValue) > totalUSDBalance;
		// @TODO: Add gasLimitEstimate error instead of checking the values (bc of rounding error);
		if (insufficientBalance) {
			return (
				<StyledCTA variant="primary" size="lg" disabled={true}>
					{isMint
						? t('staking.actions.mint.action.insufficient')
						: t('staking.actions.burn.action.insufficient')}
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
					{isMint ? t('staking.actions.mint.action.mint') : t('staking.actions.burn.action.burn')}
				</StyledCTA>
			);
		}
	};

	if (transactionState === Transaction.WAITING) {
		return (
			<ActionInProgress
				isMint={isMint}
				stake={stakeInfo(inputValue)}
				mint={inputValue.toString()}
				hash={txHash as string}
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return <ActionCompleted isMint={isMint} setTransactionState={setTransactionState} />;
	}

	return (
		<>
			<InputContainer>
				<IconContainer onClick={() => onBack(null)}>
					<Svg src={NavigationBack} />
				</IconContainer>
				<InputBox>
					<Img width={50} height={50} src={sUSDIcon} />
					{isLocked ? (
						<InputLocked>{formattedInput}</InputLocked>
					) : (
						<StyledInput placeholder="0" onChange={(e) => onInputChange(e.target.value)} />
					)}
				</InputBox>
				<DataContainer>
					<DataRow>
						<RowTitle>
							{isMint
								? t('staking.actions.mint.info.staking')
								: t('staking.actions.burn.info.unstaking')}
						</RowTitle>
						<RowValue>{stakeInfo(inputValue)}</RowValue>
					</DataRow>
					<DataRow>
						<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
					</DataRow>
				</DataContainer>
			</InputContainer>
			{returnButtonStates()}
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txError}
					attemptRetry={() => onSubmit()}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.staking.from')}</ModalItemTitle>
								<ModalItemText>{stakeInfo(inputValue)}</ModalItemText>
							</ModalItem>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.staking.to')}</ModalItemTitle>
								<ModalItemText>{formattedInput}</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const IconContainer = styled.div`
	position: absolute;
	top: 20px;
	left: 20px;
	cursor: pointer;
`;

export default StakingInput;
