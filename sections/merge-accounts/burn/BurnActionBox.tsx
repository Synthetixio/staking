import { useMemo, useEffect, FC, useCallback } from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';
import Wei, { wei } from '@synthetixio/wei';

import Connector from 'containers/Connector';
import StructuredTab from 'components/StructuredTab';
import Etherscan from 'containers/BlockExplorer';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import GasSelector from 'components/GasSelector';
import { BurnActionType } from 'store/staking';
import {
	ModalContent as TxModalContent,
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
	ModalItemSeperator as TxModalItemSeperator,
	NoTextTransform,
	GlowingCircle,
	IconButton,
} from 'styles/common';
import { StyledCTA } from 'sections/staking/components/common';
import {
	FormContainer,
	InputsContainer,
	SettingsContainer,
	SettingContainer,
	TxModalItem,
	FormHeader,
} from 'sections/merge-accounts/common';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { formatCryptoCurrency, formatNumber } from 'utils/formatters/number';
import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import ROUTES from 'constants/routes';
import Currency from 'components/Currency';
import { CryptoCurrency, Synths } from 'constants/currency';
import { parseSafeWei } from 'utils/parse';
import { getStakingAmount } from 'sections/staking/components/helper';
import useBurnTx from 'sections/staking/components/BurnTab/useBurnTx';

import { TxWaiting, TxSuccess } from './Tx';

const BurnTab: FC = () => {
	const { t } = useTranslation();

	const tabData = useMemo(
		() => [
			{
				title: t('merge-accounts.burn.title'),
				tabChildren: <BurnTabInner />,
				key: 'main',
				blue: true,
			},
		],
		[t]
	);

	return (
		<StructuredTab singleTab={true} boxPadding={20} tabData={tabData} setPanelType={() => null} />
	);
};

const BurnTabInner: FC = () => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();

	const router = useRouter();
	const { blockExplorerInstance } = Etherscan.useContainer();

	const {
		debtBalance,
		sUSDBalance,
		issuableSynths,
		txn,
		onBurnChange,
		onBurnTypeChange,
		error,
		txModalOpen,
		setTxModalOpen,
		setGasPrice,
		isWalletConnected,
		targetCRatio,
		SNXRate,
		currentCRatio,
	} = useBurnTx();

	const stakeInfo = useCallback(
		(burnAmount: Wei): Wei => wei(getStakingAmount(targetCRatio, burnAmount, SNXRate)),
		[SNXRate, targetCRatio]
	);

	const burnAmount = debtBalance.gt(sUSDBalance) ? wei(sUSDBalance) : debtBalance;
	const unstakeAmount = useMemo(() => {
		const calculatedTargetBurn = Math.max(debtBalance.sub(issuableSynths).toNumber(), 0);
		if (currentCRatio.gt(targetCRatio) && parseSafeWei(burnAmount, 0).lte(calculatedTargetBurn)) {
			return stakeInfo(wei(0));
		} else {
			return stakeInfo(burnAmount);
		}
	}, [burnAmount, debtBalance, issuableSynths, targetCRatio, currentCRatio, stakeInfo]);

	const txLink = useMemo(
		() => (blockExplorerInstance && txn.hash ? blockExplorerInstance.txLink(txn.hash) : ''),
		[blockExplorerInstance, txn.hash]
	);

	const maxBurnAmount = useMemo(
		() => (debtBalance.gt(sUSDBalance) ? wei(sUSDBalance) : debtBalance),
		[debtBalance, sUSDBalance]
	);

	const onGoBack = () => router.replace(ROUTES.MergeAccounts.Home);

	const onBurn = useCallback(() => txn.mutate(), [txn]);

	useEffect(() => {
		onBurnChange(maxBurnAmount.toString());
		onBurnTypeChange(BurnActionType.MAX);
	}, [onBurnChange, onBurnTypeChange, maxBurnAmount]);

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
		} else {
			return (
				<StyledCTA
					onClick={onBurn}
					variant="primary"
					size="lg"
					disabled={txn.txnStatus !== 'unsent'}
				>
					<Trans i18nKey={'staking.actions.burn.action.burn'} components={[<NoTextTransform />]} />
				</StyledCTA>
			);
		}
	}, [error, txn.txnStatus, t, isWalletConnected, connectWallet, onBurn]);

	if (txn.txnStatus === 'pending') {
		return <TxWaiting {...{ unstakeAmount, burnAmount, txLink }} />;
	}

	if (txn.txnStatus === 'confirmed') {
		return (
			<TxSuccess
				{...{ unstakeAmount, burnAmount, txLink }}
				onDismiss={() => {
					router.push(ROUTES.MergeAccounts.Nominate);
				}}
			/>
		);
	}

	return (
		<div data-testid="form">
			<FormContainer>
				<FormHeader>
					<IconButton onClick={onGoBack}>
						<Svg src={NavigationBack} />
					</IconButton>
				</FormHeader>

				<InputsContainer>
					<GlowingCircle variant="blue" size="md">
						<Currency.Icon currencyKey={Synths.sUSD} width="52" height="52" />
					</GlowingCircle>
					<AmountLabel>{formatCryptoCurrency(debtBalance.toString())}</AmountLabel>
				</InputsContainer>

				<SettingsContainer>
					<SettingContainer>
						<GasSelector gasLimitEstimate={txn.gasLimit} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			{returnButtonStates}

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={null}
					attemptRetry={onBurn}
					content={
						<TxModalItem>
							<TxModalItemTitle>{t('merge-accounts.burn.tx-waiting.title')}</TxModalItemTitle>
							<TxModalContent>
								<TxModalItem>
									<TxModalItemTitle>
										{t('merge-accounts.burn.tx-waiting.unstaking')}
									</TxModalItemTitle>
									<TxModalItemText>
										{t('merge-accounts.burn.tx-waiting.unstake-amount', {
											amount: formatNumber(unstakeAmount, {
												minDecimals: DEFAULT_FIAT_DECIMALS,
												maxDecimals: DEFAULT_FIAT_DECIMALS,
											}),
											asset: Synths.sUSD,
										})}
									</TxModalItemText>
								</TxModalItem>
								<TxModalItemSeperator />
								<TxModalItem>
									<TxModalItemTitle>{t('merge-accounts.burn.tx-waiting.burning')}</TxModalItemTitle>
									<TxModalItemText>
										{t('merge-accounts.burn.tx-waiting.burn-amount', {
											amount: formatNumber(burnAmount, {
												minDecimals: DEFAULT_FIAT_DECIMALS,
												maxDecimals: DEFAULT_FIAT_DECIMALS,
											}),
											asset: CryptoCurrency.SNX,
										})}
									</TxModalItemText>
								</TxModalItem>
							</TxModalContent>
						</TxModalItem>
					}
				/>
			)}
		</div>
	);
};

const AmountLabel = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 24px;
`;

export default BurnTab;
