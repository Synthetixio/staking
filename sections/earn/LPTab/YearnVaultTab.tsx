import { FC, useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import BigNumber from 'bignumber.js';
import { useRouter } from 'next/router';

import StructuredTab from 'components/StructuredTab';
import ROUTES from 'constants/routes';
import { FlexDivColCentered, IconButton, FlexDivJustifyEnd } from 'styles/common';
import media from 'styles/media';
import { CurrencyKey, Synths } from 'constants/currency';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import ExpandIcon from 'assets/svg/app/expand.svg';

import { Transaction } from 'constants/network';
import { CryptoCurrency } from 'constants/currency';
import { formatNumber } from 'utils/formatters/number';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import TxState from 'sections/earn/TxState';
import { EXTERNAL_LINKS } from 'constants/links';

import Approve from './Approve';
import Settle from './Settle';

import {
	StyledLink,
	GreyHeader,
	WhiteSubheader,
	Divider,
	DismissButton,
	ButtonSpacer,
	GreyText,
	TabContainer,
	Label,
	HeaderLabel,
} from '../common';

import styled from 'styled-components';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';
import { MobileOnlyView } from 'components/Media';
import DepositTab from './DepositTab/DepositTab';

type DualRewards = {
	a: number;
	b: number;
};

type LPTabProps = {
	stakedAsset: CurrencyKey;
	icon?: CurrencyKey;
	type?: CurrencyIconType;
	tokenRewards: number | DualRewards;
	allowance: number | null;
	userBalance: number;
	userBalanceBN: BigNumber;
	staked: number;
	stakedBN: BigNumber;
	pricePerShare: number;
	needsToSettle?: boolean;
	secondTokenRate?: number;
};

const YearnVaultTab: FC<LPTabProps> = ({
	stakedAsset,
	icon = stakedAsset,
	type,
	tokenRewards,
	allowance,
	userBalance,
	userBalanceBN,
	staked,
	stakedBN,
	needsToSettle,
	pricePerShare,
	secondTokenRate,
}) => {
	const { t } = useTranslation();
	const [showApproveOverlayModal, setShowApproveOverlayModal] = useState<boolean>(false);
	const [showSettleOverlayModal, setShowSettleOverlayModal] = useState<boolean>(false);

	const [claimTransactionState, setClaimTransactionState] = useState<Transaction>(
		Transaction.PRESUBMIT
	);

	const router = useRouter();
	const goToEarn = useCallback(() => router.push(ROUTES.Earn.Home), [router]);

	const tabData = useMemo(() => {
		const commonDepositTabProps = {
			asset: stakedAsset,
			userBalance,
			userBalanceBN,
			staked,
			stakedBN,
			icon,
			type,
			pricePerShare,
		};

		return [
			{
				title: t('earn.actions.deposit.title'),
				tabChildren: <DepositTab {...commonDepositTabProps} isDeposit={true} />,
				blue: true,
				key: 'deposit',
			},
			{
				title: t('earn.actions.withdraw.title'),
				tabChildren: <DepositTab {...commonDepositTabProps} isDeposit={false} />,
				blue: false,
				key: 'withdraw',
			},
		];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [t, stakedAsset, userBalance, staked]);

	useEffect(() => {
		if (allowance === 0 && userBalance > 0) {
			setShowApproveOverlayModal(true);
		}
	}, [allowance, userBalance]);

	useEffect(() => {
		if (needsToSettle) {
			setShowSettleOverlayModal(true);
		}
	}, [needsToSettle]);

	const translationKey = 'earn.incentives.options.yvsnx.description';

	if (claimTransactionState === Transaction.WAITING) {
		return (
			<TxState
				description={
					<Label>
						<Trans
							i18nKey={translationKey}
							components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
						/>
					</Label>
				}
				title={t('earn.actions.rewards.waiting')}
				content={
					<FlexDivColCentered>
						<Svg src={PendingConfirmation} />
						<>
							<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
							<WhiteSubheader>
								{t('earn.actions.claim.amount', {
									amount: formatNumber(tokenRewards as number, {
										decimals: DEFAULT_CRYPTO_DECIMALS,
									}),
									asset: CryptoCurrency.SNX,
								})}
							</WhiteSubheader>
						</>
						<Divider />
						<GreyText>{t('earn.actions.tx.notice')}</GreyText>
					</FlexDivColCentered>
				}
			/>
		);
	}

	if (claimTransactionState === Transaction.SUCCESS) {
		return (
			<TxState
				description={
					<Label>
						<Trans
							i18nKey={translationKey}
							components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Incentives} />]}
						/>
					</Label>
				}
				title={t('earn.actions.claim.success')}
				content={
					<FlexDivColCentered>
						<Svg src={Success} />
						<>
							<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
							<WhiteSubheader>
								{t('earn.actions.claim.amount', {
									amount: formatNumber(tokenRewards as number, {
										decimals: DEFAULT_CRYPTO_DECIMALS,
									}),
									asset: CryptoCurrency.SNX,
								})}
							</WhiteSubheader>
						</>
						<Divider />
						<ButtonSpacer>
							<DismissButton
								variant="secondary"
								onClick={() => setClaimTransactionState(Transaction.PRESUBMIT)}
							>
								{t('earn.actions.tx.dismiss')}
							</DismissButton>
						</ButtonSpacer>
					</FlexDivColCentered>
				}
			/>
		);
	}

	const infoLink = 'https://yearn.finance/vaults/0xF29AE508698bDeF169B89834F76704C3B205aedf';

	return (
		<StyledTabContainer>
			<GoToEarnButtonContainer>
				<MobileOnlyView>
					<StyledIconButton onClick={goToEarn}>
						<Svg src={ExpandIcon} />
					</StyledIconButton>
				</MobileOnlyView>
			</GoToEarnButtonContainer>

			<HeaderLabel>
				<Trans i18nKey={translationKey} components={[<StyledLink href={infoLink} />]} />
			</HeaderLabel>
			<GridContainer>
				<StructuredTab
					tabHeight={30}
					inverseTabColor={true}
					boxPadding={0}
					boxHeight={242}
					tabData={tabData}
				/>
			</GridContainer>
			{showApproveOverlayModal && (
				<Approve
					setShowApproveOverlayModal={setShowApproveOverlayModal}
					stakedAsset={CryptoCurrency.SNX}
				/>
			)}
			{showSettleOverlayModal && (
				<Settle setShowSettleOverlayModal={setShowSettleOverlayModal} stakedAsset={stakedAsset} />
			)}
		</StyledTabContainer>
	);
};

const StyledTabContainer = styled(TabContainer)`
	height: inherit;
`;

const GridContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	grid-gap: 1rem;

	${media.lessThan('mdUp')`
		display: flex;
		flex-direction: column;
	`}
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

export default YearnVaultTab;
