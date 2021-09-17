import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';
import { Trans, useTranslation } from 'react-i18next';

import NavigationBack from 'assets/svg/app/navigation-back.svg';
import Logo1Inch from 'assets/svg/providers/1inch.svg';
import Info from 'assets/svg/app/info.svg';

import GasSelector from 'components/GasSelector';
import {
	StyledCTA,
	InputBox,
	DataContainer,
	DataRow,
	RowTitle,
	RowValue,
	StyledInput,
	Tagline,
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
	IconButton,
	FlexDivRow,
	FlexDivCentered,
	Tooltip,
	FlexDiv,
} from 'styles/common';
import { InputContainer, InputLocked } from '../common';
import { GasLimitEstimate } from 'constants/network';
import { formatCurrency, formatNumber } from 'utils/formatters/number';
import { getStakingAmount } from '../helper';
import { CryptoCurrency, Synths } from 'constants/currency';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import Wei, { wei } from '@synthetixio/wei';
import { isWalletConnectedState } from 'store/wallet';
import Connector from 'containers/Connector';
import { BurnActionType, burnTypeState } from 'store/staking';
import Button from 'components/Button';
import Currency from 'components/Currency';
import { parseSafeWei } from 'utils/parse';

type StakingInputProps = {
	onSubmit: () => void;
	inputValue: string;
	isLocked: boolean;
	isMint: boolean;
	onBack: Function;
	error: string | null;
	txModalOpen: boolean;
	setTxModalOpen: Function;
	gasLimitEstimate: GasLimitEstimate;
	setGasPrice: Function;
	onInputChange: Function;
	txHash: string | null;
	transactionState: string;
	resetTransaction: () => void;
	maxBurnAmount?: Wei;
	burnAmountToFixCRatio?: Wei;
	etherNeededToBuy?: string;
	sUSDNeededToBuy?: string;
	sUSDNeededToBurn?: string;
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
	resetTransaction,
	maxBurnAmount,
	burnAmountToFixCRatio,
	etherNeededToBuy,
	sUSDNeededToBuy,
	sUSDNeededToBurn,
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
		(mintInput: string) =>
			formatCurrency(stakingCurrencyKey, getStakingAmount(targetCRatio, mintInput, SNXRate), {
				currencyKey: stakingCurrencyKey,
			}),
		[SNXRate, stakingCurrencyKey, targetCRatio]
	);

	const formattedInput = formatCurrency(synthCurrencyKey, inputValue, {
		currencyKey: synthCurrencyKey,
		maxDecimals: 2,
	});

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
					{error}
				</StyledCTA>
			);
		} else if (inputValue.toString().length === 0) {
			return (
				<StyledCTA variant="primary" size="lg" disabled={true}>
					{isMint ? t('staking.actions.mint.action.empty') : t('staking.actions.burn.action.empty')}
				</StyledCTA>
			);
		} else if (
			burnType === BurnActionType.TARGET &&
			maxBurnAmount != null &&
			burnAmountToFixCRatio != null &&
			burnAmountToFixCRatio.gt(maxBurnAmount)
		) {
			return (
				<StyledCTA variant="primary" size="lg" disabled={true} style={{ padding: 0 }}>
					<Trans
						i18nKey="staking.actions.burn.action.insufficient-sUSD-to-fix-c-ratio"
						components={[<NoTextTransform />]}
					/>
				</StyledCTA>
			);
		} else if (burnType === BurnActionType.CLEAR) {
			return (
				<StyledCTA
					onClick={onSubmit}
					variant="primary"
					size="lg"
					disabled={transactionState !== 'unsent'}
				>
					{t('staking.actions.burn.action.clear-debt')}
				</StyledCTA>
			);
		} else {
			return (
				<StyledCTA
					onClick={onSubmit}
					variant="primary"
					size="lg"
					disabled={transactionState !== 'unsent'}
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
	}, [
		inputValue,
		error,
		transactionState,
		isMint,
		onSubmit,
		t,
		isWalletConnected,
		connectWallet,
		maxBurnAmount,
		burnType,
		burnAmountToFixCRatio,
	]);

	const equivalentSNXAmount = useMemo(() => {
		const calculatedTargetBurn = Math.max(debtBalance.sub(issuableSynths).toNumber(), 0);
		if (
			!isMint &&
			currentCRatio.gt(targetCRatio) &&
			parseSafeWei(inputValue, 0).lte(calculatedTargetBurn)
		) {
			return stakeInfo('0');
		} else {
			return stakeInfo(inputValue);
		}
	}, [inputValue, isMint, debtBalance, issuableSynths, targetCRatio, currentCRatio, stakeInfo]);

	if (transactionState === 'pending') {
		return (
			<ActionInProgress
				isMint={isMint}
				from={stakeInfo(inputValue)}
				to={formattedInput}
				hash={txHash as string}
			/>
		);
	}

	if (transactionState === 'confirmed') {
		return (
			<ActionCompleted
				isMint={isMint}
				resetTransaction={resetTransaction}
				from={stakeInfo(inputValue)}
				to={formattedInput}
				hash={txHash as string}
			/>
		);
	}

	const BuySUSDToBurnInputBox = () => (
		<>
			<InputGroup>
				<FlexDivRow>
					<InputBoxInGroup>
						<Tagline>{t('staking.actions.burn.info.clear-debt.tx1')}</Tagline>
						<InputLocked>{sUSDNeededToBuy}</InputLocked>
						<FlexDiv>
							<Tagline>
								{t('staking.actions.burn.info.clear-debt.spending', { value: etherNeededToBuy })}
							</Tagline>
							<Tooltip arrow={false} content={t('staking.actions.burn.info.clear-debt.tooltip')}>
								<TooltipIconContainer>
									<Svg src={Info} />
								</TooltipIconContainer>
							</Tooltip>
						</FlexDiv>
					</InputBoxInGroup>
					<InputBoxInGroup>
						<Tagline>{t('staking.actions.burn.info.clear-debt.tx2')}</Tagline>
						<InputLocked>{sUSDNeededToBurn}</InputLocked>
						<FlexDiv>
							<Tagline>{t('staking.actions.burn.info.clear-debt.buffer')}</Tagline>
							<Tooltip arrow={false} content={t('staking.actions.burn.info.clear-debt.tooltip')}>
								<TooltipIconContainer>
									<Svg src={Info} />
								</TooltipIconContainer>
							</Tooltip>
						</FlexDiv>
					</InputBoxInGroup>
				</FlexDivRow>
			</InputGroup>
			<FlexDivCentered>
				<Tagline>{t('staking.actions.burn.info.clear-debt.tagline')}</Tagline>
				<Svg height={20} src={Logo1Inch} />
			</FlexDivCentered>
		</>
	);

	return (
		<>
			<InputContainer>
				<HeaderRow>
					<IconButton onClick={() => onBack(null)}>
						<Svg src={NavigationBack} />
					</IconButton>
					{!isMint && burnType != null && [BurnActionType.CUSTOM].includes(burnType) && (
						<BalanceButton variant="text" onClick={() => onInputChange(maxBurnAmount)}>
							<span>{t('common.wallet.balance')}</span>
							{formatNumber(maxBurnAmount ?? wei(0))}
						</BalanceButton>
					)}
				</HeaderRow>
				{burnType === BurnActionType.CLEAR ? (
					<BuySUSDToBurnInputBox />
				) : (
					<InputBox>
						<Currency.Icon currencyKey={Synths.sUSD} width="50" height="50" />
						{isLocked ? (
							<InputLocked>{formattedInput}</InputLocked>
						) : (
							<StyledInput
								type="number"
								maxLength={12}
								placeholder="0"
								onChange={(e) => onInputChange(e.target.value)}
								disabled={
									!isWalletConnected ||
									(!isMint && debtBalance.eq(0)) ||
									(isMint && collateral.eq(0))
								}
							/>
						)}
					</InputBox>
				)}
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
					attemptRetry={onSubmit}
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
							{burnType === BurnActionType.CLEAR && (
								<ModalItem>
									<ModalItemTitle>
										{isMint ? null : t('modals.confirm-transaction.burning.spending')}
									</ModalItemTitle>
									<ModalItemText>{etherNeededToBuy}</ModalItemText>
								</ModalItem>
							)}
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

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

const InputGroup = styled.div`
	width: 100%;
`;

const InputBoxInGroup = styled(InputBox)`
	:not(:first-child) {
		border-left: 1px solid ${(props) => props.theme.colors.mediumBlue};
	}
	flex: 1 1 auto;
`;

const TooltipIconContainer = styled(FlexDiv)`
	align-items: center;
`;

export default StakingInput;
