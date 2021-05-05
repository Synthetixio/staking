import React, { useEffect, useState, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { isWalletConnectedState, isL2State } from 'store/wallet';
import ROUTES from 'constants/routes';
import { ExternalLink, FlexDiv, GlowingCircle, IconButton, FlexDivJustifyEnd } from 'styles/common';
import media from 'styles/media';
import synthetix from 'lib/synthetix';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import ExpandIcon from 'assets/svg/app/expand.svg';

import Etherscan from 'containers/BlockExplorer';
import TransactionNotifier from 'containers/TransactionNotifier';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { DEFAULT_CRYPTO_DECIMALS, DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import { formatCurrency, formatFiatCurrency, formatNumber } from 'utils/formatters/number';
import { getCurrentTimestampSeconds } from 'utils/formatters/date';
import { normalizedGasPrice } from 'utils/network';

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

type ClaimTabProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
};

const ClaimTab: React.FC<ClaimTabProps> = ({ tradingRewards, stakingRewards, totalRewards }) => {
	const { t } = useTranslation();
	const claimed = useClaimedStatus();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { blockExplorerInstance } = Etherscan.useContainer();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const [lowCRatio, setLowCRatio] = useState(false);
	const [claimedTradingRewards, setClaimedTradingRewards] = useState<number | null>(null);
	const [claimedStakingRewards, setClaimedStakingRewards] = useState<number | null>(null);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const router = useRouter();
	const isAppReady = useRecoilValue(appReadyState);

	const [isCloseFeePeriodEnabled, setIsCloseFeePeriodEnabled] = useState<boolean>(false);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const link =
		blockExplorerInstance != null && txHash != null
			? blockExplorerInstance.txLink(txHash)
			: undefined;

	const fetchFeePeriodData = useCallback(async () => {
		if (!isL2) return;
		try {
			const {
				contracts: { FeePool },
			} = synthetix.js!;
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
	}, [isL2]);

	useEffect(() => {
		fetchFeePeriodData();
	}, [fetchFeePeriodData]);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && isWalletConnected) {
				try {
					setError(null);
					const {
						contracts: { FeePool },
					} = synthetix.js!;

					let gasEstimate = await synthetix.getGasEstimateForTransaction({
						txArgs: [],
						method: FeePool.estimateGas.claimFees,
					});

					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					if (error.message.includes('below penalty threshold')) {
						setLowCRatio(true);
					} else if (!error.message.includes('already claimed')) {
						setError(error.message);
					}
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [isAppReady, isWalletConnected]);

	const handleClaim = useCallback(() => {
		async function claim() {
			if (isAppReady) {
				try {
					setError(null);
					setTxModalOpen(true);
					const {
						contracts: { FeePool },
					} = synthetix.js!;

					const gasLimit = await synthetix.getGasEstimateForTransaction({
						txArgs: [],
						method: FeePool.estimateGas.claimFees,
					});
					const transaction: ethers.ContractTransaction = await FeePool.claimFees({
						gasPrice: normalizedGasPrice(gasPrice),
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
					setError(e.message);
				}
			}
		}
		claim();
	}, [gasPrice, monitorTransaction, tradingRewards, stakingRewards, isAppReady]);

	const goToBurn = useCallback(() => router.push(ROUTES.Staking.Burn), [router]);
	const goToEarn = useCallback(() => router.push(ROUTES.Earn.Home), [router]);

	const handleCloseFeePeriod = async () => {
		const {
			contracts: { FeePool },
		} = synthetix.js!;
		try {
			const gasLimit = await synthetix.getGasEstimateForTransaction({
				txArgs: [],
				method: FeePool.estimateGas.closeCurrentFeePeriod,
			});
			const transaction: ethers.ContractTransaction = await FeePool.closeCurrentFeePeriod({
				gasPrice: normalizedGasPrice(gasPrice),
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
										amount: formatNumber(tradingRewards, { decimals: DEFAULT_FIAT_DECIMALS }),
										asset: Synths.sUSD,
									})}
								</WhiteSubheader>
							</StyledFlexDivColCentered>
							<StyledFlexDivColCentered>
								<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
								<WhiteSubheader>
									{t('earn.actions.claim.amount', {
										amount: formatNumber(stakingRewards, { decimals: DEFAULT_CRYPTO_DECIMALS }),
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
											decimals: DEFAULT_FIAT_DECIMALS,
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
											decimals: DEFAULT_CRYPTO_DECIMALS,
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
	const canClaim = !claimed && totalRewards.toNumber() > 0;

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
									decimals: DEFAULT_FIAT_DECIMALS,
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
									decimals: DEFAULT_CRYPTO_DECIMALS,
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
							<PaddedButton
								variant="primary"
								onClick={canClaim && lowCRatio ? goToBurn : handleClaim}
								disabled={!canClaim || lowCRatio}
							>
								{claimed
									? t('earn.actions.claim.claimed-button')
									: lowCRatio && totalRewards.toNumber() > 0
									? t('earn.actions.claim.low-ratio')
									: totalRewards.toNumber() > 0
									? t('earn.actions.claim.claim-button')
									: t('earn.actions.claim.nothing-to-claim')}
							</PaddedButton>
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
												amount: formatNumber(tradingRewards, { decimals: DEFAULT_FIAT_DECIMALS }),
												asset: Synths.sUSD,
											})}
										</WhiteSubheader>
									</StyledFlexDivColCentered>
									<StyledFlexDivColCentered>
										<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
										<WhiteSubheader>
											{t('earn.actions.claim.amount', {
												amount: formatNumber(stakingRewards, { decimals: DEFAULT_CRYPTO_DECIMALS }),
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
	width: 90%;
	padding: 20px;
	border: 1px solid ${(props) => props.theme.colors.pink};
	border-radius: 4px;
	background-image: url(${largeWaveSVG.src});
	background-size: cover;
`;

const ValueBoxWrapper = styled(FlexDivCentered)`
	justify-content: space-around;
	${media.greaterThan('md')`
		width: 380px;
	`}
	${media.lessThan('md')`
		grid-gap: 1rem;
	`}
`;

const ValueBox = styled(FlexDivColCentered)`
	${media.greaterThan('md')`
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
