import { FC, useState, useMemo, useEffect, ReactNode, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ethers } from 'ethers';
import { Svg } from 'react-optimized-image';

import synthetix from 'lib/synthetix';
import StructuredTab from 'components/StructuredTab';
import { FlexDivCentered, FlexDivColCentered, ExternalLink } from 'styles/common';
import { CurrencyKey } from 'constants/currency';
import Etherscan from 'containers/Etherscan';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';
import { Transaction } from 'constants/network';
import { normalizedGasPrice } from 'utils/network';
import { CryptoCurrency } from 'constants/currency';
import { getGasEstimateForTransaction } from 'utils/transactions';

import Connector from 'containers/Connector';
import Notify from 'containers/Notify';
import TxState from 'sections/earn/TxState';

import StakeTab from './StakeTab';
import Approve from './Approve';
import RewardsBox from './RewardsBox';
import { getContract } from './StakeTab/StakeTab';

import {
	StyledLink,
	GreyHeader,
	WhiteSubheader,
	Divider,
	VerifyButton,
	DismissButton,
	ButtonSpacer,
	GreyText,
	LinkText,
	TabContainer,
	Label,
} from '../common';

type LPTabProps = {
	stakedAsset: CurrencyKey;
	title: ReactNode;
	tokenRewards: number;
	icon: ReactNode;
	allowance: number | null;
	userBalance: number;
	staked: number;
};

const LPTab: FC<LPTabProps> = ({
	icon,
	stakedAsset,
	title,
	tokenRewards,
	allowance,
	userBalance,
	staked,
}) => {
	const { t } = useTranslation();
	const { signer } = Connector.useContainer();
	const { monitorHash } = Notify.useContainer();
	const [showApproveOverlayModal, setShowApproveOverlayModal] = useState<boolean>(false);

	const [claimGasPrice, setClaimGasPrice] = useState<number>(0);
	const [claimTransactionState, setClaimTransactionState] = useState<Transaction>(
		Transaction.PRESUBMIT
	);
	const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
	const [claimError, setClaimError] = useState<string | null>(null);
	const [claimTxModalOpen, setClaimTxModalOpen] = useState<boolean>(false);

	const { etherscanInstance } = Etherscan.useContainer();
	const claimLink =
		etherscanInstance != null && claimTxHash != null
			? etherscanInstance.txLink(claimTxHash)
			: undefined;

	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

	const tabData = useMemo(() => {
		const commonStakeTabProps = {
			icon,
			stakedAsset,
			userBalance,
			staked,
		};

		return [
			{
				title: t('earn.actions.stake.title'),
				tabChildren: <StakeTab {...commonStakeTabProps} isStake={true} />,
				blue: true,
				key: 'stake',
			},
			{
				title: t('earn.actions.unstake.title'),
				tabChildren: <StakeTab {...commonStakeTabProps} isStake={false} />,
				blue: false,
				key: 'unstake',
			},
		];
	}, [t, icon, stakedAsset, userBalance, staked]);

	useEffect(() => {
		if (allowance === 0 && userBalance > 0) {
			setShowApproveOverlayModal(true);
		}
	}, [allowance, userBalance]);

	const handleClaim = useCallback(() => {
		async function claim() {
			if (synthetix && synthetix.js) {
				try {
					setClaimError(null);
					setClaimTxModalOpen(true);
					const contract = getContract(stakedAsset, signer);

					const gasLimit = await getGasEstimateForTransaction([], contract.estimateGas.getReward);
					const transaction: ethers.ContractTransaction = await contract.getReward({
						gasPrice: normalizedGasPrice(claimGasPrice),
						gasLimit,
					});

					if (transaction) {
						setClaimTxHash(transaction.hash);
						setClaimTransactionState(Transaction.WAITING);
						monitorHash({
							txHash: transaction.hash,
							onTxConfirmed: () => setClaimTransactionState(Transaction.SUCCESS),
						});
						setClaimTxModalOpen(false);
					}
				} catch (e) {
					setClaimTransactionState(Transaction.PRESUBMIT);
					setClaimError(e.message);
				}
			}
		}
		claim();
	}, [stakedAsset, signer, claimGasPrice, monitorHash]);

	if (claimTransactionState === Transaction.WAITING) {
		return (
			<TxState
				description={
					<Trans i18nKey="earn.incentives.options.snx.description" components={[<StyledLink />]} />
				}
				title={t('earn.actions.rewards.waiting')}
				content={
					<FlexDivColCentered>
						<Svg src={PendingConfirmation} />
						<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
						<WhiteSubheader>
							{t('earn.actions.claim.amount', {
								amount: tokenRewards,
								asset: CryptoCurrency.SNX,
							})}
						</WhiteSubheader>
						<Divider />
						<GreyText>{t('earn.actions.tx.notice')}</GreyText>
						<ExternalLink href={claimLink}>
							<LinkText>{t('earn.actions.tx.link')}</LinkText>
						</ExternalLink>
					</FlexDivColCentered>
				}
			/>
		);
	}

	if (claimTransactionState === Transaction.SUCCESS) {
		return (
			<TxState
				description={
					<Trans i18nKey="earn.incentives.options.snx.description" components={[<StyledLink />]} />
				}
				title={t('earn.actions.claim.success')}
				content={
					<FlexDivColCentered>
						<Svg src={Success} />
						<GreyHeader>{t('earn.actions.claim.claiming')}</GreyHeader>
						<WhiteSubheader>
							{t('earn.actions.claim.amount', {
								amount: tokenRewards,
								asset: CryptoCurrency.SNX,
							})}
						</WhiteSubheader>
						<Divider />
						<ButtonSpacer>
							{claimLink ? (
								<ExternalLink href={claimLink}>
									<VerifyButton>{t('earn.actions.tx.verify')}</VerifyButton>
								</ExternalLink>
							) : null}
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

	return (
		<TabContainer>
			<Label>{title}</Label>
			<FlexDivCentered>
				<StructuredTab
					tabHeight={40}
					inverseTabColor={true}
					boxPadding={0}
					boxHeight={242}
					boxWidth={270}
					tabData={tabData}
				/>
				<RewardsBox
					setClaimGasPrice={setClaimGasPrice}
					claimTxModalOpen={claimTxModalOpen}
					setClaimTxModalOpen={setClaimTxModalOpen}
					handleClaim={handleClaim}
					claimError={claimError}
					setClaimError={setClaimError}
					stakedAsset={stakedAsset}
					tokenRewards={tokenRewards}
					SNXRate={SNXRate}
				/>
			</FlexDivCentered>
			{showApproveOverlayModal ? (
				<Approve
					setShowApproveOverlayModal={setShowApproveOverlayModal}
					stakedAsset={stakedAsset}
				/>
			) : null}
		</TabContainer>
	);
};

export default LPTab;
