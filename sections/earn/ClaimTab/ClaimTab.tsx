import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ethers } from 'ethers';
import Wei, { wei } from '@synthetixio/wei';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import {
	isWalletConnectedState,
	isL2State,
	delegateWalletState,
	walletAddressState,
} from 'store/wallet';
import ROUTES from 'constants/routes';
import { ExternalLink, FlexDiv, GlowingCircle, IconButton, FlexDivJustifyEnd } from 'styles/common';
import media from 'styles/media';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import ExpandIcon from 'assets/svg/app/expand.svg';

import Etherscan from 'containers/BlockExplorer';
import TransactionNotifier from 'containers/TransactionNotifier';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import useUserStakingData from 'hooks/useUserStakingData';

import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import { formatCurrency, formatFiatCurrency, formatNumber } from 'utils/formatters/number';
import { getCurrentTimestampSeconds } from 'utils/formatters/date';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';

import { Transaction, GasLimitEstimate } from 'constants/network';
import { CryptoCurrency, Synths } from 'constants/currency';
import TxState from 'sections/earn/TxState';

import {
	GreyHeader,
	WhiteSubheader,
	Divider,
	VerifyButton,
	DismissButton,
	ButtonSpacer,
	GreyText,
	LinkText,
} from '../common';

import GasSelector from 'components/GasSelector';

import largeWaveSVG from 'assets/svg/app/large-wave.svg';

import {
	ErrorMessage,
	FlexDivCentered,
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	Tooltip,
} from 'styles/common';
import { EXTERNAL_LINKS } from 'constants/links';
import Currency from 'components/Currency';

import {
	TotalValueWrapper,
	Subtext,
	Value,
	StyledButton,
	Label,
	StyledLink,
	TabContainer,
	HeaderLabel,
} from '../common';
import { MobileOnlyView } from 'components/Media';
import useSynthetixQueries from '@synthetixio/queries';
import { snapshotEndpoint } from 'constants/snapshot';
import Connector from 'containers/Connector';

type ClaimTabProps = {
	tradingRewards: Wei;
	stakingRewards: Wei;
	totalRewards: Wei;
};

const ClaimTab: React.FC<ClaimTabProps> = ({ tradingRewards, stakingRewards, totalRewards }) => {
	const { t } = useTranslation();

	const { synthetixjs } = Connector.useContainer();

	const walletAddress = useRecoilValue(walletAddressState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const { useHasVotedForElectionsQuery } = useSynthetixQueries();

	const claimed = useClaimedStatus();
	const { isBelowCRatio } = useUserStakingData(delegateWallet?.address ?? walletAddress);
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { blockExplorerInstance } = Etherscan.useContainer();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const isL2 = useRecoilValue(isL2State);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);
	const router = useRouter();

	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [error, setError] = useState<string | null>(null);
	const [lowCRatio, setLowCRatio] = useState<boolean>(false);
	const [claimedTradingRewards, setClaimedTradingRewards] = useState<number | null>(null);
	const [claimedStakingRewards, setClaimedStakingRewards] = useState<number | null>(null);
	const [isCloseFeePeriodEnabled, setIsCloseFeePeriodEnabled] = useState<boolean>(false);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const hasVotedForElections = useHasVotedForElectionsQuery(snapshotEndpoint, walletAddress);

	const link = useMemo(
		() =>
			blockExplorerInstance != null && txHash != null
				? blockExplorerInstance.txLink(txHash)
				: undefined,
		[blockExplorerInstance, txHash]
	);

	const canClaim = useMemo(() => !claimed && totalRewards.gt(0), [claimed, totalRewards]);

	const fetchFeePeriodData = useCallback(async () => {
		if (!isL2) return;
		try {
			const {
				contracts: { FeePool },
			} = synthetixjs!;
			const [feePeriodDuration, recentFeePeriods] = await Promise.all([
				FeePool.feePeriodDuration(),
				FeePool.recentFeePeriods(0),
			]);

			const now = Math.ceil(getCurrentTimestampSeconds());
			const startTime = Number(recentFeePeriods.startTime);
			const duration = Number(feePeriodDuration);

			setIsCloseFeePeriodEnabled(now > duration + startTime);
		} catch (e) {
			console.log(e);
			setIsCloseFeePeriodEnabled(false);
		}
	}, [isL2, synthetixjs]);

	useEffect(() => {
		fetchFeePeriodData();
	}, [fetchFeePeriodData]);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && isWalletConnected && canClaim) {
				if (isBelowCRatio) {
					setLowCRatio(true);
					return;
				}
				try {
					setError(null);
					if (delegateWallet && !delegateWallet.canClaim) {
						throw new Error(t('staking.actions.mint.action.error.delegate-cannot-claim'));
					}
					const {
						contracts: { FeePool },
					} = synthetixjs!;

					let gasEstimate = wei(
						delegateWallet
							? await FeePool.estimateGas.claimOnBehalf(delegateWallet.address)
							: await FeePool.estimateGas.claimFees(),
						0
					);

					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					if (isL2 && error.data) {
						if (error.data.message.includes('below penalty threshold')) {
							setLowCRatio(true);
						} else if (!error.data.message.includes('already claimed')) {
							setError(error.data.message);
						}
					} else {
						if (error.message.includes('below penalty threshold')) {
							setLowCRatio(true);
						} else if (!error.message.includes('already claimed')) {
							setError(error.message);
						}
					}
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [
		isAppReady,
		isWalletConnected,
		isBelowCRatio,
		delegateWallet,
		t,
		isL2,
		synthetixjs,
		canClaim,
	]);

	const handleClaim = useCallback(() => {
		async function claim() {
			if (isAppReady) {
				try {
					setError(null);
					setTxModalOpen(true);
					const {
						contracts: { FeePool },
					} = synthetixjs!;

					let gasLimit = delegateWallet
						? (await FeePool.estimateGas.claimOnBehalf(delegateWallet.address)).toNumber()
						: (await FeePool.estimateGas.claimFees()).toNumber();

					if (!isL2) {
						gasLimit = normalizeGasLimit(gasLimit);
					}

					const transaction: ethers.ContractTransaction = delegateWallet
						? await FeePool.claimOnBehalf(delegateWallet.address, {
								gasPrice: normalizedGasPrice(gasPrice.toNumber()),
								gasLimit,
						  })
						: await FeePool.claimFees({
								gasPrice: normalizedGasPrice(gasPrice.toNumber()),
								gasLimit,
						  });

					if (transaction) {
						setTxHash(transaction.hash);
						setTransactionState(Transaction.WAITING);
						monitorTransaction({
							txHash: transaction.hash,
							onTxConfirmed: () => {
								setClaimedTradingRewards(tradingRewards.toNumber());
								setClaimedStakingRewards(stakingRewards.toNumber());
								setTransactionState(Transaction.SUCCESS);
							},
						});
						setTxModalOpen(false);
					}
				} catch (e) {
					setTransactionState(Transaction.PRESUBMIT);
					if (isL2) {
						setError(e?.data?.message ?? e.message);
					} else {
						setError(e.message);
					}
				}
			}
		}
		claim();
	}, [
		gasPrice,
		monitorTransaction,
		tradingRewards,
		stakingRewards,
		isAppReady,
		delegateWallet,
		isL2,
		synthetixjs,
	]);

	const goToBurn = useCallback(() => router.push(ROUTES.Staking.Burn), [router]);
	const goToEarn = useCallback(() => router.push(ROUTES.Earn.Home), [router]);

	const handleCloseFeePeriod = async () => {
		const {
			contracts: { FeePool },
		} = synthetixjs!;
		try {
			const gasLimit = FeePool.estimateGas.closeCurrentFeePeriod();

			const transaction: ethers.ContractTransaction = await FeePool.closeCurrentFeePeriod({
				gasPrice: normalizedGasPrice(gasPrice.toNumber()),
				gasLimit,
			});
			if (transaction) {
				setTxHash(transaction.hash);
				monitorTransaction({
					txHash: transaction.hash,
					onTxConfirmed: () => {
						fetchFeePeriodData();
					},
				});
				setTxModalOpen(false);
			}
		} catch (e) {
			console.log(e);
		}
	};

	if (transactionState === Transaction.WAITING) {
		return (
			<TxState
				description={
					<Label>
						<Trans
							i18nKey="earn.incentives.options.snx.description"
							components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
						/>
					</Label>
				}
				title={t('earn.actions.claim.in-progress')}
				content={
					<FlexDivColCentered>
						<Svg src={PendingConfirmation} />
						<StyledFlexDiv>
							<StyledFlexDivColCentered>
								<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
								<WhiteSubheader>
									{t('earn.actions.claim.amount', {
										amount: formatNumber(tradingRewards, {
											minDecimals: DEFAULT_FIAT_DECIMALS,
											maxDecimals: DEFAULT_FIAT_DECIMALS,
										}),
										asset: Synths.sUSD,
									})}
								</WhiteSubheader>
							</StyledFlexDivColCentered>
							<StyledFlexDivColCentered>
								<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
								<WhiteSubheader>
									{t('earn.actions.claim.amount', {
										amount: formatNumber(stakingRewards, {
											minDecimals: DEFAULT_FIAT_DECIMALS,
											maxDecimals: DEFAULT_FIAT_DECIMALS,
										}),
										asset: CryptoCurrency.SNX,
									})}
								</WhiteSubheader>
							</StyledFlexDivColCentered>
						</StyledFlexDiv>
						<Divider />
						<GreyText>{t('earn.actions.tx.notice')}</GreyText>
						<ExternalLink href={link}>
							<LinkText>{t('earn.actions.tx.link')}</LinkText>
						</ExternalLink>
					</FlexDivColCentered>
				}
			/>
		);
	}

	if (transactionState === Transaction.SUCCESS) {
		return (
			<TxState
				description={
					<Label>
						<Trans
							i18nKey="earn.incentives.options.snx.description"
							components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
						/>
					</Label>
				}
				title={t('earn.actions.claim.success')}
				content={
					<FlexDivColCentered>
						<Svg src={Success} />
						<StyledFlexDiv>
							<StyledFlexDivColCentered>
								<GreyHeader>{t('earn.actions.claim.claimed')}</GreyHeader>
								<WhiteSubheader>
									{t('earn.actions.claim.amount', {
										amount: formatNumber(claimedTradingRewards as number, {
											minDecimals: DEFAULT_FIAT_DECIMALS,
											maxDecimals: DEFAULT_FIAT_DECIMALS,
										}),
										asset: Synths.sUSD,
									})}
								</WhiteSubheader>
							</StyledFlexDivColCentered>
							<StyledFlexDivColCentered>
								<GreyHeader>{t('earn.actions.claim.claimed')}</GreyHeader>
								<WhiteSubheader>
									{t('earn.actions.claim.amount', {
										amount: formatNumber(claimedStakingRewards as number, {
											minDecimals: DEFAULT_FIAT_DECIMALS,
											maxDecimals: DEFAULT_FIAT_DECIMALS,
										}),
										asset: CryptoCurrency.SNX,
									})}
								</WhiteSubheader>
							</StyledFlexDivColCentered>
						</StyledFlexDiv>
						<Divider />
						<ButtonSpacer>
							{link ? (
								<ExternalLink href={link}>
									<VerifyButton>{t('earn.actions.tx.verify')}</VerifyButton>
								</ExternalLink>
							) : null}
							<DismissButton
								variant="secondary"
								onClick={() => {
									setClaimedTradingRewards(null);
									setClaimedStakingRewards(null);
									setTransactionState(Transaction.PRESUBMIT);
								}}
							>
								{t('earn.actions.tx.dismiss')}
							</DismissButton>
						</ButtonSpacer>
					</FlexDivColCentered>
				}
			/>
		);
	}

	return (
		<>
			<StyledTabContainer>
				<GoToEarnButtonContainer>
					<MobileOnlyView>
						<StyledIconButton onClick={goToEarn}>
							<Svg src={ExpandIcon} />
						</StyledIconButton>
					</MobileOnlyView>
				</GoToEarnButtonContainer>

				<HeaderLabel>
					<Trans
						i18nKey="earn.incentives.options.snx.description"
						components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
					/>
				</HeaderLabel>
				<InnerContainer>
					<ValueBoxWrapper>
						<ValueBox>
							<StyledGlowingCircle variant="green" size="md">
								<Currency.Icon currencyKey={Synths.sUSD} width="36" height="36" />
							</StyledGlowingCircle>
							<Value>
								{formatCurrency(Synths.sUSD, tradingRewards, {
									currencyKey: Synths.sUSD,
									minDecimals: DEFAULT_FIAT_DECIMALS,
									maxDecimals: DEFAULT_FIAT_DECIMALS,
								})}
							</Value>
							<Subtext>{t('earn.incentives.options.snx.trading-rewards')}</Subtext>
						</ValueBox>
						<ValueBox>
							<StyledGlowingCircle variant="green" size="md">
								<Currency.Icon currencyKey={CryptoCurrency.SNX} width="36" height="36" />
							</StyledGlowingCircle>
							<Value>
								{formatCurrency(CryptoCurrency.SNX, stakingRewards, {
									currencyKey: CryptoCurrency.SNX,
								})}
							</Value>
							<Subtext>{t('earn.incentives.options.snx.staking-rewards')}</Subtext>
						</ValueBox>
					</ValueBoxWrapper>
					<TotalValueWrapper>
						<Subtext>{t('earn.incentives.options.snx.total-value')}</Subtext>
						<Value>
							{formatFiatCurrency(getPriceAtCurrentRate(totalRewards), {
								sign: selectedPriceCurrency.sign,
							})}
						</Value>
					</TotalValueWrapper>
					{error && <ErrorMessage>{error}</ErrorMessage>}
					<Tooltip
						hideOnClick={true}
						arrow={true}
						placement="bottom"
						content={t('earn.actions.claim.ratio-notice')}
						disabled={!canClaim || !lowCRatio}
					>
						<PaddedButtonContainer>
							{hasVotedForElections.data && !hasVotedForElections.data.hasVoted ? (
								<PaddedButton variant="primary" onClick={() => router.push(ROUTES.Gov.Home)}>
									{t('earn.actions.claim.not-voted')}
								</PaddedButton>
							) : lowCRatio ? (
								<PaddedButton variant="primary" onClick={goToBurn}>
									{t('earn.actions.claim.low-ratio')}
								</PaddedButton>
							) : (
								<PaddedButton
									variant="primary"
									onClick={handleClaim}
									disabled={!canClaim || !!(delegateWallet && !delegateWallet.canClaim)}
								>
									{claimed
										? t('earn.actions.claim.claimed-button')
										: totalRewards.gt(0)
										? t('earn.actions.claim.claim-button')
										: t('earn.actions.claim.nothing-to-claim')}
								</PaddedButton>
							)}
							{isCloseFeePeriodEnabled ? (
								<PaddedButton variant="primary" onClick={handleCloseFeePeriod}>
									{t('earn.actions.claim.close-fee-period')}
								</PaddedButton>
							) : null}
						</PaddedButtonContainer>
					</Tooltip>
					<GasSelector
						altVersion={true}
						gasLimitEstimate={gasLimitEstimate}
						setGasPrice={setGasPrice}
					/>
				</InnerContainer>
			</StyledTabContainer>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={error}
					attemptRetry={handleClaim}
					content={
						<ModalContent>
							<ModalItem>
								<StyledFlexDiv>
									<StyledFlexDivColCentered>
										<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
										<WhiteSubheader>
											{t('earn.actions.claim.amount', {
												amount: formatNumber(tradingRewards, {
													minDecimals: DEFAULT_FIAT_DECIMALS,
													maxDecimals: DEFAULT_FIAT_DECIMALS,
												}),
												asset: Synths.sUSD,
											})}
										</WhiteSubheader>
									</StyledFlexDivColCentered>
									<StyledFlexDivColCentered>
										<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
										<WhiteSubheader>
											{t('earn.actions.claim.amount', {
												amount: formatNumber(stakingRewards, {}),
												asset: CryptoCurrency.SNX,
											})}
										</WhiteSubheader>
									</StyledFlexDivColCentered>
								</StyledFlexDiv>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const InnerContainer = styled(FlexDivColCentered)`
	padding: 20px;
	border: 1px solid ${(props) => props.theme.colors.pink};
	border-radius: 4px;
	background-image: url(${largeWaveSVG.src});
	background-size: cover;
`;

const ValueBoxWrapper = styled(FlexDivCentered)`
	justify-content: space-around;
	${media.greaterThan('mdUp')`
		width: 380px;
	`}
	${media.lessThan('md')`
		grid-gap: 1rem;
	`}
`;

const ValueBox = styled(FlexDivColCentered)`
	${media.greaterThan('mdUp')`
		width: 175px;
	`}
`;

const PaddedButtonContainer = styled.div`
	width: 100%;
	text-align: center;
`;

const PaddedButton = styled(StyledButton)`
	margin-top: 20px;
	text-transform: uppercase;
`;

const StyledFlexDivColCentered = styled(FlexDivColCentered)`
	padding: 20px 30px;
	&:first-child {
		border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
	}
`;

const StyledFlexDiv = styled(FlexDiv)`
	margin-bottom: -20px;
`;

const StyledGlowingCircle = styled(GlowingCircle)`
	margin-bottom: 12px;
`;

const StyledTabContainer = styled(TabContainer)`
	height: inherit;
`;

const StyledIconButton = styled(IconButton)`
	margin-left: auto;
	svg {
		color: ${(props) => props.theme.colors.gray};
	}
	&:hover {
		svg {
			color: ${(props) => props.theme.colors.white};
		}
	}
`;

const GoToEarnButtonContainer = styled(FlexDivJustifyEnd)`
	width: 100%;
`;

export default ClaimTab;
