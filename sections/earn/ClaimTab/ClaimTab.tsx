import React, { useState, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';
import { Svg } from 'react-optimized-image';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import {
	isWalletConnectedState,
	delegateWalletState,
	walletAddressState,
	isL2State,
} from 'store/wallet';
import ROUTES from 'constants/routes';
import { ExternalLink, FlexDiv, GlowingCircle, IconButton, FlexDivJustifyEnd } from 'styles/common';
import media from 'styles/media';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import ExpandIcon from 'assets/svg/app/expand.svg';

import Etherscan from 'containers/BlockExplorer';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import useUserStakingData from 'hooks/useUserStakingData';

import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';
import { formatCurrency, formatFiatCurrency, formatNumber } from 'utils/formatters/number';
import { getCurrentTimestampSeconds } from 'utils/formatters/date';

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
} from 'styles/common';
import { EXTERNAL_LINKS } from 'constants/links';
import Currency from 'components/Currency';

import {
	TotalValueWrapper,
	Subtext,
	Value,
	Label,
	StyledLink,
	TabContainer,
	HeaderLabel,
} from '../common';
import { MobileOnlyView } from 'components/Media';
import useSynthetixQueries from '@synthetixio/queries';
import { snapshotEndpoint } from 'constants/snapshot';
import ClaimOrCloseFeeButton from './ClaimOrCloseFeeButton';

type ClaimTabProps = {
	tradingRewards: Wei;
	stakingRewards: Wei;
	totalRewards: Wei;
};

const ClaimTab: React.FC<ClaimTabProps> = ({ tradingRewards, stakingRewards, totalRewards }) => {
	const { t } = useTranslation();

	const walletAddress = useRecoilValue(walletAddressState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const {
		useHasVotedForElectionsQuery,
		useSynthetixTxn,
		useGetFeePoolDataQuery,
	} = useSynthetixQueries();

	const { isBelowCRatio } = useUserStakingData(delegateWallet?.address ?? walletAddress);
	const { blockExplorerInstance } = Etherscan.useContainer();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);
	const router = useRouter();
	const [gasPrice, setGasPrice] = useState<Wei>(wei(0));
	const [error, setError] = useState<string | null>(null);
	const [claimedTradingRewards, setClaimedTradingRewards] = useState<number | null>(null);
	const [claimedStakingRewards, setClaimedStakingRewards] = useState<number | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const userStakingData = useUserStakingData(walletAddress);
	const isL2 = useRecoilValue(isL2State);
	const feePoolDataQuery = useGetFeePoolDataQuery(0, { enabled: isL2 });
	const hasVotedForElections = useHasVotedForElectionsQuery(snapshotEndpoint, walletAddress);

	const claimCall: [string, string[]] = delegateWallet
		? ['claimOnBehalf', [delegateWallet.address]]
		: ['claimFees', []];
	const txn = useSynthetixTxn(
		'FeePool',
		claimCall[0],
		claimCall[1],
		{ gasPrice: gasPrice.toBN() },
		{
			enabled: true,
			onSuccess: () => {
				setClaimedTradingRewards(tradingRewards.toNumber());
				setClaimedStakingRewards(stakingRewards.toNumber());
				userStakingData.refetch();
				setTxModalOpen(false);
			},
		}
	);

	const now = Math.ceil(getCurrentTimestampSeconds());
	const isCloseFeePeriodEnabled =
		isL2 &&
		feePoolDataQuery.data &&
		now > feePoolDataQuery.data.feePeriodDuration + feePoolDataQuery.data.startTime;

	const closeFeesTxn = useSynthetixTxn(
		'FeePool',
		'closeCurrentFeePeriod',
		[],
		{ gasPrice: gasPrice.toBN() },
		{
			enabled: isCloseFeePeriodEnabled,
			onSuccess: () => {
				feePoolDataQuery.refetch();
			},
		}
	);
	const handleCloseFeePeriod = async () => {
		closeFeesTxn.mutate();
	};

	const link = useMemo(
		() =>
			blockExplorerInstance != null && txn.hash != null
				? blockExplorerInstance.txLink(txn.hash)
				: undefined,
		[blockExplorerInstance, txn.hash]
	);

	const canClaim = useMemo(() => !userStakingData.hasClaimed && totalRewards.gt(0), [
		userStakingData.hasClaimed,
		totalRewards,
	]);

	const handleClaim = () => {
		if (!isAppReady || !isWalletConnected || !canClaim) return;
		if (delegateWallet && !delegateWallet.canClaim) {
			setError(t('staking.actions.mint.action.error.delegate-cannot-claim'));
			return;
		}
		setTxModalOpen(true);

		txn.mutate();
	};

	const goToEarn = useCallback(() => router.push(ROUTES.Earn.Home), [router]);

	if (txn.txnStatus === 'pending') {
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

	if (txn.txnStatus === 'confirmed') {
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
					{txn.isError && <ErrorMessage>{txn.errorMessage}</ErrorMessage>}
					<ClaimOrCloseFeeButton
						hasNotVoted={Boolean(hasVotedForElections.data && !hasVotedForElections.data.hasVoted)}
						canClaim={delegateWallet ? delegateWallet.canClaim : canClaim}
						hasClaimed={userStakingData.hasClaimed}
						totalRewards={totalRewards}
						isCloseFeePeriodEnabled={Boolean(isCloseFeePeriodEnabled)}
						isBelowCRatio={isBelowCRatio}
						handleClaim={handleClaim}
						handleCloseFeePeriod={handleCloseFeePeriod}
					/>
					<GasSelector
						altVersion={true}
						gasLimitEstimate={isCloseFeePeriodEnabled ? closeFeesTxn.gasLimit : txn.gasLimit}
						setGasPrice={setGasPrice}
					/>
				</InnerContainer>
			</StyledTabContainer>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txn.errorMessage}
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
