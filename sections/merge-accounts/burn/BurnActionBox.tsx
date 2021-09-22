import { useState, useMemo, useEffect, FC, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';
import Wei, { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import StructuredTab from 'components/StructuredTab';
import Etherscan from 'containers/BlockExplorer';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import {
	ModalContent as TxModalContent,
	ModalItemTitle as TxModalItemTitle,
	ModalItemText as TxModalItemText,
	ModalItemSeperator as TxModalItemSeperator,
	NoTextTransform,
	GlowingCircle,
	IconButton,
} from 'styles/common';
import GasSelector from 'components/GasSelector';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';
import {
	FormContainer,
	InputsContainer,
	SettingsContainer,
	SettingContainer,
	ErrorMessage,
	TxModalItem,
	FormHeader,
} from 'sections/merge-accounts/common';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { formatCryptoCurrency, formatNumber } from 'utils/formatters/number';
import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import ROUTES from 'constants/routes';
import Currency from 'components/Currency';
import { CryptoCurrency, Synths } from 'constants/currency';
import { parseSafeWei } from 'utils/parse';
import { getStakingAmount } from 'sections/staking/components/helper';

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
	const walletAddress = useRecoilValue(walletAddressState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const sourceAccountAddress = useRecoilValue(walletAddressState);
	const router = useRouter();
	const { useSynthsBalancesQuery, useSynthetixTxn } = useSynthetixQueries();
	const { blockExplorerInstance } = Etherscan.useContainer();

	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [buttonState, setButtonState] = useState<string | null>(null);

	const {
		targetCRatio,
		SNXRate,
		debtBalance,
		issuableSynths,
		currentCRatio,
	} = useStakingCalculations();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);

	const synthBalances = useMemo(
		() =>
			synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
				? synthsBalancesQuery.data
				: null,
		[synthsBalancesQuery.isSuccess, synthsBalancesQuery.data]
	);

	const sUSDBalance = useMemo(
		() => (synthBalances?.balancesMap.sUSD ? synthBalances.balancesMap.sUSD.balance : wei(0)),
		[synthBalances]
	);

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

	const txn = useSynthetixTxn(
		'Synthetix',
		'burnSynths',
		[sourceAccountAddress],
		{
			gasPrice: gasPrice.toBN(),
		},
		{ enabled: !!sourceAccountAddress }
	);

	const txLink = useMemo(
		() => (blockExplorerInstance && txn.hash ? blockExplorerInstance.txLink(txn.hash) : ''),
		[blockExplorerInstance, txn.hash]
	);

	const onGoBack = () => router.replace(ROUTES.MergeAccounts.Home);

	// effects

	useEffect(() => {
		switch (txn.txnStatus) {
			case 'prompting':
				setTxModalOpen(true);
				break;

			case 'pending':
				setButtonState('burning-debt');
				setTxModalOpen(true);
				break;

			// case 'unsent':
			case 'confirmed':
				setTxModalOpen(false);
				break;
		}
	}, [txn.txnStatus]);

	// funcs

	const connectOrBurn = async () => {
		if (!isWalletConnected) {
			return connectWallet();
		}

		// if (sUSDBalance.lt(debtBalance)) {
		// 	const requiredSUSDTopUp = debtBalance.sub(sUSDBalance);
		// 	return setError(
		// 		`You need to acquire an additional ${formatCryptoCurrency(
		// 			requiredSUSDTopUp.toString()
		// 		)} sUSD in order to fully burn your debt.`
		// 	);
		// }

		txn.mutate();
	};

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

			<FormButton
				onClick={connectOrBurn}
				variant="primary"
				size="lg"
				data-testid="form-button"
				disabled={isWalletConnected && !!buttonState}
			>
				{!isWalletConnected ? (
					t('common.wallet.connect-wallet')
				) : (
					<Trans
						i18nKey={`merge-accounts.burn.button-labels.${buttonState || 'burn'}`}
						components={[<NoTextTransform />]}
					/>
				)}
			</FormButton>

			{!txn.error ? null : <ErrorMessage>{txn.errorMessage}</ErrorMessage>}

			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={null}
					attemptRetry={connectOrBurn}
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

const FormButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;

export default BurnTab;
